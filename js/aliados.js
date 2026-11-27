/* Agéndalo · página para empresas (como Rappi Aliados): beneficios, pasos, requisitos y registro */
(function(){
  const PL = window.PL;
  const APP = 'app.html';
  const STEPS = ['Contacto', 'Empresa', 'Equipo', 'Documentos'];
  const DOCS = [['ficha', 'Ficha RUC', 'id', true], ['dniRep', 'DNI del representante legal', 'id', true], ['lic', 'Licencia municipal', 'shield', false], ['logo', 'Logo de tu empresa', 'cam', false]];

  function render(){
    const root = PL.$('#ali'), B = PL.S.biz;
    document.body.dataset.view = 'inicio';
    root.innerHTML = `
    <section class="hero"><div class="hero-in">
      <span class="eti" style="color:#FFB08A">${PL.ic('bag')}Agéndalo para empresas</span>
      <h1 class="rise" style="margin-top:22px">Tu empresa, con más clientes <span class="sel"><i aria-hidden="true"></i>cerca</span>.</h1>
      <div class="hero-row rise"><p class="lead">Súmate con tu equipo y recibe pedidos de tu zona en un solo panel.</p>
        <div class="land-ctas"><a class="btn btn-a" href="#registro" data-to="registro">${B ? 'Editar mi empresa' : 'Registrar mi empresa'}<span class="arr">${PL.ic('arrow')}</span></a>${B ? `<a class="btn btn-dl" href="${APP}#/mi-empresa">Ir a mi panel</a>` : `<a class="btn btn-dl" href="index.html">Conoce Agéndalo</a>`}</div></div>
    </div></section>
    <div class="wrap">
      <section class="sec" id="beneficios"><div class="sec-h"><span class="eti">${PL.ic('star')}Beneficios</span><h2>Por qué <span class="k">sumarte</span></h2></div>
        <div class="ali-bens">
          <div><span class="ico">${PL.ic('users')}</span><b>Clientes de tu zona</b><span>Apareces dentro de cada servicio que ofreces.</span></div>
          <div><span class="ico">${PL.ic('list')}</span><b>Tu equipo en un panel</b><span>Recibes solicitudes y las asignas a tu gente.</span></div>
          <div><span class="ico">${PL.ic('chat')}</span><b>Chat y presupuestos</b><span>El cliente te explica y tú pones tu precio.</span></div>
          <div><span class="ico">${PL.ic('wallet')}</span><b>Les pagan en el momento</b><span>En efectivo o como acuerden por el chat.</span></div>
        </div></section>
      <section class="sec" id="pasos"><div class="sec-h"><span class="eti">${PL.ic('bolt')}Cómo unirte</span><h2>Cuatro <span class="k">pasos</span></h2></div>
        <ol class="ali-steps">
          <li><span class="n">1</span><b>Completa el registro</b><span>Contacto, empresa y equipo.</span></li>
          <li><span class="n">2</span><b>Sube tus documentos</b><span>Ficha RUC y DNI del representante.</span></li>
          <li><span class="n">3</span><b>Revisamos tu empresa</b><span>Verificamos el RUC y a tu equipo.</span></li>
          <li><span class="n">4</span><b>Recibes pedidos</b><span>Activas tu panel y asignas a tu gente.</span></li>
        </ol></section>
      <section class="sec" id="requisitos"><div class="sec-h"><span class="eti">${PL.ic('check')}Requisitos</span><h2>Lo que <span class="k">necesitas</span></h2></div>
        <ul class="ali-req">
          <li>${PL.ic('check')}RUC activo (empieza con 10 o 20)</li><li>${PL.ic('check')}Ficha RUC</li><li>${PL.ic('check')}DNI del representante legal</li>
          <li>${PL.ic('check')}Nombre y DNI de cada persona de tu equipo</li><li>${PL.ic('check')}Licencia municipal, si tu rubro la pide</li><li>${PL.ic('check')}Logo de tu empresa (opcional)</li>
        </ul></section>
      <section class="sec" id="registro"><div class="sec-h"><span class="eti">${PL.ic('edit')}Registro</span><h2>${B ? 'Edita tu empresa' : 'Registra tu empresa'}</h2></div>
        <div class="wiz"><div class="wiz-steps" id="ws"></div><div id="wb"></div>
          <div class="wiz-f"><button class="btn btn-l" type="button" id="wBack">Atrás</button><button class="btn btn-t" type="button" id="wNext">Continuar<span class="arr">${PL.ic('arrow')}</span></button></div></div>
      </section>
    </div>
    ${PL.footer()}`;
    wizard();
    document.addEventListener('click', e => { const a = e.target.closest('[data-to]'); if (!a) return; const t = document.getElementById(a.dataset.to); if (t) { e.preventDefault(); t.scrollIntoView({behavior: 'smooth'}); } });
    if (location.hash === '#registro') setTimeout(() => PL.$('#registro').scrollIntoView(), 120);
  }

  function wizard(){
    const S = PL.S, B = S.biz;
    const D = {rep: B ? B.rep || '' : '', phone: B ? B.phone : '', email: B ? B.email || '' : '', n: B ? B.n : '', ruc: B ? B.ruc : '', svcs: B ? B.svcs.slice() : [], d: B ? B.d.slice() : [], about: B ? B.about : '',
      team: B ? B.team.map(m => Object.assign({dni: ''}, m)) : [{name: '', dni: '', role: ''}], docs: B ? Object.assign({}, B.docs) : {}};
    let step = 0;
    const ws = PL.$('#ws'), wb = PL.$('#wb'), next = PL.$('#wNext'), back = PL.$('#wBack');
    const val = id => (PL.$(id, wb) || {}).value || '';
    const roleOpts = sel => D.svcs.map(id => `<option${PL.svc(id).n === sel ? ' selected' : ''}>${PL.esc(PL.svc(id).n)}</option>`).join('') || '<option value="">Elige los servicios en el paso anterior</option>';
    const VIEWS = [
      () => `<div class="row2"><label class="field"><span>Nombre del representante</span><input class="in" id="a-rep" maxlength="60" autocomplete="name" value="${PL.esc(D.rep)}"></label><label class="field"><span>Celular</span><input class="in" id="a-ph" type="tel" inputmode="numeric" maxlength="9" placeholder="9XXXXXXXX" value="${PL.esc(D.phone)}"></label></div>
        <label class="field"><span>Correo <em>(opcional)</em></span><input class="in" id="a-em" type="email" maxlength="80" autocomplete="email" value="${PL.esc(D.email)}"></label>`,
      () => `<div class="row2"><label class="field"><span>Nombre comercial</span><input class="in" id="a-n" maxlength="60" value="${PL.esc(D.n)}"></label><label class="field"><span>RUC</span><input class="in" id="a-ruc" inputmode="numeric" maxlength="11" value="${PL.esc(D.ruc)}"></label></div>
        <p class="blk-t">Servicios que ofrecen <small>Hasta 8</small></p>
        ${PL.CATS.map(c => `<div class="trade-g"><h3>${c.name}</h3><div class="chips">${PL.SVCS.filter(s => s.c === c.id && !s.other).map(s => `<button class="chip" type="button" data-s="${s.id}" aria-pressed="${D.svcs.includes(s.id)}">${PL.esc(s.n)}</button>`).join('')}</div></div>`).join('')}
        <p class="blk-t">Distritos donde atienden</p><div class="chips" id="a-d">${D.d.map(z => `<button class="chip" type="button" aria-pressed="true" data-z="${PL.esc(z)}">${PL.esc(z)} ${PL.ic('x')}</button>`).join('')}<button class="chip" type="button" id="a-addz">${PL.ic('plus')}Agregar distrito</button></div>
        <label class="field" style="margin-top:16px"><span>Cuéntales sobre tu empresa <em>(opcional)</em></span><textarea class="in" id="a-ab" maxlength="240">${PL.esc(D.about)}</textarea></label>`,
      () => `<p class="muted" style="margin-bottom:14px">Las personas que pueden ir a los pedidos. Verificamos su DNI.</p>
        ${D.team.map((m, k) => `<div class="team-row"><label class="field"><span>Nombre y apellido</span><input class="in" data-tn="${k}" maxlength="50" value="${PL.esc(m.name)}"></label><label class="field"><span>DNI</span><input class="in" data-td="${k}" inputmode="numeric" maxlength="8" value="${PL.esc(m.dni || '')}"></label><label class="field"><span>Oficio</span><select class="in" data-tr="${k}">${roleOpts(m.role)}</select></label>${D.team.length > 1 ? `<button class="ibtn" type="button" data-rm="${k}" aria-label="Quitar">${PL.ic('x')}</button>` : ''}</div>`).join('')}
        <button class="btn btn-l btn-sm" type="button" id="a-addt">${PL.ic('plus')}Agregar a alguien</button>`,
      () => `<div class="docs">${DOCS.map(([k, label, ic, req]) => `<label class="doc"><input type="file" accept="image/*,application/pdf" data-doc="${k}"><span class="ico">${PL.ic(D.docs[k] ? 'check' : ic)}</span><span class="tx"><b>${label}</b><span>${req ? 'Requerido' : 'Opcional'}</span></span><span class="pill ${D.docs[k] ? 'v' : 'o'}">${D.docs[k] ? 'Enviado' : 'Subir'}</span></label>`).join('')}</div>
        <label class="check" style="margin-top:18px"><input type="checkbox" id="a-ok"${B ? ' checked' : ''}><span>Confirmo que los datos son reales y autorizo a Agéndalo a verificar el RUC y a mi equipo.</span></label>`
    ];
    function collect(){
      if (step === 0) { D.rep = val('#a-rep').trim(); D.phone = val('#a-ph').trim(); D.email = val('#a-em').trim(); }
      if (step === 1) { D.n = val('#a-n').trim(); D.ruc = val('#a-ruc').trim(); D.about = val('#a-ab').trim(); }
      if (step === 2) D.team = D.team.map((m, k) => ({name: (wb.querySelector(`[data-tn="${k}"]`) || {}).value || '', dni: (wb.querySelector(`[data-td="${k}"]`) || {}).value || '', role: (wb.querySelector(`[data-tr="${k}"]`) || {}).value || ''}));
    }
    function check(){
      collect();
      if (step === 0) { if (D.rep.split(/\s+/).length < 2) return PL.toast('Escribe nombre y apellido del representante'), false; if (!/^9\d{8}$/.test(D.phone)) return PL.toast('El celular tiene 9 dígitos y empieza con 9'), false; }
      if (step === 1) { if (D.n.length < 3) return PL.toast('Escribe el nombre de tu empresa'), false; if (!/^(10|20)\d{9}$/.test(D.ruc)) return PL.toast('El RUC tiene 11 dígitos y empieza con 10 o 20'), false; if (!D.svcs.length) return PL.toast('Elige al menos un servicio'), false; if (!D.d.length) return PL.toast('Agrega al menos un distrito'), false; }
      if (step === 2) { const ok = D.team.filter(m => m.name.trim().split(/\s+/).length >= 2 && /^\d{8}$/.test(m.dni)); if (!ok.length) return PL.toast('Agrega al menos a una persona con nombre, apellido y DNI'), false; }
      if (step === 3) { if (!D.docs.ficha || !D.docs.dniRep) return PL.toast('Sube la ficha RUC y el DNI del representante'), false; if (!PL.$('#a-ok', wb).checked) return PL.toast('Marca la casilla de confirmación'), false; }
      return true;
    }
    function bind(){
      if (step === 1) {
        wb.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { collect(); const id = x.dataset.s, on = !D.svcs.includes(id); if (on && D.svcs.length >= 8) { PL.toast('Máximo 8 servicios'); return; } D.svcs = on ? D.svcs.concat(id) : D.svcs.filter(v => v !== id); draw(); });
        PL.$('#a-addz', wb).onclick = () => { collect(); PL.pickDistrict('', z => { if (!D.d.includes(z)) D.d.push(z); draw(); }); };
        PL.$('#a-d', wb).onclick = e => { const z = e.target.closest('[data-z]'); if (z) { collect(); D.d = D.d.filter(v => v !== z.dataset.z); draw(); } };
      }
      if (step === 2) {
        PL.$('#a-addt', wb).onclick = () => { collect(); D.team.push({name: '', dni: '', role: ''}); draw(); };
        wb.querySelectorAll('[data-rm]').forEach(x => x.onclick = () => { collect(); D.team.splice(Number(x.dataset.rm), 1); draw(); });
      }
      if (step === 3) wb.querySelectorAll('[data-doc]').forEach(inp => inp.onchange = () => { if (inp.files[0]) { const ok = PL.$('#a-ok', wb).checked; D.docs[inp.dataset.doc] = true; draw(); PL.$('#a-ok', wb).checked = ok; } });
    }
    function draw(){
      ws.innerHTML = STEPS.map((t, i) => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}">${i < step ? PL.ic('check') : ''}${t}</span>`).join('');
      wb.innerHTML = VIEWS[step]();
      back.style.visibility = step ? 'visible' : 'hidden';
      next.innerHTML = step === 3 ? (B ? 'Guardar cambios' : 'Enviar registro') : `Continuar<span class="arr">${PL.ic('arrow')}</span>`;
      bind();
    }
    back.onclick = () => { collect(); step = Math.max(0, step - 1); draw(); };
    next.onclick = () => {
      if (!check()) return;
      if (step < 3) { step++; draw(); PL.$('#registro').scrollIntoView({behavior: 'smooth'}); return; }
      const team = D.team.filter(m => m.name.trim().split(/\s+/).length >= 2 && /^\d{8}$/.test(m.dni)), svc0 = PL.svc(D.svcs[0]);
      S.biz = Object.assign(B || {id: 'mi-empresa', c: '#FFE3D4', jobs: [], online: false, createdAt: Date.now()}, {rep: D.rep, phone: D.phone, email: D.email, n: D.n, ruc: D.ruc, svcs: D.svcs, d: D.d, about: D.about || `Servicios de ${svc0.n.toLowerCase()}.`, team: team.map(m => ({name: m.name.trim(), dni: m.dni, role: m.role || svc0.n})), docs: D.docs, i: svc0.i, tag: svc0.n});
      PL.save();
      PL.toSheet({tipo: 'empresa', representante: D.rep, celular: D.phone, correo: D.email, nombre: D.n, ruc: D.ruc, servicios: D.svcs.map(id => PL.svc(id).n).join(', '), distritos: D.d.join(', '), equipo: team.map(m => `${m.name} (${m.role})`).join('; ')});
      PL.$('.wiz').innerHTML = `<div class="wiz-done"><span class="done-ic">${PL.ic('check')}</span><h3>${B ? 'Cambios guardados' : 'Recibimos tu registro'}</h3><p class="muted">${B ? 'Tu página ya muestra los cambios.' : 'Revisamos el RUC y los documentos, y te avisamos en tu panel cuando tu empresa esté activa.'}</p><a class="btn btn-a" href="${APP}#/mi-empresa">Ir a mi panel<span class="arr">${PL.ic('arrow')}</span></a></div>`;
    };
    draw();
  }
  window.addEventListener('DOMContentLoaded', render);
})();
