/* Puente Laboral · lado del cliente: inicio, mis pedidos y mis trabajadores */
(function(){
  const PL = window.PL;
  PL.mode = PL.mode || 'ya';

  PL.stLabel = o => {
    const w = o.worker ? PL.short(o.worker.name) : '';
    return ({
      buscando: [o.mode === 'prog' ? 'Recibiendo ofertas' : 'Buscando trabajador…', 'a'], programado: [`${w} va el ${PL.whenText(o.when).toLowerCase()}`, 'm'],
      en_camino: [`${w} está en camino`, 'a'], llego: [`${w} llegó`, 'v'], trabajando: [`${w} está trabajando`, 'v'],
      pagar: ['Falta pagar', 'r'], calificar: [`Califica a ${w}`, 'a'], terminado: ['Terminado', 'v'], cancelado: ['Cancelado', 'r']
    })[o.status] || [o.status, 'o'];
  };
  const SHORT = {buscando: 'Ofertas', programado: 'Programado', en_camino: 'En camino', llego: 'Llegó', trabajando: 'Trabajando', pagar: 'Por pagar', calificar: 'Por calificar', terminado: 'Terminado', cancelado: 'Cancelado'};
  PL.stPill = o => `<span class="pill ${PL.stLabel(o)[1]}">${SHORT[o.status] || o.status}</span>`;

  const ART_YA = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><defs><linearGradient id="gYa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9466"/><stop offset="1" stop-color="#EE4A0E"/></linearGradient></defs><ellipse cx="78" cy="126" rx="42" ry="7" fill="#E9A182" opacity=".45"/><circle cx="78" cy="64" r="50" fill="url(#gYa)"/><circle cx="78" cy="64" r="49" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><path d="M86 24L58 70h19l-7 40 30-50H80z" fill="#fff"/><path d="M8 46h18M2 64h20M8 82h16" stroke="#EE4A0E" stroke-width="5" stroke-linecap="round" opacity=".45"/></svg>`;
  const ART_PROG = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><ellipse cx="75" cy="127" rx="46" ry="7" fill="#8ACDAE" opacity=".45"/><rect x="22" y="22" width="106" height="98" rx="20" fill="#fff"/><path d="M22 42a20 20 0 0 1 20-20h66a20 20 0 0 1 20 20v10H22z" fill="#18A058"/><rect x="46" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/><rect x="95" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/>${[68, 86, 104].map((y, r) => [44, 62, 80, 98].map((x, c) => (r === 1 && c === 2) ? '' : `<circle cx="${x + 4}" cy="${y}" r="4.5" fill="#E2D8CB"/>`).join('')).join('')}<circle cx="84" cy="86" r="13" fill="#FF5A1F"/><path d="M78 86l4 4 8-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function tile(s, mode){
    const onlyProg = mode === 'ya' && !PL.canNow(s);
    return `<button class="svc" type="button" data-svc="${s.id}" data-c="${s.c}"><span class="svc-ic">${PL.si(s.i)}</span><span class="svc-n">${PL.esc(s.n)}</span><span class="svc-p">${onlyProg ? 'Solo programado' : s.other ? 'Tú lo describes' : PL.esc(s.t.slice(0, 2).join(' · '))}</span>${s.team ? `<span class="team pill o" title="Puedes pedir varias personas">${PL.ic('users')}</span>` : ''}</button>`;
  }
  function live(o){
    const svc = PL.svc(o.svc);
    return `<a class="live rise" href="#/pedido/${o.id}"><span class="pulse" aria-hidden="true"></span><div><div class="t">${PL.esc(PL.stLabel(o)[0])}</div><div class="s">${PL.esc(svc.n)} · ${PL.esc(o.district)}</div></div><span class="btn btn-w btn-sm">Ver</span></a>`;
  }
  const favSvcs = name => [...new Set(PL.history(name).map(o => o.svc))];
  function favCard(f){
    const sv = favSvcs(f.name).map(id => PL.svc(id).n);
    return `<div class="fav"><div class="top-r">${PL.avatar(f.name, f.color, 's')}<div><b>${PL.esc(PL.short(f.name))}</b><span>${PL.esc(sv.slice(0, 2).join(', ') || 'De confianza')}</span></div><span class="heart" aria-hidden="true">${PL.ic('heart')}</span></div><button class="btn btn-t btn-sm" type="button" data-rehire="${PL.esc(f.name)}">Volver a pedir</button></div>`;
  }

  /* volver a contratar a la misma persona: al toque o programado */
  PL.rehire = (w, svcId, reId) => {
    if (!PL.fav(w.name)) PL.addFav(w);
    const f = PL.fav(w.name), list = favSvcs(f.name);
    let sel = svcId || list[0] || 'otro';
    const first = f.name.split(' ')[0];
    PL.sheet({title: `Volver a pedir a <span class="k">${PL.esc(first)}</span>`,
      body: `<div class="direct">${PL.avatar(f.name, f.color)}<div><b>${PL.esc(f.name)}</b><span>Ya trabajó contigo</span></div><span class="heart" aria-hidden="true">${PL.ic('heart')}</span></div>
        ${list.length > 1 ? `<p class="blk-t">¿Qué servicio?</p><div class="chips" id="rs">${list.map(id => `<button class="chip" type="button" data-s="${id}" aria-pressed="${id === sel}">${PL.esc(PL.svc(id).n)}</button>`).join('')}</div><p class="blk-t">¿Cuándo?</p>` : ''}
        <div class="rehire"><button class="ya" type="button" data-m="ya"><span class="ic">${PL.ic('bolt')}</span><span><b>Al toque</b><span>Que vaya hoy, apenas pueda</span></span></button><button class="prog" type="button" data-m="prog"><span class="ic">${PL.ic('cal')}</span><span><b>Programar</b><span>Eliges día y hora, una vez o cada semana</span></span></button></div>
        <p class="muted" style="font-size:.88rem;margin-top:12px">Le llega primero a ${PL.esc(first)}. Si no puede, te avisamos.</p>`,
      foot: `<button class="btn btn-l" type="button" id="rchat">${PL.ic('chat')}Escribirle</button>`,
      onOpen: s => {
        const sync = () => { const b = s.querySelector('[data-m="ya"]'); b.disabled = !PL.canNow(PL.svc(sel)); };
        const rs = s.querySelector('#rs');
        if (rs) rs.onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; sel = b.dataset.s; rs.querySelectorAll('[data-s]').forEach(x => x.setAttribute('aria-pressed', x === b)); sync(); };
        s.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { PL.mode = b.dataset.m; PL.go(`#/pedir/${sel}?w=${encodeURIComponent(f.name)}&m=${b.dataset.m}${reId ? '&re=' + reId : ''}`); });
        s.querySelector('#rchat').onclick = () => PL.favChat(f);
        sync();
      }});
  };
  PL.favChat = f => { if (!f.chat) f.chat = []; PL.chat({worker: f, chat: f.chat, eta: 10, status: '', greet: `Hola, soy ${f.name.split(' ')[0]}. ¿En qué te puedo ayudar?`}); };

  /* ——— inicio ——— */
  PL.route('', view => {
    const S = PL.S;
    const act = PL.activeOrders().filter(o => !PL.isUpcoming(o))[0] || PL.activeOrders()[0];
    const drumList = ['gasfitero', 'ninera', 'mesero', 'electricista', 'limpieza', 'mudanza', 'cerrajero', 'adulto', 'dj', 'profesor', 'pintor', 'paseador', 'barman', 'jardinero'].map(PL.svc);
    view.innerHTML = `
    <section class="hero"><div class="hero-in">
      <a class="news rise" href="#modos"><b>Nuevo</b>Pide al toque o programa con anticipación ${PL.ic('arrow')}</a>
      <h1 class="rise">Ayuda de confianza, <span class="sel"><i aria-hidden="true"></i>al toque</span> o el día que quieras.</h1>
      <div class="hero-row rise">
        <div><p class="lead">Gasfiteros, niñeras, meseros, mudanzas y más, cerca de ti. Tú propones el precio y eliges a quién.</p>
          <div class="crowd">${PL.ic('shield')}<span>Cada trabajador pasa un filtro de identidad y antecedentes</span></div></div>
        <div><div class="search-box">${PL.ic('search')}<input id="hq" type="search" placeholder="Ej.: gasfitero, niñera…" aria-label="Buscar un servicio" autocomplete="off"><button class="loc" id="hloc" type="button" aria-label="Cambiar distrito">${PL.ic('pin')}<span>${PL.esc(S.client.district || 'Tu distrito')}</span></button></div>
          <p class="hint">Prueba “fuga de agua”, “niñera” o “mesero para el sábado”.</p></div>
      </div>
    </div></section>
    <section class="modes" id="modos" aria-label="Dos formas de pedir">
      <a class="mode ya" href="#servicios" data-pick="ya"><span class="go">${PL.ic('arrow')}</span><div><span class="eti">${PL.ic('bolt')}Ahora mismo</span><h3>Al toque</h3><p>Alguien va ahora, en minutos. Para lo urgente.</p><div class="tags"><span>Gasfitero</span><span>Cerrajero</span><span>Electricista</span><span>Niñera</span></div></div>${ART_YA}</a>
      <a class="mode prog" href="#servicios" data-pick="prog"><span class="go">${PL.ic('arrow')}</span><div><span class="eti v">${PL.ic('cal')}Con anticipación</span><h3>Programado</h3><p>Eliges día y hora. Una vez, cada semana o cada mes.</p><div class="tags"><span>Eventos</span><span>Limpieza</span><span>Clases</span><span>Mudanza</span></div></div>${ART_PROG}</a>
    </section>
    <section class="band" id="scene" aria-label="Ejemplo de un pedido en el mapa"></section>
    <div class="wrap">
      ${act ? live(act) : ''}
      ${S.favs.length ? `<section class="favs-sec"><div class="favs-h"><div><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h2>Vuelve a llamar a quien te gustó</h2></div><a href="#/equipo">Ver todos</a></div><div class="favs" id="favs">${S.favs.map(favCard).join('')}</div></section>` : ''}
      <section class="drum-sec" aria-label="Oficios">
        <span class="eti">${PL.ic('bolt')}Para lo que necesites</span>
        <div class="drum" id="drum" role="button" tabindex="0" aria-label="Ver el oficio del centro"><ul>${drumList.map(s => `<li>${PL.esc(s.n)}</li>`).join('')}</ul></div>
        <div class="drum-foot"><span><b id="dn">1</b> de ${drumList.length}</span><span id="dc"></span></div>
      </section>
      <section class="sec" id="servicios">
        <div class="sec-h"><span class="eti">${PL.ic('search')}Servicios</span><h2>¿Qué necesitas <span class="k">hoy</span>?</h2>
          <div><div class="mode-switch" role="group" aria-label="Cómo lo necesitas"><button type="button" data-mode="ya">${PL.ic('bolt')}Al toque</button><button type="button" data-mode="prog">${PL.ic('cal')}Programado</button></div><p class="mode-note" id="mnote"></p></div></div>
        <div class="cat-rail" id="rail" role="group" aria-label="Filtrar por categoría"></div>
        <p class="muted" id="resTxt" hidden style="margin-bottom:14px"></p>
        <div class="svc-grid" id="grid"></div>
      </section>
      <section class="sec">
        <div class="sec-h"><span class="eti">${PL.ic('bolt')}Cómo funciona</span><h2>Dos formas de pedir, <span class="k">una sola app.</span></h2><p>Lo urgente llega en minutos. Lo planeado, con calma y con la persona que tú elijas.</p></div>
        <div class="feats">
          <article class="feat"><div class="feat-art p"><div class="mock"><div class="mock-h"><span>ofertas · gasfitero</span><span>ahora</span></div><div class="mock-row"><span class="mav">${PL.ic('user')}</span><div><b>Gasfitero</b><span>Cerca de ti · verificado</span></div><span class="ok" style="margin-left:auto">Ver perfil</span></div><div class="mock-row"><span class="mav">${PL.ic('user')}</span><div><b>Gasfitera</b><span>Cerca de ti · verificada</span></div></div><div class="mock-row"><span class="mav">${PL.ic('user')}</span><div><b>Gasfitero</b><span>Cerca de ti · verificado</span></div></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('bolt')}Al toque</span><h3>Lo necesitas ya. Llega en minutos.</h3><p>Una fuga, te quedaste afuera, se fue la luz. Pides, te llegan ofertas de gente cerca y ves en el mapa cuándo llega.</p><span class="pill a">Ofertas en vivo</span></div></article>
          <article class="feat flip"><div class="feat-art m"><div class="mock"><div class="mock-h"><span>limpieza del hogar</span><span>programado</span></div><div class="mock-days">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<span class="${i === 5 ? 'on' : ''}">${d}<b>${23 + i}</b></span>`).join('')}</div><div class="mock-times"><span>8 a. m.</span><span class="on">9 a. m.</span><span>10 a. m.</span><span>11 a. m.</span></div><div style="margin-top:10px"><span class="pill m">${PL.ic('check')}Cada semana</span></div></div></div>
            <div class="feat-txt"><span class="eti v">${PL.ic('cal')}Programado</span><h3>Para el sábado, o para cada semana.</h3><p>Eventos, limpieza, clases, cuidado. Eliges día y hora con anticipación, comparas ofertas con calma y, si quieres, se repite solo.</p><span class="pill m">Una vez, cada semana o cada mes</span></div></article>
          <article class="feat"><div class="feat-art l"><div class="mock"><div class="mock-h"><span>mis trabajadores</span><span>favoritos</span></div><div class="mock-row"><span class="mav">${PL.ic('heart')}</span><div><b>Tu ayuda de limpieza</b><span>Ya trabajó contigo</span></div></div><div class="mock-row"><span class="mav">${PL.ic('heart')}</span><div><b>Tu gasfitero</b><span>Ya trabajó contigo</span></div></div><div style="padding:10px 4px 2px"><span class="btn btn-t btn-sm btn-full">Volver a pedirle</span></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h3>¿Te gustó cómo trabajó? Vuelve a llamarle.</h3><p>Guarda a quien te dio un buen servicio. La próxima vez le pides directo a esa persona, al toque o para otro día, y le escribes desde la app.</p><span class="pill a">Pedido directo</span></div></article>
        </div>
      </section>
      <section class="safe">
        <div class="safe-h"><span class="eti">${PL.ic('shield')}Seguridad</span><h2>Confianza para abrirle la puerta.</h2><p>Cada persona que trabaja en Puente pasa un filtro antes de recibir su primer pedido.</p></div>
        <ul>
          <li><span class="ico">${PL.ic('id')}</span><div><b>DNI verificado</b><span>Revisamos su identidad antes de activar su cuenta.</span></div></li>
          <li><span class="ico">${PL.ic('shield')}</span><div><b>Antecedentes revisados</b><span>Le pedimos su certificado de antecedentes.</span></div></li>
          <li><span class="ico">${PL.ic('star')}</span><div><b>Calificaciones reales</b><span>Solo califica quien contrató el servicio.</span></div></li>
          <li><span class="ico">${PL.ic('bolt')}</span><div><b>Código de inicio</b><span>El trabajo empieza cuando le das tu código de 4 dígitos.</span></div></li>
          <li><span class="ico">${PL.ic('share')}</span><div><b>Comparte tu pedido</b><span>Tu familia puede ver quién va y a qué hora.</span></div></li>
          <li><span class="ico">${PL.ic('alert')}</span><div><b>Ayuda al toque</b><span>Botón de emergencia y atención por WhatsApp.</span></div></li>
        </ul>
      </section>
      <section class="cta-work">
        <div><span class="eti">${PL.ic('bag')}Para quienes trabajan</span><h2 style="margin-top:14px">¿Sabes un oficio? Gana con él.</h2><p>Recibe trabajos al toque o agenda los de otros días. Tus clientes pueden volver a pedirte directo.</p><a class="btn btn-w" href="#/trabajar" style="margin-top:26px">Quiero trabajar<span class="arr">${PL.ic('arrow')}</span></a></div>
        <ul><li>Tú pones tus horarios</li><li>Trabajos cerca de casa</li><li>Cobras directo</li><li>Clientes que repiten</li></ul>
      </section>
    </div>
    ${PL.footer()}`;

    let cat = 'todos', q = '';
    const grid = PL.$('#grid', view), rail = PL.$('#rail', view), res = PL.$('#resTxt', view), hq = PL.$('#hq', view);
    const cats = [{id: 'todos', name: 'Todos'}].concat(PL.CATS);
    function drawMode(){
      PL.$$('[data-mode]', view).forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === PL.mode));
      PL.$('#mnote', view).textContent = PL.mode === 'ya' ? 'Gente que puede ir ahora. Eventos y clases están en Programado.' : 'Eliges día y hora con anticipación. Puedes repetirlo cada semana.';
    }
    function drawRail(){ rail.innerHTML = cats.map(c => `<button class="chip" type="button" data-c="${c.id}" aria-pressed="${c.id === cat}">${c.name}</button>`).join(''); }
    function draw(){
      const nq = PL.norm(q.trim());
      const list = PL.SVCS.filter(s => (nq || PL.mode === 'prog' || PL.canNow(s)) && (cat === 'todos' || s.c === cat || s.other) && (!nq || PL.norm(s.n + ' ' + s.t.join(' ') + ' ' + PL.cat(s.c).name).includes(nq)));
      res.hidden = !nq;
      res.textContent = nq && list.length ? `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'} para “${q.trim()}”` : '';
      grid.innerHTML = list.length ? list.map(s => tile(s, PL.mode)).join('') :
        `<div class="svc-empty empty"><svg class="big si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI.otr}</svg><h3>No encontramos “${PL.esc(q.trim())}”</h3><p>Pídelo igual: lo describes y te llegan ofertas.</p><a class="btn btn-t" href="#/pedir/otro?m=${PL.mode}&d=${encodeURIComponent(q.trim())}">Pedir “${PL.esc(q.trim())}”</a></div>`;
    }
    drawMode(); drawRail(); draw();
    PL.$('.mode-switch', view).onclick = e => { const b = e.target.closest('[data-mode]'); if (!b) return; PL.mode = b.dataset.mode; drawMode(); draw(); };
    PL.$$('[data-pick]', view).forEach(a => a.onclick = e => { e.preventDefault(); PL.mode = a.dataset.pick; drawMode(); draw(); PL.$('#servicios', view).scrollIntoView({behavior: 'smooth'}); });
    rail.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; drawRail(); draw(); };
    grid.onclick = e => { const b = e.target.closest('[data-svc]'); if (!b) return; const s = PL.svc(b.dataset.svc); PL.go(`#/pedir/${s.id}?m=${PL.canNow(s) ? PL.mode : 'prog'}`); };
    hq.oninput = () => { q = hq.value; if (q) { cat = 'todos'; drawRail(); } draw(); };
    hq.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); hq.blur(); PL.$('#servicios', view).scrollIntoView({behavior: 'smooth'}); } };
    PL.$('#hloc', view).onclick = () => PL.pickDistrict(S.client.district, d => { S.client.district = d; PL.save(); PL.$('#hloc span', view).textContent = d; });
    const fv = PL.$('#favs', view);
    if (fv) fv.onclick = e => { const b = e.target.closest('[data-rehire]'); if (b) PL.rehire(PL.fav(b.dataset.rehire)); };
    PL.heroScene(PL.$('#scene', view));
    /* rueda de oficios */
    const drum = PL.$('#drum', view), ul = drum.querySelector('ul'), lis = Array.from(ul.children);
    let di = 0;
    const spin = () => {
      const h = lis[0].offsetHeight || 66;
      ul.style.transform = `translateY(${drum.offsetHeight / 2 - h / 2 - di * h}px)`;
      lis.forEach((li, k) => { li.className = k === di ? 'on' : Math.abs(k - di) === 1 ? 'n1' : ''; });
      PL.$('#dn', view).textContent = di + 1; PL.$('#dc', view).textContent = PL.cat(drumList[di].c).name;
    };
    spin();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) PL.every(() => { di = (di + 1) % lis.length; spin(); }, 1900);
    const openDrum = () => { const s = drumList[di]; PL.go(`#/pedir/${s.id}?m=${PL.canNow(s) ? PL.mode : 'prog'}`); };
    drum.onclick = openDrum; drum.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrum(); } };
  });

  /* ——— mis pedidos ——— */
  PL.route('pedidos', (view, a, qs) => {
    const all = PL.S.orders.slice().sort((x, y) => y.createdAt - x.createdAt);
    const act = all.filter(o => PL.ACTIVE.includes(o.status) && !PL.isUpcoming(o));
    const prox = all.filter(PL.isUpcoming).sort((x, y) => PL.whenTs(x.when) - PL.whenTs(y.when));
    const past = all.filter(o => !PL.ACTIVE.includes(o.status));
    let tab = qs.get('t') || (act.length ? 'act' : prox.length ? 'prox' : 'past');
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('list')}Tus pedidos</span><h1>Mis pedidos</h1>
      <div class="seg" style="width:min(100%,460px)" role="group" aria-label="Filtrar pedidos"><button type="button" data-t="act">En curso · ${act.length}</button><button type="button" data-t="prox">Próximos · ${prox.length}</button><button type="button" data-t="past">Historial</button></div></div>
      <div class="ords"><a class="ord" href="#/equipo"><span class="svc-ic" style="background:var(--acc-3);color:var(--acc)">${PL.ic('heart')}</span><div class="ord-i"><b>Mis trabajadores</b><span>${PL.S.favs.length ? PL.S.favs.length + ' de confianza · pídeles directo' : 'Guarda a quien te gustó para volver a llamarle'}</span></div>${PL.ic('chev', 'i chev')}</a></div>
      <div id="ol"></div></div>${PL.footer()}`;
    const ol = PL.$('#ol', view);
    function card(o){
      const svc = PL.svc(o.svc);
      return `<a class="ord" href="#/pedido/${o.id}"><span class="svc-ic">${PL.si(svc.i)}</span><div class="ord-i"><b>${PL.esc(svc.n)}</b><span>${o.mode === 'prog' ? PL.esc(PL.whenText(o.when)) : 'Al toque'}${o.repeat && o.repeat !== 'no' ? ' · ' + PL.REPEAT[o.repeat].toLowerCase() : ''} · ${PL.esc(o.district)}</span><span>${o.worker ? PL.esc(PL.short(o.worker.name)) + (o.people > 1 ? ' y equipo' : '') : o.direct ? 'Esperando a ' + PL.esc(PL.short(o.direct)) : 'Sin asignar'}</span></div><div class="ord-r"><b>${PL.money(PL.total(o))}</b>${PL.stPill(o)}</div></a>`;
    }
    const EMPTY = {act: ['No tienes nada en curso', 'Lo que pidas al toque lo sigues desde aquí.'], prox: ['No tienes pedidos programados', 'Programa una limpieza, un evento o una clase con anticipación.'], past: ['Aún no hay historial', 'Aquí quedan tus pedidos terminados.']};
    function draw(){
      PL.$$('[data-t]', view).forEach(b => b.setAttribute('aria-pressed', b.dataset.t === tab));
      const l = {act, prox, past}[tab];
      ol.innerHTML = l.length ? `<div class="ords">${l.map(card).join('')}</div>` :
        `<div class="empty"><svg class="big si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI[tab === 'prox' ? 'otr' : 'caja']}</svg><h3>${EMPTY[tab][0]}</h3><p>${EMPTY[tab][1]}</p><a class="btn btn-a" href="#/" data-m="${tab === 'prox' ? 'prog' : 'ya'}">Pedir un servicio<span class="arr">${PL.ic('arrow')}</span></a></div>`;
      const em = PL.$('[data-m]', ol); if (em) em.onclick = () => { PL.mode = em.dataset.m; };
    }
    PL.$('.seg', view).onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; tab = b.dataset.t; draw(); };
    draw();
  }, {tab: 'pedidos'});

  /* ——— mis trabajadores ——— */
  PL.route('equipo', view => {
    const favs = PL.S.favs;
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h1>Gente de <span class="k">confianza</span></h1><p>Quienes te dieron un buen servicio. Pídeles directo, al toque o para otro día.</p></div>
      <div id="tl"></div></div>${PL.footer()}`;
    const tl = PL.$('#tl', view);
    function draw(){
      tl.innerHTML = favs.length ? `<div class="team-grid">${favs.map(f => {
        const h = PL.history(f.name), sv = favSvcs(f.name).map(id => PL.svc(id).n);
        return `<div class="tcard"><div class="top-r">${PL.avatar(f.name, f.color)}<div><b>${PL.esc(f.name)}</b><div class="meta"><span>${h.length ? `Trabajó contigo ${h.length} ${h.length === 1 ? 'vez' : 'veces'}` : 'De confianza'}</span></div></div><button class="ibtn del" type="button" data-del="${PL.esc(f.name)}" aria-label="Quitar a ${PL.esc(f.name)}">${PL.ic('trash')}</button></div>
          <div class="chips">${sv.map(n => `<span class="pill">${PL.esc(n)}</span>`).join('')}${h[0] ? `<span class="pill o">Última vez: ${PL.esc(PL.fdate(h[0].createdAt))}</span>` : ''}</div>
          <div class="acts"><button class="btn btn-a btn-sm" type="button" data-rehire="${PL.esc(f.name)}">Volver a pedir</button><button class="btn btn-l btn-sm" type="button" data-chat="${PL.esc(f.name)}">${PL.ic('chat')}Escribirle</button></div></div>`;
      }).join('')}</div>` :
        `<div class="empty"><svg class="big i" viewBox="0 0 24 24" aria-hidden="true">${PL.UI.heart}</svg><h3>Aún no guardas a nadie</h3><p>Cuando califiques bien un servicio, guarda a esa persona para volver a llamarle.</p><a class="btn btn-a" href="#/">Pedir un servicio<span class="arr">${PL.ic('arrow')}</span></a></div>`;
    }
    tl.onclick = async e => {
      const r = e.target.closest('[data-rehire]'), c = e.target.closest('[data-chat]'), d = e.target.closest('[data-del]');
      if (r) PL.rehire(PL.fav(r.dataset.rehire));
      if (c) PL.favChat(PL.fav(c.dataset.chat));
      if (d && await PL.confirm({title: '¿Quitar de Mis trabajadores?', text: `Ya no verás a ${PL.esc(d.dataset.del)} en tu lista. Puedes volver a guardarle desde un pedido terminado.`, ok: 'Quitar', cancel: 'Cancelar', danger: true})) { PL.delFav(d.dataset.del); PL.render(); }
    };
    draw();
  }, {tab: 'pedidos'});
})();
