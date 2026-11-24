/* Puente Laboral · mapa plano en SVG
   No es un mapa real: es un dibujo que explica qué pasa (buscando, quién está cerca, quién viene). */
(function(){
  const PL = window.PL;
  const P = 42, CX = 210, CY = 168, ROT = -12;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  PL.loop = fn => {
    let alive = true, id;
    const f = t => { if (!alive) return; if (fn(t) === false) return; id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    const kill = () => { alive = false; cancelAnimationFrame(id); };
    PL.onLeave(kill); return kill;
  };
  PL.tween = (ms, fn, done) => {
    let st = null;
    return PL.loop(t => {
      if (st == null) st = t;
      const p = reduce() ? 1 : Math.min(1, (t - st) / ms);
      fn(p);
      if (p >= 1) { if (done) done(); return false; }
    });
  };

  function hash(str){ let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) % 100003; return h || 1; }

  PL.map = (host, opts = {}) => {
    let s = hash(opts.seed || 'puente');
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let blocks = '';
    for (let i = -14; i < 25; i++) for (let j = -12; j < 22; j++) {
      const r = rnd();
      const fill = r < .07 ? '#DDEEDF' : r < .13 ? '#E7DED1' : '#EFE8DD';
      blocks += `<rect x="${i * P + 4}" y="${j * P + 4}" width="${P - 8}" height="${P - 8}" rx="6" fill="${fill}"/>`;
    }
    const av = `<path d="M-700 ${2 * P}H1100M-700 ${7 * P}H1100M-700 ${-4 * P}H1100M-700 ${12 * P}H1100M${1 * P} -700V1000M${8 * P} -700V1000M${-5 * P} -700V1000M${14 * P} -700V1000M${-11 * P} -700V1000M${20 * P} -700V1000" stroke="#FFD9C4" stroke-width="11"/><path d="M-460 670L900 -240" stroke="#FFFFFF" stroke-width="10"/><path d="M-460 670L900 -240" stroke="#FFD9C4" stroke-width="6"/>`;
    host.insertAdjacentHTML('afterbegin', `<svg class="map" viewBox="0 0 420 336" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${PL.esc(opts.label || 'Mapa de tu zona')}">
      <rect x="-400" y="-400" width="1300" height="1200" fill="#FFFFFF"/>
      <g class="world" transform="rotate(${ROT} ${CX} ${CY})">${blocks}${av}
        <polyline class="route" fill="none" stroke="#1B130E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points=""/>
        <g class="pins"></g>
      </g>
      <g class="radar" style="display:none"><circle class="ring" cx="${CX}" cy="${CY}" r="78" fill="#1B130E" fill-opacity=".05" stroke="#1B130E" stroke-opacity=".35" stroke-width="1.5"/><circle class="ring" cx="${CX}" cy="${CY}" r="78" fill="#1B130E" fill-opacity=".05" stroke="#1B130E" stroke-opacity=".35" stroke-width="1.5"/><circle class="ring" cx="${CX}" cy="${CY}" r="78" fill="#1B130E" fill-opacity=".05" stroke="#1B130E" stroke-opacity=".35" stroke-width="1.5"/></g>
      <g class="me"><circle cx="${CX}" cy="${CY}" r="14" fill="#1B130E" stroke="#FFFFFF" stroke-width="4"/><circle cx="${CX}" cy="${CY}" r="5" fill="#FF5A1F"/></g>
    </svg>`);
    const svg = host.querySelector('svg.map');
    /* en pantallas grandes se ve más ciudad, con el mismo centro */
    const fit = () => { const k = Math.max(1, Math.min(3.2, host.clientWidth / 600)); svg.setAttribute('viewBox', `${CX - 210 * k} ${CY - 168 * k} ${420 * k} ${336 * k}`); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(host); PL.onLeave(() => ro.disconnect());
    const pinsG = svg.querySelector('.pins'), routeEl = svg.querySelector('.route'), radarG = svg.querySelector('.radar');
    const pins = {}, cid = 'pc' + Math.random().toString(36).slice(2, 7);
    svg.insertAdjacentHTML('afterbegin', `<defs><clipPath id="${cid}"><circle r="14"/></clipPath></defs>`);
    const NSu = 'http://www.w3.org/2000/svg';

    function spot(){
      let ix, iy;
      do { ix = PL.ri(2, 8); iy = PL.ri(1, 7); } while (Math.abs(ix - 5) + Math.abs(iy - 4) < 2 || (ix === 5 && iy === 4));
      return {x: ix * P, y: iy * P};
    }
    function place(g, x, y){ g.setAttribute('transform', `translate(${x} ${y})`); }
    function pathPts(p){ return [[p.x0, p.y0], [CX, p.y0], [CX, CY]]; }
    function at(pts, d){
      for (let k = 0; k < pts.length - 1; k++) {
        const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
        const L = Math.abs(bx - ax) + Math.abs(by - ay);
        if (d <= L || k === pts.length - 2) {
          const f = L ? Math.min(1, d / L) : 1;
          return {x: ax + (bx - ax) * f, y: ay + (by - ay) * f, k};
        }
        d -= L;
      }
    }

    return {
      svg,
      radar(on){ radarG.style.display = on ? '' : 'none'; },
      addPin(id, w, pos){
        const p = pos || spot();
        const g = document.createElementNS(NSu, 'g');
        g.setAttribute('class', 'wpin'); g.style.opacity = 0;
        g.innerHTML = !w.name ? `<g transform="rotate(${-ROT})"><circle r="10" fill="${w.color}" stroke="#fff" stroke-width="3.5"/></g>` : PL.avSrc(w.name) ? `<g transform="rotate(${-ROT})"><circle r="17" fill="#fff"/><circle r="15" fill="${PL.avBg(w.name)}"/><image href="${PL.avSrc(w.name)}" x="-11.5" y="-12" width="23" height="23"/><circle r="16" fill="none" stroke="#1B130E" stroke-width="2"/></g>` : `<g transform="rotate(${-ROT})"><circle r="15" fill="${w.color}" stroke="#1B130E" stroke-width="2.5"/><text text-anchor="middle" dy=".36em" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="10.5" fill="#1B130E">${PL.esc(PL.initials(w.name))}</text></g>`;
        place(g, p.x, p.y); pinsG.appendChild(g);
        requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = 1; }));
        pins[id] = {g, x0: p.x, y0: p.y};
        return p;
      },
      removePin(id){ const p = pins[id]; if (!p) return; p.g.style.opacity = 0; setTimeout(() => p.g.remove(), 400); delete pins[id]; },
      only(id){ Object.keys(pins).forEach(k => { if (k !== id) this.removePin(k); }); },
      clear(){ Object.keys(pins).forEach(k => this.removePin(k)); routeEl.setAttribute('points', ''); },
      /* avanza el pin por las calles hasta ti: p va de 0 a 1 */
      move(id, prog){
        const p = pins[id]; if (!p) return;
        const pts = pathPts(p);
        const L = Math.abs(CX - p.x0) + Math.abs(CY - p.y0);
        const pos = at(pts, L * Math.max(0, Math.min(1, prog)));
        place(p.g, pos.x, pos.y);
        const rest = [[pos.x, pos.y]].concat(pts.slice(pos.k + 1));
        routeEl.setAttribute('points', prog >= 1 ? '' : rest.map(q => q.join(',')).join(' '));
      }
    };
  };

  /* ——— escena de la portada: busca, llegan trabajadores, uno acepta y viene ——— */
  PL.heroScene = host => {
    const m = PL.map(host, {seed: 'portada', label: 'Ejemplo de cómo se ve un pedido en el mapa'});
    host.insertAdjacentHTML('beforeend', `<span class="scene-tag">Así se ve un pedido</span><div class="scene-card out" id="scCard"></div>`);
    const card = host.querySelector('#scCard');
    const SC = [
      {s: 'gasfitero', d: 'Santiago de Surco', w: 'Carlos Mendoza', c: '#FFD86B', p: 80, eta: 12, task: 'Fuga de agua'},
      {s: 'ninera', d: 'Los Olivos', w: 'Rosa Quispe', c: '#B4EEE1', p: 14, eta: 9, task: 'Recoger del colegio', u: 'hora'},
      {s: 'mesero', d: 'Miraflores', w: 'Milagros Torres', c: '#D4CBFF', p: 80, eta: 18, task: 'Matrimonio · 4 personas', u: 'turno'},
      {s: 'mudanza', d: 'San Juan de Lurigancho', w: 'Wilmer Castillo', c: '#FFC2B0', p: 260, eta: 15, task: 'Mudanza completa'}
    ];
    let n = 0;
    function show(html){ card.classList.add('out'); PL.later(() => { card.innerHTML = html; card.classList.remove('out'); }, 260); }
    function cycle(){
      const sc = SC[n++ % SC.length], svc = PL.svc(sc.s);
      m.clear(); m.radar(true);
      show(`<span class="svc-ic" style="margin:0;width:46px;height:46px">${PL.si(svc.i)}</span><div><div class="t">Buscando ${PL.esc(svc.n.toLowerCase())}</div><div class="s">${PL.esc(sc.task)} · ${PL.esc(sc.d)}</div></div><span class="pill ${['mesero', 'mudanza'].includes(sc.s) ? 'm' : 'a'}">${['mesero', 'mudanza'].includes(sc.s) ? 'Programado' : 'Al toque'}</span>`);
      const others = PL.DEMO.workers.filter(x => x !== sc.w);
      PL.later(() => m.addPin('a', {name: '', color: '#FFB08A'}), 900);
      PL.later(() => m.addPin('w', {name: '', color: '#FF5A1F'}), 1500);
      PL.later(() => m.addPin('b', {name: '', color: '#FFB08A'}), 2100);
      PL.later(() => {
        m.radar(false); m.only('w');
        show(`<span class="svc-ic" style="margin:0;width:46px;height:46px">${PL.si(svc.i)}</span><div><div class="t">Tu pedido fue aceptado</div><div class="s">${['mesero', 'mudanza'].includes(sc.s) ? 'Confirmado para ese día' : 'Va en camino'}</div></div><span class="pill v">${PL.ic('check')}Aceptado</span>`);
        PL.tween(3600, p => m.move('w', p));
      }, 3200);
      PL.later(cycle, 8200);
    }
    cycle();
  };
})();
