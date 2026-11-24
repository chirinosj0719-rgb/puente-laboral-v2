/* Puente Laboral · empresas con su equipo (choferes, veterinarias, limpieza…)
   Las de muestra van marcadas como "Empresa de ejemplo": sin calificaciones ni cifras inventadas. */
(function(){
  const PL = window.PL;

  PL.BIZ = [
    {id: 'ruta-clara', n: 'Ruta Clara', tag: 'Choferes y movilidad', svcs: ['chofer', 'motorizado'], d: ['Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja'], team: ['Carlos Mendoza', 'Jhon Paredes', 'Edwin Vargas'], c: '#E3EEFC', i: 'cho', about: 'Choferes para empresas, eventos y uso particular, con movilidad propia o con tu auto.'},
    {id: 'huellitas-al-paso', n: 'Huellitas al Paso', tag: 'Veterinaria a domicilio', svcs: ['veterinaria', 'grooming', 'mascotas', 'paseador'], d: ['Jesús María', 'Lince', 'Pueblo Libre', 'San Miguel', 'Magdalena del Mar'], team: ['Milagros Torres', 'Lucía Chávez', 'Ángel Ramos'], c: '#DCF2E8', i: 'pata', about: 'Atención veterinaria en casa: consultas, vacunas, baño y cuidado de tu mascota.'},
    {id: 'brillo-hogar', n: 'Brillo Hogar', tag: 'Limpieza de casas y oficinas', svcs: ['limpieza', 'limpiezaof', 'lavado'], d: ['Los Olivos', 'San Martín de Porres', 'Comas', 'Independencia'], team: ['Rosa Quispe', 'Yesenia Rojas', 'Sonia Mamani'], c: '#FFF1C9', i: 'limp', about: 'Equipos de limpieza para hogares, oficinas y locales, por día o por turno.'},
    {id: 'carga-feliz', n: 'Carga Feliz', tag: 'Mudanzas y fletes', svcs: ['mudanza', 'montaje', 'almacen', 'armado'], d: ['Ate', 'La Molina', 'Santa Anita', 'El Agustino'], team: ['Wilmer Castillo', 'Raúl Gutiérrez', 'Jorge Ccori'], c: '#FFE3D4', i: 'cmn', about: 'Mudanzas completas, cargadores y armado de muebles, con camión.'},
    {id: 'guardia-uno', n: 'Guardia Uno', tag: 'Seguridad y vigilancia', svcs: ['seguridad', 'vigilante'], d: ['Cercado de Lima', 'La Victoria', 'Breña', 'Rímac'], team: ['Luis Huamán', 'Kevin Flores', 'Karina Salazar'], c: '#ECE8FF', i: 'seg', about: 'Personal de seguridad para eventos, edificios y negocios, de día o de noche.'},
    {id: 'mesa-lista', n: 'Mesa Lista', tag: 'Eventos y catering', svcs: ['mesero', 'barman', 'cocinero', 'anfitriona'], d: ['Miraflores', 'Barranco', 'Chorrillos', 'Santiago de Surco'], team: ['Maribel Apaza', 'Fiorella Díaz', 'Patricia León'], c: '#FFD9C4', i: 'mes', about: 'Meseros, barman y cocina para matrimonios, cumpleaños y eventos de empresa.'}
  ];

  /* la empresa del usuario (si la registró) va primero */
  PL.bizList = () => (PL.S.biz ? [Object.assign({mine: true}, PL.S.biz)] : []).concat(PL.BIZ);
  PL.biz = id => PL.bizList().find(b => b.id === id);
  PL.bizFor = svcId => PL.bizList().filter(b => b.svcs.includes(svcId));
  PL.bizTeam = b => b.team.map((m, k) => typeof m === 'string' ? {name: m, role: PL.svc(b.svcs[k % b.svcs.length]).n} : m);
  PL.bizW = b => ({name: b.n, color: b.c, isBiz: true, biz: b.id});
  PL.bizLogo = (b, cls = '') => { const B = b.i ? b : PL.biz(b.biz) || {c: '#FFE3D4', i: 'otr'}; return `<span class="blogo ${cls}" style="background:${B.c}" aria-hidden="true">${PL.si(B.i)}</span>`; };
  const tagPill = b => b.mine ? '<span class="pill a">Tu empresa</span>' : '<span class="pill o">Empresa de ejemplo</span>';
  PL.bizRow = b => `<a class="ord" href="#/empresa/${b.id}">${PL.bizLogo(b)}<div class="ord-i"><b>${PL.esc(b.n)}</b><span>${PL.esc(b.tag)}</span><span>${PL.esc(b.d.slice(0, 3).join(', '))}${b.d.length > 3 ? '…' : ''}</span></div><div class="ord-r">${tagPill(b)}<span class="muted" style="font-size:.84rem">Equipo de ${b.team.length}</span></div></a>`;

  /* hoja rápida de una empresa dentro de un pedido */
  PL.bizSheet = (b, opt = {}) => {
    const team = PL.bizTeam(b);
    PL.sheet({title: `${PL.bizLogo(b, 's')}<span>${PL.esc(b.n)}</span>`,
      body: `<p class="muted" style="margin-bottom:12px">${PL.esc(b.about)}</p><div class="chips" style="margin-bottom:16px">${tagPill(b)}<span class="pill v">${PL.ic('check')}RUC verificado</span></div>
        <p class="blk-t">Su equipo <small>La empresa asigna a una de estas personas</small></p>
        <div class="list">${team.map(m => `<div class="tm">${PL.avatar(m.name, '#FFE3D4', 's')}<div><b>${PL.esc(m.name)}</b><span>${PL.esc(m.role)}</span></div><span class="pill v">${PL.ic('check')}Verificado</span></div>`).join('')}</div>
        <a class="prof-link" href="#/empresa/${b.id}" style="display:inline-block;margin-top:14px">Ver página de la empresa</a>`,
      foot: `<button class="btn btn-l" type="button" id="bzC">${PL.ic('chat')}Escribir</button><button class="btn btn-t" type="button" id="bzA">Pedir a ${PL.esc(b.n)}</button>`,
      onOpen: s => { s.querySelector('#bzC').onclick = () => opt.onChat && opt.onChat(); s.querySelector('#bzA').onclick = () => { PL.closeSheet(); if (opt.onAccept) opt.onAccept(); }; }});
  };

  /* ——— listado ——— */
  PL.route('empresas', view => {
    let cat = 'todos';
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('bag')}Empresas</span><h1>Empresas de <span class="k">servicios</span></h1><p>Choferes, veterinarias, limpieza, mudanzas, seguridad y eventos, con su propio equipo. Escríbeles o pídeles por la app.</p></div>
      <div class="cat-rail" id="bzr" style="padding-top:20px"></div><div class="ords" id="bzl"></div>
      <div class="bz-cta"><div><b>¿Tienes una empresa de servicios?</b><span>Súmala gratis a la demo y recibe pedidos para tu equipo.</span></div><a class="btn btn-a" href="#/empresa-registro">Registrar mi empresa<span class="arr">${PL.ic('arrow')}</span></a></div></div>${PL.footer()}`;
    const cats = [{id: 'todos', name: 'Todas'}].concat(PL.CATS.filter(c => PL.bizList().some(b => b.svcs.some(s => PL.svc(s).c === c.id))));
    const draw = () => {
      PL.$('#bzr', view).innerHTML = cats.map(c => `<button class="chip" type="button" data-c="${c.id}" aria-pressed="${c.id === cat}">${c.name}</button>`).join('');
      PL.$('#bzl', view).innerHTML = PL.bizList().filter(b => cat === 'todos' || b.svcs.some(s => PL.svc(s).c === cat)).map(PL.bizRow).join('');
    };
    PL.$('#bzr', view).onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; draw(); };
    draw();
  }, {tab: ''});

  /* ——— página de una empresa ——— */
  PL.route('empresa', (view, args) => {
    const b = PL.biz(args[0]);
    if (!b) { PL.go('#/empresas'); return; }
    const team = PL.bizTeam(b), main = PL.svc(b.svcs[0]);
    const reqUrl = id => `#/pedir/${id}?b=${b.id}&m=${PL.canNow(PL.svc(id)) ? 'ya' : 'prog'}`;
    view.innerHTML = `<div class="wrap">
      <section class="bz-hero">${PL.bizLogo(b, 'l')}
        <div><span class="eti">${PL.ic('bag')}${PL.esc(b.tag)}</span><h1>${PL.esc(b.n)}</h1><p class="muted" style="max-width:52ch;margin-top:10px">${PL.esc(b.about)}</p>
          <div class="chips" style="margin-top:14px">${tagPill(b)}<span class="pill v">${PL.ic('check')}RUC verificado</span></div></div>
        <div class="bz-acts"><button class="btn btn-l" type="button" id="bzChat">${PL.ic('chat')}Escribir a la empresa</button><a class="btn btn-a" href="${reqUrl(main.id)}">Pedir un servicio<span class="arr">${PL.ic('arrow')}</span></a></div>
      </section>
      <section class="sec" style="padding-top:44px"><div class="sec-h"><span class="eti">${PL.ic('list')}Servicios</span><h2>Lo que <span class="k">ofrecen</span></h2><p>Toca un servicio para pedírselo directo a la empresa.</p></div>
        <div class="ords">${b.svcs.map(id => { const s = PL.svc(id); return `<a class="ord" href="${reqUrl(id)}"><span class="svc-ic">${PL.si(s.i)}</span><div class="ord-i"><b>${PL.esc(s.n)}</b><span>${PL.esc(s.t.slice(0, 3).join(' · '))}</span></div>${PL.ic('chev', 'i chev')}</a>`; }).join('')}</div></section>
      <section class="sec"><div class="sec-h"><span class="eti">${PL.ic('users')}Equipo</span><h2>Quiénes <span class="k">van</span></h2><p>La empresa asigna a una de estas personas a tu pedido.</p></div>
        <div class="ords">${team.map(m => `<div class="ord">${PL.avatar(m.name, '#FFE3D4')}<div class="ord-i"><b>${PL.esc(m.name)}</b><span>${PL.esc(m.role)}</span></div><span class="pill v">${PL.ic('check')}Verificado</span></div>`).join('')}</div></section>
      <section class="sec"><div class="sec-h"><span class="eti">${PL.ic('pin')}Zonas</span><h2>Dónde <span class="k">atienden</span></h2></div><div class="chips">${b.d.map(d => `<span class="chip" style="cursor:default">${PL.esc(d)}</span>`).join('')}</div></section>
    </div>${PL.footer()}`;
    PL.$('#bzChat', view).onclick = () => {
      PL.S.bizChats = PL.S.bizChats || {}; const q = PL.S.bizChats[b.id] = PL.S.bizChats[b.id] || {msgs: [], stage: 0};
      PL.quoteChat({w: PL.bizW(b), svc: main, whenTxt: 'Cuando lo acuerden', tasks: [], price: 0, msgs: q.msgs, state: q, save: PL.save,
        onAccept: (amt, sum) => PL.go(`${reqUrl(main.id)}&p=${amt}&d=${encodeURIComponent(sum || '')}`)});
    };
  }, {tab: ''});

  /* ——— registro de una empresa ——— */
  PL.route('empresa-registro', view => {
    const S = PL.S, B = S.biz;
    const D = B ? JSON.parse(JSON.stringify(B)) : {n: '', ruc: '', phone: '', svcs: [], d: [], about: '', team: [{name: '', role: ''}]};
    view.innerHTML = `<div class="reg"><p class="eti" style="margin-top:22px">${PL.ic('bag')}${B ? 'Editar empresa' : 'Registrar empresa'}</p><h1>Tu empresa, <span class="k">con su equipo</span></h1><p class="lead">Los clientes te encuentran dentro de cada servicio, te escriben por la app y tú asignas a alguien de tu equipo.</p><div id="eb"></div></div>
      <div class="fp-f" style="border:0"><a class="btn btn-l" href="${B ? '#/mi-empresa' : '#/trabajar'}">Cancelar</a><button class="btn btn-t" type="button" id="eSave">${B ? 'Guardar cambios' : 'Registrar empresa'}</button></div>`;
    const eb = PL.$('#eb', view);
    const roleOpts = sel => D.svcs.map(id => `<option${PL.svc(id).n === sel ? ' selected' : ''}>${PL.esc(PL.svc(id).n)}</option>`).join('') || '<option value="">Elige primero los servicios</option>';
    function draw(){
      eb.innerHTML = `<label class="field"><span>Nombre comercial</span><input class="in" id="e-n" maxlength="60" value="${PL.esc(D.n)}"></label>
        <div class="row2"><label class="field"><span>RUC</span><input class="in" id="e-ruc" inputmode="numeric" maxlength="11" value="${PL.esc(D.ruc)}"></label><label class="field"><span>Celular de la empresa</span><input class="in" id="e-wa" type="tel" inputmode="numeric" maxlength="9" placeholder="9XXXXXXXX" value="${PL.esc(D.phone)}"></label></div>
        <p class="blk-t">¿Qué servicios ofrecen? <small>Hasta 8</small></p>
        ${PL.CATS.map(c => `<div class="trade-g"><h3>${c.name}</h3><div class="chips">${PL.SVCS.filter(s => s.c === c.id && !s.other).map(s => `<button class="chip" type="button" data-s="${s.id}" aria-pressed="${D.svcs.includes(s.id)}">${PL.esc(s.n)}</button>`).join('')}</div></div>`).join('')}
        <p class="blk-t">Distritos donde atienden</p><div class="chips" id="e-d">${D.d.map(z => `<button class="chip" type="button" aria-pressed="true" data-z="${PL.esc(z)}">${PL.esc(z)} ${PL.ic('x')}</button>`).join('')}<button class="chip" type="button" id="e-addz">${PL.ic('plus')}Agregar distrito</button></div>
        <label class="field" style="margin-top:16px"><span>Cuéntales sobre la empresa</span><textarea class="in" id="e-about" maxlength="240" placeholder="Qué hacen, cómo trabajan, qué los diferencia.">${PL.esc(D.about)}</textarea></label>
        <p class="blk-t">Tu equipo <small>Las personas que pueden ir a los pedidos</small></p>
        <div id="e-team">${D.team.map((m, k) => `<div class="row2 tm-row"><label class="field"><span>Nombre y apellido</span><input class="in" data-tn="${k}" maxlength="50" value="${PL.esc(m.name)}"></label><label class="field"><span>Oficio</span><select class="in" data-tr="${k}">${roleOpts(m.role)}</select></label></div>`).join('')}</div>
        <button class="btn btn-l btn-sm" type="button" id="e-addt">${PL.ic('plus')}Agregar a alguien del equipo</button>
        <label class="check" style="margin-top:18px"><input type="checkbox" id="e-ok"${B ? ' checked' : ''}><span>Confirmo que los datos son reales y autorizo a Puente Laboral a verificar el RUC de la empresa.</span></label>`;
      eb.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { collect(); const id = x.dataset.s, on = !D.svcs.includes(id); if (on && D.svcs.length >= 8) { PL.toast('Máximo 8 servicios'); return; } D.svcs = on ? D.svcs.concat(id) : D.svcs.filter(v => v !== id); draw(); });
      PL.$('#e-addz', eb).onclick = () => { collect(); PL.pickDistrict('', z => { if (!D.d.includes(z)) D.d.push(z); draw(); }); };
      PL.$('#e-d', eb).onclick = e => { const z = e.target.closest('[data-z]'); if (z) { collect(); D.d = D.d.filter(v => v !== z.dataset.z); draw(); } };
      PL.$('#e-addt', eb).onclick = () => { collect(); D.team.push({name: '', role: ''}); draw(); };
    }
    function collect(){
      const v = id => (PL.$(id, eb) || {}).value;
      if (!PL.$('#e-n', eb)) return;
      D.n = v('#e-n').trim(); D.ruc = v('#e-ruc').trim(); D.phone = v('#e-wa').trim(); D.about = v('#e-about').trim();
      D.team = D.team.map((m, k) => ({name: (eb.querySelector(`[data-tn="${k}"]`) || {}).value || '', role: (eb.querySelector(`[data-tr="${k}"]`) || {}).value || ''}));
    }
    PL.$('#eSave', view).onclick = () => {
      collect();
      const team = D.team.filter(m => m.name.trim().split(/\s+/).length >= 2);
      if (D.n.length < 3) return PL.toast('Escribe el nombre de tu empresa');
      if (!/^(10|20)\d{9}$/.test(D.ruc)) return PL.toast('El RUC tiene 11 dígitos y empieza con 10 o 20');
      if (!/^9\d{8}$/.test(D.phone)) return PL.toast('El celular tiene 9 dígitos y empieza con 9');
      if (!D.svcs.length) return PL.toast('Elige al menos un servicio');
      if (!D.d.length) return PL.toast('Agrega al menos un distrito');
      if (!team.length) return PL.toast('Agrega al menos a una persona del equipo, con nombre y apellido');
      if (!PL.$('#e-ok', eb).checked) return PL.toast('Marca la casilla de confirmación');
      const svc0 = PL.svc(D.svcs[0]);
      S.biz = Object.assign(B || {id: 'mi-empresa', c: '#FFE3D4', jobs: [], online: false, createdAt: Date.now()}, {n: D.n, ruc: D.ruc, phone: D.phone, svcs: D.svcs, d: D.d, about: D.about || `Servicios de ${svc0.n.toLowerCase()}.`, team: team.map(m => ({name: m.name.trim(), role: m.role || svc0.n})), i: svc0.i, tag: svc0.n});
      PL.save();
      PL.toSheet({tipo: 'empresa', nombre: D.n, ruc: D.ruc, wa: D.phone, servicios: D.svcs.map(id => PL.svc(id).n).join(', '), distritos: D.d.join(', '), equipo: team.map(m => m.name + ' (' + m.role + ')').join('; ')});
      PL.go('#/mi-empresa');
      if (!B) setTimeout(() => { if (location.hash === '#/mi-empresa') PL.sheet({title: '¡Tu empresa está <span class="k">registrada!</span>', body: '<p style="margin-bottom:10px">Revisamos el RUC de tu empresa y te avisamos aquí cuando esté activa.</p><p class="muted">Mientras tanto ya apareces dentro de tus servicios en esta demo.</p>', foot: '<button class="btn btn-t" type="button" data-close>Entendido</button>'}); }, 450);
      else PL.toast('Empresa actualizada');
    };
    draw();
  }, {flow: true, tab: 'trabajar'});

  /* ——— panel de mi empresa ——— */
  PL.route('mi-empresa', view => {
    const S = PL.S, b = S.biz;
    if (!b) { PL.go('#/empresa-registro'); return; }
    b.jobs = b.jobs || [];
    const team = PL.bizTeam(b);
    view.innerHTML = `<section class="w-hero"><div class="w-hero-in">
      <div><span class="eti">${PL.ic('bag')}Mi empresa · en revisión</span><h1>${PL.esc(b.n)}</h1><p class="sub">${PL.esc(b.svcs.map(id => PL.svc(id).n).join(' · '))}</p>
        <button class="power" type="button" id="bpw" aria-pressed="${!!b.online}"><span class="tx"><b>${b.online ? 'Recibiendo solicitudes' : 'Pausada'}</b><span>${b.online ? 'Te llegan pedidos de tus servicios' : 'Toca para recibir solicitudes'}</span></span><span class="knob" aria-hidden="true"></span></button></div>
      <div class="w-stats"><div class="w-stat"><b>${team.length}</b><span>En el equipo</span></div><div class="w-stat"><b>${b.jobs.length}</b><span>Trabajos asignados</span></div><div class="w-stat"><b>${b.d.length}</b><span>Distritos</span></div></div>
    </div></section>
    <div class="wrap"><div class="w-grid">
      <div class="w-col"><p class="feed-h">${PL.ic('bolt')}Solicitudes</p><div id="bfeed"></div>
        <div class="card"><span class="eti">${PL.ic('check')}Trabajos asignados</span>${b.jobs.length ? `<ul class="jobs-l" style="margin-top:12px">${b.jobs.slice().reverse().map(j => `<li><span>${PL.esc(PL.svc(j.svc).n)} · ${PL.esc(j.client)} → ${PL.esc(PL.short(j.member))}</span><b>${PL.money(j.price)}</b></li>`).join('')}</ul>` : '<p class="muted" style="margin-top:10px">Cuando aceptes una solicitud y la asignes, aparece aquí.</p>'}</div></div>
      <div class="w-col">
        <div class="card"><span class="eti">${PL.ic('users')}Tu equipo</span><div class="list" style="margin-top:12px">${team.map(m => `<div class="tm">${PL.avatar(m.name, '#FFE3D4', 's')}<div><b>${PL.esc(m.name)}</b><span>${PL.esc(m.role)}</span></div></div>`).join('')}</div></div>
        <div class="card"><span class="eti">${PL.ic('pin')}Así te ven los clientes</span><p class="muted" style="margin:10px 0 14px">Tu página aparece en Empresas y dentro de cada servicio que ofreces.</p><div style="display:flex;flex-wrap:wrap;gap:8px"><a class="btn btn-t btn-sm" href="#/empresa/${b.id}">Ver mi página</a><a class="btn btn-l btn-sm" href="#/empresa-registro">${PL.ic('edit')}Editar</a></div></div>
      </div></div></div>${PL.footer()}`;
    PL.$('#bpw', view).onclick = () => { b.online = !b.online; PL.save(); PL.render(); };
    const feed = PL.$('#bfeed', view);
    if (!b.online) { feed.innerHTML = `<div class="idle"><svg class="si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI.caja}</svg><b>Tu empresa está en pausa</b><span>Actívala para recibir solicitudes de ejemplo y asignarlas a tu equipo.</span></div>`; return; }
    feed.innerHTML = `<div class="idle" id="bidle"><div class="radar-mini" aria-hidden="true"><i></i><i></i><i></i><b></b></div><b>Esperando solicitudes</b><span>Solicitudes de ejemplo para la demo.</span></div><div id="breqs" style="display:grid;gap:10px"></div>`;
    const box = PL.$('#breqs', feed); let n = 0;
    const spawn = () => {
      if (box.children.length >= 2) return;
      const svc = PL.svc(PL.pick(b.svcs)), ya = PL.canNow(svc) && Math.random() < .5;
      const when = ya ? 'Ahora' : PL.whenText({type: 'fecha', date: PL.isoDay(new Date(Date.now() + PL.ri(1, 8) * 864e5)), time: PL.pick(['08:00', '10:00', '15:00', '19:00'])});
      const r = {svc: svc.id, client: PL.pick(PL.DEMO.clients), district: PL.pick(b.d), when, task: svc.t.length ? PL.pick(svc.t) : 'Trabajo general'};
      const el = document.createElement('article'); el.className = 'req rise ' + (ya ? 'ya' : 'prog'); n++;
      el.innerHTML = `<span class="req-tag ${ya ? 'ya' : 'prog'}">${PL.ic(ya ? 'bolt' : 'cal')}${PL.esc(when)}</span>
        <div class="req-h"><span class="svc-ic">${PL.si(svc.i)}</span><div class="req-i"><b>${PL.esc(svc.n)}</b><span>${PL.esc(r.district)}</span></div></div>
        <p class="req-note">${PL.esc(r.client)}: “${PL.esc(r.task)}”</p>
        <div class="row2"><label class="field"><span>Asignar a</span><select class="in" data-m>${team.map(m => `<option>${PL.esc(m.name)}</option>`).join('')}</select></label><label class="field"><span>Precio (S/)</span><input class="in" data-p type="number" inputmode="numeric" min="1" placeholder="¿Cuánto cobran?"></label></div>
        <div class="req-acts"><button class="btn btn-g btn-sm" type="button" data-x>Pasar</button><button class="btn btn-v btn-sm" type="button" data-ok>Aceptar y asignar</button></div>`;
      el.querySelector('[data-x]').onclick = () => { el.remove(); if (!box.children.length) PL.$('#bidle', feed).hidden = false; };
      el.querySelector('[data-ok]').onclick = () => {
        const price = Math.round(Number(el.querySelector('[data-p]').value)); const member = el.querySelector('[data-m]').value;
        if (!(price > 0)) { PL.toast('Escribe cuánto cobran'); return; }
        b.jobs.push({svc: r.svc, client: r.client, member, price, when, at: Date.now()}); PL.save();
        PL.toast(`Asignado a ${PL.short(member)}`); PL.render();
      };
      box.appendChild(el); PL.$('#bidle', feed).hidden = true;
    };
    PL.later(spawn, 2200); PL.every(spawn, 9000);
  }, {tab: 'trabajar', dark: true});
})();
