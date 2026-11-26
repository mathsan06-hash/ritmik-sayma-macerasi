(function () {
  'use strict';

  /* =============================================================== veri */
  // DATA[seviye][soru] = {w, h, t (tema), k (şekil), L: [[yön, sabit, başlangıç, uzunluk]], C: [[satır, sütun, değer, verili]]}
  var DATA = /*__PUZZLES__*/[];

  var LV = [
    { name: 'Kolay', color: '#1fa95b', shade: '#13803f', soft: '#e3f8ea',
      desc: '2’şer, 3’er, 4’er, 5’er ve 10’ar ileri sayma. Her yolda yan yana iki sayı var.',
      icon: [['h', 1, 0, 3], ['v', 1, 0, 3]] },
    { name: 'Orta', color: '#2f7cf6', shade: '#1b5cd0', soft: '#e3edff',
      desc: 'Aradaki kutuları kendin bul. Geri sayan yollar ve ortak kare kutular var.',
      icon: [['h', 2, 0, 5], ['v', 2, 0, 5]] },
    { name: 'Zor', color: '#f07818', shade: '#c0580a', soft: '#ffeddb',
      desc: '6’şar, 7’şer, 8’er, 9’ar sayma. Üç dört yol birbirine bağlı.',
      icon: [['h', 2, 0, 5], ['v', 0, 0, 5], ['v', 4, 0, 5]] },
    { name: 'Çok Zor', color: '#a43fd1', shade: '#7c22ac', soft: '#f5e6fc',
      desc: 'Üç basamaklı sayılar, 25’er, 50’şer, 100’er sayma ve kapalı şekiller.',
      icon: [['h', 1, 0, 5], ['h', 3, 0, 5], ['v', 1, 0, 5], ['v', 3, 0, 5]] }
  ];

  var HEX_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23d99a00' stroke-opacity='.22' stroke-width='2.5'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%23d99a00' stroke-opacity='.16' stroke-width='2.5'/%3E%3C/svg%3E\")";
  var DOTS_BG = 'radial-gradient(circle,rgba(255,255,255,.6) 17%,transparent 18%) 0 0/48px 48px,radial-gradient(circle,rgba(255,255,255,.6) 17%,transparent 18%) 24px 24px/48px 48px,linear-gradient(180deg,#ffe0f0,#ffc4e1)';

  var THEMES = [
    { key: 'balon', shape: 'balloon', mascot: 'tavsan', acc: '#2f6fe0', track: 'rgba(255,255,255,.75)', card: 'rgba(255,255,255,.32)',
      bg: 'linear-gradient(180deg,#a9dcff 0%,#d8f0ff 55%,#fff4d6 100%)', colors: ['#ff7b7b', '#ffd84d', '#7ad98a', '#6aa8ff', '#ff9be0', '#ffb066'], ty: -0.04 },
    { key: 'petek', shape: 'hex', mascot: 'ari', acc: '#c96a00', track: 'rgba(170,95,0,.2)', card: 'rgba(255,255,255,.38)',
      bg: HEX_BG + ',linear-gradient(180deg,#fff1bd,#ffdf86)', colors: ['#ffc93c', '#ffb627', '#ffe066', '#ffcf4a'] },
    { key: 'uzay', shape: 'star', mascot: 'robot', acc: '#ffd84d', track: 'rgba(255,255,255,.2)', card: 'rgba(255,255,255,.07)',
      bg: 'radial-gradient(circle at 30% 20%,#3d3488 0%,#1b1846 60%,#120f30 100%)', colors: ['#ffd84d', '#ff9de2', '#7df9ff', '#b6ff7a', '#ffb36b'],
      ty: 0.035, fsk: 0.86, dark: true },
    { key: 'cicek', shape: 'flower', mascot: 'ugur', acc: '#c92a6a', track: 'rgba(40,120,50,.2)', card: 'rgba(255,255,255,.36)',
      bg: 'linear-gradient(180deg,#dff7ff 0%,#eafbe3 60%,#c9f0b9 100%)', colors: ['#ff8cc0', '#ffbd59', '#b896ff', '#ff7b7b', '#6fc8ff'], fsk: 0.9 },
    { key: 'elma', shape: 'apple', mascot: 'kirpi', acc: '#c2410c', track: 'rgba(120,60,20,.16)', card: 'rgba(255,255,255,.4)',
      bg: 'linear-gradient(180deg,#fff6e6 0%,#ffe9cc 70%,#e8f7d0 100%)', colors: ['#ff6b6b', '#9bdc5a', '#ffd23f', '#ff8c5a'], ty: 0.06 },
    { key: 'deniz', shape: 'fish', mascot: 'ahtapot', acc: '#0b5cad', track: 'rgba(255,255,255,.42)', card: 'rgba(255,255,255,.16)',
      bg: 'linear-gradient(180deg,#9be7ff 0%,#4fb3e8 60%,#2f8fcf 100%)', colors: ['#ffc233', '#ff9a3d', '#ff7aa8', '#9bf6ff', '#caffbf'], tx: -0.02, ty: 0.03, fsk: 0.9 },
    { key: 'seker', shape: 'candy', mascot: 'kedi', acc: '#c2255c', track: 'rgba(255,255,255,.72)', card: 'rgba(255,255,255,.3)',
      bg: DOTS_BG, colors: ['#ff7fb2', '#7fd8ff', '#ffd96a', '#aee85a', '#cf9bff'], fsk: 0.9 },
    { key: 'gol', shape: 'lily', mascot: 'kurbaga', acc: '#11683a', track: 'rgba(255,255,255,.42)', card: 'rgba(255,255,255,.18)',
      bg: 'linear-gradient(180deg,#c8f5ea 0%,#7fd6c2 55%,#4fb9a6 100%)', colors: ['#63c95f', '#86dc63', '#57bd6a', '#9ad86e'], ty: 0.07 }
  ];

  var PRAISE = ['Aferin!', 'Bravo!', 'Süpersin!', 'Tebrikler!', 'Çok güzel!', 'Harikasın!'];
  var NICE = ['Aferin!', 'Bravo!', 'Çok iyi!', 'Süper!', 'Tam isabet!'];
  var INTRO = [
    ['Her yolda yan yana iki sayı var. Aradaki fark, o yolun adımı.', 'Kutuya dokun, sonra sayıyı yaz.', 'Yol boyunca hep aynı sayı kadar zıpla!'],
    ['İki sayısı belli olan yoldan başla!', 'Kare kutu iki yolun ortak kutusu. Bir yolda bulduğun sayı öbür yolda da işe yarar.', 'Bazı yollar geri sayar: sayılar her adımda aynı miktarda küçülür.'],
    ['Önce iki sayısı belli olan yolu bul, sonra ortak kutulardan öbür yollara geç.', 'Aradaki boş kutuları say: kaç zıplamada varılıyor?', 'Sayılar küçülüyorsa o yol geri sayıyor.'],
    ['Zincir uzun! Hangi yolun iki sayısı belli, oradan başla.', 'Büyük sayılardan korkma: önce iki sayı arasındaki farkı bul.', 'Ortak kare kutular yolları birbirine bağlar.']
  ];

  /* ======================================================== yardımcılar */
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  // Türkçe üleştirme eki: 3’er, 6’şar, 50’şer, 100’er ...
  var UNIT_SUF = { 1: '’er', 2: '’şer', 3: '’er', 4: '’er', 5: '’er', 6: '’şar', 7: '’şer', 8: '’er', 9: '’ar' };
  var TEN_SUF = { 1: '’ar', 2: '’şer', 3: '’ar', 4: '’ar', 5: '’şer', 6: '’ar', 7: '’er', 8: '’er', 9: '’ar' };
  function eachWord(n) {
    var u = n % 10, t = Math.floor(n / 10) % 10;
    return n + (u ? UNIT_SUF[u] : t ? TEN_SUF[t] : '’er');
  }
  function rule(step) {
    var w = eachWord(Math.abs(step));
    return w + ' ' + w + ' ' + (step > 0 ? 'ileri' : 'geri') + ' sayıyor';
  }

  function fillIcons(root) {
    each((root || document).querySelectorAll('i[data-ic]'), function (el) {
      var tmp = document.createElement('span');
      tmp.innerHTML = ART.icon(el.getAttribute('data-ic'), el.getAttribute('data-ic') === 'star' ? 'fill' : '');
      el.parentNode.replaceChild(tmp.firstChild, el);
    });
  }

  /* ============================================================== durum */
  var S = {
    screen: 'home', level: 0, idx: 0, sound: true, demo: false,
    best: DATA.map(function (l) { return l.map(function () { return 0; }); }),
    seen: DATA.map(function (l) { return l.map(function () { return false; }); })
  };
  var G = null;

  function decode(raw) {
    var cells = raw.C.map(function (a) { return { r: a[0], c: a[1], v: a[2], g: !!a[3], x: false }; });
    var index = {};
    cells.forEach(function (c, i) { index[c.r + ',' + c.c] = i; });
    var lines = raw.L.map(function (a) {
      var ids = [];
      for (var k = 0; k < a[3]; k++) {
        var r = a[0] === 'h' ? a[1] : a[2] + k, c = a[0] === 'h' ? a[2] + k : a[1];
        ids.push(index[r + ',' + c]);
      }
      return { d: a[0], ids: ids, step: cells[ids[1]].v - cells[ids[0]].v };
    });
    var cnt = cells.map(function () { return 0; });
    lines.forEach(function (L) { L.ids.forEach(function (i) { cnt[i]++; }); });
    cells.forEach(function (c, i) { c.x = cnt[i] > 1; });
    return { w: raw.w, h: raw.h, t: raw.t, cells: cells, lines: lines };
  }

  /* ============================================================== ses */
  var Snd = {
    ctx: null,
    init: function () {
      try {
        if (!this.ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) { this.ctx = null; }
    },
    play: function (notes) {
      if (!S.sound) return;
      this.init();
      var c = this.ctx;
      if (!c) return;
      var t0 = c.currentTime + 0.02;
      notes.forEach(function (n) {
        try {
          var o = c.createOscillator(), g = c.createGain(), st = t0 + n[1];
          o.type = n[3] || 'sine';
          o.frequency.setValueAtTime(n[0], st);
          g.gain.setValueAtTime(0.0001, st);
          g.gain.exponentialRampToValueAtTime(n[4] || 0.1, st + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, st + n[2]);
          o.connect(g); g.connect(c.destination);
          o.start(st); o.stop(st + n[2] + 0.05);
        } catch (e) { /* ses çalınamazsa oyun devam eder */ }
      });
    },
    tap: function () { this.play([[880, 0, 0.06, 'triangle', 0.05]]); },
    line: function () { this.play([[523, 0, 0.13, 'triangle', 0.12], [659, 0.08, 0.13, 'triangle', 0.12], [784, 0.16, 0.22, 'triangle', 0.12]]); },
    good: function () { this.play([[660, 0, 0.1, 'sine', 0.1], [880, 0.08, 0.16, 'sine', 0.1]]); },
    bad: function () { this.play([[330, 0, 0.14, 'square', 0.04], [247, 0.12, 0.24, 'square', 0.04]]); },
    hint: function () { this.play([[988, 0, 0.08, 'sine', 0.07], [1319, 0.07, 0.14, 'sine', 0.06]]); },
    win: function () {
      this.play([[523, 0, 0.15, 'triangle', 0.13], [659, 0.12, 0.15, 'triangle', 0.13], [784, 0.24, 0.15, 'triangle', 0.13],
        [1047, 0.36, 0.5, 'triangle', 0.14], [784, 0.36, 0.5, 'sine', 0.06], [659, 0.36, 0.5, 'sine', 0.05]]);
    },
    star: function (k) { this.play([[880 + k * 220, 0, 0.16, 'sine', 0.08]]); }
  };

  function setSound(on) {
    S.sound = on;
    var b = $('sndBtn');
    b.innerHTML = ART.icon(on ? 'sound' : 'mute') + '<span>' + (on ? 'Ses açık' : 'Ses kapalı') + '</span>';
    $('gSnd').innerHTML = ART.icon(on ? 'sound' : 'mute');
  }

  function toggleFull() {
    var d = document, el = d.documentElement;
    try {
      if (!d.fullscreenElement && !d.webkitFullscreenElement) {
        var rq = el.requestFullscreen || el.webkitRequestFullscreen;
        if (rq) { var p = rq.call(el); if (p && p.catch) p.catch(function () {}); }
      } else {
        var ex = d.exitFullscreen || d.webkitExitFullscreen;
        if (ex) { var q = ex.call(d); if (q && q.catch) q.catch(function () {}); }
      }
    } catch (e) { /* tam ekran desteklenmiyor */ }
  }

  /* ========================================================== ekranlar */
  function show(id) {
    ['home', 'map', 'game'].forEach(function (s) { $(s).classList.toggle('on', s === id); });
    S.screen = id;
    if (id === 'game') fitBoard();
  }

  function miniIcon(lines, col) {
    var cells = {}, s = '';
    lines.forEach(function (L) {
      for (var i = 0; i < L[3]; i++) {
        var r = L[0] === 'h' ? L[1] : L[2] + i, c = L[0] === 'h' ? L[2] + i : L[1], k = r + ',' + c;
        cells[k] = (cells[k] || 0) + 1;
      }
    });
    Object.keys(cells).forEach(function (k) {
      var p = k.split(','), x = 6 + p[1] * 12, y = 6 + p[0] * 12;
      s += cells[k] > 1
        ? '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" rx="2.5" fill="#ffd43b" stroke="' + col + '" stroke-width="1.8"/>'
        : '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + col + '" fill-opacity=".18" stroke="' + col + '" stroke-width="1.8"/>';
    });
    return '<svg viewBox="0 0 60 60">' + s + '</svg>';
  }

  function renderHome() {
    var h = '';
    LV.forEach(function (L, i) {
      var st = sum(S.best[i]);
      h += '<button class="lvl" type="button" data-l="' + i + '" style="--c:' + L.color + ';--cs:' + L.shade + '">' +
        '<span class="lvl-top"><span class="lvl-ic">' + miniIcon(L.icon, L.color) + '</span>' +
        '<span><b>' + L.name + '</b><span class="cnt">100 soru</span></span></span>' +
        '<small>' + L.desc + '</small>' +
        '<span class="lvl-pr"><span class="bar"><i style="width:' + (st / 3).toFixed(1) + '%"></i></span>' + ART.icon('star', 'fill') + st + ' / 300</span>' +
        '</button>';
    });
    $('levels').innerHTML = h;
  }

  function homeDeco() {
    var seqs = [[2, 4, 6, 8, 10], [5, 10, 15, 20, 25], [3, 6, 9, 12], [10, 20, 30, 40], [4, 8, 12, 16], [25, 50, 75, 100]];
    var cols = ['#ff7b7b', '#ffc93c', '#5fcf80', '#5aa2ff', '#ff8fd8', '#ffa94d', '#a98bff'];
    var h = '';
    for (var i = 0; i < 18; i++) {
      var size = Math.round(ART.rnd(34, 70));
      h += '<div class="fnum" style="left:' + ART.rnd(0, 96).toFixed(1) + '%;width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.42) +
        'px;background:' + pick(cols) + ';animation-duration:' + ART.rnd(16, 30).toFixed(1) + 's;animation-delay:-' + ART.rnd(0, 30).toFixed(1) + 's">' + pick(pick(seqs)) + '</div>';
    }
    $('hbg').innerHTML = h;
    var t = $('title').textContent, tc = ['#ff4f8b', '#ff9f1c', '#2fbf71', '#2f7cf6', '#a43fd1'], k = 0;
    $('title').innerHTML = t.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (ch) {
        var s = '<span style="color:' + tc[k % tc.length] + ';animation-delay:' + (k * 0.08).toFixed(2) + 's">' + ch + '</span>';
        k++;
        return s;
      }).join('') + '</span>';
    }).join(' ');
  }

  function goHome() {
    closeModals();
    renderHome();
    show('home');
  }

  function openMap(level) {
    closeModals();
    S.level = level;
    var L = LV[level], m = $('map');
    m.style.setProperty('--c', L.color);
    m.style.setProperty('--cs', L.shade);
    m.style.setProperty('--soft', L.soft);
    $('mapTitle').innerHTML = '<span class="chip" style="background:' + L.color + '">' + L.name + '</span> 100 soru';
    $('mapStars').innerHTML = ART.icon('star', 'fill') + sum(S.best[level]) + ' / 300';
    var h = '';
    for (var i = 0; i < DATA[level].length; i++) {
      var b = S.best[level][i], st = '';
      for (var k = 0; k < 3; k++) st += '<i class="' + (k < b ? 'on' : '') + '"></i>';
      h += '<button class="mb' + (b ? ' won' : S.seen[level][i] ? ' seen' : '') + '" type="button" data-i="' + i + '"><span>' + (i + 1) + '</span><em>' + st + '</em></button>';
    }
    $('mapGrid').innerHTML = h;
    show('map');
    var cur = $('mapGrid').children[S.idx];
    if (cur && cur.scrollIntoView && S.idx > 30) cur.scrollIntoView({ block: 'center' });
  }

  /* ======================================================= oyun tahtası */
  var GAP = 0.2, PAD = 0.32, U = 1 + GAP;
  function cen(k) { return PAD + k * U + 0.5; }
  function calc(x) { return 'calc(' + (Math.round(x * 1000) / 1000) + ' * var(--s))'; }
  function box(e, x, y, w, h) {
    e.style.left = calc(x); e.style.top = calc(y);
    e.style.width = calc(w); e.style.height = calc(h);
  }

  function cellColors(P, T) {
    var n = T.colors.length, at = {}, out = [];
    P.cells.forEach(function (c) { at[c.r + ',' + c.c] = -1; });
    var order = P.cells.map(function (c, i) { return i; }).sort(function (a, b) {
      return (P.cells[a].r - P.cells[b].r) || (P.cells[a].c - P.cells[b].c);
    });
    order.forEach(function (i) {
      var c = P.cells[i], k = (c.r * 3 + c.c * 5) % n, tries = 0;
      var up = at[(c.r - 1) + ',' + c.c], left = at[c.r + ',' + (c.c - 1)];
      while ((k === up || k === left) && tries++ < n) k = (k + 1) % n;
      at[c.r + ',' + c.c] = k;
      out[i] = T.colors[k];
    });
    return out;
  }

  function applyTheme(el, T) {
    el.style.setProperty('--acc', T.acc);
    el.style.setProperty('--track', T.track);
    el.style.setProperty('--card', T.card);
    el.style.setProperty('--tx', T.tx || 0);
    el.style.setProperty('--ty', T.ty || 0);
    el.style.setProperty('--fsk', T.fsk || 1);
  }

  function buildBoard(el, P, T) {
    el.innerHTML = '';
    applyTheme(el, T);
    el.style.setProperty('--bw', (P.w * U - GAP + 2 * PAD).toFixed(3));
    el.style.setProperty('--bh', (P.h * U - GAP + 2 * PAD).toFixed(3));
    var refs = { cells: [], tracks: [], beads: [] }, TH = 0.46, cols = cellColors(P, T);
    P.lines.forEach(function (L) {
      var a = P.cells[L.ids[0]], b = P.cells[L.ids[L.ids.length - 1]];
      var t = document.createElement('div');
      t.className = 'track';
      box(t, cen(a.c) - TH / 2, cen(a.r) - TH / 2, cen(b.c) - cen(a.c) + TH, cen(b.r) - cen(a.r) + TH);
      el.appendChild(t);
      refs.tracks.push(t);
    });
    P.cells.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cell ' + (c.g ? 'given' : 'blank') + (c.x ? ' cross' : '');
      b.setAttribute('data-i', i);
      b.setAttribute('data-d', String(c.v).length);
      b.setAttribute('aria-label', c.g ? 'Sayı ' + c.v : 'Boş kutu');
      b.style.setProperty('--cc', cols[i]);
      box(b, PAD + c.c * U, PAD + c.r * U, 1, 1);
      b.innerHTML = '<span class="in">' + ART.shape(c.x ? 'cross' : T.shape) + '<span class="num">' + (c.g ? c.v : '') + '</span></span>';
      el.appendChild(b);
      refs.cells.push(b);
    });
    P.lines.forEach(function (L) {
      var arr = [];
      for (var k = 0; k + 1 < L.ids.length; k++) {
        var a = P.cells[L.ids[k]], b = P.cells[L.ids[k + 1]];
        var e = document.createElement('span');
        e.className = 'bead';
        e.textContent = (L.step > 0 ? '+' : '−') + Math.abs(L.step);
        e.style.left = calc((cen(a.c) + cen(b.c)) / 2);
        e.style.top = calc((cen(a.r) + cen(b.r)) / 2);
        el.appendChild(e);
        arr.push(e);
      }
      refs.beads.push(arr);
    });
    return refs;
  }

  function fitTo(board, wrap, maxS) {
    var bw = parseFloat(board.style.getPropertyValue('--bw')), bh = parseFloat(board.style.getPropertyValue('--bh'));
    if (!bw || !bh) return;
    var W = wrap.clientWidth - 6, H = wrap.clientHeight - 6;
    if (W <= 0 || H <= 0) return;
    var s = Math.max(20, Math.min(W / bw, H / bh, maxS || 120));
    board.style.setProperty('--s', s.toFixed(2) + 'px');
  }
  function fitBoard() { if (G) fitTo($('board'), $('bwrap'), 124); }

  /* ======================================================= oyun akışı */
  function startGame(level, idx, quiet) {
    closeModals();
    var demo = level < 0;
    S.demo = demo;
    if (!demo) { S.level = level; S.idx = idx; S.seen[level][idx] = true; }
    var P = decode(demo ? DEMO : DATA[level][idx]), T = THEMES[P.t];
    G = { P: P, T: T, entry: [], state: [], sel: -1, fresh: true, mistakes: 0, hints: 0, done: false, shown: false,
      solved: {}, hintLine: -1, hintStage: 0, refs: null };
    P.cells.forEach(function () { G.entry.push(''); G.state.push(''); });

    var game = $('game');
    game.className = 'screen th-' + T.key + (T.dark ? ' dark' : '') + (S.screen === 'game' ? ' on' : '');
    var tbg = $('tbg');
    tbg.style.background = T.bg;
    tbg.innerHTML = ART.deco(T.key);
    G.refs = buildBoard($('board'), P, T);

    if (demo) {
      $('gTitle').innerHTML = '<span class="chip" style="background:#ff9f1c">Örnek</span>soru';
    } else {
      var L = LV[level];
      $('gTitle').innerHTML = '<span class="chip" style="background:' + L.color + '">' + L.name + '</span><span class="hide-s">Soru </span>' + (idx + 1) + '<small> / ' + DATA[level].length + '</small>';
    }
    $('gM').innerHTML = ART.mascot(T.mascot);
    updateStars();
    if (!quiet) say(demo ? 'Önce yatay yola bak: 9’dan 21’e kaç zıplamada varılıyor?' : pick(INTRO[level]), '');
    show('game');
    var f = firstEditable();
    if (f >= 0) select(f, true);
    updateCells();
  }

  function restart(quiet) {
    if (S.demo) startGame(-1, 0, quiet); else startGame(S.level, S.idx, quiet);
  }

  function updateStars() {
    $('gStars').innerHTML = ART.icon('star', 'fill') + sum(S.best[S.level]);
  }

  var sayTimer = null;
  function say(msg, mood) {
    var b = $('gBubble'), m = $('gM');
    b.textContent = msg;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    m.className = 'mascot' + (mood ? ' ' + mood : '');
    clearTimeout(sayTimer);
    if (mood === 'happy' || mood === 'oops') sayTimer = setTimeout(function () { m.className = 'mascot'; }, 1400);
  }

  function anim(cellIdx, cls, ms) {
    var el = G.refs.cells[cellIdx].firstChild;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, ms || 600);
  }

  function editable(i) {
    var st = G.state[i];
    return !G.done && !G.P.cells[i].g && st !== 'ok' && st !== 'hint' && st !== 'shown';
  }
  function isRight(i) {
    var c = G.P.cells[i], st = G.state[i];
    return c.g || st === 'ok' || st === 'hint' || st === 'shown' || (G.entry[i] !== '' && +G.entry[i] === c.v);
  }
  function orderedCells() {
    return G.P.cells.map(function (c, i) { return i; }).sort(function (a, b) {
      var A = G.P.cells[a], B = G.P.cells[b];
      return (A.r - B.r) || (A.c - B.c);
    });
  }
  function firstEditable() {
    var o = orderedCells();
    for (var k = 0; k < o.length; k++) if (editable(o[k])) return o[k];
    return -1;
  }

  function select(i, silent) {
    G.sel = i; G.fresh = true;
    updateCells();
    if (!silent) Snd.tap();
  }

  function updateCells() {
    if (!G) return;
    G.P.cells.forEach(function (c, i) {
      if (c.g) return;
      var el = G.refs.cells[i], st = G.state[i], e = G.entry[i], num = el.querySelector('.num');
      el.className = 'cell blank' + (c.x ? ' cross' : '') + (st ? ' ' + st : '') + (i === G.sel ? ' sel' : '');
      if (e) { num.textContent = e; num.className = 'num'; }
      else { num.textContent = i === G.sel ? '' : '?'; num.className = 'num ph'; }
      el.setAttribute('data-d', Math.max(String(c.v).length, e.length));
    });
  }

  function typeDigit(d) {
    if (!G || G.done) return;
    Snd.tap();
    if (G.sel < 0 || !editable(G.sel)) {
      var f = firstEditable();
      if (f < 0) return;
      G.sel = f; G.fresh = true;
    }
    var i = G.sel, e = G.fresh ? '' : G.entry[i];
    if (e.length >= 4) { anim(i, 'wig', 400); return; }
    e = (e === '0' ? '' : e) + d;
    G.entry[i] = e; G.fresh = false;
    if (G.state[i] === 'bad') G.state[i] = '';
    updateCells();
    anim(i, 'pop', 260);
    afterTyping(i);
  }

  function backspace() {
    if (!G || G.done || G.sel < 0 || !editable(G.sel)) return;
    var i = G.sel;
    G.entry[i] = G.fresh ? '' : G.entry[i].slice(0, -1);
    G.fresh = false;
    if (G.state[i] === 'bad') G.state[i] = '';
    Snd.tap();
    updateCells();
  }

  // Bir hücre değişince tamamlanan yolları bul (i < 0 ise hepsine bak)
  function newlySolved(i) {
    var out = [];
    G.P.lines.forEach(function (L, li) {
      if (G.solved[li]) return;
      if (i >= 0 && L.ids.indexOf(i) < 0) return;
      if (L.ids.every(isRight)) out.push(li);
    });
    return out;
  }

  function solveLine(li, animate) {
    G.solved[li] = true;
    var L = G.P.lines[li];
    L.ids.forEach(function (id, k) {
      if (!G.P.cells[id].g && G.state[id] !== 'hint' && G.state[id] !== 'shown') G.state[id] = 'ok';
      if (animate) setTimeout(function () { anim(id, 'hop', 600); }, k * 70);
    });
    G.refs.tracks[li].classList.add('done');
    G.refs.tracks[li].classList.remove('glow');
    G.refs.beads[li].forEach(function (b, k) {
      if (animate) setTimeout(function () { b.classList.add('on'); }, 120 + k * 70);
      else b.classList.add('on');
    });
    if (G.hintLine === li) { G.hintLine = -1; G.hintStage = 0; }
  }

  function allFilled() {
    return G.P.cells.every(function (c, i) { return !editable(i) || G.entry[i] !== ''; });
  }

  function afterTyping(i) {
    var nw = newlySolved(i);
    nw.forEach(function (li) { solveLine(li, true); });
    if (G.sel >= 0 && !editable(G.sel)) G.sel = -1;
    updateCells();
    if (checkWin()) return;
    if (nw.length) {
      Snd.line();
      say('Bu yol ' + rule(G.P.lines[nw[nw.length - 1]].step) + '. ' + pick(NICE), 'happy');
    } else if (allFilled()) {
      say('Bütün kutular dolu. Kontrol Et’e bas!', 'think');
    }
  }

  function check() {
    if (!G || G.done) return;
    var wrong = 0, empty = 0, right = 0;
    G.P.cells.forEach(function (c, i) {
      if (!editable(i)) return;
      var e = G.entry[i];
      if (e === '') { empty++; return; }
      if (+e === c.v) { G.state[i] = 'ok'; right++; }
      else { G.state[i] = 'bad'; wrong++; anim(i, 'shake', 500); }
    });
    if (wrong) G.mistakes++;
    var nw = newlySolved(-1);
    nw.forEach(function (li) { solveLine(li, true); });
    if (G.sel >= 0 && !editable(G.sel)) G.sel = -1;
    updateCells();
    if (checkWin()) return;
    if (wrong) {
      Snd.bad();
      say((wrong === 1 ? 'Bir kutuda' : wrong + ' kutuda') + ' yanlış var. Kırmızı ' + (wrong === 1 ? 'kutuya' : 'kutulara') + ' bir daha bak.', 'oops');
    } else if (right || nw.length) {
      Snd.good();
      say('Yazdıkların doğru! ' + empty + ' boş kutu kaldı.', 'happy');
    } else {
      say('Önce bir kutuya dokun ve sayı yaz.', 'think');
    }
  }

  function checkWin() {
    if (G.done) return true;
    if (!G.P.cells.every(function (c, i) { return isRight(i); })) return false;
    G.P.lines.forEach(function (L, li) { if (!G.solved[li]) solveLine(li, true); });
    G.done = true; G.sel = -1;
    updateCells();
    var pen = G.mistakes + G.hints;
    var stars = pen === 0 ? 3 : pen <= 2 ? 2 : 1;
    if (!S.demo) {
      S.best[S.level][S.idx] = Math.max(S.best[S.level][S.idx], stars);
      updateStars();
    }
    Snd.win();
    confetti();
    say(pick(PRAISE), 'happy');
    G.refs.cells.forEach(function (el, i) { setTimeout(function () { if (G && G.refs.cells[i] === el) anim(i, 'hop', 600); }, 300 + i * 40); });
    var token = G;
    setTimeout(function () { if (G === token) showWin(stars); }, 1300);
    return true;
  }

  /* --------------------------------------------------------- ipucu */
  function knownIdx(L) {
    var out = [];
    L.ids.forEach(function (id, k) { if (isRight(id)) out.push(k); });
    return out;
  }

  function pickHintLine() {
    var best = -1, bestScore = 1e9;
    G.P.lines.forEach(function (L, li) {
      if (G.solved[li]) return;
      var kn = knownIdx(L);
      if (kn.length < 2 || kn.length === L.ids.length) return;
      var g = 99;
      for (var j = 1; j < kn.length; j++) g = Math.min(g, kn[j] - kn[j - 1]);
      var sc = g * 10 - kn.length;
      if (sc < bestScore) { bestScore = sc; best = li; }
    });
    return best;
  }

  function hint() {
    if (!G || G.done) return;
    var li = G.hintLine;
    if (li < 0 || G.solved[li]) { li = pickHintLine(); G.hintLine = li; G.hintStage = 0; }
    if (li < 0) { say('Kontrol Et’e basıp bakalım!', 'think'); return; }
    var L = G.P.lines[li];
    G.hintStage = Math.min(G.hintStage + 1, 3);
    G.hints++;
    G.refs.tracks.forEach(function (t, k) { t.classList.toggle('glow', k === li); });
    Snd.hint();
    var kn = knownIdx(L);
    if (G.hintStage === 1) {
      var a = kn[0], b = kn[1];
      for (var j = 1; j < kn.length; j++) if (kn[j] - kn[j - 1] < b - a) { a = kn[j - 1]; b = kn[j]; }
      var va = G.P.cells[L.ids[a]].v, vb = G.P.cells[L.ids[b]].v, gap = b - a;
      anim(L.ids[a], 'hop', 600); anim(L.ids[b], 'hop', 600);
      say('Parlayan yola bak. ' + va + ' ile ' + vb + ' belli. ' +
        (gap === 1 ? 'İkisi yan yana. Aradaki fark kaç?' : 'Aralarında ' + gap + ' zıplama var. Her zıplama aynı büyüklükte.'), 'think');
    } else if (G.hintStage === 2) {
      G.refs.beads[li].forEach(function (bd) { bd.classList.add('on'); });
      say('Bu yol ' + rule(L.step) + '. Kutuların arasındaki sayılara bak.', 'think');
    } else {
      var target = -1;
      for (var k = 0; k < L.ids.length && target < 0; k++) {
        if (isRight(L.ids[k])) continue;
        if ((k > 0 && isRight(L.ids[k - 1])) || (k + 1 < L.ids.length && isRight(L.ids[k + 1]))) target = k;
      }
      if (target < 0) for (k = 0; k < L.ids.length; k++) if (!isRight(L.ids[k])) { target = k; break; }
      if (target < 0) return;
      var id = L.ids[target];
      G.entry[id] = String(G.P.cells[id].v);
      G.state[id] = 'hint';
      if (G.sel === id) G.sel = -1;
      updateCells();
      anim(id, 'pop', 300);
      var nw = newlySolved(id);
      nw.forEach(function (x) { solveLine(x, true); });
      updateCells();
      if (checkWin()) return;
      say(nw.length ? 'Bu yol ' + rule(L.step) + '. Bu yol tamam!' : 'Bir sayıyı ben yazdım. Gerisi sende!', 'happy');
    }
  }

  /* -------------------------------------------- çözüm, baştan, geçiş */
  function revealAll() {
    closeModals();
    G.shown = true;
    G.P.cells.forEach(function (c, i) {
      if (!c.g && G.state[i] !== 'ok' && G.state[i] !== 'hint') { G.entry[i] = String(c.v); G.state[i] = 'shown'; }
    });
    G.P.lines.forEach(function (L, li) { if (!G.solved[li]) solveLine(li, false); });
    G.done = true; G.sel = -1;
    updateCells();
    say('İşte çözüm. Kutuların arasındaki sayılar her yolun adımını gösteriyor.', '');
  }

  function go(delta) {
    if (S.demo) { if (delta > 0) startGame(0, 0); else restart(); return; }
    var l = S.level, i = S.idx + delta;
    if (i < 0) { if (l > 0) { l--; i = DATA[l].length - 1; } else i = 0; }
    if (i >= DATA[l].length) { if (l < DATA.length - 1) { l++; i = 0; } else { goHome(); return; } }
    startGame(l, i);
  }

  function showWin(stars) {
    $('winM').innerHTML = ART.mascot(G.T.mascot);
    $('winTitle').textContent = pick(PRAISE);
    var h = '';
    for (var k = 0; k < 3; k++) h += ART.icon('star', 'fill' + (k < stars ? ' on' : ''));
    $('winStars').innerHTML = h;
    for (k = 0; k < stars; k++) (function (k) { setTimeout(function () { Snd.star(k); }, 250 * k + 150); })(k);
    $('winMsg').textContent = stars === 3 ? 'Hiç hata yapmadan, ipucu almadan çözdün.'
      : stars === 2 ? 'Az yardımla çözdün. Bir sonrakinde 3 yıldızı dene!'
        : 'Pes etmedin ve sonuna kadar çözdün.';
    var last = !S.demo && S.idx === DATA[S.level].length - 1;
    $('wNext').innerHTML = (S.demo ? 'İlk soruya geç' : last ? (S.level < DATA.length - 1 ? 'Sonraki seviye' : 'Ana sayfa') : 'Sonraki soru') + ART.icon('next');
    $('winModal').classList.add('on');
  }

  function openAsk() { if (G && !G.done) $('askModal').classList.add('on'); }
  function closeModals() {
    each(document.querySelectorAll('.modal.on'), function (m) { m.classList.remove('on'); });
    var v = $('howVideo');
    if (v && !v.paused) { try { v.pause(); } catch (e) { /* yok say */ } }
  }
  function modalOpen() { return !!document.querySelector('.modal.on'); }

  /* ------------------------------------------------- nasıl oynanır */
  var DEMO = (function () {
    var C = [], h = [9, 12, 15, 18, 21, 24], v = [12, 14, 16, 18, 20, 22, 24];
    v.forEach(function (x, r) { C.push([r, 3, x, r === 0 ? 1 : 0]); });
    h.forEach(function (x, c) { if (c !== 3) C.push([3, c, x, (c === 0 || c === 4) ? 1 : 0]); });
    return { w: 6, h: 7, t: 0, L: [['h', 3, 0, 6], ['v', 3, 0, 7]], C: C };
  })();

  var vidState = 0;
  function openHow() {
    closeModals();
    $('howModal').classList.add('on');
    var P = decode(DEMO), T = THEMES[0], el = $('demo');
    var refs = buildBoard(el, P, T);
    P.cells.forEach(function (c, i) {
      if (c.g) return;
      var b = refs.cells[i];
      b.className = 'cell blank shown' + (c.x ? ' cross' : '');
      b.querySelector('.num').textContent = c.v;
    });
    refs.beads.forEach(function (arr) { arr.forEach(function (b) { b.classList.add('on'); }); });
    fitTo(el, $('demoWrap'), 60);
    var v = $('howVideo');
    if (vidState === 0 && location.protocol !== 'file:') {
      vidState = 1;
      v.addEventListener('loadedmetadata', function () { vidState = 2; $('howMedia').classList.add('vid'); });
      v.addEventListener('error', function () { vidState = -1; $('howMedia').classList.remove('vid'); fitTo($('demo'), $('demoWrap'), 60); });
      v.poster = 'video/kapak.jpg';
      v.preload = 'metadata';
      v.src = 'video/nasil-oynanir.mp4';
    }
  }

  /* ------------------------------------------------------- konfeti */
  var fxRaf = 0;
  function confetti() {
    var cv = $('fx'), ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.width = Math.round(cv.clientWidth * dpr), H = cv.height = Math.round(cv.clientHeight * dpr);
    var cols = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8fd8', '#ffa94d', '#b197fc'];
    var parts = [];
    for (var i = 0; i < 150; i++) {
      parts.push({ x: W * (0.5 + (Math.random() - 0.5) * 0.35), y: H * 0.42, vx: (Math.random() - 0.5) * 17 * dpr, vy: (-Math.random() * 17 - 6) * dpr,
        s: (6 + Math.random() * 7) * dpr, c: pick(cols), r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, q: Math.random() < 0.6 });
    }
    cancelAnimationFrame(fxRaf);
    var t0 = 0, last = 0;
    function frame(t) {
      if (!t0) { t0 = t; last = t; }
      var dt = Math.min(2.5, (t - last) / 16.7); last = t;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.42 * dpr * dt; p.vx *= Math.pow(0.99, dt);
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.q) ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
        else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.283); ctx.fill(); }
        ctx.restore();
      });
      if (t - t0 < 3300) fxRaf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    }
    fxRaf = requestAnimationFrame(frame);
  }

  /* ----------------------------------------------- klavye ve dokunma */
  function moveSel(dr, dc) {
    if (!G || G.done) return;
    if (G.sel < 0) { var f = firstEditable(); if (f >= 0) select(f); return; }
    var cur = G.P.cells[G.sel], best = -1, bd = 1e9;
    G.P.cells.forEach(function (c, i) {
      if (i === G.sel || !editable(i)) return;
      var along = dr ? (c.r - cur.r) * dr : (c.c - cur.c) * dc;
      var across = dr ? Math.abs(c.c - cur.c) : Math.abs(c.r - cur.r);
      if (along <= 0) return;
      var d = along + across * 2.5;
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0) select(best);
  }

  function tabSel(dir) {
    if (!G || G.done) return;
    var o = orderedCells().filter(editable);
    if (!o.length) return;
    var k = o.indexOf(G.sel);
    k = k < 0 ? 0 : (k + dir + o.length) % o.length;
    select(o[k]);
  }

  document.addEventListener('keydown', function (ev) {
    var k = ev.key;
    if (modalOpen()) {
      if (k === 'Escape') { closeModals(); ev.preventDefault(); }
      else if (k === 'Enter' && $('winModal').classList.contains('on')) { $('wNext').click(); ev.preventDefault(); }
      return;
    }
    if (S.screen !== 'game' || !G || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (/^[0-9]$/.test(k)) { typeDigit(k); ev.preventDefault(); }
    else if (k === 'Backspace' || k === 'Delete') { backspace(); ev.preventDefault(); }
    else if (k === 'Enter') { check(); ev.preventDefault(); }
    else if (k === 'ArrowLeft') { moveSel(0, -1); ev.preventDefault(); }
    else if (k === 'ArrowRight') { moveSel(0, 1); ev.preventDefault(); }
    else if (k === 'ArrowUp') { moveSel(-1, 0); ev.preventDefault(); }
    else if (k === 'ArrowDown') { moveSel(1, 0); ev.preventDefault(); }
    else if (k === 'Tab') { tabSel(ev.shiftKey ? -1 : 1); ev.preventDefault(); }
    else if (k === 'Escape') { G.sel = -1; updateCells(); }
  });

  function on(id, fn) { $(id).addEventListener('click', function (ev) { Snd.init(); fn(ev); }); }

  function boot() {
    fillIcons();
    $('heroM').innerHTML = ART.mascot('kurbaga');
    homeDeco();
    renderHome();
    setSound(true);

    $('levels').addEventListener('click', function (ev) {
      var b = ev.target.closest('.lvl');
      if (!b) return;
      Snd.init(); Snd.tap();
      openMap(+b.getAttribute('data-l'));
    });
    $('mapGrid').addEventListener('click', function (ev) {
      var b = ev.target.closest('.mb');
      if (!b) return;
      Snd.init(); Snd.tap();
      startGame(S.level, +b.getAttribute('data-i'));
    });
    $('board').addEventListener('click', function (ev) {
      var b = ev.target.closest('.cell');
      if (!b || !G) return;
      Snd.init();
      var i = +b.getAttribute('data-i');
      if (editable(i)) select(i);
      else { anim(i, 'wig', 400); if (G.P.cells[i].g && !G.done) say('Bu sayı verilmiş. Boş kutulara yaz.', ''); }
    });
    $('keypad').addEventListener('click', function (ev) {
      var b = ev.target.closest('.key');
      if (!b) return;
      Snd.init();
      var k = b.getAttribute('data-k');
      if (k === 'del') backspace(); else typeDigit(k);
    });

    on('howBtn', openHow);
    on('howOk', closeModals);
    on('sndBtn', function () { setSound(!S.sound); Snd.tap(); });
    on('gSnd', function () { setSound(!S.sound); Snd.tap(); });
    on('fsBtn', toggleFull);
    on('gFs', toggleFull);
    on('mapHome', goHome);
    on('gHome', goHome);
    on('gMap', function () { openMap(S.demo ? 0 : S.level); });
    on('gPrev', function () { go(-1); });
    on('gNext', function () { go(1); });
    on('aCheck', check);
    on('aHint', hint);
    on('aReset', function () { restart(true); say('Baştan başlıyoruz!', ''); });
    on('aShow', openAsk);
    on('askYes', revealAll);
    on('askNo', closeModals);
    on('wNext', function () { go(1); });
    on('wAgain', function () { restart(); });
    on('wMap', function () { openMap(S.demo ? 0 : S.level); });
    on('howDemo', function () { startGame(-1, 0); });
    each(document.querySelectorAll('.modal'), function (m) {
      m.addEventListener('click', function (ev) { if (ev.target === m && m.id !== 'winModal') closeModals(); });
    });
    window.addEventListener('resize', function () {
      fitBoard();
      if ($('howModal').classList.contains('on') && vidState !== 2) fitTo($('demo'), $('demoWrap'), 60);
    });
  }

  // Otomatik test için küçük bir kapı (oyunu etkilemez)
  window.RSM = {
    data: DATA, state: S, start: startGame, type: typeDigit, check: check, hint: hint, back: backspace,
    sel: function (i) { select(i, true); }, how: openHow,
    game: function () { return G; }, decode: decode, rule: rule, eachWord: eachWord
  };

  boot();
})();
