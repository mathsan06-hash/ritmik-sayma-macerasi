#!/usr/bin/env python3
"""Tek dosyalık oyunu derler: ../index.html (yazı tipi ve 400 soru gömülü).

Kullanım: python3 kaynak/build.py
"""
import base64
import pathlib
import sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
FONTS = SRC

LATIN = ('U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,'
         'U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD')
LATIN_EXT = ('U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,'
             'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF')


def face(subset, weight, rng):
    raw = (FONTS / f'baloo-2-{subset}-{weight}-normal.woff2').read_bytes()
    data = base64.b64encode(raw).decode()
    return ("@font-face{font-family:'Baloo 2';font-style:normal;font-display:swap;font-weight:%d;"
            "src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (weight, data, rng))


def main():
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'index.html'
    fonts = '\n'.join(face(s, w, r) for w in (600, 800) for s, r in (('latin', LATIN), ('latin-ext', LATIN_EXT)))
    tpl = (SRC / 'template.html').read_text(encoding='utf-8')
    css = (SRC / 'style.css').read_text(encoding='utf-8')
    art = (SRC / 'art.js').read_text(encoding='utf-8')
    main_js = (SRC / 'main.js').read_text(encoding='utf-8')
    data = (SRC / 'sorular.json').read_text(encoding='utf-8')
    assert '/*__PUZZLES__*/[]' in main_js
    main_js = main_js.replace('/*__PUZZLES__*/[]', data)
    html = (tpl.replace('/*__FONTFACE__*/', fonts)
               .replace('/*__CSS__*/', css)
               .replace('/*__ART__*/', art)
               .replace('/*__MAIN__*/', main_js))
    assert '__' + 'PUZZLES' not in html and '/*__' not in html
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'{out} yazıldı: {len(html.encode()) / 1024:.0f} KB')


if __name__ == '__main__':
    main()
