#!/usr/bin/env python3
"""Ritmik sayma bulmacaları üreticisi.

Her bulmaca, ızgara üzerinde yatay (h) ve dikey (v) yollardan oluşur.
Her yol soldan sağa / yukarıdan aşağıya bir aritmetik dizidir (ritmik sayma).
Kesişen yollar ortak kutuyu paylaşır. Verilen sayılardan, "iki sayısı belli
olan yolu tamamla" adımı tekrarlanarak tüm kutuların bulunabilmesi şarttır;
bu da çözümün tek olduğunu garanti eder.

Çıktı: kaynak/sorular.json
Kullanım: python3 kaynak/gen.py
"""
import itertools
import json
import pathlib
import random
import sys
from collections import Counter, defaultdict, deque

MAXDIM = 8
SEED = 20261126


# ----------------------------------------------------------------- geometri
def line_cells(L):
    d, k, s, n = L
    if d == 'h':
        return [(k, s + i) for i in range(n)]
    return [(s + i, k) for i in range(n)]


def all_cells(lines):
    out = []
    seen = set()
    for L in lines:
        for c in line_cells(L):
            if c not in seen:
                seen.add(c)
                out.append(c)
    return out


def normalize(lines):
    cells = [c for L in lines for c in line_cells(L)]
    mr = min(r for r, c in cells)
    mc = min(c for r, c in cells)
    out = []
    for d, k, s, n in lines:
        if d == 'h':
            out.append(('h', k - mr, s - mc, n))
        else:
            out.append(('v', k - mc, s - mr, n))
    return out


def dims(lines):
    cells = [c for L in lines for c in line_cells(L)]
    return max(r for r, c in cells) + 1, max(c for r, c in cells) + 1


def transpose(lines):
    return [('v' if d == 'h' else 'h', k, s, n) for d, k, s, n in lines]


def mirror_h(lines):
    H, W = dims(lines)
    out = []
    for d, k, s, n in lines:
        if d == 'h':
            out.append(('h', k, W - 1 - (s + n - 1), n))
        else:
            out.append(('v', W - 1 - k, s, n))
    return out


def mirror_v(lines):
    H, W = dims(lines)
    out = []
    for d, k, s, n in lines:
        if d == 'h':
            out.append(('h', H - 1 - k, s, n))
        else:
            out.append(('v', k, H - 1 - (s + n - 1), n))
    return out


def random_orientation(lines, rng):
    lines = normalize(lines)
    if rng.random() < 0.5:
        lines = transpose(lines)
    if rng.random() < 0.5:
        lines = mirror_h(lines)
    if rng.random() < 0.5:
        lines = mirror_v(lines)
    return normalize(lines)


def valid_layout(lines):
    if any(n < 3 for _, _, _, n in lines):
        return False
    H, W = dims(lines)
    if H > MAXDIM or W > MAXDIM:
        return False
    # paralel yollar arasında en az bir boş sıra/sütun olmalı
    for a, b in itertools.combinations(lines, 2):
        if a[0] == b[0] and abs(a[1] - b[1]) < 2:
            return False
    cells = set(all_cells(lines))
    runs = set()
    for r in range(H):
        c = 0
        while c < W:
            if (r, c) in cells:
                c0 = c
                while (r, c) in cells:
                    c += 1
                if c - c0 >= 2:
                    runs.add(('h', r, c0, c - c0))
            else:
                c += 1
    for c in range(W):
        r = 0
        while r < H:
            if (r, c) in cells:
                r0 = r
                while (r, c) in cells:
                    r += 1
                if r - r0 >= 2:
                    runs.add(('v', c, r0, r - r0))
            else:
                r += 1
    if runs != set(lines):
        return False
    # yollar birbirine bağlı olmalı
    adj = defaultdict(set)
    for i, a in enumerate(lines):
        for j, b in enumerate(lines):
            if i < j and set(line_cells(a)) & set(line_cells(b)):
                adj[i].add(j)
                adj[j].add(i)
    seen = {0}
    dq = deque([0])
    while dq:
        x = dq.popleft()
        for y in adj[x]:
            if y not in seen:
                seen.add(y)
                dq.append(y)
    return len(seen) == len(lines)


# ------------------------------------------------------------ şekil aileleri
def k_plus(rng, lo, hi):
    a = rng.randint(max(lo, 4), hi)
    b = rng.randint(max(lo, 4), hi)
    i = rng.randint(1, a - 2)
    j = rng.randint(1, b - 2)
    return [('h', j, 0, a), ('v', i, 0, b)]


