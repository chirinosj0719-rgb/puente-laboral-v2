/* Agéndalo · empresas con su equipo (choferes, veterinarias, limpieza…)
   Las de muestra no llevan calificaciones ni cifras inventadas. */
(function(){
  const PL = window.PL;

  PL.BIZ = [
    {id: 'ruta-clara', n: 'Ruta Clara', tag: 'Choferes y movilidad', svcs: ['chofer', 'motorizado'], d: ['Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja'], team: ['Carlos Mendoza', 'Jhon Paredes', 'Edwin Vargas'], c: '#E3EEFC', i: 'cho', about: 'Choferes para empresas, eventos y uso particular, con movilidad propia o con tu auto.'},
    {id: 'huellitas-al-paso', n: 'Huellitas al Paso', tag: 'Veterinaria a domicilio', svcs: ['veterinaria', 'grooming', 'mascotas', 'paseador'], d: ['Jesús María', 'Lince', 'Pueblo Libre', 'San Miguel', 'Magdalena del Mar'], team: ['Milagros Torres', 'Lucía Chávez', 'Ángel Ramos'], c: '#DCF2E8', i: 'pata', about: 'Atención veterinaria en casa: consultas, vacunas, baño y cuidado de tu mascota.'},
    {id: 'brillo-hogar', n: 'Brillo Hogar', tag: 'Limpieza de casas y oficinas', svcs: ['limpieza', 'limpiezaof', 'lavado'], d: ['San Borja', 'Surquillo', 'San Luis', 'La Molina'], team: ['Rosa Quispe', 'Yesenia Rojas', 'Sonia Mamani'], c: '#FFF1C9', i: 'limp', about: 'Equipos de limpieza para hogares, oficinas y locales, por día o por turno.'},
    {id: 'carga-feliz', n: 'Carga Feliz', tag: 'Mudanzas y fletes', svcs: ['mudanza', 'montaje', 'almacen', 'armado'], d: ['La Molina', 'Santiago de Surco', 'Punta Hermosa', 'San Bartolo'], team: ['Wilmer Castillo', 'Raúl Gutiérrez', 'Jorge Ccori'], c: '#FFE3D4', i: 'cmn', about: 'Mudanzas completas, cargadores y armado de muebles, con camión.'},
    {id: 'guardia-uno', n: 'Guardia Uno', tag: 'Seguridad y vigilancia', svcs: ['seguridad', 'vigilante'], d: ['Cercado de Lima', 'La Victoria', 'Breña', 'Jesús María'], team: ['Luis Huamán', 'Kevin Flores', 'Karina Salazar'], c: '#ECE8FF', i: 'seg', about: 'Personal de seguridad para eventos, edificios y negocios, de día o de noche.'},
    {id: 'mesa-lista', n: 'Mesa Lista', tag: 'Eventos y catering', svcs: ['mesero', 'barman', 'cocinero', 'anfitriona'], d: ['Miraflores', 'Barranco', 'Chorrillos', 'Santiago de Surco'], team: ['Maribel Apaza', 'Fiorella Díaz', 'Patricia León'], c: '#FFD9C4', i: 'mes', about: 'Meseros, barman y cocina para matrimonios, cumpleaños y eventos de empresa.'}
  ];

  /* la empresa del usuario (si la registró) va primero */
  PL.bizList = () => (PL.S.biz ? [Object.assign({mine: true}, PL.S.biz)] : []).concat(PL.BIZ);
  PL.biz = id => PL.bizList().find(b => b.id === id);
  PL.bizFor = svcId => PL.bizList().filter(b => b.svcs.includes(svcId));
  PL.bizTeam = b => b.team.map((m, k) => typeof m === 'string' ? {name: m, role: PL.svc(b.svcs[k % b.svcs.length]).n} : m);
  PL.bizW = b => ({name: b.n, color: b.c, isBiz: true, biz: b.id});
  PL.bizLogo = (b, cls = '') => { const B = b.i ? b : PL.biz(b.biz) || {c: '#FFE3D4', i: 'otr'}; return `<span class="blogo ${cls}" style="background:${B.c}" aria-hidden="true">${PL.si(B.i)}</span>`; };
  const tagPill = b => b.mine ? '<span class="pill a">Tu empresa</span>' : '';
  PL.bizRow = b => `<a class="ord biz-row" href="#/empresa/${b.id}">${PL.bizLogo(b)}<div class="ord-i"><b>${PL.esc(b.n)}</b><span>${PL.esc(b.tag)}</span></div>${tagPill(b)}${PL.ic('chev', 'i chev')}</a>`;

  /* hoja rápida de una empresa dentro de un pedido */
  PL.bizSheet = (b, opt = {}) => {
    const team = PL.bizTeam(b);
    PL.sheet({title: `${PL.bizLogo(b, 's')}<span>${PL.esc(b.n)}</span>`,
      body: `<p class="muted" style="margin-bottom:12px">${PL.esc(b.about)}</p><div class="chips" style="margin-bottom:16px">${tagPill(b)}<span class="pill v">${PL.ic('check')}RUC verificado</span></div>
        <p class="blk-t">Su equipo</p>
        <div class="list">${team.map(m => `<div class="tm">${PL.avatar(m.name, '#FFE3D4', 's')}<div><b>${PL.esc(m.name)}</b><span>${PL.esc(m.role)}</span></div><span class="pill v">${PL.ic('check')}Verificado</span></div>`).join('')}</div>
        <a class="prof-link" href="#/empresa/${b.id}" style="display:inline-block;margin-top:14px">Ver página de la empresa</a>`,
      foot: `<button class="btn btn-l" type="button" id="bzC">${PL.ic('chat')}Escribir</button><button class="btn btn-t" type="button" id="bzA">Pedir a ${PL.esc(b.n)}</button>`,
      onOpen: s => { s.querySelector('#bzC').onclick = () => opt.onChat && opt.onChat(); s.querySelector('#bzA').onclick = () => { PL.closeSheet(); if (opt.onAccept) opt.onAccept(); }; }});
  };

  /* ——— listado ——— */
  PL.route('empresas', view => {
    let cat = 'todos';
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('bag')}Empresas</span><h1>Empresas</h1></div>
      <div class="cat-rail" id="bzr" style="padding-top:20px"></div><div class="ords" id="bzl"></div>
      <div class="bz-cta"><div><b>¿Tienes una empresa de servicios?</b></div><a class="btn btn-a" href="#/empresa-registro">Registrar mi empresa<span class="arr">${PL.ic('arrow')}</span></a></div></div>${PL.footer()}`;
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
      <section class="sec" style="padding-top:44px"><div class="sec-h"><span class="eti">${PL.ic('list')}Servicios</span><h2>Lo que <span class="k">ofrecen</span></h2></div>
        <div class="ords">${b.svcs.map(id => { const s = PL.svc(id); return `<a class="ord" href="${reqUrl(id)}"><span class="svc-ic">${PL.si(s.i)}</span><div class="ord-i"><b>${PL.esc(s.n)}</b><span>${PL.esc(s.t.slice(0, 3).join(' · '))}</span></div>${PL.ic('chev', 'i chev')}</a>`; }).join('')}</div></section>
      <section class="sec"><div class="sec-h"><span class="eti">${PL.ic('users')}Equipo</span><h2>Quiénes <span class="k">van</span></h2></div>
        <div class="ords">${team.map(m => `<div class="ord">${PL.avatar(m.name, '#FFE3D4')}<div class="ord-i"><b>${PL.esc(m.name)}</b><span>${PL.esc(m.role)}</span></div><span class="pill v">${PL.ic('check')}Verificado</span></div>`).join('')}</div></section>
      <section class="sec"><div class="sec-h"><span class="eti">${PL.ic('pin')}Zonas</span><h2>Dónde <span class="k">atienden</span></h2></div><div class="chips">${b.d.map(d => `<span class="chip" style="cursor:default">${PL.esc(d)}</span>`).join('')}</div></section>
    </div>${PL.footer()}`;
    PL.$('#bzChat', view).onclick = () => {
      PL.S.bizChats = PL.S.bizChats || {}; const q = PL.S.bizChats[b.id] = PL.S.bizChats[b.id] || {msgs: [], stage: 0};
      PL.quoteChat({w: PL.bizW(b), svc: main, whenTxt: 'Cuando lo acuerden', tasks: [], price: 0, msgs: q.msgs, state: q, save: PL.save,
        onAccept: (amt, sum) => PL.go(`${reqUrl(main.id)}&p=${amt}&d=${encodeURIComponent(sum || '')}`)});
    };
  }, {tab: ''});

  /* ——— registro de una empresa: vive en empresas.html (como Rappi Aliados) ——— */
  PL.route('empresa-registro', () => { location.href = 'empresas.html#registro'; }, {tab: 'trabajar'});

  /* ——— panel de mi empresa ——— */
  PL.route('mi-empresa', view => {
    const S = PL.S, b = S.biz;
    if (!b) { PL.go('#/empresa-registro'); return; }
    b.jobs = b.jobs || [];
    const team = PL.bizTeam(b);
    view.innerHTML = `<section class="w-hero"><div class="w-hero-in">
      <div><span class="eti">${PL.ic('bag')}Mi empresa · en revisión</span><h1>${PL.esc(b.n)}</h1><p class="sub">${PL.esc(b.svcs.map(id => PL.svc(id).n).join(' · '))}</p>
        <button class="power" type="button" id="bpw" aria-pressed="${!!b.online}"><span class="tx"><b>${b.online ? 'Recibiendo solicitudes' : 'Pausada'}</b><span>${b.online ? 'Te llegan pedidos de tus servicios' : 'Toca para recibir solicitudes'}</span></span><span class="knob" aria-hidden="true"></span></button></div>
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
    if (!b.online) { feed.innerHTML = `<div class="idle"><svg class="si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI.caja}</svg><b>Tu empresa está en pausa</b><span>Actívala para recibir solicitudes y asignarlas a tu equipo.</span></div>`; return; }
    feed.innerHTML = `<div class="idle" id="bidle"><div class="radar-mini" aria-hidden="true"><i></i><i></i><i></i><b></b></div><b>Esperando solicitudes</b></div><div id="breqs" style="display:grid;gap:10px"></div>`;
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
