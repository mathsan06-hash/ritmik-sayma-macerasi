/* Ritmik Sayma Macerası: çizimler (hücre şekilleri, maskotlar, ikonlar, arka plan süsleri).
   Tüm çizimler bu oyun için yazılmış özgün SVG'lerdir. */
var ART = (function () {
  'use strict';
  var INK = '#2b2d42';

  function f1(x) { return Math.round(x * 10) / 10; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function starPath(cx, cy, R, r, n) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var a = -Math.PI / 2 + i * Math.PI / n;
      var rad = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + f1(cx + rad * Math.cos(a)) + ' ' + f1(cy + rad * Math.sin(a));
    }
    return d + 'Z';
  }

  function ring(cx, cy, dist, pr, n, rot) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var a = (rot || 0) + i * 2 * Math.PI / n;
      s += '<circle cx="' + f1(cx + dist * Math.cos(a)) + '" cy="' + f1(cy + dist * Math.sin(a)) + '" r="' + pr + '"/>';
    }
    return s;
  }

  /* ------------------------------------------------ hücre şekilleri (0..100) */
  var SHAPES = {
    balloon:
      '<path class="p" d="M44 86 L56 86 L50 95 Z"/>' +
      '<path class="b" d="M50 5 C75 5 91 24 91 46 C91 69 70 85 50 88 C30 85 9 69 9 46 C9 24 25 5 50 5 Z"/>' +
      '<ellipse class="w" cx="30" cy="28" rx="7" ry="13" transform="rotate(32 30 28)"/>',
    hex:
      '<path class="b" d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z"/>' +
      '<path class="w" d="M20 33 L50 15.5 L56 19 L24 37.5 Z"/>',
    star:
      '<path class="b" d="' + starPath(50, 54, 49, 31, 5) + '"/>' +
      '<circle class="w" cx="37" cy="37" r="4.5"/>',
    flower:
      '<g class="p">' + ring(50, 50, 31, 17, 8, Math.PI / 8) + '</g>' +
      '<circle class="b" cx="50" cy="50" r="30"/>',
    apple:
      '<path class="b" d="M50 27 C43 18 26 15 16 26 C5 39 8 62 20 79 C29 92 41 96 50 90 C59 96 71 92 80 79 C92 62 95 39 84 26 C74 15 57 18 50 27 Z"/>' +
      '<path class="n" d="M50 27 C50 19 52 12 57 6"/>' +
      '<path class="g" d="M55 15 C61 4 76 3 84 7 C78 17 64 21 55 15 Z"/>' +
      '<ellipse class="w" cx="27" cy="44" rx="5.5" ry="10" transform="rotate(18 27 44)"/>',
    fish:
      '<path class="p" d="M78 50 L97 29 Q90 50 97 71 Z"/>' +
      '<path class="p" d="M34 21 Q48 5 64 20 Z"/>' +
      '<ellipse class="b" cx="45" cy="50" rx="40" ry="32"/>' +
      '<circle class="ey" cx="18" cy="35" r="6"/><circle class="k" cx="17" cy="35.5" r="3"/>',
    candy:
      '<path class="p" d="M21 50 L3 35 L8 50 L3 65 Z"/><path class="p" d="M79 50 L97 35 L92 50 L97 65 Z"/>' +
      '<circle class="b" cx="50" cy="50" r="34"/>' +
      '<path class="wl" d="M27 39 A25 25 0 0 1 47 24"/>',
    lily:
      '<path class="b" d="M50 31 L59.6 7 A46 46 0 1 1 40.4 7 Z"/>' +
      '<path class="wl" d="M16 63 A36 36 0 0 0 38 88"/>',
    cross:
      '<rect class="b" x="5" y="5" width="90" height="90" rx="22"/>' +
      '<rect class="ring" x="14" y="14" width="72" height="72" rx="15"/>'
  };

  function shape(name) {
    return '<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">' + SHAPES[name] + '</svg>';
  }

  /* --------------------------------------------------------- maskotlar */
  var SHADOW = '<ellipse cx="60" cy="114" rx="36" ry="5" fill="rgba(0,0,0,.13)"/>';

  function eyes(cx, cy, dx, r, sclera) {
    var s = '<g class="eyes">';
    [-1, 1].forEach(function (k) {
      var x = cx + k * dx;
      if (sclera) {
        s += '<circle cx="' + x + '" cy="' + cy + '" r="' + r + '" fill="#fff"/>';
        s += '<circle cx="' + f1(x + r * 0.12) + '" cy="' + f1(cy + r * 0.12) + '" r="' + f1(r * 0.58) + '" fill="' + INK + '"/>';
        s += '<circle cx="' + f1(x + r * 0.32) + '" cy="' + f1(cy - r * 0.2) + '" r="' + f1(r * 0.22) + '" fill="#fff"/>';
      } else {
        s += '<circle cx="' + x + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>';
        s += '<circle cx="' + f1(x + r * 0.35) + '" cy="' + f1(cy - r * 0.35) + '" r="' + f1(r * 0.34) + '" fill="#fff"/>';
      }
    });
    return s + '</g>';
  }

  function mouths(cx, y, w, col) {
    col = col || INK;
    return '<g class="m-smile"><path d="M' + (cx - w) + ' ' + y + ' Q' + cx + ' ' + f1(y + w * 0.9) + ' ' + (cx + w) + ' ' + y +
      '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g class="m-happy"><path d="M' + (cx - w - 2) + ' ' + (y - 1) + ' Q' + cx + ' ' + f1(y + w * 1.7) + ' ' + (cx + w + 2) + ' ' + (y - 1) +
      ' Z" fill="' + col + '"/><path d="M' + f1(cx - w * 0.55) + ' ' + f1(y + w * 0.55) + ' Q' + cx + ' ' + f1(y + w * 1.15) + ' ' +
      f1(cx + w * 0.55) + ' ' + f1(y + w * 0.55) + ' Z" fill="#ff7a90"/></g>' +
      '<g class="m-oh"><ellipse cx="' + cx + '" cy="' + (y + 3) + '" rx="' + f1(w * 0.42) + '" ry="' + f1(w * 0.55) + '" fill="' + col + '"/></g>';
  }

  function cheeks(cx, y, dx) {
    return '<ellipse cx="' + (cx - dx) + '" cy="' + y + '" rx="6" ry="3.6" fill="#ff8fa3" opacity=".75"/>' +
      '<ellipse cx="' + (cx + dx) + '" cy="' + y + '" rx="6" ry="3.6" fill="#ff8fa3" opacity=".75"/>';
  }

  function antennae(y0, col) {
    return '<path d="M50 ' + y0 + ' Q45 ' + (y0 - 16) + ' 37 ' + (y0 - 21) + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="37" cy="' + (y0 - 22) + '" r="4.2" fill="' + col + '"/>' +
      '<path d="M70 ' + y0 + ' Q75 ' + (y0 - 16) + ' 83 ' + (y0 - 21) + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="83" cy="' + (y0 - 22) + '" r="4.2" fill="' + col + '"/>';
  }

  var MASCOTS = {
    kurbaga: function () {
      var G = '#5bc35b', D = '#3f9e45';
      return SHADOW +
        '<ellipse cx="36" cy="106" rx="15" ry="7" fill="' + D + '"/><ellipse cx="84" cy="106" rx="15" ry="7" fill="' + D + '"/>' +
        '<ellipse cx="60" cy="80" rx="46" ry="31" fill="' + G + '"/>' +
        '<circle cx="35" cy="48" r="17" fill="' + G + '"/><circle cx="85" cy="48" r="17" fill="' + G + '"/>' +
        '<ellipse cx="60" cy="94" rx="27" ry="13" fill="#b9eeb0"/>' +
        eyes(60, 47, 25, 11, true) +
        '<circle cx="55" cy="65" r="1.8" fill="' + D + '"/><circle cx="65" cy="65" r="1.8" fill="' + D + '"/>' +
        cheeks(60, 78, 33) + mouths(60, 73, 15);
    },
    tavsan: function () {
      var W = '#f7f4fc', E = '#d8d0ea';
      return SHADOW +
        '<g transform="rotate(-12 44 36)"><ellipse cx="44" cy="34" rx="11" ry="27" fill="' + W + '" stroke="' + E + '" stroke-width="2"/><ellipse cx="44" cy="37" rx="5.5" ry="19" fill="#ffc2d4"/></g>' +
        '<g transform="rotate(12 76 36)"><ellipse cx="76" cy="34" rx="11" ry="27" fill="' + W + '" stroke="' + E + '" stroke-width="2"/><ellipse cx="76" cy="37" rx="5.5" ry="19" fill="#ffc2d4"/></g>' +
        '<circle cx="60" cy="76" r="36" fill="' + W + '" stroke="' + E + '" stroke-width="2"/>' +
        eyes(60, 70, 14, 5.5, false) +
        '<path d="M56 79 L64 79 L60 84 Z" fill="#ff7aa2"/>' +
        cheeks(60, 85, 24) + mouths(60, 89, 8);
    },
    ari: function () {
      return SHADOW +
        '<ellipse cx="35" cy="44" rx="15" ry="22" transform="rotate(-28 35 44)" fill="#e2f5ff" stroke="#9fd3f2" stroke-width="2"/>' +
        '<ellipse cx="85" cy="44" rx="15" ry="22" transform="rotate(28 85 44)" fill="#e2f5ff" stroke="#9fd3f2" stroke-width="2"/>' +
        antennae(40, INK) +
        '<circle cx="60" cy="74" r="38" fill="#ffd43b" stroke="#e8a400" stroke-width="2"/>' +
        '<path d="M24.7 88 L95.3 88 L91 96 L29 96 Z" fill="' + INK + '"/>' +
        '<path d="M33.3 101 L86.7 101 L77 108 L43 108 Z" fill="' + INK + '"/>' +
        eyes(60, 63, 14, 8, true) + cheeks(60, 75, 25) + mouths(60, 75, 8);
    },
    robot: function () {
      return SHADOW +
        '<line x1="60" y1="32" x2="60" y2="17" stroke="#7083a8" stroke-width="4"/><circle class="lamp" cx="60" cy="13" r="6.5" fill="#ff6b6b"/>' +
        '<rect x="13" y="58" width="11" height="24" rx="5" fill="#7083a8"/><rect x="96" y="58" width="11" height="24" rx="5" fill="#7083a8"/>' +
        '<rect x="21" y="31" width="78" height="74" rx="22" fill="#a9c9ff" stroke="#6d8fd8" stroke-width="3"/>' +
        '<rect x="31" y="45" width="58" height="44" rx="13" fill="#1f2b4d"/>' +
        '<g class="eyes"><circle cx="47" cy="62" r="6.5" fill="#7df9ff"/><circle cx="73" cy="62" r="6.5" fill="#7df9ff"/></g>' +
        mouths(60, 75, 8, '#7df9ff') +
        '<circle cx="31" cy="97" r="2.6" fill="#6d8fd8"/><circle cx="89" cy="97" r="2.6" fill="#6d8fd8"/>';
    },
    ugur: function () {
      return SHADOW + antennae(34, INK) +
        '<circle cx="60" cy="76" r="38" fill="#ff4d4d" stroke="#c92a2a" stroke-width="2"/>' +
        '<path d="M60 56 L60 113" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="39" cy="78" r="6.5" fill="' + INK + '"/><circle cx="81" cy="78" r="6.5" fill="' + INK + '"/>' +
        '<circle cx="45" cy="99" r="5.5" fill="' + INK + '"/><circle cx="75" cy="99" r="5.5" fill="' + INK + '"/>' +
        '<ellipse cx="60" cy="50" rx="30" ry="23" fill="' + INK + '"/>' +
        eyes(60, 47, 11, 7, true) + cheeks(60, 59, 21) + mouths(60, 58, 7, '#fff');
    },
    kirpi: function () {
      return SHADOW +
        '<path d="' + starPath(60, 66, 49, 36, 14) + '" fill="#8d5a3b" stroke="#6b4129" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="37" cy="50" r="8" fill="#f2c48f"/><circle cx="83" cy="50" r="8" fill="#f2c48f"/>' +
        '<ellipse cx="60" cy="78" rx="31" ry="28" fill="#f6d6a8"/>' +
        eyes(60, 72, 12, 5, false) +
        '<ellipse cx="60" cy="84" rx="5.5" ry="4.2" fill="' + INK + '"/>' +
        cheeks(60, 86, 21) + mouths(60, 91, 6);
    },
    ahtapot: function () {
      var P = '#b197fc', D = '#9775fa', legs = '';
      [[28, 95, 32], [44, 103, 12], [60, 106, 0], [76, 103, -12], [92, 95, -32]].forEach(function (l) {
        legs += '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="8" ry="15" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + l[1] + ')" fill="' + P + '" stroke="' + D + '" stroke-width="2"/>';
      });
      return SHADOW + legs +
        '<ellipse cx="60" cy="60" rx="40" ry="38" fill="' + P + '" stroke="' + D + '" stroke-width="2"/>' +
        '<circle cx="40" cy="37" r="5" fill="#d6c8ff"/><circle cx="77" cy="32" r="4" fill="#d6c8ff"/><circle cx="88" cy="48" r="3" fill="#d6c8ff"/>' +
        eyes(60, 62, 14, 8.5, true) + cheeks(60, 76, 26) + mouths(60, 78, 8);
    },
    kedi: function () {
      var O = '#ffa94d', D = '#e8590c';
      return SHADOW +
        '<path d="M28 54 L33 16 L58 40 Z" fill="' + O + '" stroke="' + D + '" stroke-width="2" stroke-linejoin="round"/><path d="M34 46 L37 26 L50 40 Z" fill="#ffc9de"/>' +
        '<path d="M92 54 L87 16 L62 40 Z" fill="' + O + '" stroke="' + D + '" stroke-width="2" stroke-linejoin="round"/><path d="M86 46 L83 26 L70 40 Z" fill="#ffc9de"/>' +
        '<ellipse cx="60" cy="72" rx="41" ry="36" fill="' + O + '" stroke="' + D + '" stroke-width="2"/>' +
        '<path d="M54 39 L56 49 M60 37 L60 48 M66 39 L64 49" stroke="' + D + '" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="88" rx="17" ry="11" fill="#fff1e0"/>' +
        eyes(60, 67, 15, 8, true) +
        '<path d="M56 80 L64 80 L60 85 Z" fill="#ff7aa2"/>' +
        '<path d="M41 86 L19 82 M41 90 L19 95 M79 86 L101 82 M79 90 L101 95" stroke="' + D + '" stroke-width="2" stroke-linecap="round"/>' +
        cheeks(60, 81, 28) + mouths(60, 89, 6);
    }
  };

  function mascot(name) {
    return '<svg class="msvg" viewBox="0 0 120 120" aria-hidden="true">' + MASCOTS[name]() + '</svg>';
  }

  /* --------------------------------------------------------------- ikonlar */
  var ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-5.5h4v5.5h4.5V10"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    full: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    check: '<path d="M4.5 12.5l5 5L20 7"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    back: '<path d="M9 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3 12z"/><path d="M11.5 9.5l5 5M16.5 9.5l-5 5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 17.2v.1"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>'
  };

  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  /* --------------------------------------------------- arka plan süsleri */
  var CLOUD = '<svg viewBox="0 0 120 60"><path d="M25 52 C8 52 6 32 22 30 C22 14 44 10 52 22 C58 6 86 8 88 26 C104 24 112 46 96 52 Z" fill="#fff"/></svg>';

  function bee(size) {
    return '<svg viewBox="0 0 60 44" width="' + size + '"><ellipse cx="22" cy="12" rx="9" ry="12" fill="#fff" opacity=".8" transform="rotate(-20 22 12)"/>' +
      '<ellipse cx="36" cy="12" rx="9" ry="12" fill="#fff" opacity=".8" transform="rotate(20 36 12)"/>' +
      '<ellipse cx="29" cy="28" rx="20" ry="14" fill="#ffd43b" stroke="#c78a00" stroke-width="2"/>' +
      '<path d="M24 15 L24 41 M33 15 L33 41" stroke="' + INK + '" stroke-width="5"/><circle cx="44" cy="25" r="2.4" fill="' + INK + '"/></svg>';
  }

  function flowerSmall(col) {
    return '<svg viewBox="0 0 40 80" width="34"><path d="M20 30 L20 80" stroke="#3c9a46" stroke-width="4"/><path d="M20 58 Q8 50 6 40 Q18 44 20 58" fill="#5cb85c"/>' +
      '<g fill="' + col + '">' + ring(20, 20, 10, 8, 5, -Math.PI / 2) + '</g><circle cx="20" cy="20" r="7" fill="#ffd43b"/></svg>';
  }

  function seaweed(h) {
    return '<svg viewBox="0 0 30 100" width="' + Math.round(h * 0.3) + '" height="' + h + '" preserveAspectRatio="none"><path d="M15 100 C2 80 28 70 14 50 C2 32 26 22 16 2" stroke="#2f9e64" stroke-width="7" fill="none" stroke-linecap="round"/></svg>';
  }

  function reed(h) {
    return '<svg viewBox="0 0 30 100" width="' + Math.round(h * 0.3) + '" height="' + h + '" preserveAspectRatio="none"><path d="M15 100 L15 20" stroke="#4f8f3a" stroke-width="3"/><rect x="11" y="6" width="8" height="26" rx="4" fill="#8b5a2b"/><path d="M15 70 Q4 58 2 44" stroke="#5ea84a" stroke-width="3" fill="none"/></svg>';
  }

  function lolli(col) {
    return '<svg viewBox="0 0 60 120" width="46"><path d="M30 56 L30 120" stroke="#fff" stroke-width="6"/>' +
      '<circle cx="30" cy="30" r="27" fill="' + col + '"/><path d="M30 30 m-17 0 a17 17 0 1 1 17 17 a11 11 0 1 1 -11 -11 a5 5 0 1 1 5 5" stroke="#fff" stroke-width="4" fill="none" opacity=".85"/></svg>';
  }

  function item(cls, style, html) {
    return '<div class="dc ' + cls + '" style="' + style + '">' + html + '</div>';
  }

  function deco(key) {
    var h = '', i;
    switch (key) {
      case 'balon':
        for (i = 0; i < 5; i++) h += item('cloud', 'top:' + rnd(3, 62) + '%;width:' + rnd(90, 170) + 'px;animation-duration:' + rnd(50, 90) + 's;animation-delay:-' + rnd(0, 90) + 's', CLOUD);
        for (i = 0; i < 7; i++) h += item('rise', 'left:' + rnd(1, 97) + '%;animation-duration:' + rnd(16, 30) + 's;animation-delay:-' + rnd(0, 30) + 's',
          '<svg viewBox="0 0 40 62" width="' + Math.round(rnd(22, 36)) + '"><path d="M20 2C32 2 38 12 38 22 38 34 28 42 20 43 12 42 2 34 2 22 2 12 8 2 20 2Z" fill="' +
          pick(['#ff6b6b', '#ffd93d', '#4d96ff', '#ff8fd8', '#6bcb77', '#ffa94d']) + '" opacity=".8"/><path d="M20 43 Q15 51 20 60" stroke="#8a8fa8" stroke-width="1.5" fill="none"/></svg>');
        break;
      case 'petek':
        for (i = 0; i < 3; i++) h += item('buzz', 'top:' + rnd(8, 80) + '%;left:' + rnd(3, 85) + '%;animation-duration:' + rnd(6, 10) + 's;animation-delay:-' + rnd(0, 8) + 's', bee(Math.round(rnd(34, 50))));
        break;
      case 'uzay':
        for (i = 0; i < 46; i++) h += item('twinkle', 'top:' + rnd(0, 100) + '%;left:' + rnd(0, 100) + '%;width:' + rnd(2, 5) + 'px;height:' + rnd(2, 5) + 'px;animation-delay:-' + rnd(0, 3) + 's', '');
        h += item('planet', 'right:4%;top:10%;width:110px', '<svg viewBox="0 0 120 80"><ellipse cx="60" cy="42" rx="56" ry="12" fill="none" stroke="#ffd8a8" stroke-width="5" opacity=".7"/><circle cx="60" cy="40" r="26" fill="#ff922b"/><circle cx="52" cy="32" r="5" fill="#ffc078"/><circle cx="68" cy="48" r="4" fill="#e8590c" opacity=".6"/></svg>');
        h += item('planet', 'left:3%;bottom:8%;width:70px', '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="#74c0fc"/><path d="M18 30 Q32 22 40 34 Q50 46 62 38" stroke="#4dabf7" stroke-width="7" fill="none"/></svg>');
        break;
      case 'cicek':
        h += item('ground', '', '<svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 30 Q50 10 100 28 T200 26 T300 24 T400 28 L400 60 L0 60 Z" fill="#7bd06f"/></svg>');
        for (i = 0; i < 9; i++) h += item('sway', 'left:' + (i * 11 + rnd(0, 5)) + '%;bottom:' + rnd(0, 3) + '%;animation-delay:-' + rnd(0, 3) + 's', flowerSmall(pick(['#ff7eb6', '#ffb84d', '#b28dff', '#ff6b6b', '#5ec2ff'])));
        break;
      case 'elma':
        h += item('ground', '', '<svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 34 Q100 6 200 30 T400 22 L400 60 L0 60 Z" fill="#a9e17a"/></svg>');
        for (i = 0; i < 7; i++) h += item('fall', 'left:' + rnd(0, 96) + '%;animation-duration:' + rnd(9, 16) + 's;animation-delay:-' + rnd(0, 16) + 's',
          '<svg viewBox="0 0 30 20" width="' + Math.round(rnd(18, 28)) + '"><path d="M2 10 C8 0 22 0 28 10 C22 20 8 20 2 10Z" fill="' + pick(['#6bbf59', '#8bd450', '#f4a261']) + '"/></svg>');
        break;
      case 'deniz':
        for (i = 0; i < 14; i++) h += item('bubble', 'left:' + rnd(0, 98) + '%;width:' + rnd(8, 26) + 'px;animation-duration:' + rnd(7, 15) + 's;animation-delay:-' + rnd(0, 15) + 's', '');
        h += item('ground', '', '<svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 22 Q60 12 120 20 T260 18 T400 20 L400 40 L0 40 Z" fill="#f6d79b"/></svg>');
        for (i = 0; i < 8; i++) h += item('sway', 'left:' + (i * 12.5 + rnd(0, 6)) + '%;bottom:2%;animation-delay:-' + rnd(0, 3) + 's', seaweed(Math.round(rnd(70, 140))));
        break;
      case 'seker':
        h += item('sway', 'left:2%;bottom:0', lolli('#ff70a6')) + item('sway', 'right:3%;bottom:0;animation-delay:-1.4s', lolli('#70d6ff'));
        break;
      case 'gol':
        for (i = 0; i < 6; i++) h += item('ripple', 'top:' + rnd(10, 85) + '%;left:' + rnd(3, 90) + '%;animation-delay:-' + rnd(0, 4) + 's', '');
        for (i = 0; i < 9; i++) h += item('sway', 'left:' + (i < 5 ? rnd(0, 18) : rnd(80, 98)) + '%;bottom:0;animation-delay:-' + rnd(0, 3) + 's', reed(Math.round(rnd(90, 160))));
        break;
    }
    return h;
  }

  return { shape: shape, mascot: mascot, icon: icon, deco: deco, starPath: starPath, rnd: rnd, pick: pick };
})();