def k_T(rng, lo, hi):
    a = rng.randint(max(lo, 3), hi)
    b = rng.randint(lo, hi)
    i = rng.randint(1, a - 2)
    return [('h', 0, 0, a), ('v', i, 0, b)]


def k_L(rng, lo, hi):
    a = rng.randint(lo, hi)
    b = rng.randint(lo, hi)
    return [('h', 0, 0, a), ('v', 0, 0, b)]


def k_double(rng, lo, hi):
    a = rng.randint(max(lo, 5), hi)
    pairs = [(x, y) for x in range(a) for y in range(x + 2, a)]
    c1, c2 = rng.choice(pairs)
    lines = [('h', 0, 0, a)]
    for c in (c1, c2):
        b = rng.randint(lo, hi)
        j = rng.randint(0, b - 1)
        lines.append(('v', c, -j, b))
    return lines


def k_comb(rng, lo, hi):
    a = rng.randint(max(lo, 5), max(hi, 6))
    triples = [t for t in itertools.combinations(range(a), 3)
               if t[1] - t[0] >= 2 and t[2] - t[1] >= 2]
    if not triples:
        return None
    cols = rng.choice(triples)
    hang = rng.random() < 0.5
    lines = [('h', 0, 0, a)]
    for c in cols:
        b = rng.randint(lo, min(hi, 6))
        j = 0 if hang else rng.randint(0, b - 1)
        lines.append(('v', c, -j, b))
    return lines


def k_hash(rng, lo, hi):
    gr = rng.randint(2, 4)
    gc = rng.randint(2, 4)
    lines = []
    for r in (0, gr):
        n = rng.randint(max(lo, gc + 1), max(hi, gc + 1))
        s = rng.randint(gc - n + 1, 0)
        lines.append(('h', r, s, n))
    for c in (0, gc):
        n = rng.randint(max(lo, gr + 1), max(hi, gr + 1))
        s = rng.randint(gr - n + 1, 0)
        lines.append(('v', c, s, n))
    return lines


def k_frame(rng, lo, hi):
    W = rng.randint(4, 6)
    H = rng.randint(4, 6)
    return [('h', 0, 0, W), ('h', H - 1, 0, W), ('v', 0, 0, H), ('v', W - 1, 0, H)]


def k_snake(rng, lo, hi):
    a, b, c, d = (rng.randint(3, 5) for _ in range(4))
    return [('h', 0, 0, a), ('v', a - 1, 0, b), ('h', b - 1, a - 1, c),
            ('v', a + c - 2, b - 1, d)]


def k_snake3(rng, lo, hi):
    # yatay - dikey - yatay zikzak
    a, b, c = (rng.randint(max(lo, 3), min(hi, 6)) for _ in range(3))
    return [('h', 0, 0, a), ('v', a - 1, 0, b), ('h', b - 1, a - 1, c)]


KINDS = {
    'plus': k_plus, 'T': k_T, 'L': k_L, 'double': k_double, 'comb': k_comb,
    'hash': k_hash, 'frame': k_frame, 'snake': k_snake, 'snake3': k_snake3,
}


def make_layout(kind, rng, lo, hi):
    for _ in range(200):
        lines = KINDS[kind](rng, lo, hi)
        if lines is None:
            continue
        lines = random_orientation(lines, rng)
        if valid_layout(lines):
            return lines
    return None


# --------------------------------------------------------------- seviyeler
LEVELS = [
    dict(key='kolay', name='Kolay',
         kinds={'plus': 55, 'T': 25, 'L': 20}, lens=(4, 6),
         steps={2: 3, 3: 2, 4: 1, 5: 3, 10: 3},
         vals=(0, 100), maxv={2: 50, 3: 60, 4: 60},
         dec=0.0, mult=1.0, blanks=(0.4, 0.67), max_blanks=8),
    dict(key='orta', name='Orta',
         kinds={'plus': 40, 'T': 18, 'L': 10, 'double': 22, 'snake3': 10}, lens=(4, 7),
         steps={2: 2, 3: 3, 4: 3, 5: 2, 10: 2},
         vals=(0, 100), maxv={},
         dec=0.25, mult=0.6, blanks=(0.5, 0.78), max_blanks=12),
    dict(key='zor', name='Zor',
         kinds={'plus': 12, 'T': 8, 'L': 5, 'double': 35, 'comb': 15, 'snake3': 15, 'snake': 10},
         lens=(4, 7),
         steps={3: 1, 4: 1.5, 6: 3, 7: 3, 8: 3, 9: 3, 5: 0.5, 10: 0.5},
         vals=(0, 200), maxv={},
         dec=0.4, mult=0.3, blanks=(0.6, 0.86), max_blanks=16),
    dict(key='cokzor', name='Çok Zor',
         kinds={'hash': 30, 'frame': 15, 'snake': 15, 'comb': 20, 'double': 20}, lens=(4, 6),
         steps={6: 1.5, 7: 1.5, 8: 1.5, 9: 1.5, 11: 1, 12: 1.5, 15: 2, 20: 1.5, 25: 2,
                50: 1.5, 100: 1},
         vals=(0, 999), maxv={},
         dec=0.45, mult=0.25, blanks=(0.64, 0.9), max_blanks=20),
]


