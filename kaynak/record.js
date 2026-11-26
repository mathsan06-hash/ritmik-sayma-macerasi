// "Nasıl oynanır?" videosu için oyunu kare kare filme alır.
// Sanal saat: JS zamanlayıcıları page.clock ile, CSS animasyonları Web Animations API ile her karede elle ilerletilir.
// Kullanım: node kaynak/record.js            -> tüm kareler (kaynak/video-is/kareler/<sahne>/00000.jpg)
//           PREVIEW=1 node kaynak/record.js  -> yalnız denetim karelerini kaynak/video-is/onizleme/ içine yazar
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const W = 1280, H = 720, FPS = 30, CAPH = 96;
const ROOT = path.resolve(__dirname, '..');
const WORK = path.join(__dirname, 'video-is');
const FRAMES = path.join(WORK, 'kareler');
const PREV = path.join(WORK, 'onizleme');
const PREVIEW = !!process.env.PREVIEW;

const FAKE_AUDIO = `(function(){
  window.__notes = [];
  function P(){ this.ev = []; }
  P.prototype.setValueAtTime = function(v,t){ this.ev.push(['set',v,t]); return this; };
  P.prototype.exponentialRampToValueAtTime = function(v,t){ this.ev.push(['exp',v,t]); return this; };
  P.prototype.linearRampToValueAtTime = function(v,t){ this.ev.push(['lin',v,t]); return this; };
  function N(){} N.prototype.connect = function(n){ this.out = n; return n; }; N.prototype.disconnect = function(){};
  function Gain(){ this.gain = new P(); } Gain.prototype = Object.create(N.prototype);
  function Osc(){ this.type = 'sine'; this.frequency = new P(); } Osc.prototype = Object.create(N.prototype);
  Osc.prototype.start = function(t){ this.t0 = t; };
  Osc.prototype.stop = function(t){ window.__notes.push({ type: this.type, f: this.frequency.ev, g: (this.out && this.out.gain) ? this.out.gain.ev : [], t0: this.t0, t1: t }); };
  function Ctx(){ this.state = 'running'; this.destination = new N(); }
  Object.defineProperty(Ctx.prototype, 'currentTime', { get: function(){ return (window.__vnow || 0) / 1000; } });
  Ctx.prototype.resume = function(){ return Promise.resolve(); };
  Ctx.prototype.createOscillator = function(){ return new Osc(); };
  Ctx.prototype.createGain = function(){ return new Gain(); };
  window.AudioContext = Ctx; window.webkitAudioContext = Ctx;
})();`;

const OVERLAY_CSS = `
#app{bottom:${CAPH}px!important}
#__cap{position:fixed;left:0;right:0;bottom:0;height:${CAPH}px;background:#fff;z-index:99990;display:flex;align-items:center;
  padding:0 34px 0 16px;font-family:'Baloo 2',sans-serif;box-shadow:0 -4px 14px rgba(38,41,74,.12)}
#__cap:before{content:'';position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,#ff4f8b,#ff9f1c,#ffd43b,#2fbf71,#2f7cf6,#a43fd1)}
#__capm{width:74px;height:74px;flex:none;margin:4px 16px 0 0}
#__capt{font-weight:800;font-size:30px;line-height:1.14;color:#26294a}
#__cur{position:fixed;left:0;top:0;width:46px;height:46px;border-radius:50%;background:rgba(28,28,70,.3);border:4px solid #fff;
  box-shadow:0 3px 12px rgba(0,0,0,.35);z-index:99999;pointer-events:none;opacity:0}
#__rip{position:fixed;left:0;top:0;width:66px;height:66px;border-radius:50%;border:5px solid #fff;box-shadow:0 0 0 3px rgba(47,124,246,.55);
  z-index:99998;pointer-events:none;opacity:0}
#__card{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99995;display:none;flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#bfe6ff 0%,#e6f6ff 50%,#fff3dc 100%);font-family:'Baloo 2',sans-serif;overflow:hidden}
#__card .cbg{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden}
#__card .ct{position:relative;font-size:92px;margin:0}
#__card .cs{position:relative;margin-top:22px;background:#ffcd38;color:#5a3b00;font-weight:800;font-size:46px;line-height:1.2;padding:4px 34px 8px;
  border-radius:24px;box-shadow:0 7px 0 #d9a300}
#__card .cm{position:relative;display:flex;margin-top:30px}
#__card .cm .mascot{width:150px;height:150px;margin:0 4px}
#__card .cm.many .mascot{width:128px;height:128px}
#__card .hills{height:16%}
`;

