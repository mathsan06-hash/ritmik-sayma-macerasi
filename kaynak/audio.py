#!/usr/bin/env python3
"""Video için ses: oyunun kendi ses efektleri (kayıt sırasında yakalanan notalar) + hafif bir fon müziği.

Kullanım: python3 kaynak/audio.py kaynak/video-is/meta.json kaynak/video-is/ses.wav
"""
import json
import sys
import wave

import numpy as np

SR = 44100


def band_limited(kind, f, t):
    """Örtüşmesiz dalga biçimi (tek harmoniklerle)."""
    w = 2 * np.pi * f * t
    if kind == 'sine':
        return np.sin(w)
    out = np.zeros_like(t)
    nmax = int(min(9000, SR / 2 - 500) // f)
    for n in range(1, nmax + 1, 2):
        if kind == 'square':
            out += np.sin(n * w) / n
        else:  # triangle
            out += ((-1) ** ((n - 1) // 2)) * np.sin(n * w) / (n * n)
    return out * (4 / np.pi if kind == 'square' else 8 / (np.pi ** 2))


def envelope(events, t):
    """Web Audio gain olaylarını (set / exp / lin) örnek zamanlarına uygular."""
    ev = sorted(events, key=lambda e: e[2])
    val = np.full_like(t, ev[0][1] if ev else 1.0)
    prev_v, prev_t = (ev[0][1], ev[0][2]) if ev else (1.0, 0.0)
    for kind, v, tt in ev:
        if kind == 'set':
            val[t >= tt] = v
        elif kind in ('exp', 'lin'):
            seg = (t >= prev_t) & (t < tt)
            frac = (t[seg] - prev_t) / max(1e-6, tt - prev_t)
            if kind == 'exp':
                a, b = max(prev_v, 1e-5), max(v, 1e-5)
                val[seg] = a * (b / a) ** frac
            else:
                val[seg] = prev_v + (v - prev_v) * frac
            val[t >= tt] = v
        prev_v, prev_t = v, tt
    return val


def sfx(notes, n, offset):
    out = np.zeros(n)
    for nt in notes:
        t0, t1 = nt['t0'] - offset, nt['t1'] - offset
        if t1 <= 0:
            continue
        i0, i1 = max(0, int(t0 * SR)), min(n, int(t1 * SR))
        if i1 <= i0:
            continue
        t = np.arange(i0, i1) / SR
        f = nt['f'][0][1]
        g = [[e[0], e[1], e[2] - offset] for e in nt['g']]
        out[i0:i1] += band_limited(nt['type'], f, t - t0) * envelope(g, t)
    return out


def pluck(f, dur, decay, kind='triangle'):
    t = np.arange(int(dur * SR)) / SR
    att = np.minimum(1, t / 0.006)
    return band_limited(kind, f, t) * att * np.exp(-t / decay)


def music(n):
    bpm = 100
    beat = 60 / bpm
    bar = 4 * beat
    chords = [  # (bas, arpej sesleri)
        (130.81, [261.63, 329.63, 392.00, 523.25]),   # C
        (110.00, [220.00, 261.63, 329.63, 440.00]),   # Am
        (87.31, [174.61, 220.00, 261.63, 349.23]),    # F
        (98.00, [196.00, 246.94, 293.66, 392.00]),    # G
    ]
    pattern = [0, 1, 2, 3, 2, 1, 2, 1]
    out = np.zeros(n)
    rng = np.random.default_rng(7)
    total = n / SR
    k = 0
    while k * bar < total:
        root, tones = chords[k % 4]
        start = k * bar
        for b in (0, 2):
            s = int((start + b * beat) * SR)
            x = 0.07 * (pluck(root, 1.1, 0.42, 'sine') + 0.35 * pluck(root * 2, 1.1, 0.3, 'sine'))
            e = min(n, s + len(x))
            if s < n:
                out[s:e] += x[:e - s]
        for j, idx in enumerate(pattern):
            s = int((start + j * beat / 2) * SR)
            x = 0.032 * pluck(tones[idx], 0.5, 0.17)
            e = min(n, s + len(x))
            if s < n:
                out[s:e] += x[:e - s]
        for b in (1, 3):
            s = int((start + b * beat) * SR)
            m = int(0.05 * SR)
            x = 0.012 * rng.standard_normal(m) * np.exp(-np.arange(m) / (0.012 * SR))
            x = np.diff(x, prepend=0)  # basit yüksek geçiren: daha "tıss" bir ses
            e = min(n, s + m)
            if s < n:
                out[s:e] += x[:e - s]
        k += 1
    t = np.arange(n) / SR
    fade = np.minimum(1, t / 0.8) * np.minimum(1, (total - t) / 2.0)
    return out * np.clip(fade, 0, 1)


def main():
    meta = json.load(open(sys.argv[1]))
    total = meta['frames'] / meta['fps']
    n = int(total * SR)
    offset = 1 / meta['fps']
    fx = sfx(meta['notes'], n, offset)
    mix = 1.0 * fx + 0.55 * music(n)
    peak = np.max(np.abs(mix))
    mix = mix / max(peak, 1e-9) * 0.89
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())
    rms = np.sqrt(np.mean(mix ** 2))
    print(f'{sys.argv[2]}: {total:.2f} sn, tepe {np.max(np.abs(mix)):.2f}, rms {20 * np.log10(rms):.1f} dBFS, efekt tepe/müzik tepe oranı '
          f'{np.max(np.abs(fx)) / max(1e-9, np.max(np.abs(music(n)))):.2f}')


if __name__ == '__main__':
    main()