def wchoice(rng, items):
    tot = sum(w for _, w in items)
    x = rng.random() * tot
    for it, w in items:
        x -= w
        if x <= 0:
            return it
    return items[-1][0]


def fits(line_vals, d, cfg, need_mult):
    lo, hi = cfg['vals']
    hi = cfg['maxv'].get(abs(d), hi)
    if min(line_vals) < lo or max(line_vals) > hi:
        return False
    if need_mult and line_vals[0] % abs(d) != 0:
        return False
    return True


def assign_values(lines, cfg, rng):
    nL = len(lines)
    cells_of = [line_cells(L) for L in lines]
    adj = defaultdict(set)
    for i in range(nL):
        for j in range(i + 1, nL):
            if set(cells_of[i]) & set(cells_of[j]):
                adj[i].add(j)
                adj[j].add(i)
    lo, hi = cfg['vals']
    strict_mult = cfg['mult'] >= 1.0
    for _ in range(400):
        root = rng.randrange(nL)
        order, seen, dq = [], {root}, deque([root])
        while dq:
            x = dq.popleft()
            order.append(x)
            nb = sorted(adj[x])
            rng.shuffle(nb)
            for y in nb:
                if y not in seen:
                    seen.add(y)
                    dq.append(y)
        vals = {}
        steps = [None] * nL
        ok = True
        for li in order:
            cs = cells_of[li]
            n = len(cs)
            known = [(i, vals[c]) for i, c in enumerate(cs) if c in vals]
            nb_steps = {abs(steps[j]) for j in adj[li] if steps[j] is not None}
            if len(known) >= 2:
                (i1, v1), (i2, v2) = known[0], known[1]
                if (v2 - v1) % (i2 - i1):
                    ok = False
                    break
                d = (v2 - v1) // (i2 - i1)
                if d == 0 or abs(d) not in cfg['steps'] or (d < 0 and cfg['dec'] == 0):
                    ok = False
                    break
                line_vals = [v1 + (i - i1) * d for i in range(n)]
                if any(vals.get(c, v) != v for c, v in zip(cs, line_vals)):
                    ok = False
                    break
                if not fits(line_vals, d, cfg, strict_mult):
                    ok = False
                    break
            elif len(known) == 1:
                i0, v0 = known[0]
                cands = []
                for s, w in cfg['steps'].items():
                    for sign, ws in ((1, 1 - cfg['dec']), (-1, cfg['dec'])):
                        if ws <= 0:
                            continue
                        d = sign * s
                        lv = [v0 + (i - i0) * d for i in range(n)]
                        if not fits(lv, d, cfg, strict_mult):
                            continue
                        is_mult = lv[0] % s == 0
                        wm = cfg['mult'] if is_mult else 1 - cfg['mult']
                        if wm <= 0:
                            continue
                        wn = 0.25 if s in nb_steps else 1.0
                        cands.append(((lv, d), w * ws * wm * wn))
                if not cands:
                    ok = False
                    break
                line_vals, d = wchoice(rng, cands)
            else:
                line_vals = None
                for _t in range(30):
                    s = wchoice(rng, list(cfg['steps'].items()))
                    d = -s if rng.random() < cfg['dec'] else s
                    want_mult = strict_mult or rng.random() < cfg['mult']
                    shi = cfg['maxv'].get(s, hi)
                    # ilk değer v0: tüm değerler [lo, shi] içinde
                    vmin = lo - min(0, (n - 1) * d)
                    vmax = shi - max(0, (n - 1) * d)
                    if vmin > vmax:
                        continue
                    starts = [v for v in range(vmin, vmax + 1) if (v % s == 0) == want_mult]
                    if not starts:
                        continue
                    v0 = rng.choice(starts)
                    line_vals = [v0 + i * d for i in range(n)]
                    break
                if line_vals is None:
                    ok = False
                    break
            steps[li] = d
            for c, v in zip(cs, line_vals):
                vals[c] = v
        if ok:
            return vals, steps
    return None, None


