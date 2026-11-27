/* Agéndalo · lado del cliente: inicio, mis pedidos y mis trabajadores */
(function(){
  const PL = window.PL;
  PL.mode = PL.mode || 'prog';

  PL.stLabel = o => {
    const w = o.worker ? PL.short(o.worker.name) : '';
    return ({
      buscando: [o.mode === 'prog' ? 'Recibiendo ofertas' : 'Buscando trabajador…', 'a'], programado: [o.when && o.when.type === 'flex' ? `${w} · fecha a coordinar` : `${w} va el ${PL.whenText(o.when).toLowerCase()}`, 'm'],
      en_camino: [`${w} está en camino`, 'a'], llego: [`${w} llegó`, 'v'], trabajando: [`${w} está trabajando`, 'v'],
      calificar: [`Califica a ${w}`, 'a'], terminado: ['Terminado', 'v'], cancelado: ['Cancelado', 'r']
    })[o.status] || [o.status, 'o'];
  };
  const SHORT = {buscando: 'Ofertas', programado: 'Programado', en_camino: 'En camino', llego: 'Llegó', trabajando: 'Trabajando', calificar: 'Por calificar', terminado: 'Terminado', cancelado: 'Cancelado'};
  PL.stPill = o => `<span class="pill ${PL.stLabel(o)[1]}">${SHORT[o.status] || o.status}</span>`;


  function live(o){
    const svc = PL.svc(o.svc);
    return `<a class="live rise" href="#/pedido/${o.id}"><span class="pulse" aria-hidden="true"></span><div><div class="t">${PL.esc(PL.stLabel(o)[0])}</div><div class="s">${PL.esc(svc.n)} · ${PL.esc(o.district)}</div></div><span class="btn btn-w btn-sm">Ver</span></a>`;
  }
  const favSvcs = name => [...new Set(PL.history(name).map(o => o.svc))];
  function favCard(f){
    const sv = favSvcs(f.name).map(id => PL.svc(id).n);
    return `<div class="fav"><div class="top-r">${PL.avatar(f.name, f.color, 's')}<div><b>${PL.esc(PL.short(f.name))}</b><span>${PL.esc(sv.slice(0, 2).join(', ') || 'De confianza')}</span></div><span class="heart" aria-hidden="true">${PL.ic('heart')}</span></div><button class="btn btn-t btn-sm" type="button" data-rehire="${PL.esc(f.name)}">Volver a pedir</button></div>`;
  }

  /* volver a contratar a la misma persona: inmediato o programado */
  PL.rehire = (w, svcId, reId) => {
    if (!PL.fav(w.name)) PL.addFav(w);
    const f = PL.fav(w.name), list = favSvcs(f.name);
    let sel = svcId || list[0] || 'otro';
    const first = f.name.split(' ')[0];
    PL.sheet({title: `Volver a pedir a <span class="k">${PL.esc(first)}</span>`,
      body: `<div class="direct">${PL.avatar(f.name, f.color)}<div><b>${PL.esc(f.name)}</b><span>Ya trabajó contigo</span></div><span class="heart" aria-hidden="true">${PL.ic('heart')}</span></div>
        ${list.length > 1 ? `<p class="blk-t">¿Qué servicio?</p><div class="chips" id="rs">${list.map(id => `<button class="chip" type="button" data-s="${id}" aria-pressed="${id === sel}">${PL.esc(PL.svc(id).n)}</button>`).join('')}</div><p class="blk-t">¿Cuándo?</p>` : ''}
        <div class="rehire"><button class="prog" type="button" data-m="prog"><span class="ic">${PL.ic('cal')}</span><span><b>Agendar</b><span>Eliges día y hora</span></span></button><button class="ya" type="button" data-m="ya"><span class="ic">${PL.ic('bolt')}</span><span><b>Lo antes posible</b><span>Hoy mismo, si puede</span></span></button></div>
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

  /* ——— inicio de la app: sencillo, como una app de comida ———
     Entras y vas directo a lo que necesitas: Servicios (profesionales y oficios), y debajo Emergencia y Pedido personalizado.
     Las empresas no tienen zona propia: aparecen al pedir un servicio, antes que las personas independientes. */
  const examples = s => s.other ? 'Lo describes y te llegan ofertas' : s.t.slice(0, 2).join(' · ');
  /* servicio: fila con su ícono plano · sector: tarjeta de color con su ícono */
  PL.svcRow = s => `<button class="svc-row" type="button" data-svc="${s.id}" data-c="${s.c}"><span class="svc-ic">${PL.si(s.i)}</span><span class="sr-t"><b>${PL.esc(s.n)}</b><span>${PL.esc(examples(s))}</span></span>${s.team ? `<span class="sr-team" title="Puedes pedir varias personas">${PL.ic('users')}</span>` : ''}${PL.ic('chev', 'i chev')}</button>`;
  PL.sectCard = c => PL.sectCell(c);
  const locTxt = l => l && l.line ? `${l.line}, ${l.district}` : l && l.district ? l.district : 'Elige dónde necesitas el servicio';
  const goSvc = e => { const b = e.target.closest('[data-svc]'); if (b) PL.go(`#/pedir/${b.dataset.svc}`); };

  PL.route('', (view, args, qs) => {
    const S = PL.S;
    const act = PL.activeOrders().filter(o => !PL.isUpcoming(o))[0] || PL.activeOrders()[0];
    const me = PL.me(), first = me && me.name ? me.name.split(' ')[0] : '';
    const loc = PL.startLoc ? PL.startLoc() : null;
    view.innerHTML = `
    <section class="home-hero">
      <div class="hh-map" id="hmap" title="Cambiar dirección"></div>
      <div class="hh-in">
        <button class="loc-eti" type="button" id="hloc" aria-label="Cambiar dirección">${PL.ic('pin')}<span>${PL.esc(locTxt(S.lastLoc || loc))}</span>${PL.ic('chev')}</button>
        <h1>${first ? `Hola, ${PL.esc(first)}.` : 'Hola.'} <span class="k">¿Qué necesitas?</span></h1>
        <div class="search-box">${PL.ic('search')}<input id="hq" type="search" placeholder="Busca: gasfitero, uñas, masajes, niñera…" aria-label="Buscar un servicio" autocomplete="off"></div>
      </div>
    </section>
    ${act ? `<div class="wrap">${live(act)}</div>` : ''}
    <div id="entries">${PL.entryBand()}</div>
    <div class="wrap">
      <section class="sres" id="sres" hidden><div class="feat-h"><h2>Resultados</h2></div><div id="grid"></div></section>
      ${S.favs.length ? `<section class="favs-sec"><div class="favs-h"><div><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h2>Vuelve a llamar a quien te gustó</h2></div><a href="#/equipo">Ver todos</a></div><div class="favs" id="favs">${S.favs.map(favCard).join('')}</div></section>` : ''}
    </div>
    ${PL.footer()}`;

    /* mapa de tu zona: no se arrastra (la página tiene que poder bajar); tocarlo cambia la dirección */
    const hmap = PL.$('#hmap', view), here = loc ? [loc.lat, loc.lng] : PL.zoneCenter('Miraflores');
    const hm = PL.map(hmap, {center: here, zoom: 14.5, drag: false, zones: {mask: true}, label: 'Tu zona en el mapa', me: !!loc});
    const shift = () => { if (hm.map && PL.isDesk()) hm.map.panBy([-Math.round(hmap.clientWidth * .2), 0], {animate: false}); };
    shift();
    const pickAddr = () => PL.addrSheet(ad => { PL.$('#hloc span', view).textContent = locTxt(ad); hm.setMe([ad.lat, ad.lng], {zoom: 15}); shift(); });
    hmap.onclick = pickAddr;
    PL.$('#hloc', view).onclick = pickAddr;

    /* buscar: los servicios que coinciden reemplazan a las entradas mientras escribes */
    const grid = PL.$('#grid', view), hq = PL.$('#hq', view);
    let q = qs.get('q') || '';
    function draw(){
      const nq = PL.norm(q.trim());
      PL.$('#entries', view).hidden = !!nq; PL.$('#sres', view).hidden = !nq;
      if (!nq) return;
      const list = PL.SVCS.filter(s => PL.norm(s.n + ' ' + s.t.join(' ') + ' ' + PL.cat(s.c).name + ' ' + (s.g || '')).includes(nq));
      grid.innerHTML = list.length ? `<div class="svc-list">${list.map(PL.svcRow).join('')}</div>` :
        `<div class="svc-empty empty"><svg class="big si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI.otr}</svg><h3>No encontramos “${PL.esc(q.trim())}”</h3><p>Pídelo igual: lo describes y te llegan ofertas.</p><a class="btn btn-t" href="#/pedir/otro?d=${encodeURIComponent(q.trim())}">Pedir “${PL.esc(q.trim())}”</a></div>`;
    }
    grid.onclick = goSvc;
    hq.value = q; draw();
    hq.oninput = () => { q = hq.value; draw(); };
    hq.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); hq.blur(); } };
    const fv = PL.$('#favs', view);
    if (fv) fv.onclick = e => { const b = e.target.closest('[data-rehire]'); if (b) PL.rehire(PL.fav(b.dataset.rehire)); };
  });

  /* ——— todos los servicios, por sector ——— */
  PL.route('servicios', view => {
    view.innerHTML = `<section class="sector-h" data-c="hogar"><div class="wrap">
        <a class="sector-back" href="#/">${PL.ic('back')}Inicio</a>
        <div class="sector-t"><div><h1>Servicios</h1><p>Profesionales y oficios, por sector.</p></div></div>
      </div></section>
      <div class="modes sg" id="sects">${PL.CATS.map(PL.sectCard).join('')}</div>
      <div class="wrap">
        <a class="row-btn custom-row" href="#/pedir/otro">${PL.ic('plus')}<span><b>¿No está lo que buscas?</b><span>Haz un pedido personalizado: lo describes y te llegan ofertas</span></span>${PL.ic('chev', 'i chev')}</a>
      </div>${PL.footer()}`;
  }, {tab: ''});

  /* ——— un sector: sus servicios en tarjetas, agrupados si el sector tiene grupos (Hogar: reparaciones y limpieza) ——— */
  PL.route('sector', (view, args) => {
    const c = PL.CATS.find(x => x.id === args[0]);
    if (!c) { PL.go('#/servicios'); return; }
    const list = PL.SVCS.filter(s => s.c === c.id && !s.other);
    const groups = [...new Set(list.map(s => s.g).filter(Boolean))];
    const others = PL.CATS.filter(x => x.id !== c.id);
    view.innerHTML = `<section class="sector-h" data-c="${c.id}"><div class="wrap">
        <a class="sector-back" href="#/servicios">${PL.ic('back')}Servicios</a>
        <div class="sector-t">${PL.art(c.id, 'sh-art')}<div><h1>${PL.esc(c.name)}</h1><p>${PL.esc(c.d || '')}</p></div></div>
      </div></section>
      <div class="wrap" id="sv">
        ${groups.length ? groups.map(g => `<div class="cat-block"><h3>${PL.esc(g)}</h3><div class="svc-list">${list.filter(s => s.g === g).map(PL.svcRow).join('')}</div></div>`).join('') : `<div class="cat-block"><div class="svc-list">${list.map(PL.svcRow).join('')}</div></div>`}
        <a class="row-btn custom-row" href="#/pedir/otro">${PL.ic('plus')}<span><b>¿No está lo que buscas?</b><span>Haz un pedido personalizado: lo describes y te llegan ofertas</span></span>${PL.ic('chev', 'i chev')}</a>
        <section class="sec"><div class="feat-h"><h2>Otros servicios</h2></div><div class="modes sg bleed">${others.map(PL.sectCard).join('')}</div></section>
      </div>${PL.footer()}`;
    PL.$('#sv', view).onclick = goSvc;
  }, {tab: ''});

  /* ——— emergencia: lo más común, directo a "lo antes posible" ——— */
  const EMERG = [
    ['gasfitero', 'Fuga de agua', 'Hay agua saliendo y no para'],
    ['gasfitero', 'Destapar desagüe', 'Un desagüe o inodoro atorado'],
    ['electricista', 'Se fue la luz', 'Sin luz en casa o un enchufe que chispea'],
    ['cerrajero', 'Me quedé afuera', 'No puedes entrar a tu casa'],
    ['todero', 'Arreglo pequeño', 'Algo se rompió y hay que arreglarlo hoy'],
    ['veterinaria', 'Emergencia', 'Tu mascota está mal'],
    ['enfermeria', 'Curaciones', 'Una curación o un inyectable hoy']
  ];
  PL.route('emergencia', view => {
    view.innerHTML = `<section class="sector-h emerg-h"><div class="wrap">
        <a class="sector-back" href="#/">${PL.ic('back')}Inicio</a>
        <div class="sector-t">${PL.art('emergencia', 'sh-art')}<div><h1>¿Cuál es la emergencia?</h1><p>Elige y te mostramos quién puede ir hoy mismo, lo antes posible.</p></div></div>
      </div></section>
      <div class="wrap">
        <p class="sos">${PL.ic('alert')}<span>Si hay riesgo para la vida, un incendio o un delito, llama primero: <a href="tel:116">Bomberos 116</a> · <a href="tel:106">SAMU 106</a> · <a href="tel:105">Policía 105</a></span></p>
        <div class="svc-list" id="em">${EMERG.filter(([id]) => PL.svc(id)).map(([id, t, d]) => { const sv = PL.svc(id); return `<a class="svc-row" href="#/pedir/${id}?m=ya&t=${encodeURIComponent(t)}" data-c="${sv.c}"><span class="svc-ic">${PL.si(sv.i)}</span><span class="sr-t"><b>${PL.esc(t)}</b><span>${PL.esc(d)} · ${PL.esc(sv.n)}</span></span>${PL.ic('chev', 'i chev')}</a>`; }).join('')}
          <a class="svc-row" href="#/pedir/otro?m=ya" data-c="ayuda"><span class="svc-ic">${PL.si('otr')}</span><span class="sr-t"><b>Otra emergencia</b><span>Cuéntanos qué pasa y te llegan ofertas</span></span>${PL.ic('chev', 'i chev')}</a></div>
      </div>${PL.footer()}`;
  }, {tab: ''});

  /* ——— mis pedidos ——— */
  PL.route('pedidos', (view, a, qs) => {
    const all = PL.S.orders.slice().sort((x, y) => y.createdAt - x.createdAt);
    const act = all.filter(o => PL.ACTIVE.includes(o.status) && !PL.isUpcoming(o));
    const prox = all.filter(PL.isUpcoming).sort((x, y) => PL.whenTs(x.when) - PL.whenTs(y.when));
    const past = all.filter(o => !PL.ACTIVE.includes(o.status));
    let tab = qs.get('t') || (act.length ? 'act' : prox.length ? 'prox' : 'past');
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('list')}Tus pedidos</span><h1>Mis pedidos</h1>
      <div class="seg" style="width:min(100%,460px)" role="group" aria-label="Filtrar pedidos"><button type="button" data-t="act">En curso</button><button type="button" data-t="prox">Próximos</button><button type="button" data-t="past">Historial</button></div></div>
      <div class="ords"><a class="ord" href="#/equipo"><span class="svc-ic" style="background:var(--acc-3);color:var(--acc)">${PL.ic('heart')}</span><div class="ord-i"><b>Mis trabajadores</b><span>Quienes te gustaron, para pedirles directo</span></div>${PL.ic('chev', 'i chev')}</a></div>
      <div id="ol"></div></div>${PL.footer()}`;
    const ol = PL.$('#ol', view);
    function card(o){
      const svc = PL.svc(o.svc);
      return `<a class="ord" href="#/pedido/${o.id}"><span class="svc-ic">${PL.si(svc.i)}</span><div class="ord-i"><b>${PL.esc(svc.n)}</b><span>${o.mode === 'prog' ? PL.esc(PL.whenText(o.when)) : 'Inmediato'}${o.repeat && o.repeat !== 'no' ? ' · ' + PL.REPEAT[o.repeat].toLowerCase() : ''} · ${PL.esc(o.district)}</span><span>${o.worker ? PL.esc(PL.short(o.worker.name)) + (o.people > 1 ? ' y equipo' : '') : o.direct ? 'Esperando a ' + PL.esc(PL.short(o.direct)) : 'Sin asignar'}</span></div><div class="ord-r"><b>${PL.money(PL.total(o))}</b>${PL.stPill(o)}</div></a>`;
    }
    const EMPTY = {act: ['No tienes nada en curso', 'Aquí sigues tus solicitudes inmediatas.'], prox: ['No tienes pedidos programados', 'Programa una limpieza, un evento o una clase con anticipación.'], past: ['Aún no hay historial', 'Aquí quedan tus pedidos terminados.']};
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
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h1>Gente de <span class="k">confianza</span></h1><p>Quienes te dieron un buen servicio. Solicítales directamente, de inmediato o con anticipación.</p></div>
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