function overlayJS() {
  const cap = document.createElement('div');
  cap.id = '__cap';
  cap.innerHTML = '<div id="__capm" class="mascot">' + ART.mascot('kurbaga') + '</div><div id="__capt"></div>';
  document.body.appendChild(cap);
  const cur = document.createElement('div'); cur.id = '__cur'; document.body.appendChild(cur);
  const rip = document.createElement('div'); rip.id = '__rip'; document.body.appendChild(rip);
  const card = document.createElement('div'); card.id = '__card'; document.body.appendChild(card);
  const seen = new WeakMap();
  window.__card = function (kind) {
    const title = document.getElementById('title').innerHTML;
    const hills = document.querySelector('#home .hills').outerHTML;
    const bg = '<div class="cbg">' + document.getElementById('hbg').innerHTML + '</div>' + hills;
    if (kind === 'intro') {
      card.innerHTML = bg + '<h1 class="title ct">' + title + '</h1><div class="cs">Nasıl oynanır?</div>' +
        '<div class="cm"><div class="mascot">' + ART.mascot('kurbaga') + '</div></div>';
    } else {
      card.innerHTML = bg + '<h1 class="title ct">' + title + '</h1><div class="cs">Haydi, sen de dene!</div><div class="cm many">' +
        ['tavsan', 'ari', 'robot', 'ugur', 'kirpi', 'ahtapot', 'kedi', 'kurbaga'].map(function (m, i) {
          return '<div class="mascot" style="animation-delay:-' + (i * 0.35).toFixed(2) + 's">' + ART.mascot(m) + '</div>';
        }).join('') + '</div>';
    }
  };
  window.__frame = function (s, v) {
    window.__vnow = v;
    cur.style.opacity = String(s.cvis);
    cur.style.transform = 'translate(' + s.cx + 'px,' + s.cy + 'px) translate(-50%,-50%) scale(' + (1 - 0.25 * s.press) + ')';
    if (s.rip >= 0) {
      rip.style.opacity = String((1 - s.rip) * 0.95);
      rip.style.transform = 'translate(' + s.ripx + 'px,' + s.ripy + 'px) translate(-50%,-50%) scale(' + (0.4 + s.rip * 1.4) + ')';
    } else rip.style.opacity = '0';
    const t = document.getElementById('__capt');
    if (t.textContent !== s.cap) t.textContent = s.cap;
    t.style.opacity = String(s.capop);
    card.style.opacity = String(s.cardop);
    card.style.display = s.cardop > 0 ? 'flex' : 'none';
    document.getAnimations().forEach(function (a) {
      let st0 = seen.get(a);
      if (st0 === undefined) { st0 = v; seen.set(a, st0); }
      if (a.playState !== 'paused') a.pause();
      a.currentTime = v - st0;
    });
  };
}

let page, frameNo = 0, sceneName = '', sceneFrame = 0;
const st = { cx: 640, cy: 300, cvis: 0, press: 0, rip: -1, ripx: 0, ripy: 0, cap: '', capop: 0, cardop: 0 };
const sceneList = [];