# ------------------------------------------------------------------ çözücü
def solve(lines, givens):
    """'İki sayısı belli olan yolu tamamla' kuralını tekrarlar.

    Dönüş: (hepsi bulundu mu, tur sayısı, {yol: (tur, en küçük aralık)}, bilinenler)
    """
    cells_of = [line_cells(L) for L in lines]
    known = dict(givens)
    info = {}
    rnd = 0
    while True:
        newly = []
        for li, cs in enumerate(cells_of):
            if li in info:
                continue
            kidx = [i for i, c in enumerate(cs) if c in known]
            if len(kidx) == len(cs):
                info[li] = (rnd, 0)
                continue
            if len(kidx) >= 2:
                g = min(b - a for a, b in zip(kidx, kidx[1:]))
                newly.append((li, kidx, g))
        if not newly:
            break
        rnd += 1
        for li, kidx, g in newly:
            cs = cells_of[li]
            i1, i2 = kidx[0], kidx[1]
            v1, v2 = known[cs[i1]], known[cs[i2]]
            assert (v2 - v1) % (i2 - i1) == 0
            d = (v2 - v1) // (i2 - i1)
            for i, c in enumerate(cs):
                v = v1 + (i - i1) * d
                if c in known:
                    assert known[c] == v, 'tutarsız'
                else:
                    known[c] = v
            info[li] = (rnd, g)
    total = len(set(c for cs in cells_of for c in cs))
    return len(known) == total, rnd, info, known


def features(lines, vals, givens):
    ok, depth, info, _ = solve(lines, {c: vals[c] for c in givens})
    gaps = [g for (_, g) in info.values() if g > 0]
    cells = all_cells(lines)
    blanks = len(cells) - len(givens)
    line_blank = [sum(1 for c in line_cells(L) if c not in givens) for L in lines]
    return dict(ok=ok, depth=depth, gaps=gaps, maxg=max(gaps) if gaps else 0,
                sumg=sum(g - 1 for g in gaps), blanks=blanks,
                ratio=blanks / len(cells), min_line_blank=min(line_blank), n=len(cells))


def keep_ok(level, f):
    if not f['ok']:
        return False
    if level == 0:
        return f['depth'] == 1 and f['maxg'] == 1
    if level == 1:
        return f['depth'] <= 2 and f['maxg'] <= 4
    if level == 2:
        return f['depth'] <= 3 and f['maxg'] <= 5
    return f['depth'] <= 5


def core_ok(level, f, nlines):
    """Seviyeyi belirleyen zorluk özellikleri (boşluk oranı hariç)."""
    if not f['ok'] or f['min_line_blank'] < 1 or not keep_ok(level, f):
        return False
    if level == 0:
        return f['depth'] == 1 and f['maxg'] == 1
    if level == 1:
        return f['depth'] == 2 or f['maxg'] >= 2
    if level == 2:
        return f['depth'] >= 2 and f['maxg'] >= 2
    return f['depth'] >= 3 or (f['depth'] >= 2 and f['sumg'] >= 3 and nlines >= 4)


def accept(level, cfg, f, nlines):
    lo, hi = cfg['blanks']
    if not (lo <= f['ratio'] <= hi) or f['blanks'] > cfg['max_blanks']:
        return False
    return core_ok(level, f, nlines)


def choose_givens(level, cfg, lines, vals, rng):
    cells = all_cells(lines)
    givens = set(cells)
    order = cells[:]
    rng.shuffle(order)
    # 1) Çözülebilirliği bozmadan olabildiğince çok kutuyu boşalt
    for c in order:
        trial = givens - {c}
        f = features(lines, vals, trial)
        if keep_ok(level, f):
            givens = trial
    # 2) Hedef boşluk oranına inene kadar bazı kutuları geri doldur
    lo, hi = cfg['blanks']
    target = rng.uniform(lo, hi)
    blanks = [c for c in cells if c not in givens]
    rng.shuffle(blanks)
    for c in blanks:
        f = features(lines, vals, givens)
        if f['ratio'] <= target and f['blanks'] <= cfg['max_blanks']:
            break
        trial = givens | {c}
        f2 = features(lines, vals, trial)
        if core_ok(level, f2, len(lines)):
            givens = trial
    return givens


