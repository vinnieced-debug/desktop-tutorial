/* FitHer — workout, meal plan & shopping PWA. All data stays on the phone (localStorage). */
(function () {
  'use strict';
  const KEY = 'fither.v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  // ---------- dates ----------
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const todayISO = () => iso(new Date());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const wdIdx = d => (d.getDay() + 6) % 7; // Mon=0
  const mondayOf = d => addDays(d, -wdIdx(d));
  const fmtDate = s => parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // ---------- state ----------
  function defaults() {
    return {
      v: 1, name: '', start: iso(mondayOf(new Date())), schedule: DEFAULT_SCHEDULE.slice(), calTarget: 1500,
      plan: buildDefaultPlan(), customRecipes: {}, log: [], weights: [], videos: [],
      shopChecked: {}, shopExtra: {}, gear: {}, water: {}, lastWeights: {}, servings: 1, theme: 'auto'
    };
  }
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = defaults(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full or blocked'); } }
  save();

  function applyTheme() { if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', S.theme); }
  applyTheme();

  // ---------- program helpers ----------
  function programPos(dateStr) {
    const diff = Math.floor((parse(dateStr) - parse(S.start)) / 864e5);
    const week = Math.floor(diff / 7) + 1;
    return { diff, week, weekC: Math.min(6, Math.max(1, week)), wd: wdIdx(parse(dateStr)) };
  }
  const phaseOf = w => (w <= 2 ? 1 : w <= 4 ? 2 : 3);
  const typeOn = dateStr => S.schedule[wdIdx(parse(dateStr))];
  const recipe = id => RECIPES[id] || S.customRecipes[id];
  const allRecipes = () => Object.assign({}, RECIPES, S.customRecipes);
  const loggedOn = dateStr => S.log.filter(l => l.date === dateStr);

  function buildSteps(type, phase) {
    const W = WORKOUTS[type], P = PHASES[phase], steps = [];
    W.warmup.forEach(b => steps.push({ ex: b.ex, kind: 'time', secs: b.secs, label: 'Warm-up' }));
    const main = W.main;
    if (main.length && main[0].kind === 'interval') {
      for (let r = 1; r <= P.rounds; r++) {
        main.forEach((b, i) => {
          steps.push({ ex: b.ex, kind: 'time', secs: P.work, label: `Round ${r} of ${P.rounds} · ${P.work}s work` });
          if (!(r === P.rounds && i === main.length - 1)) steps.push({ kind: 'rest', secs: i === main.length - 1 ? 60 : P.rest, next: main[(i + 1) % main.length].ex });
        });
      }
    } else {
      main.forEach((b, bi) => {
        const nextEx = (main[bi + 1] || W.cooldown[0] || {}).ex;
        if (b.kind === 'strength') {
          for (let s = 1; s <= P.sets; s++) {
            steps.push({ ex: b.ex, kind: 'reps', reps: b.reps + P.repAdd, note: b.note, label: `Set ${s} of ${P.sets}` });
            if (!(bi === main.length - 1 && s === P.sets)) steps.push({ kind: 'rest', secs: s === P.sets ? 60 : P.setRest, next: s === P.sets ? nextEx : b.ex });
          }
        } else if (b.kind === 'hold') {
          for (let s = 1; s <= P.sets; s++) {
            steps.push({ ex: b.ex, kind: 'time', secs: Math.round(b.secs * P.holdMul / 5) * 5, label: `Hold · set ${s} of ${P.sets}` });
            if (!(bi === main.length - 1 && s === P.sets)) steps.push({ kind: 'rest', secs: 30, next: s === P.sets ? nextEx : b.ex });
          }
        } else {
          steps.push({ ex: b.ex, kind: 'time', secs: Math.round(b.secs * P.timedMul / 15) * 15, label: type === 'rest' ? 'Stretch · breathe slowly' : 'Keep moving' });
        }
      });
    }
    W.cooldown.forEach(b => steps.push({ ex: b.ex, kind: 'time', secs: b.secs, label: 'Cool-down' }));
    return steps;
  }
  const estMins = steps => Math.round(steps.reduce((a, s) => a + (s.kind === 'reps' ? 40 : s.secs), 0) / 60);
  function blockText(b, phase) {
    const P = PHASES[phase];
    if (b.kind === 'strength') return `${P.sets} × ${b.reps + P.repAdd}${b.note ? ' ' + b.note : ''}`;
    if (b.kind === 'hold') return `${P.sets} × ${Math.round(b.secs * P.holdMul / 5) * 5}s hold`;
    if (b.kind === 'interval') return `${P.work}s on / ${P.rest}s off × ${P.rounds} rounds`;
    if (b.kind === 'timed') return fmtSecs(Math.round(b.secs * P.timedMul / 15) * 15);
    return fmtSecs(b.secs);
  }
  function fmtSecs(s) { return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min` : `${s}s`; }

  // ---------- UI primitives ----------
  function figHTML(exId, cls) { return `<div class="figbox ${cls || ''}"><svg class="fig" data-ex="${exId}"></svg></div>`; }
  // Custom pictures: drop images/exercises/<exercise-id>.png (and optionally <id>-2.png
  // for an end position) into the site. They replace the animated figure automatically.
  const imgCache = {};
  function probe(src) {
    if (!imgCache[src]) imgCache[src] = new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = src; });
    return imgCache[src];
  }
  function mountFigs(root) {
    (root || document).querySelectorAll('svg.fig[data-ex]:not([data-m])').forEach(svg => {
      const id = svg.dataset.ex, ex = EXERCISES[id]; if (!ex) return;
      svg.setAttribute('data-m', '1');
      Figure.mount(svg, ex, { static: svg.hasAttribute('data-static') });
      const a = `images/exercises/${id}.png`, b = `images/exercises/${id}-2.png`;
      probe(a).then(ok => {
        if (!ok || !svg.isConnected) return;
        const img = document.createElement('img');
        img.className = 'fig fig-img'; img.src = a; img.alt = ex.name;
        svg.replaceWith(img);
        probe(b).then(ok2 => {
          if (!ok2) return;
          let flip = false;
          const t = setInterval(() => { if (!img.isConnected) return clearInterval(t); flip = !flip; img.src = flip ? b : a; }, 1300);
        });
      });
    });
  }
  let toastT;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2400);
  }
  function openSheet(html, onMount) {
    const sh = $('#sheet');
    sh.innerHTML = `<div class="scrim"></div><div class="panel"><div class="grab"></div>${html}</div>`;
    sh.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.scrim', sh).onclick = closeSheet;
    mountFigs(sh);
    if (onMount) onMount($('.panel', sh));
  }
  function closeSheet() { const sh = $('#sheet'); sh.classList.remove('open'); sh.innerHTML = ''; document.body.style.overflow = ''; }

  const ICONS = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
    meals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 21V3c-2 1-3 4-3 7s1 4 3 4"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 16l4-5 3 3 5-7"/></svg>'
  };
  const TABS = [['today', 'Today'], ['train', 'Workouts'], ['meals', 'Meals'], ['shop', 'Shop'], ['progress', 'Progress']];
  let tab = 'today';
  const sub = { train: 'plan', shop: 'groceries', exCat: 'all', mealWeek: null, shopWeek: null, openDay: null };

  function renderTabs() {
    $('#tabs').innerHTML = '<div class="in">' + TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${ICONS[k]}<span>${l}</span></button>`).join('') + '</div>';
    $('#tabs').querySelectorAll('button').forEach(b => b.onclick = () => go(b.dataset.tab));
  }
  function go(t) { tab = t; renderTabs(); render(); window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + t); } catch (e) {} }
  function render() {
    const v = $('#view');
    v.innerHTML = VIEWS[tab]();
    mountFigs(v);
    if (BIND[tab]) BIND[tab](v);
  }
  function on(root, sel, ev, fn) { root.querySelectorAll(sel).forEach(el => el.addEventListener(ev, e => fn(el, e))); }

  // ======================================================================
  // TODAY
  // ======================================================================
  function workoutHero(dateStr, compact) {
    const type = typeOn(dateStr), T = DAY_TYPES[type], pos = programPos(dateStr), ph = phaseOf(pos.weekC);
    const steps = buildSteps(type, ph), W = WORKOUTS[type];
    const figs = W.main.slice(0, 3).map(b => `<div>${figHTML(b.ex)}</div>`).join('');
    const done = loggedOn(dateStr).length > 0;
    return `<div class="hero" style="background:linear-gradient(135deg, ${T.color}, ${shade(T.color)})">
      <div class="row between"><div class="kicker">${T.icon} ${compact ? WEEKDAYS[pos.wd] + ' · ' : "Today's workout · "}Week ${pos.weekC}</div>${done ? '<span class="badge white">✓ Done</span>' : ''}</div>
      <h2>${T.label}</h2>
      <div class="meta"><span>⏱ ~${estMins(steps)} min</span><span>${W.main.length} moves</span><span>Phase ${ph}: ${PHASES[ph].name}</span></div>
      <div class="figs">${figs}</div>
      <div class="small" style="opacity:.95;margin-bottom:12px">${T.blurb}</div>
      <div class="row"><button class="btn white grow" data-start="${type}" data-date="${dateStr}">▶ Start workout</button><button class="btn sm" style="background:rgba(255,255,255,.22)" data-detail="${type}" data-date="${dateStr}">Details</button></div>
    </div>`;
  }
  function shade(hex) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.min(255, r + 40); g = Math.min(255, g + 30); b = Math.max(0, b - 10);
    return `rgb(${r},${g},${b})`;
  }
  function mealsForDate(dateStr) {
    const p = programPos(dateStr);
    if (p.week < 1 || p.week > 6) return null;
    return S.plan[p.week - 1][p.wd];
  }

  const VIEWS = {};
  const BIND = {};

  VIEWS.today = () => {
    const t = todayISO(), pos = programPos(t), hr = new Date().getHours();
    const hi = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    let banner = '';
    if (pos.week < 1) banner = `<div class="note" style="margin-bottom:14px">Your 6-week program starts <b>${fmtDate(S.start)}</b>. You can preview everything now.</div>`;
    if (pos.week > 6) banner = `<div class="note" style="margin-bottom:14px">🎉 You finished the 6-week program! Go to <b>Progress → Settings</b> to start a new round (try heavier weights).</div>`;
    const m = mealsForDate(t) || S.plan[pos.weekC - 1][pos.wd];
    const mealRows = MEAL_TYPES.map(mt => { const r = recipe(m[mt]); return r ? `<div class="item" data-recipe="${m[mt]}" data-w="${pos.weekC - 1}" data-d="${pos.wd}" data-mt="${mt}"><div class="emoji">${r.emoji || '🍽️'}</div><div class="grow"><div class="s">${cap(mt)}</div><div class="t">${esc(r.name)}</div></div><div class="kcal">${r.cal}</div></div>` : ''; }).join('');
    const total = MEAL_TYPES.reduce((a, mt) => a + ((recipe(m[mt]) || {}).cal || 0), 0);
    const prot = MEAL_TYPES.reduce((a, mt) => a + ((recipe(m[mt]) || {}).protein || 0), 0);
    const mon = mondayOf(new Date());
    const week = WEEKDAYS.map((d, i) => {
      const ds = iso(addDays(mon, i)), ty = S.schedule[i], done = loggedOn(ds).length > 0;
      return `<div class="d ${ds === t ? 'today' : ''}" data-day="${ds}">${d}<div class="dot" style="background:${done ? 'var(--ok)' : DAY_TYPES[ty].color};${done ? '' : 'opacity:.85'}">${done ? '✓' : DAY_TYPES[ty].short[0]}</div></div>`;
    }).join('');
    const type = typeOn(t);
    const vids = S.videos.filter(v => v.cat === type);
    const water = S.water[t] || 0;
    return `
      <div class="row between" style="margin-bottom:14px"><div><div class="muted small">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div><h1>${hi}${S.name ? ', ' + esc(S.name) : ''} 👋</h1></div></div>
      ${installHint()}
      ${backupReminder()}
      ${banner}
      ${workoutHero(t)}
      ${vids.length ? `<h2>Your ${DAY_TYPES[type].label} videos</h2><div class="hscroll">${vids.map(vidThumb).join('')}</div>` : ''}
      <h2>This week</h2>
      <div class="week">${week}</div>
      <h2 class="row between"><span>Today's meals</span><span class="small muted" style="font-weight:600">${total} / ${S.calTarget} cal · ${prot}g protein</span></h2>
      <div class="card tight list">${mealRows}</div>
      <h2>Water <span class="small muted" style="font-weight:600">${water} / 8 glasses</span></h2>
      <div class="card tight"><div class="water">${Array.from({ length: 8 }, (_, i) => `<button class="${i < water ? 'on' : ''}" data-water="${i + 1}">💧</button>`).join('')}</div></div>
    `;
  };
  BIND.today = v => {
    bindHero(v);
    on(v, '[data-recipe]', 'click', el => recipeSheet(el.dataset.recipe, { w: +el.dataset.w, d: +el.dataset.d, mt: el.dataset.mt }));
    on(v, '[data-water]', 'click', el => { const n = +el.dataset.water, t = todayISO(); S.water[t] = (S.water[t] === n ? n - 1 : n); save(); render(); });
    on(v, '[data-day]', 'click', el => dayPreview(el.dataset.day));
    on(v, '[data-vid]', 'click', el => videoSheet(el.dataset.vid));
    on(v, '[data-dismiss-install]', 'click', () => { S.installHidden = true; save(); render(); });
    on(v, '[data-backup]', 'click', backup);
    on(v, '[data-snooze]', 'click', () => { S.backupSnooze = todayISO(); save(); render(); toast("We'll remind you tomorrow"); });
  };
  function bindHero(v) {
    on(v, '[data-start]', 'click', el => Player.start(el.dataset.start, el.dataset.date));
    on(v, '[data-detail]', 'click', el => workoutSheet(el.dataset.detail, el.dataset.date));
  }
  function installHint() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone || S.installHidden) return '';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return `<div class="card install"><div class="row between"><h3>📲 Put this app on your home screen</h3><button class="iconbtn" data-dismiss-install aria-label="Dismiss">✕</button></div>
      <div class="small muted" style="margin-top:6px">${ios ? 'In <b>Safari</b>: tap the <b>Share</b> button (square with ↑ arrow) → <b>Add to Home Screen</b> → Add.' : 'In <b>Chrome</b>: tap the <b>⋮ menu</b> → <b>Add to Home screen</b> / <b>Install app</b>.'} It opens full-screen like a real app and works offline.<br><b>Important:</b> once it's on your home screen, always open it from that icon — that's where your progress is saved.</div></div>`;
  }
  function dayPreview(ds) {
    const p = programPos(ds), m = S.plan[p.weekC - 1][p.wd];
    openSheet(`${workoutHero(ds, true)}<h3 style="margin:6px 0 4px">Meals</h3><div class="card tight list">${MEAL_TYPES.map(mt => { const r = recipe(m[mt]); return r ? `<div class="item" data-recipe="${m[mt]}"><div class="emoji">${r.emoji || '🍽️'}</div><div class="grow"><div class="s">${cap(mt)}</div><div class="t">${esc(r.name)}</div></div><div class="kcal">${r.cal}</div></div>` : ''; }).join('')}</div>`,
      panel => { bindHero(panel); on(panel, '[data-recipe]', 'click', el => recipeSheet(el.dataset.recipe, { w: p.weekC - 1, d: p.wd, mt: recipe(el.dataset.recipe).type })); on(panel, '[data-start]', 'click', closeSheet); });
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ======================================================================
  // WORKOUTS
  // ======================================================================
  VIEWS.train = () => {
    const segs = [['plan', 'Weekly Split'], ['library', 'Exercises'], ['videos', 'My Videos']];
    let body = '';
    if (sub.train === 'plan') {
      const pos = programPos(todayISO()), ph = phaseOf(pos.weekC);
      body = `<div class="card"><div class="row between"><h3>Phase ${ph}: ${PHASES[ph].name}</h3><span class="badge">Week ${pos.weekC} of 6</span></div>
        <div class="small muted" style="margin-top:6px">${PHASES[ph].tip}</div>
        <div class="row small" style="margin-top:10px;gap:6px">${[1, 2, 3].map(n => `<span class="badge ${n === ph ? '' : 'ok'}" style="${n === ph ? 'background:var(--brand);color:#fff' : n > ph ? 'opacity:.5' : ''}">Wk ${n * 2 - 1}–${n * 2}</span>`).join('')}</div></div>
        <div class="list card tight">${S.schedule.map((ty, i) => {
          const T = DAY_TYPES[ty], ds = iso(addDays(mondayOf(new Date()), i));
          return `<div class="item" data-detail="${ty}" data-date="${ds}"><div class="emoji" style="background:${T.color}22">${T.icon}</div><div class="grow"><div class="s">${WEEKDAYS[i]}</div><div class="t">${T.label}</div></div><span class="kcal muted">~${estMins(buildSteps(ty, ph))} min ›</span></div>`;
        }).join('')}</div>
        <div class="small muted">Want different days? Change your split in <b>Progress → Settings</b>.</div>`;
    } else if (sub.train === 'library') {
      const cats = [['all', 'All']].concat(Object.entries(CATEGORY_LABELS));
      const list = Object.entries(EXERCISES).filter(([, e]) => sub.exCat === 'all' || e.cat === sub.exCat);
      body = `<div class="chips" style="margin-bottom:14px">${cats.map(([k, l]) => `<button class="chip ${sub.exCat === k ? 'on' : ''}" data-cat="${k}">${l}</button>`).join('')}</div>
        <div class="grid2">${list.map(([id, e]) => `<div class="excard" data-ex="${id}">${figHTML(id)}<div class="b"><div class="t">${e.name}</div><div class="s">${e.equip.length ? e.equip.join(', ') : 'No equipment'}</div></div></div>`).join('')}</div>`;
    } else {
      body = `<div class="card"><h3>Add a YouTube workout</h3>
        <label class="f">YouTube link</label><input class="inp" id="vurl" placeholder="https://youtu.be/..." inputmode="url" autocomplete="off">
        <label class="f">Title (optional — we'll try to fill it in)</label><input class="inp" id="vtitle" placeholder="e.g. 20 min low-impact HIIT">
        <label class="f">Which day is it for?</label><select class="inp" id="vcat">${Object.entries(DAY_TYPES).map(([k, t]) => `<option value="${k}">${t.icon} ${t.label}</option>`).join('')}<option value="other">⭐ Other / favorites</option></select>
        <button class="btn block" style="margin-top:14px" id="vadd">Save video</button>
        <div class="small muted" style="margin-top:10px">Tip: in the YouTube app tap <b>Share → Copy link</b>, then paste here. Saved videos also show on Today for that day type.</div></div>
        ${S.videos.length ? Object.keys(DAY_TYPES).concat('other').map(c => { const vs = S.videos.filter(v => v.cat === c); return vs.length ? `<h2>${c === 'other' ? '⭐ Other' : DAY_TYPES[c].icon + ' ' + DAY_TYPES[c].label}</h2><div class="card tight list">${vs.map(v => `<div class="vid"><img src="https://i.ytimg.com/vi/${v.vid}/mqdefault.jpg" alt="" data-vid="${v.id}" loading="lazy"><div class="grow"><div class="t" style="font-weight:650">${esc(v.title)}</div><div class="row" style="margin-top:6px;gap:6px"><button class="btn sm ghost" data-vid="${v.id}">▶ Play</button><button class="btn sm line" data-vlog="${v.id}">✓ Log</button><button class="iconbtn" data-vdel="${v.id}" aria-label="Delete">🗑</button></div></div></div>`).join('')}</div>` : ''; }).join('')
        : '<div class="note">No videos yet. Add your favorite YouTube workouts above.</div>'}`;
    }
    return `<h1 style="margin-bottom:14px">Workouts</h1><div class="seg">${segs.map(([k, l]) => `<button class="${sub.train === k ? 'on' : ''}" data-seg="${k}">${l}</button>`).join('')}</div>${body}`;
  };
  BIND.train = v => {
    on(v, '[data-seg]', 'click', el => { sub.train = el.dataset.seg; render(); });
    on(v, '[data-detail]', 'click', el => workoutSheet(el.dataset.detail, el.dataset.date));
    on(v, '[data-cat]', 'click', el => { sub.exCat = el.dataset.cat; render(); });
    on(v, '.excard', 'click', el => exerciseSheet(el.dataset.ex));
    on(v, '[data-vid]', 'click', el => videoSheet(el.dataset.vid));
    on(v, '[data-vdel]', 'click', el => { if (confirm('Delete this video?')) { S.videos = S.videos.filter(x => x.id !== el.dataset.vdel); save(); render(); } });
    on(v, '[data-vlog]', 'click', el => { const vd = S.videos.find(x => x.id === el.dataset.vlog); logSheet({ type: vd.cat === 'other' ? typeOn(todayISO()) : vd.cat, title: vd.title, source: 'video' }); });
    const add = $('#vadd', v);
    if (add) add.onclick = async () => {
      const url = $('#vurl', v).value.trim(), id = ytId(url);
      if (!id) { toast("That doesn't look like a YouTube link"); return; }
      let title = $('#vtitle', v).value.trim();
      add.disabled = true; add.textContent = 'Saving…';
      if (!title) title = await ytTitle(id) || 'YouTube workout';
      S.videos.unshift({ id: uid(), vid: id, title, cat: $('#vcat', v).value, added: todayISO() });
      save(); toast('Video saved'); render();
    };
  };
  function ytId(u) {
    const m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u) ? u : null);
  }
  async function ytTitle(id) {
    try {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
      if (!r.ok) return null; const j = await r.json(); return j.title;
    } catch (e) { return null; }
  }
  function vidThumb(v) { return `<div class="v" data-vid="${v.id}"><img src="https://i.ytimg.com/vi/${v.vid}/mqdefault.jpg" alt="" loading="lazy"><div>${esc(v.title)}</div></div>`; }
  function videoSheet(id) {
    const v = S.videos.find(x => x.id === id); if (!v) return;
    openSheet(`<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${v.vid}?playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${esc(v.title)}"></iframe></div>
      <h3 style="margin:12px 0">${esc(v.title)}</h3>
      <div class="row"><button class="btn grow" id="vl">✓ I did this workout</button><a class="btn line" href="https://www.youtube.com/watch?v=${v.vid}" target="_blank" rel="noopener">Open in YouTube</a></div>`,
      p => { $('#vl', p).onclick = () => logSheet({ type: v.cat === 'other' ? typeOn(todayISO()) : v.cat, title: v.title, source: 'video' }); });
  }

  function workoutSheet(type, dateStr) {
    const pos = programPos(dateStr || todayISO()), ph = phaseOf(pos.weekC), W = WORKOUTS[type], T = DAY_TYPES[type];
    const row = (b, txt) => `<div class="exrow" data-ex="${b.ex}">${figHTML(b.ex)}<div class="grow"><div style="font-weight:700">${EXERCISES[b.ex].name}</div><div class="small muted">${txt}</div></div><span class="muted">›</span></div>`;
    const equip = [...new Set(W.main.concat(W.warmup, W.cooldown).flatMap(b => EXERCISES[b.ex].equip))];
    openSheet(`<div class="row between"><div><div class="muted small">${T.icon} Week ${pos.weekC} · Phase ${ph}</div><h1>${T.label}</h1></div><span class="badge">~${estMins(buildSteps(type, ph))} min</span></div>
      <p class="muted small">${T.blurb}</p>
      ${equip.length ? `<div class="note small"><b>You'll need:</b> ${equip.join(', ')}</div>` : ''}
      ${W.warmup.length ? `<h3 style="margin-top:16px">Warm-up</h3>${W.warmup.map(b => row(b, fmtSecs(b.secs))).join('')}` : ''}
      <h3 style="margin-top:16px">${type === 'rest' ? 'Stretches' : 'Workout'}</h3>${W.main.map(b => row(b, blockText(b, ph))).join('')}
      ${W.cooldown.length ? `<h3 style="margin-top:16px">Cool-down</h3>${W.cooldown.map(b => row(b, fmtSecs(b.secs))).join('')}` : ''}
      ${W.alt ? `<div class="note small" style="margin-top:12px">${W.alt}</div>` : ''}
      <div class="row" style="margin-top:16px"><button class="btn grow" id="ws">▶ Start</button><button class="btn line" id="wl">Log without timer</button></div>`,
      p => {
        on(p, '.exrow', 'click', el => exerciseSheet(el.dataset.ex, () => workoutSheet(type, dateStr)));
        $('#ws', p).onclick = () => { closeSheet(); Player.start(type, dateStr || todayISO()); };
        $('#wl', p).onclick = () => logSheet({ type, title: T.label, date: dateStr, mins: estMins(buildSteps(type, ph)) });
      });
  }
  function exerciseSheet(id, back) {
    const e = EXERCISES[id];
    openSheet(`${back ? '<button class="btn sm ghost" id="back" style="margin-bottom:8px">‹ Back</button>' : ''}
      <div style="max-width:300px;margin:0 auto">${figHTML(id)}</div>
      <h1 style="margin-top:12px">${e.name}</h1>
      <div class="row wrap" style="gap:6px;margin:8px 0"><span class="badge">${CATEGORY_LABELS[e.cat]}</span>${e.equip.map(q => `<span class="badge ok">${q}</span>`).join('') || '<span class="badge ok">No equipment</span>'}</div>
      <div class="muted small"><b>Works:</b> ${e.muscles}</div>
      <h3 style="margin:14px 0 4px">How to do it</h3>${e.cues.map((c, i) => `<div class="cue"><b>${i + 1}</b><div>${c}</div></div>`).join('')}
      <div class="grid2" style="margin-top:12px"><div class="note small"><b>Easier</b><br>${e.easier}</div><div class="note small"><b>Harder</b><br>${e.harder}</div></div>
      <a class="btn line block" style="margin-top:14px" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent('how to do ' + e.name + ' proper form')}">▶ Watch a real-person demo on YouTube</a>`,
      p => { if (back) $('#back', p).onclick = back; });
  }

  // ======================================================================
  // WORKOUT PLAYER
  // ======================================================================
  const Player = (() => {
    let steps = [], i = 0, left = 0, timer = null, paused = false, startedAt = 0, ctx = {}, wake = null, weights = {};
    const el = () => $('#player');
    function beep(f, d) {
      try {
        Player.ac = Player.ac || new (window.AudioContext || window.webkitAudioContext)();
        const ac = Player.ac, o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = f; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(.18, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d);
        o.start(); o.stop(ac.currentTime + d);
      } catch (e) {}
    }
    async function lock() { try { wake = await navigator.wakeLock.request('screen'); } catch (e) {} }
    function start(type, dateStr) {
      const pos = programPos(dateStr || todayISO()), ph = phaseOf(pos.weekC);
      ctx = { type, date: dateStr || todayISO(), phase: ph };
      steps = buildSteps(type, ph); i = 0; startedAt = Date.now(); paused = false; weights = {};
      el().classList.add('open'); document.body.style.overflow = 'hidden';
      lock(); beep(660, .15); show();
    }
    function stop() { clearInterval(timer); timer = null; el().classList.remove('open'); el().innerHTML = ''; document.body.style.overflow = ''; try { wake && wake.release(); } catch (e) {} }
    function show() {
      clearInterval(timer);
      if (i >= steps.length) return finish();
      const s = steps[i], P = el();
      const pct = Math.round(i / steps.length * 100);
      const exId = s.kind === 'rest' ? s.next : s.ex;
      const ex = EXERCISES[exId] || {};
      P.classList.toggle('resting', s.kind === 'rest');
      left = s.secs || 0;
      const top = `<div class="row between" style="margin-bottom:10px"><button class="iconbtn" id="px" aria-label="Close">✕</button><div class="small muted" style="font-weight:700">${DAY_TYPES[ctx.type].label} · ${i + 1}/${steps.length}</div><button class="iconbtn" id="pinfo" aria-label="How to">?</button></div><div class="bar"><i style="width:${pct}%"></i></div>`;
      let mid, ctr;
      if (s.kind === 'rest') {
        mid = `<div class="label" style="font-size:20px;color:#1f9bf0">Rest & breathe</div><div class="timer" id="pt">${left}</div><div class="label">Up next</div><div class="bigfig" style="width:55%">${figHTML(exId)}</div><div class="name" style="font-size:20px">${ex.name || ''}</div>`;
        ctr = `<button class="btn line" id="padd">+15s</button><button class="btn" id="pnext">Skip rest ›</button>`;
      } else if (s.kind === 'reps') {
        const last = S.lastWeights[s.ex];
        mid = `<div class="bigfig">${figHTML(s.ex)}</div><div class="name">${ex.name}</div><div class="label">${s.label}</div><div class="reps">${s.reps} reps</div>${s.note ? `<div class="label">${s.note}</div>` : ''}
          ${ex.equip && (ex.equip.includes('dumbbells') || ex.equip.includes('kettlebell')) ? `<div class="row" style="justify-content:center;margin-top:8px"><span class="small muted">Weight used</span><input class="inp" id="pw" type="number" inputmode="decimal" style="width:90px;text-align:center" value="${weights[s.ex] ?? last ?? ''}" placeholder="lb"><span class="small muted">lb</span></div>` : ''}`;
        ctr = `<button class="btn line" id="pprev">‹</button><button class="btn" id="pnext" style="flex:3">✓ Done</button>`;
      } else {
        mid = `<div class="bigfig">${figHTML(s.ex)}</div><div class="name">${ex.name}</div><div class="label">${s.label}</div><div class="timer" id="pt">${fmtClock(left)}</div>`;
        ctr = `<button class="btn line" id="pprev">‹</button><button class="btn ghost" id="ppause">${paused ? '▶ Resume' : '❚❚ Pause'}</button><button class="btn line" id="pnext">›</button>`;
      }
      P.innerHTML = top + `<div class="stage">${mid}</div><div class="controls">${ctr}</div>`;
      mountFigs(P);
      $('#px').onclick = () => { if (confirm('End workout? You can still log it.')) { const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000)); stop(); logSheet({ type: ctx.type, title: DAY_TYPES[ctx.type].label + ' (partial)', mins, date: ctx.date }); } };
      $('#pinfo').onclick = () => { paused = true; exerciseSheet(exId); const b = $('#ppause'); if (b) b.textContent = '▶ Resume'; };
      const nx = $('#pnext'); if (nx) nx.onclick = next;
      const pv = $('#pprev'); if (pv) pv.onclick = () => { i = Math.max(0, i - 1); if (steps[i].kind === 'rest' && i > 0) i--; show(); };
      const pa = $('#ppause'); if (pa) pa.onclick = () => { paused = !paused; pa.textContent = paused ? '▶ Resume' : '❚❚ Pause'; };
      const ad = $('#padd'); if (ad) ad.onclick = () => { left += 15; tick(true); };
      const pw = $('#pw'); if (pw) pw.oninput = () => { weights[s.ex] = pw.value; };
      if (s.kind !== 'reps') timer = setInterval(() => tick(false), 1000);
    }
    function fmtClock(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
    function tick(noDec) {
      if (!noDec) { if (paused || $('#sheet').classList.contains('open')) return; left--; }
      const t = $('#pt'); if (t) t.textContent = steps[i].kind === 'rest' ? left : fmtClock(Math.max(0, left));
      if (!noDec && left <= 3 && left > 0) beep(520, .12);
      if (left <= 0) { beep(880, .3); try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} next(); }
    }
    function next() {
      const s = steps[i];
      if (s && s.kind === 'reps' && weights[s.ex]) S.lastWeights[s.ex] = weights[s.ex];
      i++; show();
    }
    function finish() {
      const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      save(); stop(); beep(990, .4);
      const w = Object.entries(weights).filter(([, x]) => x).map(([k, x]) => `${EXERCISES[k].name}: ${x} lb`).join(', ');
      logSheet({ type: ctx.type, title: DAY_TYPES[ctx.type].label, mins, date: ctx.date, notes: w, celebrate: true });
    }
    return { start };
  })();

  // ---------- log sheet ----------
  function logSheet(o) {
    let rating = 4;
    openSheet(`${o.celebrate ? '<div style="text-align:center;font-size:54px">🎉</div><h1 style="text-align:center">Workout complete!</h1><p class="muted" style="text-align:center">Amazing work. Log it below.</p>' : '<h1>Log a workout</h1>'}
      <label class="f">Workout</label><input class="inp" id="lt" value="${esc(o.title || '')}" placeholder="e.g. Leg Day, 30 min walk">
      <div class="grid2"><div><label class="f">Type</label><select class="inp" id="ly">${Object.entries(DAY_TYPES).map(([k, t]) => `<option value="${k}" ${k === (o.type || typeOn(todayISO())) ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      <div><label class="f">Minutes</label><input class="inp" id="lm" type="number" inputmode="numeric" value="${o.mins || 30}"></div></div>
      <label class="f">Date</label><input class="inp" id="ld" type="date" value="${o.date || todayISO()}">
      <label class="f">How did it feel?</label><div class="rating">${['😫', '😕', '🙂', '😊', '🔥'].map((e, i) => `<button data-r="${i + 1}" class="${i + 1 === rating ? 'on' : ''}">${e}</button>`).join('')}</div>
      <label class="f">Notes (weights, how you felt, etc.)</label><textarea class="inp" id="ln" placeholder="Used 10 lb dumbbells, knees felt good">${esc(o.notes || '')}</textarea>
      <button class="btn block" style="margin-top:16px" id="lsave">Save to log</button>`,
      p => {
        on(p, '[data-r]', 'click', b => { rating = +b.dataset.r; p.querySelectorAll('[data-r]').forEach(x => x.classList.toggle('on', x === b)); });
        $('#lsave', p).onclick = () => {
          S.log.unshift({ id: uid(), date: $('#ld', p).value || todayISO(), type: $('#ly', p).value, title: $('#lt', p).value.trim() || DAY_TYPES[$('#ly', p).value].label, mins: +$('#lm', p).value || 0, rating, notes: $('#ln', p).value.trim(), source: o.source || 'app' });
          S.log.sort((a, b) => b.date.localeCompare(a.date));
          save(); closeSheet(); toast(daysSinceBackup() >= 7 ? 'Logged! 💪 Tip: back up your progress (Progress tab)' : 'Logged! 💪'); render();
        };
      });
  }

  // ======================================================================
  // MEALS
  // ======================================================================
  VIEWS.meals = () => {
    const pos = programPos(todayISO());
    if (sub.mealWeek == null) sub.mealWeek = pos.weekC - 1;
    const w = sub.mealWeek, days = S.plan[w], mon = addDays(parse(S.start), w * 7);
    if (sub.openDay == null) sub.openDay = pos.week - 1 === w ? pos.wd : 0;
    const custom = Object.entries(S.customRecipes);
    return `<div class="row between" style="margin-bottom:14px"><h1>Meal Plan</h1><button class="btn sm ghost" id="newr">+ Recipe</button></div>
      <div class="chips" style="margin-bottom:14px">${[0, 1, 2, 3, 4, 5].map(i => `<button class="chip ${i === w ? 'on' : ''}" data-mw="${i}">Week ${i + 1}</button>`).join('')}</div>
      ${days.map((d, di) => {
        const tot = MEAL_TYPES.reduce((a, mt) => a + ((recipe(d[mt]) || {}).cal || 0), 0);
        const prot = MEAL_TYPES.reduce((a, mt) => a + ((recipe(d[mt]) || {}).protein || 0), 0);
        const open = sub.openDay === di;
        return `<div class="card tight"><div class="row between" data-od="${di}" style="cursor:pointer"><div><b>${WEEKDAYS[di]}</b> <span class="muted small">${addDays(mon, di).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${di === 6 ? ' · 🥡 meal-prep day' : ''}</span></div><div class="small muted"><b style="color:var(--ink)">${tot}</b> cal · ${prot}g protein ${open ? '▴' : '▾'}</div></div>
          ${open ? `<div class="list" style="margin-top:6px">${MEAL_TYPES.map(mt => { const r = recipe(d[mt]); return `<div class="item" data-recipe="${d[mt]}" data-d="${di}" data-mt="${mt}"><div class="emoji">${r ? r.emoji || '🍽️' : '❔'}</div><div class="grow"><div class="s">${cap(mt)}</div><div class="t">${r ? esc(r.name) : 'Pick a meal'}</div></div><div class="kcal">${r ? r.cal : ''}</div></div>`; }).join('')}</div>` : ''}
        </div>`;
      }).join('')}
      <div class="row" style="gap:8px"><button class="btn sm line" id="regen">↻ Shuffle this week</button><button class="btn sm line" id="resetw">Reset week</button></div>
      <div class="note small" style="margin-top:14px">Plan targets ~${S.calTarget} cal/day with high protein to stay full. Add a 2nd snack on hard training days if you're hungry. Calories are estimates — a food scale makes them accurate. Check with a doctor or dietitian if you have medical conditions.</div>
      <h2>My recipes</h2>
      ${custom.length ? `<div class="card tight list">${custom.map(([id, r]) => `<div class="item" data-recipe="${id}"><div class="emoji">${r.emoji || '🍽️'}</div><div class="grow"><div class="s">${cap(r.type)}</div><div class="t">${esc(r.name)}</div></div><div class="kcal">${r.cal}</div></div>`).join('')}</div>` : '<div class="note small">Create your own meals with <b>+ Recipe</b>. They can be swapped into any day and are added to the shopping list automatically.</div>'}
      <h2>Recipe library</h2>
      <div class="card tight list">${Object.entries(RECIPES).map(([id, r]) => `<div class="item" data-recipe="${id}"><div class="emoji">${r.emoji}</div><div class="grow"><div class="s">${cap(r.type)} · ${r.time} min</div><div class="t">${esc(r.name)}</div></div><div class="kcal">${r.cal}</div></div>`).join('')}</div>`;
  };
  BIND.meals = v => {
    on(v, '[data-mw]', 'click', el => { sub.mealWeek = +el.dataset.mw; sub.openDay = 0; render(); });
    on(v, '[data-od]', 'click', el => { const d = +el.dataset.od; sub.openDay = sub.openDay === d ? -1 : d; render(); });
    on(v, '[data-recipe]', 'click', el => recipeSheet(el.dataset.recipe, el.dataset.mt ? { w: sub.mealWeek, d: +el.dataset.d, mt: el.dataset.mt } : null));
    $('#newr', v).onclick = () => recipeForm();
    $('#resetw', v).onclick = () => { if (confirm(`Reset Week ${sub.mealWeek + 1} to the original plan?`)) { S.plan[sub.mealWeek] = buildDefaultPlan()[sub.mealWeek]; save(); render(); } };
    $('#regen', v).onclick = () => {
      const pool = t => Object.keys(allRecipes()).filter(k => allRecipes()[k].type === t);
      const pick = (arr, n) => arr.sort(() => Math.random() - .5).slice(0, n);
      const b = pick(pool('breakfast'), 3), l = pick(pool('lunch'), 3), d = pick(pool('dinner'), 4), s = pool('snack');
      S.plan[sub.mealWeek] = Array.from({ length: 7 }, (_, i) => ({ breakfast: b[i % b.length], lunch: l[[0, 0, 1, 1, 0, 2, 2][i] % l.length], dinner: d[[0, 1, 2, 0, 3, 1, 2][i] % d.length], snack: s[Math.floor(Math.random() * s.length)] }));
      save(); render(); toast('Week shuffled — shopping list updated');
    };
  };
  function recipeSheet(id, slot) {
    const r = recipe(id); if (!r) return;
    const isCustom = !!S.customRecipes[id];
    openSheet(`<div style="font-size:60px;text-align:center">${r.emoji || '🍽️'}</div>
      <h1 style="text-align:center">${esc(r.name)}</h1>
      <div class="stats" style="margin:14px 0"><div class="stat"><b>${r.cal}</b><span>calories</span></div><div class="stat"><b>${r.protein || 0}g</b><span>protein</span></div><div class="stat"><b>${r.time || '–'}</b><span>minutes</span></div></div>
      <h3>Ingredients <span class="muted small">(1 serving)</span></h3>
      <div class="card tight list" style="margin-top:8px">${r.ing.map(x => `<div class="item" style="cursor:default;padding:8px 0"><div class="grow">${esc(x[2])}</div><div class="muted">${fmtQty(x[0])} ${esc(x[1])}</div></div>`).join('')}</div>
      <h3>Steps</h3>${(r.steps || []).map((s, i) => `<div class="cue"><b>${i + 1}</b><div>${esc(s)}</div></div>`).join('')}
      <div class="row wrap" style="margin-top:16px;gap:8px">${slot ? `<button class="btn grow" id="swap">⇄ Swap this meal</button>` : ''}${isCustom ? `<button class="btn line" id="edit">Edit</button><button class="btn line" id="del">Delete</button>` : ''}</div>`,
      p => {
        if (slot) $('#swap', p).onclick = () => swapSheet(slot);
        if (isCustom) {
          $('#edit', p).onclick = () => recipeForm(id);
          $('#del', p).onclick = () => {
            if (!confirm('Delete this recipe? Days using it will go back to the original meal.')) return;
            const def = buildDefaultPlan();
            S.plan.forEach((w, wi) => w.forEach((d, di) => MEAL_TYPES.forEach(mt => { if (d[mt] === id) d[mt] = def[wi][di][mt]; })));
            delete S.customRecipes[id]; save(); closeSheet(); render();
          };
        }
      });
  }
  function swapSheet(slot) {
    const all = allRecipes(), cur = S.plan[slot.w][slot.d][slot.mt];
    const opts = Object.entries(all).filter(([, r]) => r.type === slot.mt);
    openSheet(`<h1>Swap ${slot.mt}</h1><p class="muted small">Week ${slot.w + 1}, ${WEEKDAYS[slot.d]}</p>
      <div class="card tight list">${opts.map(([id, r]) => `<div class="item" data-pick="${id}"><div class="emoji">${r.emoji || '🍽️'}</div><div class="grow"><div class="t">${esc(r.name)}${id === cur ? ' <span class="badge">current</span>' : ''}</div><div class="s">${r.cal} cal · ${r.protein || 0}g protein</div></div></div>`).join('')}</div>
      <label class="row small" style="margin:10px 0"><input type="checkbox" id="allw"> Use this for every ${slot.mt} that was "${esc((all[cur] || {}).name || '')}" this week</label>
      <button class="btn line block" id="mk">+ Create a new ${slot.mt}</button>`,
      p => {
        on(p, '[data-pick]', 'click', el => {
          const id = el.dataset.pick;
          if ($('#allw', p).checked) S.plan[slot.w].forEach(d => { if (d[slot.mt] === cur) d[slot.mt] = id; });
          else S.plan[slot.w][slot.d][slot.mt] = id;
          save(); closeSheet(); render(); toast('Meal swapped — shopping list updated');
        });
        $('#mk', p).onclick = () => recipeForm(null, slot);
      });
  }
  function recipeForm(id, slot) {
    const r = id ? S.customRecipes[id] : { type: slot ? slot.mt : 'dinner', emoji: '🍽️', ing: [], steps: [] };
    openSheet(`<h1>${id ? 'Edit' : 'New'} recipe</h1>
      <label class="f">Name</label><input class="inp" id="rn" value="${esc(r.name || '')}" placeholder="e.g. Chicken fajita bowl">
      <div class="grid2"><div><label class="f">Meal</label><select class="inp" id="rt">${MEAL_TYPES.map(t => `<option ${t === r.type ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div><label class="f">Emoji</label><input class="inp" id="re" value="${esc(r.emoji || '🍽️')}" maxlength="4"></div></div>
      <div class="grid2"><div><label class="f">Calories</label><input class="inp" id="rc" type="number" inputmode="numeric" value="${r.cal || ''}"></div><div><label class="f">Protein (g)</label><input class="inp" id="rp" type="number" inputmode="numeric" value="${r.protein || ''}"></div></div>
      <label class="f">Ingredients — one per line: amount, unit, item</label>
      <textarea class="inp" id="ri" placeholder="4 oz chicken breast&#10;1 cup brown rice&#10;1/2 bell pepper&#10;2 tbsp salsa">${esc(r.ing.map(x => `${fmtQty(x[0])} ${x[1] ? x[1] + ' ' : ''}${x[2]}`).join('\n'))}</textarea>
      <label class="f">Steps — one per line</label><textarea class="inp" id="rs">${esc((r.steps || []).join('\n'))}</textarea>
      <button class="btn block" style="margin-top:16px" id="rsave">Save recipe</button>
      <div class="small muted" style="margin-top:8px">Tip: use free apps like MyFitnessPal or the USDA site to look up calories.</div>`,
      p => {
        $('#rsave', p).onclick = () => {
          const name = $('#rn', p).value.trim(); if (!name) { toast('Give it a name'); return; }
          const nid = id || 'c_' + uid();
          S.customRecipes[nid] = {
            type: $('#rt', p).value, name, emoji: $('#re', p).value || '🍽️', cal: +$('#rc', p).value || 0, protein: +$('#rp', p).value || 0, time: r.time || 0, custom: true,
            ing: $('#ri', p).value.split('\n').map(parseIng).filter(Boolean), steps: $('#rs', p).value.split('\n').map(s => s.trim()).filter(Boolean)
          };
          if (slot && !id) S.plan[slot.w][slot.d][slot.mt] = nid;
          save(); closeSheet(); render(); toast('Recipe saved');
        };
      });
  }
  const UNITS = ['cups', 'cup', 'tbsp', 'tsp', 'oz', 'lbs', 'lb', 'g', 'kg', 'ml', 'cans', 'can', 'slices', 'slice', 'scoops', 'scoop', 'stalks', 'stalk', 'cloves', 'clove', 'pinch', 'handful', 'bunch', 'pkg', 'jar'];
  function parseIng(line) {
    line = line.trim(); if (!line) return null;
    const m = line.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)?\s*(.*)$/);
    let q = 1, rest = line;
    if (m && m[1]) { q = m[1].split(/\s+/).reduce((a, p) => a + (p.includes('/') ? p.split('/')[0] / p.split('/')[1] : +p), 0); rest = m[2]; }
    let unit = '';
    const u = rest.split(/\s+/)[0].toLowerCase().replace(/\.$/, '');
    if (UNITS.includes(u)) { unit = u.replace(/s$/, '') === 'lb' ? 'lb' : u.replace(/(cup|can|slice|scoop|stalk|clove)s$/, '$1'); rest = rest.slice(u.length).trim(); }
    rest = rest.replace(/^of\s+/i, '');
    return [Math.round(q * 100) / 100, unit, rest || line, guessAisle(rest)];
  }
  function guessAisle(name) {
    const n = name.toLowerCase();
    const known = Object.values(RECIPES).flatMap(r => r.ing).find(x => x[2].toLowerCase() === n);
    if (known) return known[3];
    if (/chicken|beef|turkey|pork|salmon|shrimp|fish|cod|tuna steak|steak|bacon|sausage/.test(n)) return 'Meat & Seafood';
    if (/milk|yogurt|cheese|egg|butter|cream|feta|parmesan/.test(n)) return 'Dairy & Eggs';
    if (/bread|tortilla|rice|quinoa|pasta|bagel|bun|wrap/.test(n)) return 'Bakery & Grains';
    if (/frozen/.test(n)) return 'Frozen';
    if (/apple|banana|berr|lettuce|spinach|kale|onion|garlic|pepper|tomato|cucumber|carrot|broccoli|zucchini|avocado|lemon|lime|potato|celery|mushroom|fruit|herb|cilantro|parsley|asparagus|bean sprout|cabbage/.test(n)) return 'Produce';
    return 'Pantry';
  }
  function fmtQty(q) {
    const whole = Math.floor(q), f = q - whole;
    const fr = [[0, ''], [.25, '¼'], [.33, '⅓'], [.5, '½'], [.67, '⅔'], [.75, '¾'], [1, '']];
    let best = fr[0]; fr.forEach(x => { if (Math.abs(x[0] - f) < Math.abs(best[0] - f)) best = x; });
    if (Math.abs(best[0] - f) > .06) return String(Math.round(q * 10) / 10);
    const w = whole + (best[0] === 1 ? 1 : 0);
    return (w ? w : '') + best[1] || '0';
  }

  // ======================================================================
  // SHOP
  // ======================================================================
  function groceryList(w) {
    const map = {};
    S.plan[w].forEach(d => MEAL_TYPES.forEach(mt => {
      const r = recipe(d[mt]); if (!r) return;
      r.ing.forEach(([q, u, n, a]) => {
        const k = n.toLowerCase() + '|' + u;
        if (!map[k]) map[k] = { name: n, unit: u, qty: 0, aisle: a || 'Other', key: k };
        map[k].qty += q * (S.servings || 1);
      });
    }));
    // merge tbsp/tsp into cups when the same item is also measured in cups
    Object.values(map).forEach(it => {
      const f = { tbsp: 1 / 16, tsp: 1 / 48 }[it.unit], cup = map[it.name.toLowerCase() + '|cup'];
      if (f && cup) { cup.qty += it.qty * f; delete map[it.key]; }
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }
  function buyHint(it) {
    const n = it.name.toLowerCase(), q = it.qty;
    if (it.unit === 'oz' && /chicken|turkey|beef|salmon|cod|shrimp/.test(n)) return `≈ ${(q / 16).toFixed(1)} lb`;
    if (n === 'eggs') return `≈ ${Math.ceil(q / 12)} dozen`;
    if (/greek yogurt/.test(n) && it.unit === 'cup') return `≈ ${Math.ceil(q / 3.5)} × 32oz tub`;
    if (n.includes('spinach') && it.unit === 'cup') return `≈ ${Math.ceil(q / 6)} × 5oz bag`;
    if ((n.includes('salad greens') || n.includes('romaine')) && it.unit === 'cup') return `≈ ${Math.ceil(q / 6)} bag/head`;
    if (n.includes('almond milk') && it.unit === 'cup') return `≈ ${Math.ceil(q / 7.5)} half-gallon`;
    if (it.unit === '' && q % 1) return `buy ${Math.ceil(q)}`;
    return '';
  }

  VIEWS.shop = () => {
    const segs = [['groceries', 'Groceries'], ['gear', 'Home Gym Gear']];
    let body = '';
    if (sub.shop === 'groceries') {
      if (sub.shopWeek == null) sub.shopWeek = programPos(todayISO()).weekC - 1;
      const w = sub.shopWeek, items = groceryList(w), extra = S.shopExtra[w] || [];
      const ck = k => !!S.shopChecked[w + '|' + k];
      const left = items.filter(i => !ck(i.key)).length + extra.filter(e => !e.done).length;
      body = `<div class="chips" style="margin-bottom:12px">${[0, 1, 2, 3, 4, 5].map(i => `<button class="chip ${i === w ? 'on' : ''}" data-sw="${i}">Week ${i + 1}</button>`).join('')}</div>
        <div class="card tight"><div class="row between"><div><b>${left}</b> <span class="muted">items left</span></div>
          <div class="row" style="gap:6px"><span class="small muted">Servings</span><select class="inp" id="serv" style="width:70px;padding:6px 8px">${[1, 2, 3, 4].map(n => `<option ${n === S.servings ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
          <div class="row wrap" style="margin-top:10px;gap:8px"><button class="btn sm" id="copy">📋 Copy list</button><button class="btn sm ghost" id="share">📤 Share</button><button class="btn sm line" id="clr">Uncheck all</button></div>
          <div class="small muted" style="margin-top:8px">Copies everything not checked off. Paste it into Instacart, Notes, or a text message.</div></div>
        <div class="card tight shop">${AISLES.map(a => {
          const its = items.filter(i => i.aisle === a); if (!its.length) return '';
          return `<div class="aisle">${a}</div><div class="list">${its.map(it => `<div class="item ${ck(it.key) ? 'done' : ''}"><button class="check ${ck(it.key) ? 'on' : ''}" data-ck="${esc(it.key)}">${ck(it.key) ? '✓' : ''}</button><div class="grow"><div class="t">${esc(it.name)}</div><div class="s">${fmtQty(it.qty)} ${esc(it.unit)} ${buyHint(it) ? '· ' + buyHint(it) : ''}</div></div></div>`).join('')}</div>`;
        }).join('')}
        <div class="aisle">Extras</div><div class="list">${extra.map((e, ei) => `<div class="item ${e.done ? 'done' : ''}"><button class="check ${e.done ? 'on' : ''}" data-ex-ck="${ei}">${e.done ? '✓' : ''}</button><div class="grow t">${esc(e.name)}</div><button class="iconbtn" data-ex-del="${ei}" aria-label="Remove">✕</button></div>`).join('')}</div>
        <div class="row" style="margin-top:10px"><input class="inp grow" id="xadd" placeholder="Add item (paper towels, coffee…)"><button class="btn" id="xbtn">Add</button></div></div>
        <div class="note small"><b>Spices & basics to keep stocked:</b> cooking spray, salt, pepper, garlic powder, Italian seasoning, cumin, cinnamon, oregano, chili flakes. Not listed above.</div>`;
    } else {
      const owned = EQUIPMENT.filter(e => S.gear[e.id]).length;
      body = `<div class="card"><b>Everything you need to train at home</b><div class="small muted" style="margin-top:4px">Starter kit (must-haves + recommended) runs roughly <b>$150–300</b>. Start with the must-haves; you can do every workout with a mat, 3 pairs of dumbbells and loop bands. Prices are rough estimates.</div><div class="small" style="margin-top:8px"><b>${owned}/${EQUIPMENT.length}</b> items checked off</div></div>
        ${['Must-have', 'Recommended', 'Nice-to-have'].map(need => `<h2>${need}</h2>${EQUIPMENT.filter(e => e.need === need).map(e => `<div class="card tight gear"><div class="row" style="align-items:flex-start"><div class="ico">${GEAR_SVG[e.icon] || ''}</div><div class="grow"><div class="row between"><b>${e.name}</b></div><div class="small muted" style="margin:4px 0">${e.why}</div><div class="row wrap" style="gap:6px;margin-top:6px"><span class="badge">${e.price}</span><a class="btn sm line" href="https://www.amazon.com/s?k=${encodeURIComponent(e.q)}" target="_blank" rel="noopener">Shop</a><button class="btn sm ${S.gear[e.id] ? '' : 'ghost'}" data-gear="${e.id}">${S.gear[e.id] ? '✓ Have it' : 'I have this'}</button></div></div></div></div>`).join('')}`).join('')}`;
    }
    return `<h1 style="margin-bottom:14px">Shopping</h1><div class="seg">${segs.map(([k, l]) => `<button class="${sub.shop === k ? 'on' : ''}" data-seg="${k}">${l}</button>`).join('')}</div>${body}`;
  };
  BIND.shop = v => {
    on(v, '[data-seg]', 'click', el => { sub.shop = el.dataset.seg; render(); });
    on(v, '[data-sw]', 'click', el => { sub.shopWeek = +el.dataset.sw; render(); });
    on(v, '[data-gear]', 'click', el => { S.gear[el.dataset.gear] = !S.gear[el.dataset.gear]; save(); render(); });
    if (sub.shop !== 'groceries') return;
    const w = sub.shopWeek;
    on(v, '[data-ck]', 'click', el => { const k = w + '|' + el.dataset.ck; S.shopChecked[k] = !S.shopChecked[k]; save(); render(); });
    on(v, '[data-ex-ck]', 'click', el => { S.shopExtra[w][+el.dataset.exCk].done ^= true; save(); render(); });
    on(v, '[data-ex-del]', 'click', el => { S.shopExtra[w].splice(+el.dataset.exDel, 1); save(); render(); });
    $('#serv', v).onchange = e => { S.servings = +e.target.value; save(); render(); };
    $('#clr', v).onclick = () => { Object.keys(S.shopChecked).forEach(k => { if (k.startsWith(w + '|')) delete S.shopChecked[k]; }); (S.shopExtra[w] || []).forEach(e => e.done = false); save(); render(); };
    const addX = () => { const i = $('#xadd', v), n = i.value.trim(); if (!n) return; (S.shopExtra[w] = S.shopExtra[w] || []).push({ name: n, done: false }); save(); render(); };
    $('#xbtn', v).onclick = addX; $('#xadd', v).onkeydown = e => { if (e.key === 'Enter') addX(); };
    const listText = () => {
      const items = groceryList(w).filter(i => !S.shopChecked[w + '|' + i.key]);
      const txt = `Grocery list — Week ${w + 1}\n\n` + AISLES.map(a => { const its = items.filter(i => i.aisle === a); return its.length ? a.toUpperCase() + '\n' + its.map(i => `• ${i.name} — ${fmtQty(i.qty)} ${i.unit}`.trim()).join('\n') : ''; }).filter(Boolean).join('\n\n')
        + ((S.shopExtra[w] || []).filter(e => !e.done).length ? '\n\nEXTRAS\n' + S.shopExtra[w].filter(e => !e.done).map(e => '• ' + e.name).join('\n') : '');
      return txt;
    };
    const manualCopy = txt => openSheet(`<h3>Copy your list</h3><p class="small muted">Press and hold in the box → Select All → Copy.</p><textarea class="inp" style="min-height:50vh" readonly>${esc(txt)}</textarea>`);
    $('#copy', v).onclick = async () => {
      const txt = listText();
      try { await navigator.clipboard.writeText(txt); toast('List copied — paste it into Instacart or Notes'); } catch (e) { manualCopy(txt); }
    };
    $('#share', v).onclick = async () => {
      const txt = listText();
      if (!navigator.share) { $('#copy', v).click(); return; }
      try { await navigator.share({ title: 'Grocery list', text: txt }); } catch (e) { if (e.name !== 'AbortError') manualCopy(txt); }
    };
  };

  const GEAR_SVG = {
    mat: '<svg viewBox="0 0 48 48"><rect x="6" y="14" width="30" height="22" rx="3" fill="#8fd3c3"/><circle cx="38" cy="25" r="8" fill="#5fb9a5"/><circle cx="38" cy="25" r="3" fill="#3f9a86"/></svg>',
    db: '<svg viewBox="0 0 48 48"><rect x="14" y="22" width="20" height="4" rx="2" fill="#7d6a70"/><rect x="6" y="14" width="8" height="20" rx="2.5" fill="#e8436b"/><rect x="34" y="14" width="8" height="20" rx="2.5" fill="#e8436b"/><rect x="3" y="18" width="4" height="12" rx="1.5" fill="#c22f55"/><rect x="41" y="18" width="4" height="12" rx="1.5" fill="#c22f55"/></svg>',
    loop: '<svg viewBox="0 0 48 48" fill="none" stroke-width="5"><ellipse cx="24" cy="18" rx="16" ry="7" stroke="#f5b400"/><ellipse cx="24" cy="30" rx="14" ry="6" stroke="#e8436b"/></svg>',
    tube: '<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round"><path d="M10 12 C 18 40, 30 40, 38 12" stroke="#7b5cff" stroke-width="3.5"/><rect x="5" y="6" width="10" height="7" rx="3" fill="#23161b"/><rect x="33" y="6" width="10" height="7" rx="3" fill="#23161b"/></svg>',
    kb: '<svg viewBox="0 0 48 48"><path d="M16 20 C 16 8, 32 8, 32 20" fill="none" stroke="#3a2d32" stroke-width="5"/><circle cx="24" cy="30" r="13" fill="#3a2d32"/><rect x="18" y="27" width="12" height="6" rx="2" fill="#ff7a1a"/></svg>',
    rope: '<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round"><path d="M10 14 C 4 44, 44 44, 38 14" stroke="#1f9bf0" stroke-width="2.5"/><rect x="7" y="4" width="6" height="12" rx="3" fill="#e8436b"/><rect x="35" y="4" width="6" height="12" rx="3" fill="#e8436b"/></svg>',
    shoe: '<svg viewBox="0 0 48 48"><path d="M5 30 L5 20 Q12 22 18 16 L26 24 Q36 26 43 29 L43 34 L5 34 Z" fill="#e8436b"/><rect x="5" y="33" width="38" height="4" rx="2" fill="#3a2d32"/><path d="M19 20 l3 3 M22 18 l3 3" stroke="#fff" stroke-width="1.5"/></svg>',
    bottle: '<svg viewBox="0 0 48 48"><rect x="17" y="4" width="14" height="6" rx="2" fill="#3a2d32"/><rect x="14" y="10" width="20" height="34" rx="6" fill="#1f9bf0"/><rect x="14" y="22" width="20" height="22" rx="6" fill="#64bdf7"/></svg>',
    scale2: '<svg viewBox="0 0 48 48"><rect x="6" y="26" width="36" height="12" rx="4" fill="#7d6a70"/><ellipse cx="24" cy="24" rx="16" ry="4" fill="#c9bcc1"/><rect x="18" y="30" width="12" height="5" rx="1" fill="#8fd3c3"/></svg>',
    scale: '<svg viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="8" fill="#c9bcc1"/><rect x="16" y="13" width="16" height="7" rx="2" fill="#23161b"/><text x="24" y="19" font-size="6" fill="#8fd3c3" text-anchor="middle" font-family="monospace">142</text><rect x="13" y="30" width="7" height="5" rx="2" fill="#7d6a70"/><rect x="28" y="30" width="7" height="5" rx="2" fill="#7d6a70"/></svg>',
    roller: '<svg viewBox="0 0 48 48"><rect x="6" y="16" width="36" height="16" rx="8" fill="#7b5cff"/><ellipse cx="42" cy="24" rx="3" ry="8" fill="#5a3fd6"/><path d="M12 16v16M18 16v16M24 16v16M30 16v16M36 16v16" stroke="#9a82ff" stroke-width="1.5"/></svg>'
  };

  // ---------- backup ----------
  async function backup() {
    S.lastBackup = todayISO(); save();
    const name = `fither-backup-${todayISO()}.json`, json = JSON.stringify(S);
    try {
      const file = new File([json], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'FitHer backup' });
        toast('Backup saved ✓'); render(); return;
      }
    } catch (e) { if (e.name === 'AbortError') { S.lastBackup = null; save(); return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup downloaded ✓'); render();
  }
  const hasData = () => S.log.length || S.weights.length || Object.keys(S.customRecipes).length || S.videos.length;
  const daysSinceBackup = () => S.lastBackup ? Math.floor((parse(todayISO()) - parse(S.lastBackup)) / 864e5) : Infinity;
  function backupReminder() {
    if (!hasData() || daysSinceBackup() < 7 || S.backupSnooze === todayISO()) return '';
    return `<div class="card" style="border:2px solid #f5b400"><div class="row between"><h3>💾 Time to back up your progress</h3><button class="iconbtn" data-snooze aria-label="Later">✕</button></div>
      <div class="small muted" style="margin:6px 0 10px">${S.lastBackup ? `Last backup was ${daysSinceBackup()} days ago.` : "You haven't backed up yet."} Your workouts, weights and recipes live only on this phone. A backup takes 10 seconds.</div>
      <button class="btn block" data-backup>Back up now</button></div>`;
  }
  function saveGuide() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return `<div class="card"><h3>💾 How your progress is saved</h3>
      <div class="cue"><b>1</b><div><b>It saves automatically</b> on this phone every time you log something. No account needed.</div></div>
      <div class="cue"><b>2</b><div><b>Always open the app from the home-screen icon.</b>${ios ? " On iPhone, the icon and Safari keep <i>separate</i> data — progress logged in Safari won't show up in the icon app." : ''} Apps on the home screen are also safer from the phone clearing old website data.</div></div>
      <div class="cue"><b>3</b><div><b>Back up once a week</b> (you'll get a reminder). Tap <b>Back up now</b> → ${ios ? 'choose <b>Save to Files</b> (pick iCloud Drive) or email it to yourself' : 'save it to Google Drive or email it to yourself'}.</div></div>
      <div class="cue"><b>4</b><div><b>New phone or lost data?</b> Install the app again, go to Progress → <b>Restore</b>, and pick your latest backup file.</div></div>
      <div class="small muted" style="margin:6px 0 10px">Don't clear your browser history/website data or delete the app without backing up first — that erases everything.</div>
      <div class="row" style="gap:8px"><button class="btn grow" data-backup>⬇ Back up now</button><label class="btn ghost">⬆ Restore<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
      <div class="small muted" style="margin-top:8px">${S.lastBackup ? `Last backup: ${fmtDate(S.lastBackup)}` : 'No backup yet'}</div></div>`;
  }

  // ======================================================================
  // PROGRESS
  // ======================================================================
  VIEWS.progress = () => {
    const t = todayISO(), mon = iso(mondayOf(new Date()));
    const thisWeek = new Set(S.log.filter(l => l.date >= mon && l.date <= t).map(l => l.date)).size;
    let streak = 0; const days = new Set(S.log.map(l => l.date));
    for (let n = 0, d = new Date(); n < 400; n++, d = addDays(d, -1)) {
      const ds = iso(d), ty = S.schedule[wdIdx(d)];
      if (days.has(ds)) streak++; else if (ty === 'rest' || n === 0) continue; else break;
    }
    const ws = S.weights.slice().sort((a, b) => a.date.localeCompare(b.date));
    const change = ws.length > 1 ? (ws[ws.length - 1].lb - ws[0].lb) : null;
    const totalMins = S.log.reduce((a, l) => a + (l.mins || 0), 0);
    return `<h1 style="margin-bottom:14px">Progress</h1>
      <div class="card stats"><div class="stat"><b>${thisWeek}</b><span>workouts this week</span></div><div class="stat"><b>${streak}</b><span>day streak 🔥</span></div><div class="stat"><b>${S.log.length}</b><span>total · ${Math.round(totalMins / 60)}h</span></div></div>
      <h2 class="row between"><span>Weight</span>${change !== null ? `<span class="badge ${change <= 0 ? 'ok' : ''}">${change <= 0 ? '▼' : '▲'} ${Math.abs(change).toFixed(1)} lb</span>` : ''}</h2>
      <div class="card">${ws.length > 1 ? chartSVG(ws) : '<div class="muted small">Log your weight once a week (same day, morning, before eating) to see your trend here.</div>'}
        <div class="row" style="margin-top:12px"><input class="inp" id="wlb" type="number" step="0.1" inputmode="decimal" placeholder="Weight (lb)" style="flex:1"><input class="inp" id="wdt" type="date" value="${t}" style="flex:1"><button class="btn" id="wadd">Add</button></div>
        ${ws.length ? `<div class="list small" style="margin-top:10px">${ws.slice().reverse().slice(0, 6).map(w => `<div class="row between" style="padding:6px 0"><span>${fmtDate(w.date)}</span><span><b>${w.lb}</b> lb <button class="iconbtn" style="width:28px;height:28px;font-size:13px" data-wdel="${w.date}">✕</button></span></div>`).join('')}</div>` : ''}
        <div class="small muted" style="margin-top:8px">Healthy, sustainable loss is about 0.5–2 lb/week. Weight bounces day to day — watch the trend, not one number.</div></div>
      <h2 class="row between"><span>Workout log</span><button class="btn sm ghost" id="lnew">+ Log workout</button></h2>
      ${S.log.length ? `<div class="card tight list">${S.log.slice(0, 60).map(l => `<div class="item" style="cursor:default;align-items:flex-start"><div class="emoji" style="background:${DAY_TYPES[l.type].color}22">${DAY_TYPES[l.type].icon}</div><div class="grow"><div class="t">${esc(l.title)} ${['', '😫', '😕', '🙂', '😊', '🔥'][l.rating] || ''}</div><div class="s">${fmtDate(l.date)} · ${l.mins} min${l.source === 'video' ? ' · YouTube' : ''}</div>${l.notes ? `<div class="s" style="margin-top:2px">${esc(l.notes)}</div>` : ''}</div><button class="iconbtn" style="width:30px;height:30px;font-size:13px" data-ldel="${l.id}" aria-label="Delete">✕</button></div>`).join('')}</div>` : '<div class="note small">No workouts logged yet. Finish one with the timer, or tap <b>+ Log workout</b>.</div>'}
      <h2>Save your progress</h2>
      ${saveGuide()}
      <h2>Settings</h2>
      <div class="card"><label class="f" style="margin-top:0">Your name</label><input class="inp" id="sname" value="${esc(S.name)}" placeholder="Name">
        <label class="f">Program start date (week 1, day 1)</label><input class="inp" id="sstart" type="date" value="${S.start}">
        <label class="f">Daily calorie target</label><input class="inp" id="scal" type="number" inputmode="numeric" value="${S.calTarget}">
        <label class="f">Weekly split</label>
        ${WEEKDAYS.map((d, i) => `<div class="row" style="margin-bottom:6px"><span style="width:44px;font-weight:700">${d}</span><select class="inp" data-sched="${i}">${Object.entries(DAY_TYPES).map(([k, ty]) => `<option value="${k}" ${S.schedule[i] === k ? 'selected' : ''}>${ty.icon} ${ty.label}</option>`).join('')}</select></div>`).join('')}
        <label class="f">Appearance</label><select class="inp" id="stheme">${[['auto', 'Match phone'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<option value="${k}" ${S.theme === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <div class="row wrap" style="margin-top:16px;gap:8px"><button class="btn sm line" id="restart">Start new 6 weeks</button><button class="btn sm line" id="wipe" style="color:#c22">Erase all</button></div>
      </div>`;
  };
  function chartSVG(ws) {
    const W = 320, H = 150, pad = 26;
    const xs = ws.map(w => parse(w.date).getTime()), ys = ws.map(w => w.lb);
    const x0 = Math.min(...xs), x1 = Math.max(...xs) || x0 + 1, y0 = Math.floor(Math.min(...ys) - 2), y1 = Math.ceil(Math.max(...ys) + 2);
    const X = x => pad + (x - x0) / (x1 - x0 || 1) * (W - pad - 10), Y = y => 10 + (y1 - y) / (y1 - y0) * (H - 30);
    const pts = ws.map((w, i) => [X(xs[i]), Y(w.lb)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const grid = [y0, (y0 + y1) / 2, y1].map(v => `<line class="gl" x1="${pad}" x2="${W - 10}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v) + 3}">${Math.round(v)}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}">${grid}<path class="ar" d="${line} L${pts[pts.length - 1][0]},${H - 20} L${pts[0][0]},${H - 20} Z"/><path class="ln" d="${line}"/>${pts.map(p => `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`).join('')}<text x="${pad}" y="${H - 4}">${fmtDate(ws[0].date)}</text><text x="${W - 10}" y="${H - 4}" text-anchor="end">${fmtDate(ws[ws.length - 1].date)}</text></svg>`;
  }
  BIND.progress = v => {
    $('#wadd', v).onclick = () => {
      const lb = parseFloat($('#wlb', v).value), d = $('#wdt', v).value || todayISO();
      if (!lb) { toast('Enter a weight'); return; }
      S.weights = S.weights.filter(w => w.date !== d); S.weights.push({ date: d, lb }); save(); render(); toast('Weight saved');
    };
    on(v, '[data-wdel]', 'click', el => { S.weights = S.weights.filter(w => w.date !== el.dataset.wdel); save(); render(); });
    on(v, '[data-ldel]', 'click', el => { if (confirm('Delete this entry?')) { S.log = S.log.filter(l => l.id !== el.dataset.ldel); save(); render(); } });
    $('#lnew', v).onclick = () => logSheet({});
    $('#sname', v).onchange = e => { S.name = e.target.value.trim(); save(); };
    $('#sstart', v).onchange = e => { if (e.target.value) { S.start = e.target.value; sub.mealWeek = null; sub.shopWeek = null; save(); toast('Start date updated'); } };
    $('#scal', v).onchange = e => { S.calTarget = +e.target.value || 1500; save(); };
    $('#stheme', v).onchange = e => { S.theme = e.target.value; save(); applyTheme(); };
    on(v, '[data-sched]', 'change', el => { S.schedule[+el.dataset.sched] = el.value; save(); toast('Split updated'); });
    on(v, '[data-backup]', 'click', backup);
    $('#imp', v).onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { const d = JSON.parse(t); if (!d.plan) throw 0; S = Object.assign(defaults(), d); save(); applyTheme(); render(); toast('Backup restored'); }).catch(() => toast("That file isn't a valid backup"));
    };
    $('#restart', v).onclick = () => { if (confirm('Start a fresh 6-week program from this Monday? Your log and weights are kept.')) { S.start = iso(mondayOf(new Date())); S.plan = buildDefaultPlan(); S.shopChecked = {}; S.shopExtra = {}; sub.mealWeek = sub.shopWeek = null; save(); go('today'); } };
    $('#wipe', v).onclick = () => { if (confirm('Erase ALL data on this phone? This cannot be undone.')) { S = defaults(); save(); go('today'); } };
  };

  // ---------- boot ----------
  const h = location.hash.slice(1);
  if (TABS.some(t => t[0] === h)) tab = h;
  renderTabs(); render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