async function frame() {
  const a = Math.round(frameNo * 1000 / FPS), b = Math.round((frameNo + 1) * 1000 / FPS);
  await page.clock.runFor(b - a);
  await page.evaluate(([s, v]) => window.__frame(s, v), [st, b]);
  if (!PREVIEW) {
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    fs.writeFileSync(path.join(FRAMES, sceneName, String(sceneFrame).padStart(5, '0') + '.jpg'), buf);
  }
  frameNo++; sceneFrame++;
}
async function snap(name) {
  if (!PREVIEW) return;
  await page.screenshot({ path: path.join(PREV, name + '.jpg'), type: 'jpeg', quality: 92 });
}
function scene(name) {
  sceneName = name; sceneFrame = 0; sceneList.push(name);
  if (!PREVIEW) fs.mkdirSync(path.join(FRAMES, name), { recursive: true });
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
async function hold(sec) { const n = Math.round(sec * FPS); for (let i = 0; i < n; i++) await frame(); }
async function center(sel) {
  const p = await page.evaluate(s => {
    const e = document.querySelector(s);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel);
  if (!p) throw new Error('öğe yok: ' + sel);
  return p;
}
async function moveTo(x, y, sec) {
  const x0 = st.cx, y0 = st.cy, d = Math.hypot(x - x0, y - y0);
  if (sec === undefined) sec = Math.min(0.75, Math.max(0.22, d / 1100));
  const n = Math.max(1, Math.round(sec * FPS)), from = st.cvis;
  for (let i = 1; i <= n; i++) {
    const e = ease(i / n);
    st.cx = x0 + (x - x0) * e; st.cy = y0 + (y - y0) * e;
    st.cvis = Math.min(1, from + i / 6);
    await frame();
  }
  await page.mouse.move(x, y);
}
async function moveSel(sel, sec) { const p = await center(sel); await moveTo(p.x, p.y, sec); }
async function tapHere() {
  await page.mouse.move(st.cx, st.cy);
  await page.mouse.down();
  for (let i = 1; i <= 2; i++) { st.press = i / 2; await frame(); }
  await page.mouse.up();
  st.ripx = st.cx; st.ripy = st.cy; st.rip = 0;
  for (let i = 1; i <= 8; i++) { st.press = Math.max(0, 1 - i / 3); st.rip = i / 8; await frame(); }
  st.rip = -1; st.press = 0;
}
async function tap(sel, sec) { await moveSel(sel, sec); await tapHere(); }
async function keys(digits) { for (const d of digits) await tap('#keypad .key[data-k="' + d + '"]', 0.22); }
async function key(k, after) { await page.keyboard.press(k); await hold(after); }
async function caption(text) {
  if (st.capop > 0) for (let i = 1; i <= 4; i++) { st.capop = 1 - i / 4; await frame(); }
  st.cap = text;
  for (let i = 1; i <= 6; i++) { st.capop = i / 6; await frame(); }
}
async function hideCursor() { const f = st.cvis; for (let i = 1; i <= 6; i++) { st.cvis = f * (1 - i / 6); await frame(); } st.cvis = 0; }
async function cardFade(to, sec) {
  const from = st.cardop, n = Math.round(sec * FPS);
  for (let i = 1; i <= n; i++) { st.cardop = from + (to - from) * ease(i / n); await frame(); }
}
const ev = (fn, arg) => page.evaluate(fn, arg);
const hop = id => ev(i => {
  const el = document.querySelector('#board .cell[data-i="' + i + '"] .in');
  el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
}, id);
const glow = (idxs, on) => ev(([idxs, on]) => {
  const t = document.querySelectorAll('#board .track');
  idxs.forEach(i => t[i].classList.toggle('glow', on));
}, [idxs, on]);

async function story() {
  // 1) Giriş kartı
  scene('01-giris');
  await ev(() => window.__card('intro'));
  st.cardop = 1;
  await hold(0.6); await snap('01-giris');
  await hold(2.0);
  await cardFade(0, 0.6);

  // 2) Ana sayfa
  scene('02-ana-sayfa');
  await caption('Dört seviye var: Kolay, Orta, Zor ve Çok Zor. Hepsinde 100’er soru, toplam 400 soru!');
  for (const l of [0, 1, 2, 3]) { await moveSel('.lvl[data-l="' + l + '"]', 0.4); await hold(0.45); }
  await snap('02-ana-sayfa');
  await caption('Önce örnek soruyu birlikte çözelim.');
  await tap('#howBtn');
  await hold(0.9); await snap('03-pencere');
  await tap('#howDemo');
  await hold(0.5);

  // 3) Kurallar
  scene('03-kurallar');
  await caption('Her yol hep aynı adımla sayar. Kare kutu, iki yolun ortak kutusudur.');
  await glow([0, 1], true);
  await moveSel('#board .cell[data-i="3"]', 0.5);
  await hold(1.0); await snap('04-kurallar');
  await hold(1.0);
  await glow([0, 1], false);
  await caption('Yatay yolda 9 ve 21 belli. 9’dan 21’e kaç zıplamada varılıyor?');
  await glow([0], true);
  await moveSel('#board .cell[data-i="7"]', 0.45);
  for (const id of [8, 9, 3, 10]) { await hop(id); await hold(0.42); }
  await moveSel('#board .cell[data-i="10"]', 0.3);
  await hold(0.9);
  await caption('4 zıplama! 2’şer sayarsak 17’de kalırız, 3’er sayarsak tam 21’e varırız.');
  await hold(2.8);
  await glow([0], false);

  // 4) Yatay yolu tuşlarla doldur
  scene('04-yatay');
  await caption('Boş kutuya dokun, sayıyı alttaki tuşlarla yaz.');
  await tap('#board .cell[data-i="8"]'); await keys('12');
  await tap('#board .cell[data-i="9"]'); await keys('15');
  await tap('#board .cell[data-i="3"]'); await keys('18');
  await snap('05-yaziyor');
  await tap('#board .cell[data-i="11"]'); await keys('24');
  await hold(0.5);
  await caption('Yol tamamlanınca kutuların arasında adım görünür: 3’er 3’er ileri!');
  await hold(1.0); await snap('06-yatay-tamam');
  await hold(1.4);

  // 5) Dikey yol, klavye ve bir yanlış
  scene('05-dikey');
  await caption('Ortak kutuda 18 çıktı. Dikey yolda 12’den 18’e 3 zıplama var: 2’şer 2’şer!');
  await glow([1], true);
  await moveSel('#board .cell[data-i="0"]', 0.45); await hold(0.8);
  await moveSel('#board .cell[data-i="3"]', 0.45); await hold(1.6);
  await glow([1], false);
  await caption('Klavyeyle de yazabilirsin. Tab tuşu sonraki kutuya geçer.');
  await tap('#board .cell[data-i="1"]');
  await hideCursor();
  await key('1', 0.12); await key('4', 0.3); await key('Tab', 0.22);
  await key('1', 0.12); await key('6', 0.3); await key('Tab', 0.22);
  await key('2', 0.12); await key('0', 0.3); await key('Tab', 0.22);
  await key('2', 0.12); await key('3', 0.3); await key('Tab', 0.22);
  await key('2', 0.12); await key('4', 0.5);
  await caption('Emin değilsen Kontrol Et’e bas. Yanlış kutu kırmızı olur.');
  await tap('#aCheck');
  await hold(1.2); await snap('07-kontrol');
  await hold(0.6);
  await caption('Kırmızı kutuyu düzelt: 20’den sonra 22 gelir.');
  await tap('#board .cell[data-i="5"]'); await keys('22');
  await hold(1.0); await snap('08-konfeti');
  await hold(0.8);

  // 6) Yıldızlar
  scene('06-yildiz');
  await caption('Hatasız ve ipucusuz bitirene 3 yıldız! Biz bir hata yaptık, 2 yıldız aldık.');
  await hold(1.4); await snap('09-yildiz');
  await hold(1.6);

  // 7) İpucu
  scene('07-ipucu');
  await tap('#wNext');
  await hold(0.6);
  await caption('Takılırsan İpucu’na bas. Önce hangi yola bakacağını söyler.');
  await tap('#aHint');
  await hold(2.2); await snap('10-ipucu1');
  await caption('Bir daha basarsan yolun adımını gösterir. Ama ipucu yıldızı azaltır.');
  await tap('#aHint');
  await hold(2.2); await snap('11-ipucu2');

  // 8) Dünyalar
  scene('08-dunyalar');
  await hideCursor();
  await caption('Her soruda başka bir dünya: arı kovanı, uzay, deniz, çiçek bahçesi, kurbağa gölü...');
  const tour = [[1, 81], [1, 40], [2, 31], [3, 20], [3, 91]];
  for (let k = 0; k < tour.length; k++) {
    await ev(([l, i]) => {
      RSM.state.sound = false;
      RSM.start(l, i, true);
      const G = RSM.game(), L = G.P.lines[0];
      L.ids.forEach(id => { if (!G.P.cells[id].g) { RSM.sel(id); String(G.P.cells[id].v).split('').forEach(d => RSM.type(d)); } });
      RSM.state.sound = true;
    }, tour[k]);
    await hold(1.55);
    if (k === 2) await snap('12-dunya');
  }

  // 9) Kapanış
  scene('09-son');
  await ev(() => window.__card('outro'));
  await cardFade(1, 0.6);
  await hold(1.0); await snap('13-son');
  await hold(2.4);
}

(async () => {
  fs.mkdirSync(PREVIEW ? PREV : FRAMES, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await ctx.addInitScript(FAKE_AUDIO);
  page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-11-26T09:00:00') });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.clock.pauseAt(new Date('2026-11-26T09:00:05'));
  await page.addStyleTag({ content: OVERLAY_CSS });
  await page.evaluate(overlayJS);
  const t0 = Date.now();
  await story();
  const notes = await page.evaluate(() => window.__notes);
  const meta = { fps: FPS, frames: frameNo, seconds: frameNo / FPS, scenes: sceneList, notes };
  fs.writeFileSync(path.join(WORK, PREVIEW ? 'onizleme-meta.json' : 'meta.json'), JSON.stringify(meta));
  console.log(JSON.stringify({ frames: frameNo, seconds: (frameNo / FPS).toFixed(1), notes: notes.length, wall: ((Date.now() - t0) / 1000).toFixed(0) + 's', errors }));
  await browser.close();
})();
