/* Animated exercise figure renderer.
 * A pose is a set of joint angles (degrees). Limb angles are measured from
 * "straight down" (0), positive = toward +x (the figure's front in side view,
 * the viewer's right in front view). Torso angle is measured from "straight up".
 * Each exercise supplies 2+ key poses; the figure loops through them.
 */
(function () {
  const L = { torso: 48, neck: 5, head: 10, ua: 24, fa: 22, th: 30, sh: 30 };
  const FLOOR = 186;
  const D = Math.PI / 180;

  const BASE = { view: 'side', t: 0, la: 5, lf: 5, ra: -5, rf: -5, ll: 4, ls: 4, rl: -4, rs: -4, lift: 0 };

  function seg(x, y, ang, len) {
    return [x + Math.sin(ang * D) * len, y + Math.cos(ang * D) * len];
  }

  function solve(p) {
    const front = p.view === 'front';
    const hip = [100, 100];
    const neck = [hip[0] + Math.sin(p.t * D) * L.torso, hip[1] - Math.cos(p.t * D) * L.torso];
    const headC = [neck[0] + Math.sin(p.t * D) * (L.neck + L.head + (p.headOff || 0)), neck[1] - Math.cos(p.t * D) * (L.neck + L.head)];
    const so = front ? 13 : 0, ho = front ? 8 : 0;
    // shoulders slightly below neck
    const sh = [neck[0] - Math.sin(p.t * D) * 3, neck[1] + Math.cos(p.t * D) * 3];
    const lS = [sh[0] - so, sh[1]], rS = [sh[0] + so, sh[1]];
    const lH = [hip[0] - ho, hip[1]], rH = [hip[0] + ho, hip[1]];
    const lE = seg(lS[0], lS[1], p.la, L.ua), lW = seg(lE[0], lE[1], p.lf, L.fa);
    const rE = seg(rS[0], rS[1], p.ra, L.ua), rW = seg(rE[0], rE[1], p.rf, L.fa);
    const lK = seg(lH[0], lH[1], p.ll, L.th), lA = seg(lK[0], lK[1], p.ls, L.sh);
    const rK = seg(rH[0], rH[1], p.rl, L.th), rA = seg(rK[0], rK[1], p.rs, L.sh);
    const pts = { hip, neck, headC, lS, rS, lH, rH, lE, lW, rE, rW, lK, lA, rK, rA };
    // auto-ground: lowest body point touches the floor, then apply lift (jumps)
    const ys = [lW, rW, lA, rA, lK, rK, lE, rE, hip, neck].map(q => q[1]);
    ys.push(headC[1] + L.head);
    const low = Math.max.apply(null, ys);
    const dy = FLOOR - low - (p.lift || 0);
    // center horizontally
    const xs = [lW, rW, lA, rA, lK, rK, headC, hip].map(q => q[0]);
    const cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    const dx = 100 - cx;
    Object.keys(pts).forEach(k => { pts[k] = [pts[k][0] + dx, pts[k][1] + dy]; });
    return pts;
  }

  function lerpPose(a, b, f) {
    const o = { view: a.view };
    Object.keys(BASE).forEach(k => {
      if (k === 'view') return;
      const va = a[k] ?? BASE[k], vb = b[k] ?? BASE[k];
      o[k] = va + (vb - va) * f;
    });
    o.headOff = 0;
    return o;
  }

  function norm(p) { return Object.assign({}, BASE, p); }

  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function build(svg, ex) {
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.innerHTML = '';
    const g = el('g', {});
    svg.appendChild(el('ellipse', { cx: 100, cy: FLOOR + 4, rx: 80, ry: 5, class: 'fig-shadow' }));
    if (ex.mat) svg.appendChild(el('rect', { x: 18, y: FLOOR, width: 164, height: 5, rx: 2.5, class: 'fig-mat' }));
    const mk = (cls, w) => { const l = el('line', { class: cls, 'stroke-width': w, 'stroke-linecap': 'round' }); g.appendChild(l); return l; };
    const parts = {};
    // far limbs first (behind), then torso, then near limbs
    parts.lTh = mk('fig-far', 10); parts.lSh = mk('fig-far', 9);
    parts.lUa = mk('fig-far', 8); parts.lFa = mk('fig-far', 7);
    parts.torso = mk('fig-body', 15);
    parts.rTh = mk('fig-near', 10); parts.rSh = mk('fig-near', 9);
    parts.rUa = mk('fig-near', 8); parts.rFa = mk('fig-near', 7);
    parts.hair = el('ellipse', { rx: 6, ry: 4, class: 'fig-hair' }); g.appendChild(parts.hair);
    parts.head = el('circle', { r: L.head, class: 'fig-head' }); g.appendChild(parts.head);
    if (ex.prop === 'db' || ex.prop === 'kb') {
      parts.pL = el(ex.prop === 'kb' ? 'circle' : 'rect', ex.prop === 'kb' ? { r: 7, class: 'fig-prop' } : { width: 14, height: 6, rx: 2, class: 'fig-prop' });
      parts.pR = el(ex.prop === 'kb' ? 'circle' : 'rect', ex.prop === 'kb' ? { r: 0, class: 'fig-prop' } : { width: 14, height: 6, rx: 2, class: 'fig-prop' });
      g.appendChild(parts.pL); g.appendChild(parts.pR);
    }
    if (ex.prop === 'band') { parts.band = el('path', { class: 'fig-band', fill: 'none', 'stroke-width': 3 }); g.appendChild(parts.band); }
    if (ex.prop === 'rope') { parts.rope = el('path', { class: 'fig-rope', fill: 'none', 'stroke-width': 2 }); g.insertBefore(parts.rope, g.firstChild); }
    svg.appendChild(g);
    return parts;
  }

  function setLine(l, a, b) { l.setAttribute('x1', a[0].toFixed(1)); l.setAttribute('y1', a[1].toFixed(1)); l.setAttribute('x2', b[0].toFixed(1)); l.setAttribute('y2', b[1].toFixed(1)); }

  function draw(parts, ex, p, phase) {
    const q = solve(p);
    setLine(parts.lTh, q.lH, q.lK); setLine(parts.lSh, q.lK, q.lA);
    setLine(parts.lUa, q.lS, q.lE); setLine(parts.lFa, q.lE, q.lW);
    setLine(parts.torso, q.hip, q.neck);
    setLine(parts.rTh, q.rH, q.rK); setLine(parts.rSh, q.rK, q.rA);
    setLine(parts.rUa, q.rS, q.rE); setLine(parts.rFa, q.rE, q.rW);
    parts.head.setAttribute('cx', q.headC[0].toFixed(1)); parts.head.setAttribute('cy', q.headC[1].toFixed(1));
    // ponytail behind the head (side view) or bun on top (front view)
    const tr = p.t * D;
    const off = p.view === 'front' ? [0, -12] : [-11, -3];
    const hx = q.headC[0] + off[0] * Math.cos(tr) - off[1] * Math.sin(tr);
    const hy = q.headC[1] + off[0] * Math.sin(tr) + off[1] * Math.cos(tr);
    parts.hair.setAttribute('cx', hx.toFixed(1)); parts.hair.setAttribute('cy', hy.toFixed(1));
    parts.hair.setAttribute('transform', `rotate(${(p.t + (p.view === 'front' ? 0 : 30)).toFixed(0)} ${hx.toFixed(1)} ${hy.toFixed(1)})`);
    if (parts.pL) {
      if (ex.prop === 'kb') {
        const m = [(q.lW[0] + q.rW[0]) / 2, (q.lW[1] + q.rW[1]) / 2 + 6];
        parts.pL.setAttribute('cx', m[0]); parts.pL.setAttribute('cy', m[1]);
      } else {
        parts.pL.setAttribute('x', q.lW[0] - 7); parts.pL.setAttribute('y', q.lW[1] - 3);
        parts.pR.setAttribute('x', q.rW[0] - 7); parts.pR.setAttribute('y', q.rW[1] - 3);
      }
    }
    if (parts.band) {
      const a = ex.bandAt === 'knees' ? [q.lK, q.rK] : ex.bandAt === 'ankles' ? [q.lA, q.rA] : [q.lW, q.rW];
      parts.band.setAttribute('d', `M${a[0][0]},${a[0][1]} L${a[1][0]},${a[1][1]}`);
    }
    if (parts.rope) {
      const r = phase; // swing rope around
      const top = Math.cos(r * Math.PI * 2);
      const midY = top > 0 ? q.headC[1] - 22 : FLOOR + 1;
      const midX = (q.lW[0] + q.rW[0]) / 2;
      parts.rope.setAttribute('d', `M${q.lW[0]},${q.lW[1]} Q${midX - 30},${midY} ${midX},${midY} Q${midX + 30},${midY} ${q.rW[0]},${q.rW[1]}`);
    }
  }

  const live = new Set();
  let running = false;

  function ease(f) { return 0.5 - Math.cos(f * Math.PI) / 2; }

  function frame(ts) {
    live.forEach(item => {
      if (!item.svg.isConnected) { live.delete(item); return; }
      if (item.paused) return;
      const poses = item.poses;
      const n = poses.length;
      const period = item.ex.speed || 1600;
      // cycle through keyframes; for 2 poses go A->B->A
      const seq = n === 2 ? [poses[0], poses[1], poses[0]] : poses.concat([poses[0]]);
      const segs = seq.length - 1;
      const t = (ts % period) / period * segs;
      const i = Math.min(Math.floor(t), segs - 1);
      const f = ease(t - i);
      draw(item.parts, item.ex, lerpPose(seq[i], seq[i + 1], f), (ts % period) / period);
    });
    if (live.size) requestAnimationFrame(frame); else running = false;
  }

  window.Figure = {
    mount(svg, ex, opts) {
      opts = opts || {};
      const poses = (ex.poses || [{}]).map(norm);
      const parts = build(svg, ex);
      const item = { svg, ex, poses, parts, paused: !!opts.static };
      draw(parts, ex, poses[poses.length > 1 ? 1 : 0], 0);
      if (!opts.static) {
        live.add(item);
        if (!running) { running = true; requestAnimationFrame(frame); }
      }
      return item;
    }
  };
})();
