/* Agéndalo · pedir un servicio, paso a paso
   Inmediato  (mode 'ya'):   servicio → dirección → confirmar. Alguien va ahora.
   Programado (mode 'prog'): servicio → día → dirección → confirmar. Con anticipación, una vez o repetido.
   La dirección se elige en el mapa real (pin fijo, búsqueda o tu ubicación) y tiene que caer dentro de la zona de servicio.
   Con ?w=Nombre el pedido va directo a un trabajador de confianza; con ?b=id, a una empresa. */
(function(){
  const PL = window.PL;
  const SLOTS = [['Mañana', ['07:00', '08:00', '09:00', '10:00', '11:00']], ['Tarde', ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], ['Noche', ['18:00', '19:00', '20:00', '21:00']]];
  const NOREP = ['eventos', 'mudanza'];
  const MAXPH = 3;
  const okPhone = p => /^9\d{8}$/.test(p);

  /* dónde empieza el mapa: tu última dirección, la primera guardada o el centro de tu distrito */
  PL.startLoc = () => {
    const S = PL.S, z = d => d && PL.zone(d);
    if (S.lastLoc && S.lastLoc.lat) return Object.assign({}, S.lastLoc);
    const ad = (S.addresses || []).find(a => a.lat) || (S.addresses || []).find(a => z(a.district));
    if (ad) return ad.lat ? {lat: ad.lat, lng: ad.lng, line: ad.line || ad.ref || '', district: ad.district, floor: ad.floor || '', ref: ad.lat ? (ad.refTxt || '') : '', label: ad.label} : Object.assign(locOf(ad.district), {line: ad.ref || '', approx: true});
    if (z(S.client.district)) return Object.assign(locOf(S.client.district), {approx: true});
    return null;
  };
  const locOf = d => { const c = PL.zoneCenter(d); return {lat: c[0], lng: c[1], district: d, line: '', floor: '', ref: ''}; };
  PL.addrText = l => [l.line, l.floor].filter(Boolean).join(', ') + (l.ref ? ' · ' + l.ref : '');
  const shrink = (file, cb) => {
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .78)); }; img.onerror = () => cb(r.result); img.src = r.result; };
    r.readAsDataURL(file);
  };

  /* ——— elegir una dirección en el mapa real ———
     Búsqueda (Photon), tu ubicación, direcciones guardadas y un pin fijo en el centro del mapa.
     La dirección vale solo si cae dentro de la zona de servicio. Lo usan el pedido y "Mis direcciones".
     o: {fm, host, loc, tip, save: bool, saveAs, saved: bool, onValid(ok), onZone(z)} → {read(), saveAs(), stop()} */
  PL.placePanel = o => {
    const {fm, host} = o, S = PL.S, L0 = Object.assign({floor: '', ref: '', line: ''}, o.loc);
    const saved = o.saved === false ? [] : (S.addresses || []).filter(a => a.lat);
    const st = {lineEdited: !!L0.line, editAt: [L0.lat, L0.lng], saveAs: o.saveAs || '', skipRev: false, seq: 0, revT: null};
    host.innerHTML = `<div class="aq"><label class="search-box aq-box">${PL.ic('search')}<span class="sr">Buscar dirección</span><input id="aq" type="search" placeholder="Busca una calle, edificio o lugar" autocomplete="off" enterkeyhint="search"></label>
        <div class="aq-res" id="aqr" hidden role="listbox" aria-label="Resultados"></div></div>
      <button class="row-btn" type="button" id="aloc">${PL.ic('locate')}<span><b>Usar mi ubicación actual</b><span>Para que el pin quede en tu puerta</span></span>${PL.ic('chev', 'i chev')}</button>
      ${saved.length ? `<div class="saved" id="saddr">${saved.map((a, k) => `<button class="row-btn" type="button" data-ad="${k}">${PL.ic(a.label === 'Casa' ? 'home' : a.label === 'Trabajo' ? 'bag' : 'pin')}<span><b>${PL.esc(a.label)}</b><span>${PL.esc(a.line || '')}${a.district ? ' · ' + PL.esc(a.district) : ''}</span></span>${PL.ic('chev', 'i chev')}</button>`).join('')}</div>` : ''}
      <div class="addr-card" id="acard"><span class="pin-ic">${PL.ic('pin')}</span><div><b id="aline">Mueve el mapa para ubicar el pin</b><span id="adist"></span></div></div>
      <p class="zone-warn" id="awarn" hidden></p>
      <label class="field"><span>Calle y número</span><input class="in" id="a-line" maxlength="90" autocomplete="street-address" placeholder="Ej.: Av. José Larco 1150" value="${PL.esc(L0.line)}"></label>
      <div class="row2"><label class="field"><span>Dpto., piso o interior <em>(opcional)</em></span><input class="in" id="a-floor" maxlength="40" placeholder="Ej.: Dpto. 502" value="${PL.esc(L0.floor)}"></label>
        <label class="field"><span>Referencia <em>(opcional)</em></span><input class="in" id="a-ref" maxlength="80" placeholder="Ej.: frente al parque" value="${PL.esc(L0.ref)}"></label></div>
      ${o.save ? `<p class="blk-t" style="margin-top:4px">${o.saveTitle || 'Guardar esta dirección <small>Para tus próximos pedidos</small>'}</p><div class="chips" id="asave">${['Casa', 'Trabajo', 'Otra'].map(l => `<button class="chip" type="button" data-sv="${l}" aria-pressed="${st.saveAs === l}">${l}</button>`).join('')}</div>` : ''}
      <p class="addr-note">${PL.ic('lock')}Tu dirección exacta solo la ve quien aceptes.</p>`;
    const $ = s => PL.$(s, host), lineIn = $('#a-line');
    const cur = {lat: L0.lat, lng: L0.lng, district: ''};
    const valid = () => !!(cur.district && lineIn.value.trim().length >= 3 && (!o.save || !o.needLabel || st.saveAs));
    const sync = () => { if (o.onValid) o.onValid(valid()); };
    function setZone(z){
      const w = $('#awarn');
      $('#adist').textContent = z ? z.n + ', Lima' : '';
      w.hidden = !!z;
      w.innerHTML = z ? '' : `${PL.ic('alert')}<span><b>Todavía no llegamos a esta zona.</b> Atendemos Lima central y las playas de Ancón, La Punta, Punta Hermosa, Punta Negra, Santa María del Mar y San Bartolo.</span>`;
      fm.tip(z ? (o.tip || 'Aquí es') : 'Fuera de la zona de servicio', !z);
      if (o.onZone) o.onZone(z);
    }
    function resolve(ll){
      const z = PL.zoneAt(ll[0], ll[1]);
      cur.lat = ll[0]; cur.lng = ll[1]; cur.district = z ? z.n : '';
      setZone(z); sync();
      if (!z) { $('#aline').textContent = 'Punto fuera de la zona'; return; }
      if (st.skipRev) { st.skipRev = false; $('#aline').textContent = lineIn.value || 'Punto en el mapa'; return; }
      const moved = PL.km(st.editAt, ll) > .15;
      $('#aline').textContent = 'Buscando la dirección…';
      clearTimeout(st.revT); const my = ++st.seq;
      st.revT = setTimeout(async () => {
        try {
          const r = await PL.geo.reverse(ll[0], ll[1]);
          if (my !== st.seq || !$('#aline')) return;
          if (r.line && (!st.lineEdited || moved)) { lineIn.value = r.line; st.lineEdited = false; st.editAt = ll.slice(); }
          $('#aline').textContent = lineIn.value || r.line || 'Punto en el mapa';
        } catch (e) { if (my === st.seq && $('#aline')) $('#aline').textContent = lineIn.value || 'Punto en el mapa'; }
        if ($('#aline')) sync();
      }, 450);
    }
    const goTo = (ll, z) => { fm.map.setView(ll, z || 17, {animate: true}); if (PL.km(fm.me, ll) < .002) resolve(ll); };
    fm.picker(true, {onMove: () => fm.tip(''), onIdle: resolve, onLocErr: m => PL.toast(m, 3600)});
    if (fm.map) fm.map.setView([L0.lat, L0.lng], L0.approx ? 15 : 17, {animate: false});
    resolve([L0.lat, L0.lng]);
    /* búsqueda mientras escribes */
    const aq = $('#aq'), res = $('#aqr'); let qT = null, qSeq = 0;
    aq.oninput = () => {
      const q = aq.value.trim(); clearTimeout(qT);
      if (q.length < 3) { res.hidden = true; return; }
      qT = setTimeout(async () => {
        const my = ++qSeq;
        res.hidden = false; res.innerHTML = `<p class="aq-msg">Buscando…</p>`;
        try {
          const list = await PL.geo.search(q, fm.me);
          if (my !== qSeq) return;
          res.innerHTML = list.length ? list.map((r, k) => `<button type="button" role="option" data-r="${k}">${PL.ic('pin')}<span><b>${PL.esc(r.title)}</b><span>${PL.esc(r.sub)}</span></span>${r.zone ? '' : '<em>Fuera de la zona</em>'}</button>`).join('') : `<p class="aq-msg">No encontramos “${PL.esc(q)}”. Prueba con la calle y el distrito, o mueve el mapa.</p>`;
          res.onclick = e => {
            const b = e.target.closest('[data-r]'); if (!b) return;
            const r = list[Number(b.dataset.r)];
            res.hidden = true; aq.value = '';
            lineIn.value = r.title; st.lineEdited = true; st.editAt = [r.lat, r.lng]; st.skipRev = true;
            goTo([r.lat, r.lng]);
          };
        } catch (e) { if (my === qSeq) res.innerHTML = `<p class="aq-msg">No pudimos buscar ahora. Mueve el mapa para ubicar el pin.</p>`; }
      }, 350);
    };
    aq.onkeydown = e => { if (e.key === 'Escape') res.hidden = true; };
    $('#aloc').onclick = () => fm.locate(m => PL.toast(m, 3600));
    const sa = $('#saddr');
    if (sa) sa.onclick = e => {
      const b = e.target.closest('[data-ad]'); if (!b) return;
      const a = saved[Number(b.dataset.ad)];
      lineIn.value = a.line || ''; $('#a-floor').value = a.floor || ''; $('#a-ref').value = a.refTxt || '';
      st.lineEdited = true; st.editAt = [a.lat, a.lng]; st.skipRev = true; st.saveAs = '';
      PL.$$('[data-sv]', host).forEach(x => x.setAttribute('aria-pressed', 'false'));
      goTo([a.lat, a.lng]);
    };
    lineIn.oninput = () => { st.lineEdited = true; st.editAt = fm.me; $('#aline').textContent = lineIn.value || 'Punto en el mapa'; sync(); };
    const sv = $('#asave');
    if (sv) sv.onclick = e => { const b = e.target.closest('[data-sv]'); if (!b) return; st.saveAs = st.saveAs === b.dataset.sv && !o.needLabel ? '' : b.dataset.sv; PL.$$('[data-sv]', host).forEach(x => x.setAttribute('aria-pressed', x.dataset.sv === st.saveAs)); sync(); };
    sync();
    return {
      read: () => ({lat: cur.lat, lng: cur.lng, district: cur.district, line: lineIn.value.trim(), floor: $('#a-floor').value.trim(), ref: $('#a-ref').value.trim(), approx: false}),
      saveAs: () => st.saveAs,
      valid,
      stop: () => { clearTimeout(st.revT); fm.picker(false); }
    };
  };

  PL.route('pedir', (view, args, qs) => {
    const svc = PL.svc(args[0]) || PL.svc('otro');
    const S = PL.S, re = qs.get('re') ? PL.order(qs.get('re')) : null;
    let fav = qs.get('w') ? PL.fav(qs.get('w')) : null;
    const pros = PL.svcWorkers(svc.id), bizHere = PL.bizFor(svc.id);
    const bizQ = qs.get('b') ? PL.biz(qs.get('b')) : null;
    let mode = qs.get('m') || PL.mode || 'ya';
    if (mode === 'ya' && !PL.canNow(svc)) mode = 'prog';
    PL.mode = mode;
    const favsHere = S.favs.filter(f => PL.history(f.name).some(o => o.svc === svc.id));
    const lastPrice = name => { const h = PL.history(name).find(o => o.svc === svc.id); return h ? h.price : null; };
    const start = (re && re.lat ? {lat: re.lat, lng: re.lng, line: re.line || '', district: re.district, floor: re.floor || '', ref: re.ref || ''} : null)
      || (re && PL.zone(re.district) ? Object.assign(locOf(re.district), {line: re.address || '', approx: true}) : null)
      || PL.startLoc() || Object.assign(locOf('Miraflores'), {approx: true});
    const D = {
      tasks: re ? re.tasks.slice() : [], note: re ? re.note : (qs.get('d') || ''), photos: [],
      people: re ? re.people : 1, hours: re ? re.hours : (svc.u === 'hora' ? 3 : 1),
      loc: start, saveAs: '', lineEdited: !!start.line, editAt: [start.lat, start.lng],
      when: mode === 'ya' ? {type: 'ahora'} : {type: 'fecha', date: '', time: ''},
      repeat: re && re.repeat ? re.repeat : 'no',
      price: Number(qs.get('p')) || (fav && lastPrice(fav.name)) || (re ? re.price : ''), pay: re ? re.pay : (S.client.pay || 'efectivo'),
      direct: fav ? fav.name : bizQ ? bizQ.n : null, directW: bizQ ? PL.bizW(bizQ) : null, fallback: true, chats: {}, cst: {}, ppos: {}
    };
    const dn = () => D.directW && D.directW.isBiz ? D.direct : PL.short(D.direct);
    const STEPS = mode === 'ya' ? [que, donde, confirmar] : [que, cuando, donde, confirmar];
    const NAMES = mode === 'ya' ? ['Servicio', 'Dirección', 'Confirmar'] : ['Servicio', 'Día', 'Dirección', 'Confirmar'];
    const TITLES = mode === 'ya' ? ['¿Qué <span class="k">necesitas?</span>', '¿Dónde <span class="k">es?</span>', 'Revisa y <span class="k">confirma</span>'] : ['¿Qué <span class="k">necesitas?</span>', '¿Qué <span class="k">día?</span>', '¿Dónde <span class="k">es?</span>', 'Revisa y <span class="k">confirma</span>'];
    const SIZE = {que: 'm', cuando: 's', donde: 'l', confirmar: 'm'};
    let step = 0;

    view.innerHTML = `<div class="flow" id="flow"><div class="flow-map" id="fmap"><span class="map-chip" id="mchip">${PL.ic('pin')}<span></span></span></div>
      <section class="flow-panel"><div class="fp-h"><button class="ibtn" id="back" type="button" aria-label="Atrás">${PL.ic('back')}</button><h1 id="fh"></h1></div>
      <ol class="fp-steps" id="fsteps" aria-label="Pasos">${NAMES.map(n => `<li>${n}</li>`).join('')}</ol>
      <div class="mode-bar ${mode}" id="mbar"></div>
      <div class="fp-b" id="fb"></div><div class="fp-f" id="ff"></div></section></div>`;
    const flow = PL.$('#flow', view), fb = PL.$('#fb', view), ff = PL.$('#ff', view);
    const fm = PL.map(PL.$('#fmap', view), {center: [D.loc.lat, D.loc.lng], zoom: 15, label: 'Mapa de tu pedido', onPin: id => { const w = pros[Number(id.slice(1))]; if (w) openPro(w); }});
    const chip = t => { PL.$('#mchip span', view).textContent = t; };

    const tot = () => D.price * D.people * (svc.u === 'hora' ? D.hours : 1);
    const nextBtn = (t = 'Continuar') => `<button class="btn btn-t" id="next" type="button">${t}<span class="arr">${PL.ic('arrow')}</span></button>`;
    const head = () => `<div class="svc-head"><span class="svc-ic">${PL.si(svc.i)}</span><div><b>${PL.esc(svc.n)}</b><span>${svc.other ? 'Cuéntanos qué necesitas' : PL.esc(PL.cat(svc.c).name)}</span></div><a class="btn btn-l btn-xs" href="#/">Cambiar</a></div>`;
    const directBox = () => {
      if (!D.direct) return '';
      const f = PL.fav(D.direct) || D.directW; if (!f) return '';
      const n = PL.history(f.name).length;
      return `<div class="direct">${f.isBiz ? PL.bizLogo(f) : PL.avatar(f.name, f.color)}<div><b>Pedido directo a ${PL.esc(f.isBiz ? f.name : PL.short(f.name))}</b><span>${n ? `Te ayudó ${n} ${n === 1 ? 'vez' : 'veces'}` : f.isBiz ? 'Empresa · asigna a alguien de su equipo' : PL.fav(f.name) ? 'De confianza' : 'Verificado'} · <button class="prof-link" type="button" data-undirect>Pedir a cualquiera</button></span></div><span class="heart" aria-hidden="true">${PL.ic(PL.fav(f.name) ? 'heart' : 'check')}</span></div>`;
    };
    const qty = (key, label, sub) => `<div class="qty"><div><b>${label}</b><span>${sub}</span></div><div class="stepper"><button type="button" data-q="${key}" data-d="-1" aria-label="Menos">${PL.ic('minus')}</button><output id="q-${key}">${D[key]}</output><button type="button" data-q="${key}" data-d="1" aria-label="Más">${PL.ic('plus')}</button></div></div>`;
    const kmTxt = km => km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toFixed(1).replace('.', ',')} km`;
    const weekday = iso => new Date(iso + 'T12:00').toLocaleDateString('es-PE', {weekday: 'long'}).replace(/o$/, 'os');
    const repTxt = () => D.repeat === 'no' ? '' : D.repeat === 'semana' && D.when.date ? `Todos los ${weekday(D.when.date)}` : PL.REPEAT[D.repeat];

    function drawBar(){
      const other = mode === 'ya' ? 'prog' : 'ya', canSwitch = step === 0 && (other === 'prog' || PL.canNow(svc));
      PL.$('#mbar', view).innerHTML = mode === 'ya'
        ? `${PL.ic('bolt')}<span><b>Inmediato</b> · atención en minutos</span>${canSwitch ? `<button type="button" data-sw="prog">Programar</button>` : ''}`
        : `${PL.ic('cal')}<span><b>Programado</b> · eliges día y hora</span>${canSwitch ? `<button type="button" data-sw="ya">Inmediato</button>` : ''}`;
      PL.$('#mbar', view).hidden = step > 0;
      const sw = PL.$('[data-sw]', view);
      if (sw) sw.onclick = () => { const p = new URLSearchParams(qs); p.set('m', sw.dataset.sw); PL.mode = sw.dataset.sw; PL.go(`#/pedir/${svc.id}?${p}`); };
    }

    /* perfiles y chat de presupuesto (desde la lista o desde el pin del mapa) */
    function openPro(w){
      PL.profile(w, {svc, district: D.loc.district || '', when: mode === 'ya' ? 'Puede ir hoy' : 'Agenda con anticipación', acceptLabel: `Pedirle a ${w.name.split(' ')[0]}`, onAccept: () => { D.direct = w.name; D.directW = w; que(); PL.toast(`Tu pedido le llegará primero a ${PL.short(w.name)}`); },
        onChat: () => PL.quoteChat({w, svc, whenTxt: mode === 'ya' ? 'Inmediato' : 'El día que elijas', tasks: D.tasks, price: D.price || 0, msgs: (D.chats[w.name] = D.chats[w.name] || []), state: (D.cst[w.name] = D.cst[w.name] || {stage: 0}),
          onAccept: (amt, sum) => { D.direct = w.name; D.directW = w; D.price = amt; if (sum && !D.note.includes(sum)) D.note = (D.note ? D.note + '\n' : '') + sum; go(step + 1); PL.toast(`Presupuesto aceptado. Completa los datos para enviárselo a ${PL.short(w.name)}`, 3600); }})});
    }
    function prosOnMap(){
      fm.clear(); fm.setMe([D.loc.lat, D.loc.lng], {zoom: 15});
      if (D.direct) return;
      pros.forEach((w, i) => { const p = fm.addPin('p' + i, w, D.ppos[w.name]); D.ppos[w.name] = [p.lat, p.lng]; });
      fm.fit(null, {max: 15.5});
    }

    /* ——— paso: qué ——— */
    function que(){
      prosOnMap();
      const near = pros.map(w => ({w, km: PL.km([D.loc.lat, D.loc.lng], D.ppos[w.name] || [D.loc.lat, D.loc.lng])})).sort((a, b) => a.km - b.km);
      fb.innerHTML = `${directBox()}${head()}
        ${!D.direct ? `<p class="blk-t">Cerca de ti <small>${PL.esc(D.loc.district || '')}</small></p><div class="pros" id="pros">${near.map(({w, km}) => `<button class="pro" type="button" data-pro="${PL.esc(w.name)}">${PL.avatar(w.name, w.color)}<b>${PL.esc(PL.short(w.name))}</b><span>${PL.ic('check')}Verificado</span><em>${mode === 'ya' ? `a ${PL.etaMin(km)} min` : kmTxt(km)}</em></button>`).join('')}</div>` : ''}
        ${!D.direct && bizHere.length ? `<p class="blk-t">Empresas</p><div class="bizs" id="bizs">${bizHere.map(b => `<button class="biz" type="button" data-biz="${b.id}">${PL.bizLogo(b)}<span><b>${PL.esc(b.n)}</b><span class="t">${PL.esc(b.tag)}</span></span>${b.mine ? '<span class="pill a">Tu empresa</span>' : ''}</button>`).join('')}</div>` : ''}
        ${svc.t.length ? `<p class="blk-t">¿Qué hay que hacer? <small>Elige una o más</small></p><div class="chips tasks" id="tasks">${svc.t.map(t => `<button class="chip" type="button" aria-pressed="${D.tasks.includes(t)}">${PL.ic('check', 'i ck')}${PL.esc(t)}</button>`).join('')}</div>` : ''}
        <label class="field" style="margin-top:18px"><span>${svc.other ? 'Describe el trabajo' : 'Detalles para cotizar'} <em>${svc.other ? '' : '(opcional)'}</em></span><textarea class="in" id="note" maxlength="400" placeholder="${svc.other ? 'Ej.: necesito alguien que arregle mi bicicleta' : 'Medidas, marca, piso, si hay que llevar materiales…'}">${PL.esc(D.note)}</textarea></label>
        <div class="photos" id="photos"><p class="blk-t" style="margin:0 0 8px">Fotos <small>Ayudan a cotizar mejor · hasta ${MAXPH}</small></p><div class="ph-row">${D.photos.map((p, k) => `<span class="ph-th"><img src="${p}" alt="Foto ${k + 1}"><button type="button" data-rmph="${k}" aria-label="Quitar foto ${k + 1}">${PL.ic('x')}</button></span>`).join('')}${D.photos.length < MAXPH ? `<label class="ph-add"><input type="file" accept="image/*" id="photo" multiple>${PL.ic('cam')}<span>Agregar</span></label>` : ''}</div></div>
        ${svc.team ? qty('people', '¿Cuántas personas?', 'Para eventos y turnos') : ''}
        ${svc.u === 'hora' ? qty('hours', '¿Cuántas horas?', 'Pagas por hora') : ''}`;
      ff.innerHTML = nextBtn();
      const next = PL.$('#next', ff), note = PL.$('#note', fb);
      const sync = () => { next.disabled = !(svc.other ? D.note.trim().length > 3 : (D.tasks.length || D.note.trim().length > 3)); };
      const tl = PL.$('#tasks', fb);
      if (tl) tl.onclick = e => { const b = e.target.closest('.chip'); if (!b) return; const t = b.textContent, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); D.tasks = on ? D.tasks.concat(t) : D.tasks.filter(x => x !== t); sync(); };
      note.oninput = () => { D.note = note.value; sync(); };
      const ph = PL.$('#photo', fb);
      if (ph) ph.onchange = e => { const files = Array.from(e.target.files).slice(0, MAXPH - D.photos.length); let left = files.length; files.forEach(f => shrink(f, url => { D.photos.push(url); if (!--left) que(); })); };
      fb.querySelectorAll('[data-rmph]').forEach(b => b.onclick = () => { D.photos.splice(Number(b.dataset.rmph), 1); que(); });
      fb.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const k = b.dataset.q; D[k] = Math.max(1, Math.min(k === 'people' ? 30 : 12, D[k] + Number(b.dataset.d))); PL.$('#q-' + k, fb).textContent = D[k]; });
      const bz = PL.$('#bizs', fb);
      if (bz) bz.onclick = e => {
        const x = e.target.closest('[data-biz]'); if (!x) return;
        const b = PL.biz(x.dataset.biz), bw = PL.bizW(b);
        const pick = () => { D.direct = b.n; D.directW = bw; que(); PL.toast(`Tu pedido le llegará a ${b.n}`); };
        PL.bizSheet(b, {onAccept: pick, onChat: () => PL.quoteChat({w: bw, svc, whenTxt: mode === 'ya' ? 'Inmediato' : 'El día que elijas', tasks: D.tasks, price: D.price || 0, msgs: (D.chats[b.id] = D.chats[b.id] || []), state: (D.cst[b.id] = D.cst[b.id] || {stage: 0}),
          onAccept: (amt, sum) => { D.direct = b.n; D.directW = bw; D.price = amt; if (sum && !D.note.includes(sum)) D.note = (D.note ? D.note + '\n' : '') + sum; go(step + 1); PL.toast(`Presupuesto aceptado. Completa los datos para enviárselo a ${b.n}`, 3600); }})});
      };
      const pl = PL.$('#pros', fb);
      if (pl) pl.onclick = e => { const b = e.target.closest('[data-pro]'); if (b) openPro(pros.find(x => x.name === b.dataset.pro)); };
      next.onclick = () => go(step + 1);
      sync();
    }

    /* ——— paso: qué día (solo programado) ——— */
    function cuando(){
      fm.clear(); fm.setMe([D.loc.lat, D.loc.lng], {zoom: 15});
      const days = [];
      for (let i = 0; i < 21; i++) days.push(PL.isoDay(new Date(Date.now() + i * 864e5)));
      const canRep = !svc.other && !NOREP.includes(svc.c);
      fb.innerHTML = `<p class="blk-t">Día</p><div class="day-rail" id="days" role="group" aria-label="Elige el día">${days.map((iso, i) => { const [dw, dn, dm] = PL.fdate(iso + 'T12:00').split(' '); return `<button class="day" type="button" data-day="${iso}" aria-pressed="${D.when.date === iso}"><span>${i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dw}</span><b>${dn}</b><span>${dm}</span></button>`; }).join('')}</div>
        <p class="blk-t">Hora de llegada</p><div class="slots" id="times"></div>
        ${canRep ? `<p class="blk-t">¿Se repite? <small>Ideal para limpieza, cuidado y clases</small></p><div class="chips" id="rep">${Object.keys(PL.REPEAT).map(k => `<button class="chip" type="button" data-r="${k}" aria-pressed="${D.repeat === k}">${PL.REPEAT[k]}</button>`).join('')}</div>` : ''}
        <div class="when-sum" id="ws" hidden></div>`;
      ff.innerHTML = nextBtn();
      const next = PL.$('#next', ff);
      function drawTimes(){
        const isToday = D.when.date === days[0], h0 = new Date().getHours() + 2;
        if (isToday && D.when.time && Number(D.when.time.slice(0, 2)) < h0) D.when.time = '';
        PL.$('#times', fb).innerHTML = SLOTS.map(([g, ts]) => `<div class="slot"><span>${g}</span><div class="chips">${ts.map(t => { const off = isToday && Number(t.slice(0, 2)) < h0; return `<button class="chip" type="button" data-t="${t}" aria-pressed="${D.when.time === t}"${off ? ' disabled' : ''}>${PL.fhm(t).replace(':00', '')}</button>`; }).join('')}</div></div>`).join('');
      }
      function sync(){
        next.disabled = !(D.when.date && D.when.time);
        const ws = PL.$('#ws', fb);
        ws.hidden = next.disabled;
        ws.innerHTML = `${PL.ic('cal')}<span><b>${PL.esc(PL.whenText(D.when))}</b>${D.repeat !== 'no' ? '<br>' + PL.esc(repTxt()) + ', a la misma hora' : ''}</span>`;
      }
      PL.$('#days', fb).onclick = e => { const b = e.target.closest('[data-day]'); if (!b) return; D.when.date = b.dataset.day; PL.$$('[data-day]', fb).forEach(x => x.setAttribute('aria-pressed', x === b)); drawTimes(); sync(); };
      PL.$('#times', fb).onclick = e => { const b = e.target.closest('[data-t]'); if (!b || b.disabled) return; D.when.time = b.dataset.t; PL.$$('[data-t]', fb).forEach(x => x.setAttribute('aria-pressed', x === b)); sync(); };
      const rep = PL.$('#rep', fb);
      if (rep) rep.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; D.repeat = b.dataset.r; PL.$$('[data-r]', fb).forEach(x => x.setAttribute('aria-pressed', x === b)); sync(); };
      next.onclick = () => go(step + 1);
      drawTimes(); sync();
    }

    /* ——— paso: dónde (mapa real con pin fijo) ——— */
    function donde(){
      fm.clear();
      ff.innerHTML = nextBtn('Confirmar dirección');
      const next = PL.$('#next', ff);
      const pp = PL.placePanel({fm, host: fb, loc: D.loc, tip: mode === 'ya' ? 'El servicio llega aquí' : 'Aquí es el servicio', save: !!PL.me(), saveAs: D.saveAs,
        onValid: ok => { next.disabled = !ok; }, onZone: z => chip(z ? z.n : 'Fuera de la zona')});
      next.onclick = () => { D.loc = pp.read(); D.saveAs = pp.saveAs(); pp.stop(); go(step + 1); };
    }

    /* ——— paso: confirmar (como el checkout de una app de reparto) ——— */
    function confirmar(){
      fm.clear(); fm.setMe([D.loc.lat, D.loc.lng], {zoom: 16.5}); chip(D.loc.district);
      const me = PL.me(), prog = mode === 'prog';
      const iWhen = STEPS.indexOf(cuando), iWhere = STEPS.indexOf(donde);
      const svcSub = [D.tasks.join(', '), !D.tasks.length && D.note ? D.note.slice(0, 60) : '', D.photos.length ? `${D.photos.length} ${D.photos.length === 1 ? 'foto' : 'fotos'}` : '', D.people > 1 ? `${D.people} personas` : '', svc.u === 'hora' ? `${D.hours} h` : ''].filter(Boolean).join(' · ');
      fb.innerHTML = `<div class="ck">
          <button class="ck-row" type="button" data-to="${iWhere}">${PL.ic('pin')}<span><small>Dirección</small><b>${PL.esc(D.loc.line)}</b><span>${PL.esc([D.loc.floor, D.loc.district].filter(Boolean).join(' · '))}${D.loc.ref ? ' · ' + PL.esc(D.loc.ref) : ''}</span></span>${PL.ic('chev', 'i chev')}</button>
          <button class="ck-row" type="button" ${prog ? `data-to="${iWhen}"` : 'disabled'}>${PL.ic(prog ? 'cal' : 'bolt')}<span><small>Cuándo</small><b>${prog ? PL.esc(PL.whenText(D.when)) : 'Inmediato'}</b><span>${prog ? PL.esc(repTxt() || 'Solo una vez') : 'Quien acepte sale hacia tu dirección'}</span></span>${prog ? PL.ic('chev', 'i chev') : ''}</button>
          <button class="ck-row" type="button" data-to="0"><span class="ck-svc">${PL.si(svc.i)}</span><span><small>Servicio</small><b>${PL.esc(svc.n)}</b><span>${PL.esc(svcSub || 'Sin detalles')}</span></span>${PL.ic('chev', 'i chev')}</button>
        </div>
        ${favsHere.length && !fav && !D.directW ? `<p class="blk-t">¿A quién se lo pides?</p><div class="chips" id="who"><button class="chip" type="button" data-who="" aria-pressed="${!D.direct}">${PL.ic('users')}Recibir ofertas</button>${favsHere.map(f => `<button class="chip who" type="button" data-who="${PL.esc(f.name)}" aria-pressed="${D.direct === f.name}">${PL.avatar(f.name, f.color, 'xs')}${PL.esc(PL.short(f.name))}</button>`).join('')}</div>` : directBox()}
        <label class="check" id="fbk"${D.direct ? '' : ' hidden'}><input type="checkbox" id="fallback"${D.fallback ? ' checked' : ''}><span>Si no puede, que me lleguen ofertas de otros trabajadores.</span></label>
        <p class="blk-t">¿Cuánto ofreces? <small>Tú pones el precio${svc.other ? '' : ' ' + PL.unitText(svc.u)}${D.people > 1 ? ', por persona' : ''}</small></p>
        <label class="offer-in"><span>S/</span><input id="pv" type="number" inputmode="numeric" min="1" step="1" placeholder="0" aria-label="Tu oferta en soles" value="${D.price || ''}"></label>
        <p class="price-hint ok" id="ph"></p>
        <p class="blk-t">Pago <small>Directo a quien hace el trabajo, al terminar</small></p>
        <div class="pay-rows" id="pay" role="radiogroup" aria-label="Forma de pago">${[['efectivo', 'Efectivo', 'Le pagas en mano al terminar', '#D6F4E3', PL.ic('cash')], ['yape', 'Yape', 'Al número que te indique al terminar', '#E9E3FF', '<b>Y</b>'], ['plin', 'Plin', 'Al número que te indique al terminar', '#D9F5EE', '<b>P</b>']].map(m => `<button class="pay-row" type="button" role="radio" data-m="${m[0]}" aria-checked="${D.pay === m[0]}"><span class="mi" style="background:${m[3]}">${m[4]}</span><span><b>${m[1]}</b><span>${m[2]}</span></span><i class="radio" aria-hidden="true"></i></button>`).join('')}</div>
        <p class="blk-t">Contacto</p>
        ${me ? `<div class="ck-me">${PL.avatar(me.name || 'Tú', '#FFE3D4')}<span><b>${PL.esc(me.name || 'Tu cuenta')}</b><span>${me.phone ? '+51 ' + PL.esc(PL.fmtPhone(me.phone)) : 'Agrega un celular para que te avisen al llegar'}</span></span><a class="btn btn-l btn-xs" href="#/perfil">Editar</a></div>
          ${me.phone ? '' : `<label class="field" style="margin-top:10px"><span>Celular</span><span class="tel"><span class="cc">+51</span><input class="in" id="cp" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="9" placeholder="9XXXXXXXX"></span></label>`}`
          : `<div class="ck-me guest">${PL.ic('user')}<span><b>Ingresa para enviar tu pedido</b><span>Con tu celular o tu correo. Tu pedido no se pierde.</span></span><button class="btn btn-t btn-xs" type="button" id="login">Ingresar</button></div>`}
        <p class="legal-note">Al enviar aceptas los <a href="#/legal">Términos y condiciones</a>. Agéndalo verifica a cada trabajador y empresa; el pago es directo entre tú y quien hace el trabajo.</p>`;
      ff.innerHTML = `<div class="tot"><b id="tt"></b><span>${D.people > 1 || svc.u === 'hora' ? 'total estimado' : 'tu oferta'}</span></div><button class="btn btn-a" id="go" type="button"></button>`;
      function draw(){
        PL.$('#tt', ff).textContent = D.price ? PL.money(tot()) : 'S/ —';
        PL.$('#ph', fb).textContent = D.direct ? `Se lo enviamos primero a ${dn()}.` : svc.u === 'hora' && D.price ? `${PL.money(D.price)} por hora × ${D.hours} h${D.people > 1 ? ` × ${D.people} personas` : ''}. Quien acepte, acepta tu precio.` : 'Quien acepte tu pedido, acepta tu precio. Si nadie acepta, puedes subirlo.';
        PL.$('#go', ff).textContent = D.direct ? `Enviar a ${dn()}` : mode === 'ya' ? 'Solicitar ahora' : 'Publicar pedido';
        PL.$('#fbk', fb).hidden = !D.direct;
      }
      fb.querySelectorAll('[data-to]').forEach(b => b.onclick = () => go(Number(b.dataset.to)));
      const who = PL.$('#who', fb);
      if (who) who.onclick = e => { const b = e.target.closest('[data-who]'); if (!b) return; D.direct = b.dataset.who || null; if (D.direct && lastPrice(D.direct)) { D.price = lastPrice(D.direct); PL.$('#pv', fb).value = D.price; } PL.$$('[data-who]', fb).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
      PL.$('#fallback', fb).onchange = e => { D.fallback = e.target.checked; };
      PL.$('#pv', fb).oninput = e => { D.price = Math.max(0, Math.round(Number(e.target.value) || 0)) || ''; draw(); };
      PL.$('#pay', fb).onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; D.pay = b.dataset.m; PL.$$('[data-m]', fb).forEach(x => x.setAttribute('aria-checked', x === b)); };
      const lg = PL.$('#login', fb);
      if (lg) lg.onclick = () => PL.authSheet({mode: 'in', reason: 'Ingresa o crea tu cuenta para enviar tu pedido. Lo que llenaste se mantiene.', onDone: () => confirmar()});
      PL.$('#go', ff).onclick = () => submit();
      draw();
    }

    function submit(){
      const pv = PL.$('#pv', fb);
      if (!D.loc.district || !PL.zone(D.loc.district)) { PL.toast('Elige una dirección dentro de la zona de servicio'); go(STEPS.indexOf(donde)); return; }
      if (!D.price) { PL.toast('Escribe cuánto ofreces'); pv.focus(); return; }
      const me = PL.me();
      if (!me) { PL.authSheet({mode: 'in', reason: 'Ingresa o crea tu cuenta para enviar tu pedido. Lo que llenaste se mantiene.', onDone: () => { confirmar(); setTimeout(submit, 80); }}); return; }
      const cp = PL.$('#cp', fb);
      if (cp) {
        const v = cp.value.replace(/\D/g, '');
        if (!okPhone(v)) { cp.classList.add('err'); cp.focus(); PL.toast('El celular tiene 9 dígitos y empieza con 9'); return; }
        if (S.accounts.some(a => a !== me && a.phone === v)) { cp.classList.add('err'); PL.toast('Ese celular ya lo usa otra cuenta'); return; }
        me.phone = v;
      }
      S.client.name = me.name || S.client.name; S.client.phone = me.phone || ''; S.client.district = S.client.district || D.loc.district;
      const L0 = D.loc;
      S.lastLoc = {lat: L0.lat, lng: L0.lng, line: L0.line, floor: L0.floor, ref: L0.ref, district: L0.district};
      if (D.saveAs) {
        S.addresses = (S.addresses || []).filter(a => D.saveAs === 'Otra' || a.label !== D.saveAs);
        S.addresses.unshift({label: D.saveAs, district: L0.district, line: L0.line, floor: L0.floor, refTxt: L0.ref, ref: PL.addrText(L0), lat: L0.lat, lng: L0.lng});
      }
      const o = {id: PL.uid(), mode, svc: svc.id, tasks: D.tasks, note: D.note.trim(), photos: D.photos.length, people: D.people, hours: D.hours, u: svc.u,
        district: L0.district, address: PL.addrText(L0), line: L0.line, floor: L0.floor, ref: L0.ref, lat: L0.lat, lng: L0.lng,
        when: Object.assign({}, D.when), repeat: mode === 'prog' ? D.repeat : 'no', direct: D.direct, directW: D.directW, fallback: D.fallback, price: D.price, pay: D.pay, status: 'buscando', createdAt: Date.now()};
      S.orders.push(o); PL.save();
      PL.toSheet({tipo: 'pedido', modo: mode === 'ya' ? 'inmediato' : 'programado', servicio: svc.n, trabajo: D.tasks.join(', '), detalle: D.note, distrito: L0.district, referencia: o.address, ubicacion: `${L0.lat},${L0.lng}`, cuando: mode === 'ya' ? 'Ahora' : PL.whenText(D.when), repite: PL.REPEAT[D.repeat], directo: D.direct || '', precio: D.price, personas: D.people, pago: D.pay, nombre: me.name, wa: me.phone || ''});
      PL.go('#/pedido/' + o.id);
    }

    function go(n){
      if (STEPS[step] === donde && n !== step) fm.picker(false);
      step = n;
      PL.$('#fh', view).innerHTML = TITLES[n];
      PL.$$('#fsteps li', view).forEach((d, i) => { d.className = i < n ? 'done' : i === n ? 'now' : ''; });
      flow.dataset.map = SIZE[STEPS[n].name] || 'm';
      chip(D.loc.district || 'Tu zona');
      drawBar();
      STEPS[n]();
      const panel = PL.$('.flow-panel', view); if (panel) panel.scrollTop = 0;
      if (n > 0) window.scrollTo(0, 0);
    }
    fb.addEventListener('click', e => { if (!e.target.closest('[data-undirect]')) return; D.direct = null; D.directW = null; fav = null; STEPS[step](); });
    PL.$('#back', view).onclick = () => step > 0 ? go(step - 1) : history.length > 1 ? history.back() : PL.go('#/');
    go(0);
  }, {flow: true, tab: ''});
})();
