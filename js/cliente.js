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

  /* volver a contratar a la misma persona: inmediato o programado */
  PL.rehire = (w, svcId, reId) => {
    if (!PL.fav(w.name)) PL.addFav(w);
    const f = PL.fav(w.name), list = favSvcs(f.name);
    let sel = svcId || list[0] || 'otro';
    const first = f.name.split(' ')[0];
    PL.sheet({title: `Volver a pedir a <span class="k">${PL.esc(first)}</span>`,
      body: `<div class="direct">${PL.avatar(f.name, f.color)}<div><b>${PL.esc(f.name)}</b><span>Ya trabajó contigo</span></div><span class="heart" aria-hidden="true">${PL.ic('heart')}</span></div>
        ${list.length > 1 ? `<p class="blk-t">¿Qué servicio?</p><div class="chips" id="rs">${list.map(id => `<button class="chip" type="button" data-s="${id}" aria-pressed="${id === sel}">${PL.esc(PL.svc(id).n)}</button>`).join('')}</div><p class="blk-t">¿Cuándo?</p>` : ''}
        <div class="rehire"><button class="ya" type="button" data-m="ya"><span class="ic">${PL.ic('bolt')}</span><span><b>Inmediato</b><span>Hoy, lo antes posible</span></span></button><button class="prog" type="button" data-m="prog"><span class="ic">${PL.ic('cal')}</span><span><b>Programado</b><span>Elige día y hora</span></span></button></div>
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

  /* ——— inicio de la app (la explicación está en la landing, index.html) ——— */
  PL.route('', (view, args, qs) => {
    const S = PL.S;
    if (qs.get('m') === 'ya' || qs.get('m') === 'prog') PL.mode = qs.get('m');
    const act = PL.activeOrders().filter(o => !PL.isUpcoming(o))[0] || PL.activeOrders()[0];
    const first = S.client.name ? S.client.name.split(' ')[0] : '';
    view.innerHTML = `
    <section class="app-top"><div class="wrap">
      <div class="app-top-in">
        <div><button class="loc-eti" type="button" id="hloc" aria-label="Cambiar distrito">${PL.ic('pin')}<span>${PL.esc(S.client.district || 'Elige tu distrito')}</span>${PL.ic('chev')}</button>
          <h1>${first ? `Hola, ${PL.esc(first)}.` : 'Hola.'} <span class="k">¿Qué necesitas?</span></h1></div>
        <div class="search-box">${PL.ic('search')}<input id="hq" type="search" placeholder="Busca: gasfitero, niñera, chofer…" aria-label="Buscar un servicio" autocomplete="off"></div>
      </div>
      <div class="mode-pick" role="group" aria-label="Cómo lo necesitas">
        <button class="mp ya" type="button" data-mode="ya"><span class="mi">${PL.ic('bolt')}</span><span><b>Inmediato</b><span>Atención en minutos</span></span></button>
        <button class="mp prog" type="button" data-mode="prog"><span class="mi">${PL.ic('cal')}</span><span><b>Programado</b><span>Elige día y hora</span></span></button>
      </div>
    </div></section>
    <div class="wrap">
      ${act ? live(act) : ''}
      ${S.favs.length ? `<section class="favs-sec"><div class="favs-h"><div><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h2>Vuelve a llamar a quien te gustó</h2></div><a href="#/equipo">Ver todos</a></div><div class="favs" id="favs">${S.favs.map(favCard).join('')}</div></section>` : ''}
      <section class="app-cat" id="servicios">
        <div class="app-cat-h"><h2>Servicios</h2></div>
        <div class="cat-rail" id="rail" role="group" aria-label="Filtrar por categoría"></div>
        <p class="muted" id="resTxt" hidden style="margin:0 0 14px"></p>
        <div class="svc-grid" id="grid"></div>
      </section>
      <section class="sec" id="empresas">
        <div class="sec-h"><span class="eti">${PL.ic('bag')}Empresas</span><h2>Empresas</h2></div>
        <div class="ords">${PL.bizList().slice(0, 4).map(PL.bizRow).join('')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:22px"><a class="btn btn-t" href="#/empresas">Ver todas las empresas<span class="arr">${PL.ic('arrow')}</span></a><a class="btn btn-l" href="#/empresa-registro">Registrar mi empresa</a></div>
      </section>
    </div>
    ${PL.footer()}`;

    let cat = 'todos', q = qs.get('q') || '';
    const grid = PL.$('#grid', view), rail = PL.$('#rail', view), res = PL.$('#resTxt', view), hq = PL.$('#hq', view);
    const cats = [{id: 'todos', name: 'Todos'}].concat(PL.CATS);
    function drawMode(){
      PL.$$('[data-mode]', view).forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === PL.mode));
    }
    function drawRail(){ rail.innerHTML = cats.map(c => `<button class="chip" type="button" data-c="${c.id}" aria-pressed="${c.id === cat}">${c.name}</button>`).join(''); }
    function draw(){
      const nq = PL.norm(q.trim());
      const list = PL.SVCS.filter(s => (nq || PL.mode === 'prog' || PL.canNow(s)) && (cat === 'todos' || s.c === cat || s.other) && (!nq || PL.norm(s.n + ' ' + s.t.join(' ') + ' ' + PL.cat(s.c).name).includes(nq)));
      res.hidden = true;
      grid.innerHTML = list.length ? list.map(s => tile(s, PL.mode)).join('') :
        `<div class="svc-empty empty"><svg class="big si" viewBox="0 0 48 48" aria-hidden="true">${PL.SI.otr}</svg><h3>No encontramos “${PL.esc(q.trim())}”</h3><p>Pídelo igual: lo describes y te llegan ofertas.</p><a class="btn btn-t" href="#/pedir/otro?m=${PL.mode}&d=${encodeURIComponent(q.trim())}">Pedir “${PL.esc(q.trim())}”</a></div>`;
    }
    hq.value = q;
    drawMode(); drawRail(); draw();
    PL.$('.mode-pick', view).onclick = e => { const b = e.target.closest('[data-mode]'); if (!b) return; PL.mode = b.dataset.mode; drawMode(); draw(); };
    rail.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; drawRail(); draw(); };
    grid.onclick = e => { const b = e.target.closest('[data-svc]'); if (!b) return; const s = PL.svc(b.dataset.svc); PL.go(`#/pedir/${s.id}?m=${PL.canNow(s) ? PL.mode : 'prog'}`); };
    hq.oninput = () => { q = hq.value; if (q) { cat = 'todos'; drawRail(); } draw(); };
    hq.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); hq.blur(); PL.$('#servicios', view).scrollIntoView({behavior: 'smooth'}); } };
    PL.$('#hloc', view).onclick = () => PL.pickDistrict(S.client.district, d => { S.client.district = d; PL.save(); PL.$('#hloc span', view).textContent = d; });
    const fv = PL.$('#favs', view);
    if (fv) fv.onclick = e => { const b = e.target.closest('[data-rehire]'); if (b) PL.rehire(PL.fav(b.dataset.rehire)); };
    if (q) PL.$('#servicios', view).scrollIntoView();
  });

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
