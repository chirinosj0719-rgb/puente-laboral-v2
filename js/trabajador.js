/* Agéndalo · lado del trabajador: presentación, registro y panel */
(function(){
  const PL = window.PL;
  const AVAIL = ['Mañanas', 'Tardes', 'Noches', 'Fines de semana', 'Eventos'];
  const EXP = ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años'];
  const first = n => String(n).trim().split(/\s+/)[0];

  PL.route('trabajar', view => PL.S.worker ? dash(view) : intro(view), {tab: 'trabajar'});

  /* ——— presentación ——— */
  function intro(view){
    view.innerHTML = `<section class="w-hero"><div class="w-hero-in">
      <div class="rise"><span class="eti">Para quienes trabajan</span><h1>Trabaja <span class="k">a tu manera.</span></h1>
        <p class="sub">Recibe pedidos cerca de tu casa, acepta los que te convienen y cobra directo. Tu oficio, tus horarios.</p>
        <a class="btn btn-a" href="#/registro" style="margin-top:20px">Crear mi perfil<span class="arr">${PL.ic('arrow')}</span></a> <a class="btn btn-dl" href="${PL.S.biz ? '#/mi-empresa' : '#/empresa-registro'}" style="margin-top:20px">${PL.S.biz ? 'Mi empresa' : 'Tengo una empresa'}</a></div>
      <div class="bens">
        <div class="ben"><span class="ico">${PL.ic('bolt')}</span><div><b>Solicitudes inmediatas</b><span>Te conectas cuando estás disponible y aceptas las que te quedan cerca.</span></div></div>
        <div class="ben"><span class="ico">${PL.ic('cal')}</span><div><b>Agenda para otros días</b><span>Acepta trabajos programados y arma tu semana.</span></div></div>
        <div class="ben"><span class="ico">${PL.ic('wallet')}</span><div><b>Cobras directo</b><span>Efectivo, Yape o Plin, al terminar.</span></div></div>
        <div class="ben"><span class="ico">${PL.ic('heart')}</span><div><b>Clientes que vuelven</b><span>Si les gustó tu trabajo, te piden directo otra vez.</span></div></div>
      </div></div></section>
      <div class="wrap">
        <section class="sec"><div class="sec-h"><div><span class="eti">Para empezar</span><h2>Lo que <span class="k">necesitas</span></h2></div><p>El registro toma unos minutos. Revisamos tus datos antes de activar tu cuenta.</p></div>
          <ol class="req-list"><li><span class="num">1</span><span>DNI vigente y ser mayor de 18 años</span></li><li><span class="num">2</span><span>Un celular</span></li><li><span class="num">3</span><span>Certificado de antecedentes (puedes enviarlo después)</span></li><li><span class="num">4</span><span>Saber hacer bien tu oficio</span></li></ol></section>
        <section class="sec" style="padding-top:0"><div class="sec-h"><div><span class="eti">Cómo funciona</span><h2>Así recibes <span class="k">trabajo</span></h2></div></div>
          <div class="how"><div class="how-i"><span class="num">1</span><h3>Conéctate o agenda</h3><p>Actívate para recibir solicitudes inmediatas o acepta trabajos programados.</p></div><div class="how-i"><span class="num">2</span><h3>Acepta o contraoferta</h3><p>Ves el trabajo, la zona y el precio. Si no te conviene, propones otro.</p></div><div class="how-i"><span class="num">3</span><h3>Cobra y suma estrellas</h3><p>Terminas, cobras directo y el cliente te califica.</p></div></div></section>
      </div>${PL.footer()}`;
  }

  /* ——— registro en 4 pasos ——— */
  PL.route('registro', view => {
    const S = PL.S, W = S.worker;
    const D = W ? JSON.parse(JSON.stringify(W)) : {name: '', dni: '', age: '', phone: '', district: S.client.district || '', zones: [], trades: [], exp: EXP[1], avail: [], bio: '', docs: {}};
    let step = 1;
    view.innerHTML = `<div class="reg"><div class="progbar"><i id="pg"></i></div><p class="eti" id="sn"></p><div id="rb"></div></div>
      <div class="fp-f" style="max-width:640px;margin:0 auto;border:0"><button class="btn btn-l" type="button" id="rback">Atrás</button><button class="btn btn-t" type="button" id="rnext">Continuar</button></div>`;
    const rb = PL.$('#rb', view), nx = PL.$('#rnext', view);
    const err = (el, msg) => { el.classList.add('err'); el.focus(); PL.toast(msg); return false; };

    const STEPS = [null,
      () => `<h1>Tus <span class="k">datos</span></h1><p class="lead">Así te van a conocer los clientes. Tu DNI no se muestra a nadie.</p>
        <div class="field"><span>Celular</span><div class="vrow"><input class="in" id="f-phone" type="tel" inputmode="numeric" maxlength="9" placeholder="9XXXXXXXX" autocomplete="tel" value="${PL.esc(D.phone)}"${D.phoneOk ? ' readonly' : ''}><button class="btn ${D.phoneOk ? 'btn-v' : 'btn-t'}" type="button" id="f-send"${D.phoneOk ? ' disabled' : ''}>${D.phoneOk ? PL.ic('check') + 'Verificado' : 'Enviar código'}</button></div></div>
        <div class="otp" id="otp" hidden><p>Escribe el código de 4 dígitos que te enviamos por SMS.</p><div class="pin-in">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" maxlength="1" aria-label="Dígito ${i + 1}" data-o="${i}">`).join('')}</div></div>
        <label class="field"><span>Nombre completo</span><input class="in" id="f-name" autocomplete="name" maxlength="60" value="${PL.esc(D.name)}"></label>
        <div class="row2"><label class="field"><span>DNI</span><input class="in" id="f-dni" inputmode="numeric" maxlength="8" autocomplete="off" value="${PL.esc(D.dni)}"></label><label class="field"><span>Edad</span><input class="in" id="f-age" type="number" inputmode="numeric" min="18" max="75" value="${PL.esc(D.age)}"></label></div>`,
      () => `<h1>¿Qué <span class="k">sabes hacer?</span></h1><p class="lead">Elige hasta 5. Solo te llegarán pedidos de estos.</p><p class="trade-note">${PL.ic('users')}<span><b>¿No tienes un oficio?</b> En «Ayuda y encargos» puedes ofrecer una mano: cargar, ordenar un depósito, hacer mandados o arreglos pequeños.</span></p>
        <div id="trades">${PL.CATS.map(c => `<div class="trade-g"><h3>${c.name}</h3><div class="chips">${PL.SVCS.filter(s => s.c === c.id && !s.other).map(s => `<button class="chip" type="button" data-s="${s.id}" aria-pressed="${D.trades.includes(s.id)}">${PL.esc(s.n)}</button>`).join('')}</div></div>`).join('')}</div>
        <label class="field"><span>Experiencia</span><select class="in" id="f-exp">${EXP.map(e => `<option${e === D.exp ? ' selected' : ''}>${e}</option>`).join('')}</select></label>`,
      () => `<h1>¿Dónde y <span class="k">cuándo?</span></h1><p class="lead">Te mostramos trabajos en los distritos que elijas.</p>
        <p class="blk-t">Distrito donde vives</p><button class="in" type="button" id="f-dist" style="display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer">${PL.ic('pin')}<span style="flex:1">${PL.esc(D.district || 'Elige tu distrito')}</span>${PL.ic('chev')}</button>
        <p class="blk-t">Distritos donde puedes trabajar</p><div class="chips" id="zones"></div>
        <p class="blk-t">¿Cuándo puedes trabajar?</p><div class="chips" id="avail">${AVAIL.map(a => `<button class="chip" type="button" aria-pressed="${D.avail.includes(a)}">${a}</button>`).join('')}</div>`,
      () => `<h1>Verifica tu <span class="k">perfil</span></h1><p class="lead">Con esto los clientes te abren la puerta con confianza.</p>
        <div class="docs">${docList().map(([k, label, ic, req, sub]) => `<label class="doc"><input type="file" accept="image/*,application/pdf" data-doc="${k}"><span class="ico">${PL.ic(D.docs[k] ? 'check' : ic)}</span><span class="tx"><b>${label}</b><span>${sub}</span></span><span class="pill ${D.docs[k] ? 'v' : req ? 'a' : 'o'}">${D.docs[k] ? 'Enviado' : req ? 'Requerido' : 'Opcional'}</span></label>`).join('')}</div>
        <label class="field" style="margin-top:16px"><span>Cuéntales sobre ti <em>(opcional)</em></span><textarea class="in" id="f-bio" maxlength="300" placeholder="Ej.: gasfitero hace 8 años, llevo mis herramientas, trabajo limpio.">${PL.esc(D.bio)}</textarea></label>
        <label class="check"><input type="checkbox" id="c1"${W ? ' checked' : ''}><span>Confirmo que soy mayor de 18 años y que mis datos son reales.</span></label>
        <label class="check"><input type="checkbox" id="c2"${W ? ' checked' : ''}><span>Autorizo a Agéndalo a verificar mi identidad y mostrar mi perfil a clientes.</span></label>`
    ];
    const NAMES = ['', 'Tus datos', 'Tus oficios', 'Zona y horario', 'Documentos'];
    const docList = () => [['photo', 'Foto de perfil', 'cam', true, 'Una foto clara de tu cara'], ['dniF', 'DNI (frente y reverso)', 'id', true, 'Vigente'], ['ant', 'Certificado de antecedentes', 'shield', false, 'Puedes subirlo después']]
      .concat(D.trades.some(t => ['chofer', 'motorizado', 'mudanza'].includes(t)) ? [['lic', 'Licencia de conducir', 'id', true, 'Vigente, para tu oficio']] : []);

    function bind(){
      if (step === 1 && !D.phoneOk) {
        const otp = PL.$('#otp', rb), ins = PL.$$('[data-o]', rb);
        PL.$('#f-send', rb).onclick = () => {
          const ph = PL.$('#f-phone', rb).value.trim();
          if (!/^9\d{8}$/.test(ph)) { PL.toast('El celular tiene 9 dígitos y empieza con 9'); return; }
          D.phone = ph; D.code = String(PL.ri(1000, 9999)); otp.hidden = false; ins[0].focus();
          PL.toast(`SMS de Agéndalo: tu código es ${D.code}`, 6000);
        };
        ins.forEach((x, i) => x.oninput = () => {
          x.value = x.value.replace(/\D/g, ''); if (x.value && ins[i + 1]) ins[i + 1].focus();
          const v = ins.map(y => y.value).join('');
          if (v.length === 4) { if (v === D.code) { collect1(); D.phoneOk = true; draw(); PL.toast('Celular verificado'); } else { PL.toast('Código incorrecto'); ins.forEach(y => { y.value = ''; }); ins[0].focus(); } }
        });
      }
      if (step === 2) PL.$('#trades', rb).onclick = e => {
        const b = e.target.closest('[data-s]'); if (!b) return;
        const id = b.dataset.s, on = !D.trades.includes(id);
        if (on && D.trades.length >= 5) { PL.toast('Máximo 5 oficios'); return; }
        D.trades = on ? D.trades.concat(id) : D.trades.filter(x => x !== id); b.setAttribute('aria-pressed', on);
      };
      if (step === 3) {
        const zl = PL.$('#zones', rb);
        const drawZ = () => { zl.innerHTML = D.zones.map(z => `<button class="chip" type="button" aria-pressed="true" data-z="${PL.esc(z)}" aria-label="Quitar ${PL.esc(z)}">${PL.esc(z)} ${PL.ic('x')}</button>`).join('') + `<button class="chip" type="button" id="addZ">${PL.ic('plus')}Agregar distrito</button>`; };
        zl.onclick = e => {
          if (e.target.closest('#addZ')) return PL.pickDistrict('', d => { if (!D.zones.includes(d)) D.zones.push(d); drawZ(); });
          const z = e.target.closest('[data-z]'); if (z) { D.zones = D.zones.filter(x => x !== z.dataset.z); drawZ(); }
        };
        PL.$('#f-dist', rb).onclick = () => PL.pickDistrict(D.district, d => { D.district = d; PL.$('#f-dist span', rb).textContent = d; if (!D.zones.includes(d)) { D.zones.unshift(d); drawZ(); } });
        PL.$('#avail', rb).onclick = e => { const b = e.target.closest('.chip'); if (!b) return; const a = b.textContent, on = !D.avail.includes(a); D.avail = on ? D.avail.concat(a) : D.avail.filter(x => x !== a); b.setAttribute('aria-pressed', on); };
        drawZ();
      }
      if (step === 4) rb.querySelectorAll('[data-doc]').forEach(inp => inp.onchange = () => { if (inp.files[0]) { D.docs[inp.dataset.doc] = true; draw(); } });
    }
    function collect1(){ const v = id => (PL.$(id, rb) || {}).value || ''; D.name = v('#f-name').trim(); D.dni = v('#f-dni').trim(); D.age = v('#f-age').trim(); }
    function check(){
      if (step === 1) {
        const n = PL.$('#f-name', rb), d = PL.$('#f-dni', rb), a = PL.$('#f-age', rb), p = PL.$('#f-phone', rb);
        D.name = n.value.trim(); D.dni = d.value.trim(); D.age = a.value.trim(); D.phone = p.value.trim();
        if (!D.phoneOk) { PL.toast('Verifica tu celular con el código'); return false; }
        if (D.name.split(/\s+/).length < 2) return err(n, 'Escribe tu nombre y apellido');
        if (!/^\d{8}$/.test(D.dni)) return err(d, 'El DNI tiene 8 dígitos');
        if (!(+D.age >= 18 && +D.age <= 75)) return err(a, 'Debes tener entre 18 y 75 años');
        if (!/^9\d{8}$/.test(D.phone)) return err(p, 'El celular tiene 9 dígitos y empieza con 9');
      }
      if (step === 2) { D.exp = PL.$('#f-exp', rb).value; if (!D.trades.length) { PL.toast('Elige al menos un oficio'); return false; } }
      if (step === 3) {
        if (!D.district) { PL.toast('Elige el distrito donde vives'); return false; }
        if (!D.zones.length) D.zones = [D.district];
        if (!D.avail.length) { PL.toast('Elige cuándo puedes trabajar'); return false; }
      }
      if (step === 4) {
        D.bio = PL.$('#f-bio', rb).value.trim();
        const falta = docList().filter(d => d[3] && !D.docs[d[0]]);
        if (falta.length) { PL.toast(`Falta: ${falta.map(d => d[1]).join(', ')}`); return false; }
        if (!PL.$('#c1', rb).checked || !PL.$('#c2', rb).checked) { PL.toast('Marca las dos casillas para terminar'); return false; }
      }
      return true;
    }
    function draw(){
      PL.$('#pg', view).style.width = step * 25 + '%';
      PL.$('#sn', view).textContent = NAMES[step];
      rb.innerHTML = STEPS[step]();
      nx.textContent = step === 4 ? (W ? 'Guardar cambios' : 'Terminar registro') : 'Continuar';
      bind();
    }
    PL.$('#rback', view).onclick = () => step > 1 ? (step--, draw(), window.scrollTo(0, 0)) : PL.go('#/trabajar');
    nx.onclick = () => {
      if (!check()) return;
      if (step < 4) { step++; draw(); window.scrollTo(0, 0); return; }
      const isNew = !W;
      S.worker = Object.assign(W || {status: 'revision', online: false, jobs: [], active: null, createdAt: Date.now()}, {name: D.name, dni: D.dni, age: D.age, phone: D.phone, phoneOk: true, district: D.district, zones: D.zones, trades: D.trades, exp: D.exp, avail: D.avail, bio: D.bio, docs: D.docs});
      PL.save();
      PL.toSheet({tipo: 'trabajador', nombre: D.name, dni: D.dni, edad: D.age, wa: D.phone, distrito: D.district, zonas: D.zones.join(', '), oficios: D.trades.map(t => PL.svc(t).n).join(', '), experiencia: D.exp, disponibilidad: D.avail.join(', '), sobre: D.bio});
      PL.go('#/trabajar');
      /* setTimeout normal: PL.later se cancela al cambiar de pantalla */
      if (isNew) setTimeout(() => { if (location.hash === '#/trabajar') sendDocs(true); }, 450); else PL.toast('Perfil actualizado');
    };
    draw();
  }, {flow: true, tab: 'trabajar'});

  function sendDocs(fresh){
    PL.sheet({title: fresh ? '¡Tu perfil está <span class="k">listo!</span>' : 'Perfil en revisión',
      body: `<p style="margin-bottom:10px">Revisamos tu foto, tu DNI y tus antecedentes, y te avisamos aquí cuando tu perfil esté activo.</p><p class="muted">Mientras tanto puedes conocer el panel: conéctate y mira cómo llegan las solicitudes.</p>`,
      foot: '<button class="btn btn-t" type="button" data-close>Entendido</button>'});
  }

  /* ——— panel del trabajador ——— */
  function dash(view){
    const S = PL.S, W = S.worker;
    document.body.dataset.view = 'panel';
    const now = new Date(), day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const today = W.jobs.filter(j => j.at >= day0).reduce((a, j) => a + j.price, 0);
    view.innerHTML = `<section class="drv${W.online ? ' on' : ''}">
      <div class="drv-map" id="dmap"></div>
      <div class="drv-top"><span class="drv-chip">${PL.avatar(W.name, '#FFE3D4', 's')}${PL.esc(first(W.name))}</span><span class="drv-earn"><small>Hoy</small><b>${PL.money(today)}</b></span><span class="drv-chip ${W.status === 'ok' ? 'ok' : ''}">${PL.ic(W.status === 'ok' ? 'check' : 'clock')}${W.status === 'ok' ? 'Verificado' : 'En revisión'}</span></div>
      <div class="drv-bottom"><div id="active"></div><div id="feed" aria-live="polite"></div></div>
    </section>
    <div class="wrap"><div class="w-grid"><div class="w-col" id="side"></div></div></div>${PL.footer()}`;
    if (!PL.ll(W.pos) || !PL.zoneAt(W.pos[0], W.pos[1])) { W.pos = PL.pointIn(PL.zone(W.district) ? W.district : (W.zones.find(z => PL.zone(z)) || 'Miraflores')); PL.save(); }
    const map = PL.map(PL.$('#dmap', view), {center: W.pos, zoom: 14, zones: {highlight: W.zones, mask: true}, label: 'Tu zona'});
    if (W.active && PL.ll(W.active.pos)) { map.addPin('job', {name: W.active.client, color: '#FFD86B'}, W.active.pos); map.fit(['job'], {pad: [70, 70], max: 16}); }
    if (W.online && !W.active) map.radar(true);
    const toggle = () => { W.online = !W.online; PL.save(); PL.toast(W.online ? 'Estás conectado' : 'Te desconectaste'); PL.render(); };
    drawSide(view); drawActive(view);
    const feed = PL.$('#feed', view);
    if (W.active) { feed.innerHTML = ''; return; }
    if (!W.online) {
      feed.innerHTML = `<button class="go-btn" type="button" id="pw" aria-label="Conectarme">Conectar</button><div class="drv-bar"><b>Estás desconectado</b><span>Conéctate para recibir solicitudes de tus oficios.</span></div>`;
      PL.$('#pw', view).onclick = toggle; return;
    }
    feed.innerHTML = `<div class="drv-bar on" id="idle"><span class="radar-mini" aria-hidden="true"><i></i><i></i><i></i><b></b></span><div><b>Buscando solicitudes</b><span>${PL.esc(W.zones.slice(0, 2).join(', '))}${W.zones.length > 2 ? '…' : ''}</span></div><button class="btn btn-l btn-sm" type="button" id="pw">Desconectar</button></div><div id="reqs" style="display:grid;gap:10px"></div>`;
    PL.$('#pw', view).onclick = toggle;
    const reqs = PL.$('#reqs', feed);
    let n = 0;
    const spawn = () => { if (W.active || reqs.children.length >= 1) return; reqs.appendChild(reqCard(view, ++n, map)); PL.$('#idle', feed).hidden = true; };
    PL.later(spawn, 2500);
    PL.every(spawn, 8000);
  }

  function reqCard(view, n, map){
    const W = PL.S.worker, svc = PL.svc(PL.pick(W.trades)), st = PL.step(svc);
    const kind = !PL.canNow(svc) ? 'prog' : Math.random() < .55 ? 'ya' : 'prog', direct = Math.random() < .22;
    const date = kind === 'prog' ? PL.isoDay(new Date(Date.now() + PL.ri(1, 9) * 864e5)) : '', time = kind === 'prog' ? PL.pick(['08:00', '09:00', '10:00', '14:00', '16:00', '19:00']) : '';
    const repeat = kind === 'prog' && Math.random() < .3 ? PL.pick(['semana', 'quincena']) : 'no';
    const r = {id: 'r' + n, kind, direct, date, time, repeat, svc: svc.id, tasks: svc.t.length ? [PL.pick(svc.t)] : [], district: PL.pick(W.zones.filter(z => PL.zone(z)).length ? W.zones.filter(z => PL.zone(z)) : ['Miraflores']), km: 0, when: kind === 'ya' ? 'Ahora' : PL.whenText({type: 'fecha', date, time}), price: 0, client: PL.pick(PL.DEMO.clients)};
    r.pos = PL.pointIn(r.district); r.km = +PL.km(W.pos || r.pos, r.pos).toFixed(1);
    if (map) { map.addPin('r' + n, {name: '', color: kind === 'ya' ? '#FF5A1F' : '#1F8F5F'}, r.pos); map.fit(['r' + n], {pad: [80, 80], max: 15.5}); }
    const el = document.createElement('article');
    el.className = `req rise ${kind}${direct ? ' direct' : ''}`;
    el.innerHTML = `<span class="req-tag ${direct ? 'dir' : kind}">${direct ? PL.ic('heart') + `${PL.esc(r.client)} te eligió otra vez` : kind === 'ya' ? PL.ic('bolt') + 'Inmediato' : PL.ic('cal') + PL.esc(r.when) + (repeat !== 'no' ? ' · ' + PL.REPEAT[repeat].toLowerCase() : '')}</span>
      <div class="req-h"><span class="svc-ic">${PL.si(svc.i)}</span><div class="req-i"><b>${PL.esc(svc.n)}</b><span>${PL.esc(r.district)} · a ${String(r.km).replace('.', ',')} km · ${PL.esc(r.when)}</span></div></div>
      <p class="req-note">${PL.esc(r.client)}: “${PL.esc(r.tasks[0] || 'Trabajo general')}”</p>
      <div class="req-acts"><button class="btn btn-g btn-sm" type="button" data-a="pass">Pasar</button><button class="btn btn-v btn-sm" type="button" data-a="ok">Aceptar</button></div>
      <div class="counter" hidden><span style="font-weight:600">S/</span><input class="in" type="number" inputmode="numeric" min="1" placeholder="¿Cuánto cobras?" aria-label="Cuánto cobras" style="flex:1;min-height:42px"><button class="btn btn-v btn-sm" type="button" data-a="send">Confirmar</button></div>
      ${kind === 'ya' ? '<i class="of-bar" aria-hidden="true"><i style="animation-duration:25s"></i></i>' : ''}`;
    const kill = () => { if (!el.isConnected || el.dataset.hold) return; if (map) map.removePin('r' + n); const p = el.parentNode; el.remove(); if (p && !p.children.length) { const i = PL.$('#idle', view); if (i) i.hidden = false; } };
    PL.later(kill, kind === 'ya' ? 25000 : 60000);
    const take = price => {
      const W2 = PL.S.worker;
      if (kind === 'prog') { W2.agenda = W2.agenda || []; W2.agenda.push(Object.assign(r, {price})); PL.save(); PL.toast(`Agendado: ${r.when}`); PL.render(); return; }
      W2.active = Object.assign(r, {price, stage: 0, pin: String(PL.ri(1000, 9999)), at: Date.now()}); PL.save(); PL.toast(`Aceptaste el trabajo de ${r.client}`); PL.render();
    };
    el.onclick = e => {
      const a = e.target.closest('[data-a]'), p = e.target.closest('[data-p]');
      if (a && a.dataset.a === 'pass') kill();
      if (a && a.dataset.a === 'ok') { el.dataset.hold = '1'; const c = el.querySelector('.counter'); c.hidden = false; el.querySelector('.req-acts').hidden = true; const bar = el.querySelector('.of-bar'); if (bar) bar.remove(); c.querySelector('input').focus(); }
      if (a && a.dataset.a === 'send') { const v = Math.round(Number(el.querySelector('.counter input').value)); if (!(v > 0)) { PL.toast('Escribe cuánto cobras'); return; } take(v); }
      if (p) {
        const price = Number(p.dataset.p);
        el.querySelector('.req-acts').hidden = true;
        el.querySelector('.counter').outerHTML = `<p class="wait"><span class="ld" style="display:flex;gap:4px">${'<i style="width:7px;height:7px;border-radius:50%;background:var(--tinta);animation:bob 1s infinite"></i>'.repeat(3)}</span>Le propusiste ${PL.money(price)} a ${PL.esc(r.client)}…</p>`;
        PL.later(() => { if (Math.random() < .65) take(price); else { PL.toast(`${r.client} eligió otra oferta`); kill(); } }, 2600);
      }
    };
    return el;
  }

  function drawActive(view){
    const W = PL.S.worker, a = W.active, box = PL.$('#active', view);
    if (!a) { box.innerHTML = ''; return; }
    const svc = PL.svc(a.svc);
    const STG = [['Aceptado', 'Voy en camino'], ['En camino', 'Llegué'], ['Llegaste', 'Empezar trabajo'], ['Trabajando', 'Terminé el trabajo'], ['Cobrar', `Cobré ${PL.money(a.price)}`]];
    box.innerHTML = `<div class="card" style="border:1.5px solid var(--tinta)"><div class="req-h"><span class="svc-ic">${PL.si(svc.i)}</span><div class="req-i"><span class="eti v">Trabajo activo · ${STG[a.stage][0]}</span><b style="margin-top:6px">${PL.esc(svc.n)} para ${PL.esc(a.client)}</b><span>${PL.esc(a.district)} · ${PL.esc(a.when)}</span></div><div class="req-p"><b>${PL.money(a.price)}</b></div></div>
      <div class="job-steps" aria-hidden="true">${STG.map((s, i) => `<i class="${i <= a.stage ? 'on' : ''}"></i>`).join('')}</div>
      ${a.stage === 2 ? `<p style="font-weight:600;text-align:center">Pídele a ${PL.esc(a.client)} su código de inicio</p><div class="pin-in">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" maxlength="1" aria-label="Dígito ${i + 1}" data-i="${i}">`).join('')}</div><p class="muted mono" style="text-align:center;font-size:.74rem">Código del cliente: ${a.pin}</p>` : ''}
      ${a.stage === 4 ? `<p class="req-note">Cobra directo: efectivo, Yape o Plin.</p>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><a class="btn btn-l btn-sm" target="_blank" rel="noopener" href="${PL.ll(a.pos) ? `https://www.google.com/maps/dir/?api=1&destination=${a.pos[0]},${a.pos[1]}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.district + ', Lima')}`}">${PL.ic('nav')}Cómo llegar</a><button class="btn btn-l btn-sm" type="button" id="jx">No puedo ir</button></div>
      <button class="btn btn-t btn-full" type="button" id="jn" style="margin-top:8px">${STG[a.stage][1]}</button></div>`;
    const jn = PL.$('#jn', box);
    const pins = PL.$$('.pin-in input', box);
    if (pins.length) {
      jn.disabled = true;
      pins.forEach((p, i) => p.oninput = () => { p.value = p.value.replace(/\D/g, ''); if (p.value && pins[i + 1]) pins[i + 1].focus(); jn.disabled = pins.map(x => x.value).join('').length < 4; });
    }
    jn.onclick = () => {
      if (a.stage === 2 && pins.map(x => x.value).join('') !== a.pin) { PL.toast('Código incorrecto. Pídelo de nuevo.'); pins.forEach(x => { x.value = ''; }); pins[0].focus(); jn.disabled = true; return; }
      if (a.stage < 4) { a.stage++; PL.save(); drawActive(view); return; }
      W.jobs.push({at: Date.now(), svc: a.svc, price: a.price, client: a.client, district: a.district, direct: !!a.direct});
      W.active = null; PL.save(); PL.toast(`Ganaste ${PL.money(a.price)}. ¡Buen trabajo!`, 3200); PL.render();
    };
    PL.$('#jx', box).onclick = async () => { if (await PL.confirm({title: '¿No puedes ir?', text: `Le avisaremos a ${a.client} para que busque a otra persona. Cancelar seguido baja tu reputación.`, ok: 'Sí, cancelar', cancel: 'Volver', danger: true})) { W.active = null; PL.save(); PL.render(); } };
  }

  function drawSide(view){
    const W = PL.S.worker, side = PL.$('#side', view);
    const now = new Date(), days = [];
    for (let k = 6; k >= 0; k--) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k); days.push({d, v: W.jobs.filter(j => j.at >= d.getTime() && j.at < d.getTime() + 864e5).reduce((s, j) => s + j.price, 0)}); }
    const max = Math.max(1, ...days.map(x => x.v));
    const ag = (W.agenda || []).slice().sort((x, y) => PL.whenTs(x) - PL.whenTs(y));
    side.innerHTML = `<div class="card"><span class="eti v">${PL.ic('cal')}Tu agenda</span>
        ${ag.length ? `<ul class="agenda" style="margin-top:14px">${ag.map((j, k) => { const [dw, dn] = PL.fdate(j.date + 'T12:00').split(' '); return `<li><span class="d">${dw}<b>${dn}</b></span><div class="x"><b>${PL.esc(PL.svc(j.svc).n)} · ${PL.esc(j.client)}</b><span>${PL.esc(PL.fhm(j.time))} · ${PL.esc(j.district)} · ${PL.money(j.price)}${j.repeat && j.repeat !== 'no' ? ' · ' + PL.REPEAT[j.repeat].toLowerCase() : ''}</span></div><button class="btn btn-l btn-xs" type="button" data-start="${j.id}" title="Empezar este trabajo">Empezar</button></li>`; }).join('')}</ul>` : `<p class="muted" style="margin-top:10px">Los trabajos para otros días que aceptes aparecen aquí.</p>`}</div>
      <div class="card"><span class="eti">${PL.ic('wallet')}Tus ganancias</span>
        <div class="bars" role="img" aria-label="Ganancias de los últimos 7 días">${days.map((x, i) => `<div><i class="${i === 6 ? 'today' : x.v ? 'on' : ''}" style="height:${Math.max(3, x.v / max * 100)}%" title="${PL.money(x.v)}"></i><span>${'DLMMJVS'[x.d.getDay()]}</span></div>`).join('')}</div>
        ${W.jobs.length ? `<ul class="jobs-l">${W.jobs.slice(-5).reverse().map(j => `<li><span>${PL.esc(PL.svc(j.svc).n)} · ${PL.esc(j.client)}</span><b>${PL.money(j.price)}</b></li>`).join('')}</ul>` : `<p class="muted">Aún no tienes ganancias. Conéctate y acepta tu primer trabajo.</p>`}</div>
      ${W.status !== 'ok' ? `<div class="card"><span class="eti">${PL.ic('shield')}Estado de tu cuenta</span><ul class="chk">${[['Celular verificado', 'Listo', 'v'], ['Datos personales', 'Listo', 'v'], ['Documentos', 'En revisión', 'a'], ['Certificado de antecedentes', W.docs && W.docs.ant ? 'En revisión' : 'Pendiente', W.docs && W.docs.ant ? 'a' : 'o']].map(([t, st, c]) => `<li><span>${t}</span><span class="pill ${c}">${st}</span></li>`).join('')}</ul></div>` : ''}
      <div class="card"><div class="who">${PL.avatar(W.name, '#FFD86B')}<div><b>${PL.esc(W.name)}</b><span class="muted">${PL.esc(W.exp)} de experiencia</span></div></div>
        <div class="chips" style="margin:14px 0">${W.trades.map(t => `<span class="pill">${PL.esc(PL.svc(t).n)}</span>`).join('')}</div>
        <dl class="dl"><dt>Zonas</dt><dd>${PL.esc(W.zones.join(', '))}</dd><dt>Horario</dt><dd>${PL.esc(W.avail.join(', '))}</dd><dt>Clientes que repiten</dt><dd>${W.jobs.filter(j => j.direct).length}</dd></dl>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><a class="btn btn-l btn-sm" href="#/registro">${PL.ic('edit')}Editar</a><a class="btn btn-l btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Hola, soy ${W.name}. Hago trabajos de ${W.trades.map(t => PL.svc(t).n.toLowerCase()).join(', ')} en ${W.zones.join(', ')}. Contrátame por Agéndalo.`)}">${PL.ic('share')}Compartir</a></div></div>`;
    const d = PL.$('#docs', side); if (d) d.onclick = () => sendDocs(false);
    side.querySelectorAll('[data-start]').forEach(b => b.onclick = () => {
      if (W.active) { PL.toast('Termina primero tu trabajo activo'); return; }
      const j = W.agenda.find(x => x.id === b.dataset.start); if (!j) return;
      W.agenda = W.agenda.filter(x => x !== j);
      W.active = Object.assign({}, j, {stage: 0, pin: String(PL.ri(1000, 9999)), at: Date.now()});
      PL.save(); PL.toast(`Hoy toca: ${PL.svc(j.svc).n} para ${j.client}`); PL.render();
    });
  }
})();