STEP_HARD = {2: 0, 5: 0, 10: 0, 3: 1, 4: 1, 6: 2, 7: 2.5, 8: 2.5, 9: 2.5, 11: 3, 12: 3,
             15: 2.5, 20: 1.5, 25: 2, 50: 1.5, 100: 1}


def score(lines, vals, steps, givens, f):
    dec = sum(1 for d in steps if d < 0)
    nonmult = 0
    for L, d in zip(lines, steps):
        first = vals[line_cells(L)[0]]
        if first % abs(d):
            nonmult += 1
    digits = max(len(str(v)) for v in vals.values())
    sh = sum(STEP_HARD.get(abs(d), 2) for d in steps) / len(steps)
    return (f['blanks'] * 1.0 + (f['depth'] - 1) * 3 + f['sumg'] * 1.5 + dec * 1.5
            + len(lines) * 1.0 + digits * 1.0 + sh * 1.5 + nonmult * 1.0)


def gen_level(level, cfg, rng, count=100):
    out = []
    sigs = set()
    kinds = list(cfg['kinds'].items())
    tries = 0
    while len(out) < count:
        tries += 1
        if tries > 200000:
            raise RuntimeError('üretim tıkandı: ' + cfg['key'])
        kind = wchoice(rng, kinds)
        lines = make_layout(kind, rng, *cfg['lens'])
        if not lines:
            continue
        vals, steps = assign_values(lines, cfg, rng)
        if vals is None:
            continue
        givens = None
        for _ in range(6):
            g = choose_givens(level, cfg, lines, vals, rng)
            f = features(lines, vals, g)
            if accept(level, cfg, f, len(lines)):
                givens = g
                break
        if givens is None:
            continue
        sig = (tuple(sorted(lines)), tuple(sorted((c, vals[c], c in givens) for c in vals)))
        if sig in sigs:
            continue
        # aynı şekil + aynı adımlar çok tekrar etmesin
        sigs.add(sig)
        f = features(lines, vals, givens)
        out.append(dict(kind=kind, lines=lines, vals=vals, steps=steps, givens=givens, f=f,
                        score=score(lines, vals, steps, givens, f)))
    out.sort(key=lambda p: p['score'])
    return out


def to_json(p, theme):
    H, W = dims(p['lines'])
    cells = all_cells(p['lines'])
    cells.sort()
    return dict(
        w=W, h=H, t=theme, k=p['kind'],
        L=[[d, k, s, n] for d, k, s, n in p['lines']],
        C=[[r, c, p['vals'][(r, c)], 1 if (r, c) in p['givens'] else 0] for r, c in cells],
    )


def main():
    rng = random.Random(SEED)
    data = []
    report = []
    NTHEME = 8
    for li, cfg in enumerate(LEVELS):
        puzzles = gen_level(li, cfg, rng)
        # temaları sırayla karıştırarak dağıt, ardışık iki soru aynı temada olmasın
        themes = []
        last = None
        while len(themes) < len(puzzles):
            block = list(range(NTHEME))
            rng.shuffle(block)
            if block[0] == last:
                block[0], block[-1] = block[-1], block[0]
            themes.extend(block)
            last = block[-1]
        data.append([to_json(p, themes[i]) for i, p in enumerate(puzzles)])
        # rapor
        depth = Counter(p['f']['depth'] for p in puzzles)
        kinds = Counter(p['kind'] for p in puzzles)
        stp = Counter(abs(d) for p in puzzles for d in p['steps'])
        dec = sum(1 for p in puzzles for d in p['steps'] if d < 0)
        nlines = sum(len(p['steps']) for p in puzzles)
        blanks = [p['f']['blanks'] for p in puzzles]
        maxv = max(max(p['vals'].values()) for p in puzzles)
        minv = min(min(p['vals'].values()) for p in puzzles)
        report.append(f"{cfg['name']}: derinlik {dict(sorted(depth.items()))}, şekil {dict(kinds)}\n"
                      f"   adımlar {dict(sorted(stp.items()))}, geri sayan yol {dec}/{nlines}, "
                      f"boş kutu {min(blanks)}-{max(blanks)} (ort {sum(blanks)/len(blanks):.1f}), "
                      f"sayılar {minv}-{maxv}, skor {puzzles[0]['score']:.1f}-{puzzles[-1]['score']:.1f}")
    out = sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent / 'sorular.json'
    with open(out, 'w') as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    print('\n'.join(report))


if __name__ == '__main__':
    main()
