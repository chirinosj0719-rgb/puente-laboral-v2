/* Agéndalo · mapas reales de Lima
   Calles de OpenStreetMap (dibujo de CARTO) con Leaflet. La zona de servicio son los límites reales
   de cada distrito (js/zonas.js). Direcciones: búsqueda con Photon y dirección de un punto con Nominatim,
   los dos sobre OpenStreetMap. Recorridos por calles con OSRM. Si un servicio no responde, el mapa sigue
   funcionando con lo que ya sabe (distrito por los límites, línea recta en vez de calles). */
(function(){
  const PL = window.PL;
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

  /* ——— geografía ——— */
  const LIMA = [-12.1215, -77.0259];                       // Miraflores
  const MAXB = [[-12.48, -77.28], [-11.68, -76.58]];        // de Ancón a San Bartolo
  const BBOX = '-77.27,-12.47,-76.70,-11.70';
  PL.LIMA = LIMA;
  const ZS = () => PL.ZONAS || [];
  function inRing(lat, lng, r){
    let c = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const yi = r[i][0], xi = r[i][1], yj = r[j][0], xj = r[j][1];
      if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  PL.zoneAt = (lat, lng) => ZS().find(z => z.p.some(poly => inRing(lat, lng, poly[0]) && !poly.slice(1).some(h => inRing(lat, lng, h)))) || null;
  PL.zone = n => ZS().find(z => z.n === n) || null;
  PL.zoneCenter = n => { const z = PL.zone(n); return z ? z.c.slice() : LIMA.slice(); };
  PL.ll = p => !p ? null : Array.isArray(p) ? (p.length === 2 && isFinite(p[0]) ? p : null) : (p.lat != null && isFinite(p.lat) ? [p.lat, p.lng] : null);
  PL.km = (a, b) => {
    const t = x => x * Math.PI / 180, dLa = t(b[0] - a[0]), dLo = t(b[1] - a[1]);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dLo / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  };
  /* minutos aproximados en el tráfico de Lima (calles: 1,35 veces la línea recta, unos 18 km/h) */
  PL.etaMin = km => Math.max(4, Math.round(km * 1.35 / 18 * 60 + 2));
  const off = (c, km, deg) => { const r = deg * Math.PI / 180; return [c[0] + km / 110.57 * Math.cos(r), c[1] + km / (111.32 * Math.cos(c[0] * Math.PI / 180)) * Math.sin(r)]; };
  const r5 = p => [+p[0].toFixed(5), +p[1].toFixed(5)];
  /* un punto en tierra y dentro de la zona, cerca de c: en toda la costa de Lima el mar queda al suroeste */
  PL.nearPoint = (c, min = .6, max = 2.2) => {
    for (let i = 0; i < 50; i++) { const p = off(c, PL.rnd(min, max), PL.rnd(-50, 140)); if (PL.zoneAt(p[0], p[1])) return r5(p); }
    return r5(off(c, min, 45));
  };
  /* un punto al azar dentro de un distrito */
  PL.pointIn = n => {
    const z = PL.zone(n); if (!z) return PL.nearPoint(LIMA);
    for (let i = 0; i < 80; i++) { const p = off(z.c, PL.rnd(0, 1.8), PL.rnd(0, 360)), zz = PL.zoneAt(p[0], p[1]); if (zz && zz.n === n) return r5(p); }
    return z.c.slice();
  };

  /* ——— servicios de OpenStreetMap ——— */
  const fetchT = (u, ms = 7000) => {
    const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
    return fetch(u, {signal: c.signal}).then(r => { clearTimeout(t); if (!r.ok) throw new Error(String(r.status)); return r.json(); }, e => { clearTimeout(t); throw e; });
  };
  const abbr = s => String(s || '').replace(/^Avenida\s/i, 'Av. ').replace(/^Jirón\s/i, 'Jr. ').replace(/^Pasaje\s/i, 'Psje. ').replace(/^Prolongación\s/i, 'Prol. ').trim();
  const revCache = {}, routeCache = {};
  PL.geo = {
    /* búsqueda mientras se escribe (Photon permite autocompletar) */
    async search(q, near){
      const u = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&bbox=${BBOX}` + (near ? `&lat=${near[0]}&lon=${near[1]}` : '');
      const j = await fetchT(u);
      const seen = new Set(), num = /\d/.test(q);
      return (j.features || []).map(f => {
        const p = f.properties || {}, lng = f.geometry.coordinates[0], lat = f.geometry.coordinates[1];
        const z = PL.zoneAt(lat, lng), street = abbr([p.street, p.housenumber].filter(Boolean).join(' '));
        const named = p.name && p.name !== p.street;
        /* si escribiste un número, primero la dirección; si no, el nombre del lugar */
        const byAddr = num && p.housenumber && p.street;
        const title = byAddr ? street : named ? p.name : street || abbr(p.name);
        const sub = [byAddr ? (named ? p.name : '') : (named && street ? street : ''), z ? z.n : (p.district || p.city || '')].filter(Boolean).join(', ');
        return {lat, lng, title, sub: byAddr ? (z ? z.n : (p.district || p.city || '')) : sub, zone: z ? z.n : null, key: byAddr ? street + '|' + (z ? z.n : '') : title + '|' + sub};
      }).filter(x => { if (!x.title || seen.has(x.key)) return false; seen.add(x.key); return true; });
    },
    /* dirección del punto donde está el pin (Nominatim: una consulta cuando el mapa se detiene) */
    async reverse(lat, lng){
      const k = lat.toFixed(4) + ',' + lng.toFixed(4);
      if (revCache[k]) return revCache[k];
      const j = await fetchT(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`);
      const a = j.address || {}, road = a.road || a.pedestrian || a.footway || a.residential || a.square || '';
      const line = road ? abbr(road) + (a.house_number ? ' ' + a.house_number : '') : abbr(j.name || String(j.display_name || '').split(',')[0]);
      return (revCache[k] = {line, near: a.neighbourhood || a.quarter || a.suburb || ''});
    }
  };
  /* recorrido por calles entre dos puntos (OSRM). Devuelve null si no responde. */
  PL.roadPath = async (a, b) => {
    const k = r5(a).join() + ';' + r5(b).join();
    if (routeCache[k]) return routeCache[k];
    try {
      const j = await fetchT(`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=simplified&geometries=geojson`, 6000);
      const r = j.routes && j.routes[0]; if (!r) return null;
      return (routeCache[k] = {path: r.geometry.coordinates.map(c => [+c[1].toFixed(5), +c[0].toFixed(5)]), min: Math.max(3, Math.round(r.duration * 1.6 / 60) + 2), km: +(r.distance / 1000).toFixed(1)});
    } catch (e) { return null; }
  };

  /* ——— marcadores ——— */
  /* base: mapa vectorial de OpenFreeMap (sin clave); si el equipo no tiene WebGL, las teselas de OpenStreetMap */
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const OSM = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  const ATTR_VEC = `<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · ${OSM}`;
  let gl = null;
  const hasGL = () => { if (gl == null) { try { const c = document.createElement('canvas'); gl = !!(window.maplibregl && L.maplibreGL && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { gl = false; } } return gl; };
  /* los nombres van como en Lima ("Av. José Pardo", no "José Pardo Avenue") */
  const local = mm => mm.on('load', () => {
    (mm.getStyle().layers || []).forEach(l => {
      const tf = l.type === 'symbol' && l.layout && l.layout['text-field'];
      if (tf && JSON.stringify(tf).includes('name')) mm.setLayoutProperty(l.id, 'text-field', ['coalesce', ['get', 'name'], ['get', 'name:latin'], ['get', 'name_en']]);
    });
  });
  const baseLayer = () => {
    if (!hasGL()) return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: OSM, keepBuffer: 4});
    const g = L.maplibreGL({style: STYLE, attribution: ATTR_VEC});
    g.once('add', () => { try { local(g.getMaplibreMap()); } catch (e) {} });
    return g;
  };
  const PIN = '<svg viewBox="0 0 44 54" aria-hidden="true"><path d="M22 52S4 34.6 4 20.5a18 18 0 0 1 36 0C40 34.6 22 52 22 52z" fill="#FF5A1F" stroke="#fff" stroke-width="3"/><circle cx="22" cy="20.5" r="6.5" fill="#fff"/></svg>';
  PL.PIN_SVG = PIN;
  const pinHtml = w => !w.name ? `<span class="mk-dot" style="background:${w.color || '#FF5A1F'}"></span>`
    : !w.isBiz && PL.isPerson && PL.isPerson(w.name) ? `<span class="mk-av face">${PL.face(w.name)}</span>`
    : `<span class="mk-av ini" style="background:${w.color || '#FFE3D4'}">${PL.esc(PL.initials(w.name))}</span>`;
  const icon = (html, size, cls = '') => L.divIcon({className: 'mk ' + cls, html, iconSize: [size, size], iconAnchor: [size / 2, size / 2]});

  /* zona de servicio: lo de afuera se apaga y los distritos se marcan con una línea fina */
  function drawZones(map, o){
    const hi = new Set(o.highlight || []), layers = {};
    if (o.mask !== false) {
      const holes = []; ZS().forEach(z => z.p.forEach(poly => holes.push(poly[0])));
      L.polygon([[[-14, -79], [-14, -75], [-10, -75], [-10, -79]]].concat(holes), {stroke: false, fillColor: '#2A1E16', fillOpacity: .16, interactive: false}).addTo(map);
    }
    ZS().forEach(z => {
      const on = hi.has(z.n);
      layers[z.n] = L.polygon(z.p, {color: '#FF5A1F', weight: on ? 2 : 1, opacity: on ? .9 : .45, fillColor: '#FF5A1F', fillOpacity: on ? .08 : 0, interactive: !!o.onClick}).addTo(map);
      if (o.onClick) layers[z.n].on('click', () => o.onClick(z.n));
    });
    return {
      highlight(names){ const s = new Set(names); Object.keys(layers).forEach(n => layers[n].setStyle({weight: s.has(n) ? 2 : 1, opacity: s.has(n) ? .9 : .45, fillOpacity: s.has(n) ? .1 : 0})); }
    };
  }

  const stub = {map: null, me: LIMA.slice(), setMe(){}, radar(){}, addPin(){ return {lat: LIMA[0], lng: LIMA[1]}; }, removePin(){}, only(){}, clear(){}, setPath(){}, route(){ return Promise.resolve(null); }, move(){}, fit(){}, picker(){}, tip(){}, zones: null};

  /* PL.map(host, {center | seed (distrito), zoom, label, drag, wheel, controls, me, zones}) */
  PL.map = (host, opts = {}) => {
    const el = document.createElement('div');
    el.className = 'lmap'; el.style.cssText = 'position:absolute;inset:0'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', opts.label || 'Mapa');
    host.prepend(el);
    let me = PL.ll(opts.center) || (opts.seed && PL.zone(opts.seed) ? PL.zoneCenter(opts.seed) : LIMA.slice());
    if (!window.L) { el.classList.add('off'); el.innerHTML = '<p>No se pudo cargar el mapa.</p>'; return Object.assign({}, stub, {me}); }
    const drag = opts.drag !== false;
    const map = L.map(el, {zoomControl: false, maxBounds: MAXB, maxBoundsViscosity: 1, minZoom: opts.minZoom || 10.5, maxZoom: 18, zoomSnap: .25,
      scrollWheelZoom: !!opts.wheel, dragging: drag, touchZoom: drag, doubleClickZoom: drag, boxZoom: false, keyboard: drag, tap: false}).setView(me, opts.zoom || 15);
    baseLayer().addTo(map);
    map.attributionControl.setPrefix(false);
    if (opts.controls) L.control.zoom({position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar'}).addTo(map);
    const zones = opts.zones ? drawZones(map, opts.zones) : null;
    const ro = new ResizeObserver(() => map.invalidateSize({pan: false})); ro.observe(host);
    PL.onLeave(() => { ro.disconnect(); map.remove(); });

    const meM = L.marker(me, {icon: icon('<span class="mk-me"><i></i></span>', 26), interactive: false, keyboard: false, zIndexOffset: 600});
    if (opts.me !== false) meM.addTo(map);
    const radarM = L.marker(me, {icon: L.divIcon({className: 'mk', html: '<span class="mk-radar"><i></i><i></i><i></i></span>', iconSize: [0, 0]}), interactive: false, keyboard: false});
    const line = L.polyline([], {color: '#1B130E', weight: 5, opacity: .85, lineCap: 'round', lineJoin: 'round', interactive: false}).addTo(map);
    const pins = {};
    let pk = null;

    function measure(p){
      const path = p.path || [p.start, me];
      p.seg = []; p.tot = 0; p.end = me.slice();
      for (let i = 0; i < path.length - 1; i++) { const d = PL.km(path[i], path[i + 1]); p.seg.push(d); p.tot += d; }
      return path;
    }
    const api = {
      map, el, zones,
      get me(){ return me.slice(); },
      setMe(p, o = {}){
        const q = PL.ll(p); if (!q) return;
        me = q.slice(); meM.setLatLng(me); radarM.setLatLng(me);
        Object.values(pins).forEach(x => { x.seg = null; });
        if (o.fly && !reduce()) map.flyTo(me, o.zoom || map.getZoom(), {duration: .9});
        else if (o.pan !== false) map.setView(me, o.zoom || map.getZoom(), {animate: false});
      },
      radar(on){ if (on) radarM.addTo(map); else radarM.remove(); },
      /* pos: [lat, lng] o {lat, lng}; sin pos aparece cerca, dentro de la zona */
      addPin(id, w, pos){
        if (pins[id]) api.removePin(id, true);
        const p0 = PL.ll(pos) || PL.nearPoint(me);
        const m = L.marker(p0, {icon: icon(pinHtml(w), w.name ? 40 : 18, 'mk-in'), keyboard: false, interactive: !!opts.onPin, zIndexOffset: 300}).addTo(map);
        if (opts.onPin) m.on('click', () => opts.onPin(id));
        pins[id] = {m, start: p0.slice(), path: null, seg: null};
        return {lat: p0[0], lng: p0[1]};
      },
      removePin(id, now){
        const p = pins[id]; if (!p) return; delete pins[id];
        const e = p.m.getElement();
        if (e && !now) { e.classList.add('mk-out'); setTimeout(() => p.m.remove(), 320); } else p.m.remove();
      },
      only(id){ Object.keys(pins).forEach(k => { if (k !== id) api.removePin(k); }); },
      clear(){ Object.keys(pins).forEach(k => api.removePin(k)); line.setLatLngs([]); },
      setPath(id, path){ const p = pins[id]; if (!p) return; p.path = path && path.length > 1 ? path : null; p.seg = null; },
      /* busca el recorrido por calles del pin hasta ti y lo usa para moverlo */
      async route(id){
        const p = pins[id]; if (!p) return null;
        const r = await PL.roadPath(p.start, me);
        if (!r || pins[id] !== p) return null;
        p.path = [p.start].concat(r.path, [me]); p.seg = null;
        return Object.assign({}, r, {full: p.path});
      },
      /* avanza el pin hasta ti: prog va de 0 a 1 */
      move(id, prog){
        const p = pins[id]; if (!p) return;
        const f = Math.max(0, Math.min(1, prog));
        const path = !p.seg || p.end[0] !== me[0] || p.end[1] !== me[1] ? measure(p) : (p.path || [p.start, me]);
        let d = p.tot * f, k = 0, pt = path[path.length - 1];
        for (; k < p.seg.length; k++) {
          if (d <= p.seg[k] || k === p.seg.length - 1) { const t = p.seg[k] ? Math.min(1, d / p.seg[k]) : 1, a = path[k], b = path[k + 1]; pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; break; }
          d -= p.seg[k];
        }
        p.m.setLatLng(pt);
        line.setLatLngs(f >= 1 ? [] : [pt].concat(path.slice(k + 1)));
      },
      /* encuadra tu punto y los pines */
      fit(ids, o = {}){
        const pts = [me].concat((ids || Object.keys(pins)).filter(k => pins[k]).map(k => { const q = pins[k].m.getLatLng(); return [q.lat, q.lng]; }));
        if (pts.length < 2) { map.setView(me, o.zoom || map.getZoom(), {animate: false}); return; }
        map.fitBounds(L.latLngBounds(pts), {padding: o.pad || [60, 60], maxZoom: o.max || 16, animate: false});
      },
      /* modo elegir punto: el mapa se mueve debajo de un pin fijo, como en las apps de reparto */
      picker(on, cb = {}){
        host.classList.toggle('picking', !!on);
        if (pk) { map.off('movestart', pk.a); map.off('moveend', pk.b); pk = null; }
        PL.$$('.pick-pin, .map-loc', host).forEach(x => x.remove());
        if (!on) { if (opts.me !== false) meM.setLatLng(me).addTo(map); map.scrollWheelZoom.disable(); return; }
        meM.remove(); map.scrollWheelZoom.enable();
        host.insertAdjacentHTML('beforeend', `<div class="pick-pin" aria-hidden="true"><i></i><b class="pick-tip" hidden></b><span>${PIN}</span></div>
          <button class="map-loc" type="button" aria-label="Usar mi ubicación">${PL.ic('locate')}</button>`);
        PL.$('.map-loc', host).onclick = () => api.locate(cb.onLocErr);
        pk = {a: () => { host.classList.add('lift'); if (cb.onMove) cb.onMove(); }, b: () => { host.classList.remove('lift'); const c = map.getCenter(); me = [+c.lat.toFixed(6), +c.lng.toFixed(6)]; if (cb.onIdle) cb.onIdle(me.slice()); }};
        map.on('movestart', pk.a); map.on('moveend', pk.b);
      },
      tip(text, bad){ const t = PL.$('.pick-tip', host); if (!t) return; t.hidden = !text; t.textContent = text || ''; t.classList.toggle('bad', !!bad); },
      locate(onErr){
        if (!navigator.geolocation) { (onErr || PL.toast)('Tu navegador no permite usar tu ubicación'); return; }
        navigator.geolocation.getCurrentPosition(g => {
          const q = [g.coords.latitude, g.coords.longitude];
          if (!L.latLngBounds(MAXB).contains(q)) { (onErr || PL.toast)('Tu ubicación está fuera de Lima. Busca la dirección o mueve el mapa.'); return; }
          map.setView(q, 17, {animate: !reduce()});
        }, () => (onErr || PL.toast)('No pudimos ver tu ubicación. Revisa el permiso del navegador.'), {enableHighAccuracy: true, timeout: 9000, maximumAge: 60000});
      }
    };
    return api;
  };

  /* ——— escena de la portada: busca, llegan trabajadores, uno acepta y viene por las calles ——— */
  PL.heroScene = host => {
    const SC = [
      {s: 'gasfitero', d: 'Santiago de Surco', task: 'Fuga de agua'},
      {s: 'ninera', d: 'Jesús María', task: 'Recoger del colegio'},
      {s: 'mesero', d: 'Miraflores', task: 'Matrimonio · 4 personas'},
      {s: 'limpieza', d: 'Punta Hermosa', task: 'Casa de playa'},
      {s: 'mudanza', d: 'La Molina', task: 'Mudanza completa'}
    ].filter(x => PL.svc(x.s));
    const m = PL.map(host, {center: PL.zoneCenter(SC[0].d), zoom: 15, drag: false, label: 'Ejemplo de cómo se ve un pedido en el mapa'});
    host.insertAdjacentHTML('beforeend', `<div class="scene-card out" id="scCard"></div>`);
    const card = host.querySelector('#scCard');
    let n = 0;
    function show(html){ card.classList.add('out'); PL.later(() => { card.innerHTML = html; card.classList.remove('out'); }, 260); }
    function cycle(){
      const sc = SC[n % SC.length], svc = PL.svc(sc.s), prog = !PL.canNow(svc) || ['mesero', 'mudanza'].includes(sc.s);
      const to = PL.zoneCenter(sc.d);
      m.clear(); m.setMe(to, {fly: n > 0 && PL.km(m.me, to) < 9, zoom: 15}); n++;
      PL.later(() => m.radar(true), 600);
      show(`<span class="svc-ic" style="margin:0;width:46px;height:46px">${PL.si(svc.i)}</span><div><div class="t">Buscando ${PL.esc(svc.n.toLowerCase())}</div><div class="s">${PL.esc(sc.task)} · ${PL.esc(sc.d)}</div></div><span class="pill ${prog ? 'm' : 'a'}">${prog ? 'Programado' : 'Inmediato'}</span>`);
      PL.later(() => m.addPin('a', {name: '', color: '#FFB08A'}), 1300);
      PL.later(() => m.addPin('w', {name: '', color: '#FF5A1F'}), 1900);
      PL.later(() => m.addPin('b', {name: '', color: '#FFB08A'}), 2500);
      PL.later(async () => {
        m.radar(false); m.only('w');
        show(`<span class="svc-ic" style="margin:0;width:46px;height:46px">${PL.si(svc.i)}</span><div><div class="t">Tu pedido fue aceptado</div><div class="s">${prog ? 'Confirmado para ese día' : 'Va en camino'}</div></div><span class="pill v">${PL.ic('check')}Aceptado</span>`);
        await m.route('w');
        PL.tween(3800, p => m.move('w', p));
      }, 3600);
      PL.later(cycle, 9200);
    }
    cycle();
  };
})();
