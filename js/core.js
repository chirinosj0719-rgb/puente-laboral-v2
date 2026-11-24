/* Puente Laboral · núcleo: estado, rutas y piezas compartidas */
(function(){
  const PL = window.PL, C = PL.CFG;

  /* ——— ayudantes ——— */
  PL.$ = (s, r = document) => r.querySelector(s);
  PL.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  PL.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  PL.ic = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${PL.UI[n] || ''}</svg>`;
  PL.si = n => `<svg class="si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI[n] || PL.SI.otr}</svg>`;
  PL.money = n => 'S/ ' + Math.round(n).toLocaleString('es-PE');
  PL.rnd = (a, b) => a + Math.random() * (b - a);
  PL.ri = (a, b) => Math.floor(PL.rnd(a, b + 1));
  PL.pick = a => a[Math.floor(Math.random() * a.length)];
  PL.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  PL.norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  PL.svc = id => PL.SVCS.find(s => s.id === id);
  PL.cat = id => PL.CATS.find(c => c.id === id);
  PL.short = full => { const p = String(full).trim().split(/\s+/); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); };
  PL.initials = full => String(full).trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  PL.step = svc => (svc.u === 'hora' || svc.u === 'paseo') ? 1 : 5;
  PL.snap = (n, svc) => { const s = PL.step(svc); return Math.max(s, Math.round(n / s) * s); };
  PL.isDesk = () => matchMedia('(min-width:900px)').matches;

  const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  PL.fdate = ts => { const d = new Date(ts); return `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  PL.fhm = hm => { if (!hm) return ''; let [h, m] = hm.split(':').map(Number); const ap = h >= 12 ? 'p. m.' : 'a. m.'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
  PL.ftime = ts => { const d = new Date(ts); return PL.fhm(`${d.getHours()}:${d.getMinutes()}`); };
  PL.isoDay = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  PL.dayName = iso => { const t = PL.isoDay(new Date()), m = PL.isoDay(new Date(Date.now() + 864e5)); return iso === t ? 'Hoy' : iso === m ? 'Mañana' : PL.fdate(iso + 'T12:00'); };
  PL.whenText = w => !w || w.type === 'ahora' ? 'Ahora' : w.type === 'hoy' ? `Hoy, ${PL.fhm(w.time)}` : `${PL.dayName(w.date)}, ${PL.fhm(w.time)}`;
  PL.whenTs = w => !w || !w.date ? Date.now() : new Date(`${w.date}T${w.time || '09:00'}`).getTime();
  PL.canNow = s => s.now !== 0;
  PL.unitText = u => PL.UNITS[u] || '';

  /* ——— estado guardado en este dispositivo ——— */
  const DEF = () => ({client: {name: '', phone: '', district: ''}, orders: [], worker: null, favs: []});
  function load(){
    try { const s = JSON.parse(localStorage.getItem(C.STORE)); if (s && typeof s === 'object') return Object.assign(DEF(), s); } catch (e) {}
    return DEF();
  }
  PL.S = load();
  PL.S.favs = PL.S.favs || [];
  PL.save = () => { try { localStorage.setItem(C.STORE, JSON.stringify(PL.S)); } catch (e) {} PL.updateDot(); };
  PL.reset = () => { try { localStorage.removeItem(C.STORE); } catch (e) {} PL.S = DEF(); PL.updateDot(); };

  PL.ACTIVE = ['buscando', 'programado', 'en_camino', 'llego', 'trabajando', 'pagar', 'calificar'];
  PL.order = id => PL.S.orders.find(o => o.id === id);
  PL.activeOrders = () => PL.S.orders.filter(o => PL.ACTIVE.includes(o.status));
  PL.total = o => o.price * (o.people || 1) * (o.u === 'hora' ? (o.hours || 1) : 1);
  /* trabajadores de confianza */
  PL.fav = name => PL.S.favs.find(f => f.name === name);
  PL.addFav = w => { if (!PL.fav(w.name)) PL.S.favs.push({name: w.name, color: w.color, rating: w.rating, jobs: w.jobs, phone: w.phone, since: Date.now(), chat: []}); PL.save(); };
  PL.delFav = name => { PL.S.favs = PL.S.favs.filter(f => f.name !== name); PL.save(); };
  PL.history = name => PL.S.orders.filter(o => o.worker && o.worker.name === name && o.status === 'terminado').sort((a, b) => b.createdAt - a.createdAt);
  PL.isUpcoming = o => o.status === 'programado' || (o.status === 'buscando' && o.mode === 'prog');
  PL.updateDot = () => { const d = PL.$('#tabDot'); if (d) d.hidden = !PL.activeOrders().length; };

  /* ——— temporizadores que se limpian al cambiar de pantalla ——— */
  let K = [];
  PL.onLeave = fn => K.push(fn);
  PL.later = (fn, ms) => { const id = setTimeout(fn, ms); K.push(() => clearTimeout(id)); return id; };
  PL.every = (fn, ms) => { const id = setInterval(fn, ms); K.push(() => clearInterval(id)); return id; };
  function leave(){ K.forEach(f => { try { f(); } catch (e) {} }); K = []; }

  /* ——— rutas ——— */
  PL.R = {};
  PL.route = (name, fn, opts = {}) => { PL.R[name] = Object.assign({fn}, opts); };
  PL.go = h => { if (location.hash === h) PL.render(); else location.hash = h; };
  let first = true;
  PL.render = () => {
    leave();
    if (sheet.open) sheet.close();
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const name = PL.R[parts[0]] ? parts[0] : '';
    const r = PL.R[name];
    const view = PL.$('#view');
    document.body.toggleAttribute('data-flow', !!r.flow);
    document.body.dataset.view = name || 'inicio';
    view.innerHTML = '';
    r.fn(view, parts.slice(1), new URLSearchParams(qs || ''));
    const tab = r.tab != null ? r.tab : name;
    PL.$$('[data-tab]').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    if (!first) { window.scrollTo(0, 0); view.focus({preventScroll: true}); }
    first = false;
    PL.updateDot();
  };

  /* ——— aviso flotante ——— */
  let tt;
  PL.toast = (msg, ms = 2800) => {
    const t = PL.$('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), ms);
  };

  /* ——— hoja deslizable ——— */
  const sheet = PL.$('#sheet');
  PL.sheet = ({title, body, foot = '', onOpen, onClose}) => {
    sheet.innerHTML = `<div class="grab"></div><div class="sh-h"><h2 id="sheetT">${title}</h2><button class="ibtn" type="button" data-close aria-label="Cerrar">${PL.ic('x')}</button></div><div class="sh-b">${body}</div>${foot ? `<div class="sh-f">${foot}</div>` : ''}`;
    sheet._onClose = onClose || null;
    if (!sheet.open) sheet.showModal();
    if (onOpen) onOpen(sheet);
    return sheet;
  };
  PL.closeSheet = () => { if (sheet.open) sheet.close(); };
  sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('[data-close]')) sheet.close(); });
  sheet.addEventListener('close', () => { const f = sheet._onClose; sheet._onClose = null; if (f) f(); });

  PL.confirm = ({title, text, ok = 'Sí', cancel = 'No', danger = false}) => new Promise(res => {
    let val = false;
    PL.sheet({
      title, body: `<p class="muted">${text}</p>`,
      foot: `<button class="btn btn-l" type="button" data-close>${cancel}</button><button class="btn ${danger ? 'btn-r' : 'btn-t'}" type="button" id="cfOk">${ok}</button>`,
      onOpen: s => { s.querySelector('#cfOk').onclick = () => { val = true; PL.closeSheet(); }; },
      onClose: () => res(val)
    });
  });

  /* ——— selector de distrito ——— */
  PL.pickDistrict = (current, cb) => {
    PL.sheet({
      title: '¿En qué distrito?',
      body: `<label class="search-box">${PL.ic('search')}<span class="sr">Buscar distrito</span><input id="dq" type="search" placeholder="Busca tu distrito" autocomplete="off"></label><div class="list" id="dlist"></div>`,
      onOpen: s => {
        const inp = s.querySelector('#dq'), list = s.querySelector('#dlist');
        const draw = () => {
          const raw = inp.value.trim(), q = PL.norm(raw);
          const arr = PL.DISTRICTS.filter(d => PL.norm(d).includes(q));
          list.innerHTML = arr.map(d => `<button type="button" data-d="${PL.esc(d)}">${PL.ic('pin')}<span>${PL.esc(d)}</span>${d === current ? PL.ic('check', 'i chev') : ''}</button>`).join('')
            || `<button type="button" data-d="${PL.esc(raw)}">${PL.ic('plus')}<span>Usar “${PL.esc(raw)}”</span></button>`;
        };
        inp.oninput = draw; draw();
        list.onclick = e => { const b = e.target.closest('[data-d]'); if (!b || !b.dataset.d) return; cb(b.dataset.d); PL.closeSheet(); };
        if (PL.isDesk()) inp.focus();
      }
    });
  };

  /* ——— WhatsApp y registro externo ——— */
  PL.wa = (text, phone = C.WA) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  PL.toSheet = o => {
    if (!C.SHEETS_URL) return;
    try { fetch(C.SHEETS_URL, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(Object.assign({fecha: new Date().toISOString()}, o))}).catch(() => {}); } catch (e) {}
  };

  /* ——— piezas compartidas ——— */
  /* avatares ilustrados para los trabajadores de ejemplo (img/av/); iniciales para personas reales */
  PL.avSlug = name => String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-');
  PL.avSrc = name => PL.DEMO.workers.includes(name) ? `img/av/${PL.avSlug(name)}.png` : '';
  PL.AV_BG = ['#FFE3D4', '#DCF2E8', '#ECE8FF', '#FFF1C9', '#FFD9C4', '#E3EEFC'];
  PL.avBg = name => PL.AV_BG[Math.max(0, PL.DEMO.workers.indexOf(name)) % PL.AV_BG.length];
  PL.avatar = (name, color, cls = '') => PL.avSrc(name)
    ? `<span class="av pic ${cls}" style="background:${PL.avBg(name)}" aria-hidden="true"><img src="${PL.avSrc(name)}" alt="" loading="lazy"></span>`
    : `<span class="av ${cls}" style="background:${color}" aria-hidden="true">${PL.esc(PL.initials(name))}</span>`;
  /* trabajadores de un servicio: siempre los mismos para ese oficio */
  PL.svcWorkers = (svcId, n = 6) => {
    let h = 0; for (const c of svcId) h = (h * 31 + c.charCodeAt(0)) % 9973;
    const pool = PL.DEMO.workers.slice(), out = [];
    while (out.length < n && pool.length) { h = (h * 7 + 13) % 9973; out.push(pool.splice(h % pool.length, 1)[0]); }
    return out.map(name => Object.assign(PL.fakeWorker(), {name}));
  };
  PL.starsH = r => `<span class="stars">${PL.ic('star')}${Number(r).toFixed(1).replace('.', ',')}</span>`;
  PL.fakeWorker = (used = []) => {
    const pool = PL.DEMO.workers.filter(n => !used.includes(n));
    const name = PL.pick(pool.length ? pool : PL.DEMO.workers);
    const km = +PL.rnd(.6, 4.6).toFixed(1);
    return {name, color: PL.pick(PL.DEMO.colors), rating: +PL.rnd(4.5, 5).toFixed(1), jobs: PL.ri(8, 240), years: PL.ri(1, 14), km, eta: Math.round(km * 4 + PL.ri(3, 7)), bg: Math.random() > .3, phone: `9${PL.ri(10, 99)} *** ${PL.ri(100, 999)}`};
  };
  PL.footer = () => `<footer class="foot"><div class="foot-in"><span>© 2026 Puente Laboral · Gente de confianza, cerca de ti. <span class="credit">Avatares 3D: Fluent Emoji de Microsoft (licencia MIT).</span></span><span><a href="#/trabajar">Quiero trabajar</a> · <a target="_blank" rel="noopener" href="${PL.wa('Hola, quiero más información sobre Puente Laboral.')}">WhatsApp</a></span></div><div class="foot-name" aria-hidden="true">Puente Laboral</div></footer>`;

  PL.demoInfo = () => PL.sheet({
    title: 'Estás viendo la demo',
    body: `<p style="margin-bottom:12px">Así va a funcionar Puente Laboral. <b>Los trabajadores, las ofertas y las calificaciones que ves son de ejemplo</b>, y aquí no se cobra nada.</p><p class="muted" style="margin-bottom:12px">Tus pedidos y tu perfil se guardan solo en este dispositivo.</p><p class="muted">¿Necesitas a alguien de verdad hoy? Escríbenos y lo coordinamos por WhatsApp.</p>`,
    foot: `<a class="btn btn-a" target="_blank" rel="noopener" href="${PL.wa('Hola, necesito un servicio: ')}">${PL.ic('wa')} Pedir por WhatsApp</a>`
  });

  /* ——— arranque ——— */
  PL.$$('.ti[data-i]').forEach(s => { s.innerHTML = PL.ic(s.dataset.i); });
  PL.$('#helpTop').href = PL.wa('Hola, necesito ayuda con Puente Laboral.');
  PL.$('#demoPill').onclick = PL.demoInfo;
  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, {passive: true}); onScroll();
  window.addEventListener('hashchange', PL.render);
  window.addEventListener('DOMContentLoaded', PL.render);
})();
