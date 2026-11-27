/* Agéndalo · vitrina de un servicio y perfil de cada persona
   Como entrar a un restaurante en una app de reparto: arriba, las empresas que atienden tu zona (les pides
   y ellas te envían a alguien de su equipo); abajo, las personas independientes que llegan hasta tu dirección,
   con su foto, su descripción y su experiencia. Al elegir a alguien sigues con el pedido (qué, cuándo, dónde). */
(function(){
  const PL = window.PL;
  const locTxt = l => l.line ? `${l.line}, ${l.district}` : l.district;

  /* cambiar la dirección: tus direcciones guardadas o, si no hay, el distrito */
  PL.changeLoc = cb => {
    const S = PL.S;
    if ((S.addresses || []).some(a => a.lat)) { PL.addrSheet(() => cb(PL.startLoc())); return; }
    PL.pickDistrict(S.lastLoc && S.lastLoc.district, d => {
      const c = PL.zoneCenter(d);
      S.lastLoc = {lat: c[0], lng: c[1], district: d, line: '', floor: '', ref: ''}; S.client.district = d; PL.save();
      cb(PL.startLoc());
    });
  };

  const q = (ya, t, extra = '') => `m=${ya ? 'ya' : 'prog'}${t ? '&t=' + encodeURIComponent(t) : ''}${extra}`;
  const bizCard = (b, svc, ya, t) => `<a class="st-b" href="#/empresa/${b.id}?s=${svc.id}&${q(ya, t)}" style="--bc:${b.c}">
      ${PL.bizLogo(b)}
      <b>${PL.esc(b.n)}</b><span class="st-b-tag">${PL.esc(b.tag)}</span><p>${PL.esc(b.about)}</p>
      <span class="st-b-go">Ver la empresa${PL.ic('arrow')}</span></a>`;
  const proRow = ({w, km}, ya, t) => `<a class="st-p" href="#/pro/${w.id}?${q(ya, t)}">
      <div class="st-p-t"><b>${PL.esc(w.name)}<span class="vf" title="Verificado">${PL.ic('check')}</span></b>
        <span class="st-p-h">${PL.esc(w.title)}</span><p>${PL.esc(w.blurb)}</p>
        <span class="st-p-m"><span>${PL.ic('pin')}${PL.esc(w.district)} · a ${PL.kmTxt(km)}</span>${w.now ? `<span class="ok">${PL.ic('bolt')}Puede ir hoy</span>` : ''}</span></div>
      <span class="st-p-ph">${PL.face(w.name)}</span></a>`;

  PL.route('servicio', (view, args, qs) => {
    const svc = PL.svc(args[0]);
    if (!svc || svc.other) { PL.go('#/pedir/otro'); return; }
    const ya = qs.get('m') === 'ya' && PL.canNow(svc), t = qs.get('t') || '', cat = PL.cat(svc.c);
    let loc = PL.startLoc();
    function draw(){
      const near = loc ? PL.prosNear(svc.id, loc, {now: ya}) : [], biz = loc ? PL.bizNear(svc.id, loc.district) : [];
      view.innerHTML = `<section class="st-h" data-c="${svc.c}"><div class="st-h-in">
          <a class="sector-back" href="${ya ? '#/emergencia' : '#/sector/' + svc.c}">${PL.ic('back')}${ya ? 'Emergencia' : PL.esc(cat.name)}</a>
          <div class="st-row"><div><h1>${PL.esc(t || svc.n)}</h1><p>${t ? PL.esc(svc.n) : PL.esc(svc.t.join(' · '))}</p></div>${PL.art(svc.c, 'st-art', true)}</div>
          <div class="st-bar"><button class="st-loc" type="button" id="stLoc">${PL.ic('pin')}<span>${loc ? 'Cerca de ' + PL.esc(locTxt(loc)) : 'Elige dónde necesitas el servicio'}</span>${PL.ic('chev')}</button>
            ${ya ? `<span class="pill a">${PL.ic('bolt')}Lo antes posible</span>` : ''}</div>
        </div></section>
        ${!loc ? `<div class="st-empty"><b>¿Dónde necesitas el servicio?</b><span>Te mostramos a quienes llegan hasta tu dirección.</span><button class="btn btn-t" type="button" data-loc>${PL.ic('pin')}Elegir mi ubicación</button></div>` : ''}
        ${biz.length ? `<section class="st-biz">${biz.map(b => bizCard(b, svc, ya, t)).join('')}</section>` : ''}
        ${loc && near.length ? `<section class="st-pros">${near.map(x => proRow(x, ya, t)).join('')}</section>` : ''}
        ${loc && !near.length && !biz.length ? `<div class="st-empty"><b>Por ahora nadie de este servicio llega a ${PL.esc(loc.district)}${ya ? ' hoy' : ''}.</b><span>Publica tu pedido y te avisamos cuando alguien pueda ir.</span></div>` : ''}
        ${loc ? `<a class="row-btn st-pub" href="#/pedir/${svc.id}?${q(ya, t, '&pub=1')}">${PL.ic('users')}<span><b>${near.length || biz.length ? '¿Prefieres recibir ofertas?' : 'Publicar mi pedido'}</b><span>Cuentas lo que necesitas y te escriben quienes pueden ir</span></span>${PL.ic('chev', 'i chev')}</a>` : ''}
        ${PL.footer()}`;
      const change = () => PL.changeLoc(l => { loc = l; draw(); });
      PL.$('#stLoc', view).onclick = change;
      const lb = PL.$('[data-loc]', view); if (lb) lb.onclick = change;
    }
    draw();
  }, {tab: ''});

  /* ——— perfil de una persona: su foto, lo que hace, su experiencia y dónde atiende ——— */
  PL.route('pro', (view, args, qs) => {
    const w = PL.pro(args[0]);
    if (!w) { PL.go('#/'); return; }
    const svc = PL.svc(w.svc), ya = qs.get('m') === 'ya' && PL.canNow(svc) && w.now, t = qs.get('t') || '';
    const loc = PL.startLoc(), km = loc && loc.lat ? PL.km([loc.lat, loc.lng], w.pos) : null;
    const first = w.name.split(' ')[0];
    const hire = `#/pedir/${svc.id}?w=${encodeURIComponent(w.name)}&pro=${w.id}&${q(ya, t)}`;
    const cta = ya ? `Pedir a ${PL.esc(first)} ahora` : `Agendar con ${PL.esc(first)}`;
    view.innerHTML = `<section class="st-h" data-c="${svc.c}"><div class="st-h-in">
        <a class="sector-back" href="#/servicio/${svc.id}?${q(ya, t)}">${PL.ic('back')}${PL.esc(svc.n)}</a>
        <div class="pf-top"><span class="pf-ph">${PL.face(w.name)}</span>
          <div class="pf-id"><h1>${PL.esc(w.name)}</h1><p class="pf-tt">${PL.esc(w.title)}</p>
            <div class="pf-badges"><span class="pill v">${PL.ic('check')}DNI verificado</span><span class="pill v">${PL.ic('shield')}Antecedentes revisados</span>${w.now ? `<span class="pill a">${PL.ic('bolt')}Puede ir hoy</span>` : ''}</div></div>
          <div class="pf-cta"><a class="btn btn-a" href="${hire}">${cta}<span class="arr">${PL.ic('arrow')}</span></a><button class="btn btn-l" type="button" id="pfChat">${PL.ic('chat')}Escribirle</button></div>
        </div></div></section>
      <div class="pf-body">
        <section class="pf-sec pf-about"><h2>Sobre mí</h2><p>${PL.esc(w.bio)}</p></section>
        <section class="pf-sec"><h2>Lo que hago</h2><ul class="pf-does">${w.does.map(x => `<li>${PL.ic('check')}${PL.esc(x)}</li>`).join('')}</ul></section>
        <section class="pf-sec"><h2>Experiencia</h2><ol class="pf-cv">${w.cv.map(c => `<li><b>${PL.esc(c.r)}</b><span>${PL.esc(c.p)}</span><em>${PL.esc(c.y)}</em></li>`).join('')}</ol>${w.edu ? `<p class="pf-edu">${PL.ic('id')}${PL.esc(w.edu)}</p>` : ''}</section>
        <section class="pf-sec pf-wide"><h2>Dónde y cuándo</h2><dl class="pf-dl"><dt>Zona</dt><dd>${PL.esc(w.district)}${km != null ? ` · a ${PL.kmTxt(km)} de ti` : ''}</dd><dt>Atiende en</dt><dd>${PL.esc(PL.proZones(w).join(', '))}</dd><dt>Horario</dt><dd>${PL.esc(w.days)}, ${PL.esc(w.hours)}</dd></dl></section>
      </div>
      <div class="pf-sticky"><a class="btn btn-a btn-full" href="${hire}">${cta}<span class="arr">${PL.ic('arrow')}</span></a></div>
      ${PL.footer()}`;
    PL.$('#pfChat', view).onclick = () => {
      const S = PL.S; S.proChats = S.proChats || {};
      const st = S.proChats[w.id] = S.proChats[w.id] || {msgs: [], stage: 0};
      PL.quoteChat({w: PL.proW(w), svc, whenTxt: ya ? 'Lo antes posible' : 'Cuando lo acuerden', tasks: t ? [t] : [], price: 0, msgs: st.msgs, state: st, save: PL.save,
        onAccept: (amt, sum) => PL.go(`${hire}&p=${amt}&d=${encodeURIComponent(sum || '')}`)});
    };
  }, {tab: ''});
})();
