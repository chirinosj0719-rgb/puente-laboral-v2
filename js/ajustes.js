/* Agéndalo · cuenta: ingresar, perfil, direcciones, billetera, notificaciones, ajustes, legal y Libro de Reclamaciones */
(function(){
  const PL = window.PL;
  const page = (ic, eti, title, body) => `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic(ic)}${eti}</span><h1>${title}</h1></div><div class="set">${body}</div></div>${PL.footer()}`;
  const hash = async t => {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return 'h' + h; }
  };
  const okMail = m => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);

  /* ——— ingresar / crear cuenta ——— */
  PL.route('ingresar', (view, a, qs) => {
    const S = PL.S; let mode = S.account ? 'in' : 'up';
    const draw = () => {
      view.innerHTML = page('user', 'Tu cuenta', mode === 'in' ? 'Ingresa' : 'Crea tu cuenta', `
        <div class="seg" style="max-width:420px;margin-bottom:22px" role="group"><button type="button" data-m="in" aria-pressed="${mode === 'in'}">Ingresar</button><button type="button" data-m="up" aria-pressed="${mode === 'up'}">Crear cuenta</button></div>
        <form id="af" class="set-f">
          ${mode === 'up' ? `<label class="field"><span>Nombre y apellido</span><input class="in" id="a-n" autocomplete="name" maxlength="60" value="${PL.esc(S.client.name)}"></label>` : ''}
          <label class="field"><span>Correo</span><input class="in" id="a-e" type="email" autocomplete="email" maxlength="80"></label>
          <label class="field"><span>Contraseña</span><input class="in" id="a-p" type="password" autocomplete="${mode === 'in' ? 'current-password' : 'new-password'}" minlength="8"></label>
          ${mode === 'up' ? `<label class="field"><span>Repite la contraseña</span><input class="in" id="a-p2" type="password" autocomplete="new-password"></label>` : ''}
          <button class="btn btn-t btn-full" type="submit">${mode === 'in' ? 'Ingresar' : 'Crear cuenta'}</button>
        </form>`);
      PL.$('.seg', view).onclick = e => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; draw(); } };
      PL.$('#af', view).onsubmit = async e => {
        e.preventDefault();
        const em = PL.$('#a-e', view).value.trim().toLowerCase(), pw = PL.$('#a-p', view).value;
        if (!okMail(em)) return PL.toast('Escribe un correo válido');
        if (pw.length < 8) return PL.toast('La contraseña debe tener al menos 8 caracteres');
        if (mode === 'up') {
          const n = PL.$('#a-n', view).value.trim();
          if (n.length < 3) return PL.toast('Escribe tu nombre');
          if (pw !== PL.$('#a-p2', view).value) return PL.toast('Las contraseñas no coinciden');
          S.account = {name: n, email: em, hash: await hash(pw)}; if (!S.client.name) S.client.name = n;
        } else {
          if (!S.account || S.account.email !== em || S.account.hash !== await hash(pw)) return PL.toast('Correo o contraseña incorrectos');
        }
        S.session = {email: em, at: Date.now()}; PL.save();
        PL.toast(mode === 'up' ? 'Cuenta creada' : 'Bienvenido de nuevo'); PL.go(qs.get('next') || '#/cuenta');
      };
    };
    draw();
  }, {tab: 'cuenta'});

  /* ——— información personal y contraseña ——— */
  PL.route('perfil', view => {
    const S = PL.S, c = S.client, acc = S.account;
    let dist = c.district;
    view.innerHTML = page('user', 'Tu cuenta', 'Información personal', `
      <form id="pf" class="set-f">
        <label class="field"><span>Nombre y apellido</span><input class="in" id="p-n" autocomplete="name" maxlength="60" value="${PL.esc(acc ? acc.name : c.name)}"></label>
        <div class="row2"><label class="field"><span>Correo</span><input class="in" id="p-e" type="email" autocomplete="email" value="${PL.esc(acc ? acc.email : c.email || '')}"></label><label class="field"><span>Celular</span><input class="in" id="p-c" type="tel" inputmode="numeric" maxlength="9" placeholder="9XXXXXXXX" value="${PL.esc(c.phone)}"></label></div>
        <p class="blk-t" style="font-size:.9rem;font-weight:600">Distrito</p>
        <button class="in" type="button" id="p-d" style="display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;margin-bottom:18px">${PL.ic('pin')}<span style="flex:1">${PL.esc(dist || 'Elige tu distrito')}</span>${PL.ic('chev')}</button>
        <button class="btn btn-t" type="submit">Guardar</button>
      </form>
      <div class="set-sec" id="clave"><h2>${PL.ic('lock')}Contraseña</h2>
        ${acc ? `<form id="kf" class="set-f"><label class="field"><span>Contraseña actual</span><input class="in" id="k-0" type="password" autocomplete="current-password"></label><div class="row2"><label class="field"><span>Nueva contraseña</span><input class="in" id="k-1" type="password" autocomplete="new-password"></label><label class="field"><span>Repite la nueva</span><input class="in" id="k-2" type="password" autocomplete="new-password"></label></div><button class="btn btn-l" type="submit">Cambiar contraseña</button></form>`
          : `<p class="muted" style="margin-bottom:14px">Crea una cuenta con tu correo y una contraseña para proteger tus datos.</p><a class="btn btn-l" href="#/ingresar?next=%23%2Fperfil">Crear cuenta</a>`}
      </div>`);
    PL.$('#p-d', view).onclick = () => PL.pickDistrict(dist, d => { dist = d; PL.$('#p-d span', view).textContent = d; });
    PL.$('#pf', view).onsubmit = e => {
      e.preventDefault();
      const n = PL.$('#p-n', view).value.trim(), em = PL.$('#p-e', view).value.trim().toLowerCase(), ph = PL.$('#p-c', view).value.trim();
      if (em && !okMail(em)) return PL.toast('Escribe un correo válido');
      if (ph && !/^9\d{8}$/.test(ph)) return PL.toast('El celular tiene 9 dígitos y empieza con 9');
      c.name = n; c.email = em; c.phone = ph; c.district = dist;
      if (acc) { acc.name = n; if (em) { acc.email = em; if (S.session) S.session.email = em; } }
      PL.save(); PL.toast('Datos guardados');
    };
    const kf = PL.$('#kf', view);
    if (kf) kf.onsubmit = async e => {
      e.preventDefault();
      const k0 = PL.$('#k-0', view).value, k1 = PL.$('#k-1', view).value;
      if (acc.hash !== await hash(k0)) return PL.toast('La contraseña actual no es correcta');
      if (k1.length < 8) return PL.toast('La nueva contraseña debe tener al menos 8 caracteres');
      if (k1 !== PL.$('#k-2', view).value) return PL.toast('Las contraseñas no coinciden');
      acc.hash = await hash(k1); PL.save(); kf.reset(); PL.toast('Contraseña actualizada');
    };
    if (location.hash.includes('clave')) PL.$('#clave', view).scrollIntoView();
  }, {tab: 'cuenta'});

  /* ——— direcciones ——— */
  PL.route('direcciones', view => {
    const S = PL.S; S.addresses = S.addresses || [];
    let label = 'Casa', dist = S.client.district || '';
    const draw = () => {
      view.innerHTML = page('pin', 'Tu cuenta', 'Direcciones', `
        ${S.addresses.length ? `<div class="list">${S.addresses.map((ad, k) => `<div class="addr">${PL.ic(ad.label === 'Trabajo' ? 'bag' : ad.label === 'Casa' ? 'home' : 'pin')}<span><b>${PL.esc(ad.label)}</b><span>${PL.esc(ad.district)}${ad.ref ? ' · ' + PL.esc(ad.ref) : ''}</span></span><button class="ibtn" type="button" data-del="${k}" aria-label="Borrar ${PL.esc(ad.label)}">${PL.ic('trash')}</button></div>`).join('')}</div>` : `<p class="muted">Aún no guardas direcciones.</p>`}
        <div class="set-sec"><h2>${PL.ic('plus')}Agregar dirección</h2>
          <div class="chips" id="dl" style="margin-bottom:14px">${['Casa', 'Trabajo', 'Otra'].map(l => `<button class="chip" type="button" data-l="${l}" aria-pressed="${l === label}">${l}</button>`).join('')}</div>
          <button class="in" type="button" id="dd" style="display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;margin-bottom:14px">${PL.ic('pin')}<span style="flex:1">${PL.esc(dist || 'Elige el distrito')}</span>${PL.ic('chev')}</button>
          <label class="field"><span>Dirección y referencia</span><input class="in" id="dr" maxlength="140" placeholder="Ej.: Av. Benavides 1200, frente al parque"></label>
          <button class="btn btn-t" type="button" id="dsave">Guardar dirección</button></div>`);
      PL.$('#dl', view).onclick = e => { const b = e.target.closest('[data-l]'); if (b) { label = b.dataset.l; PL.$$('[data-l]', view).forEach(x => x.setAttribute('aria-pressed', x === b)); } };
      PL.$('#dd', view).onclick = () => PL.pickDistrict(dist, d => { dist = d; PL.$('#dd span', view).textContent = d; });
      PL.$('#dsave', view).onclick = () => {
        const ref = PL.$('#dr', view).value.trim();
        if (!dist) return PL.toast('Elige el distrito');
        if (ref.length < 5) return PL.toast('Escribe la dirección y una referencia');
        S.addresses.push({label, district: dist, ref}); PL.save(); PL.toast('Dirección guardada'); draw();
      };
      view.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.addresses.splice(Number(b.dataset.del), 1); PL.save(); draw(); });
    };
    draw();
  }, {tab: 'cuenta'});

  /* ——— billetera ——— */
  PL.route('billetera', view => {
    const S = PL.S; S.wallet = S.wallet || {balance: 0, moves: []};
    const W = S.wallet, pay = S.client.pay || 'efectivo';
    view.innerHTML = page('wallet', 'Tu cuenta', 'Billetera', `
      <div class="wal"><span>Créditos disponibles</span><b>${PL.money(W.balance)}</b></div>
      <div class="set-sec"><h2>${PL.ic('plus')}Agregar créditos con un código</h2><div class="vrow"><input class="in" id="wc" maxlength="20" placeholder="Código" style="text-transform:uppercase"><button class="btn btn-t" type="button" id="wok">Canjear</button></div></div>
      <div class="set-sec"><h2>${PL.ic('cash')}Método de pago preferido</h2>
        <div class="methods" id="wm">${[['efectivo', 'Efectivo', '#D6F4E3', PL.ic('cash')], ['yape', 'Yape', '#D4CBFF', 'Y'], ['plin', 'Plin', '#B4EEE1', 'P']].map(m => `<button class="method" type="button" data-m="${m[0]}" aria-pressed="${pay === m[0]}"><span class="mi" style="background:${m[2]}">${m[3]}</span>${m[1]}</button>`).join('')}</div></div>
      <div class="set-sec"><h2>${PL.ic('list')}Movimientos</h2>${W.moves.length ? `<ul class="jobs-l">${W.moves.map(m => `<li><span>${PL.esc(m.t)}</span><b>${PL.money(m.v)}</b></li>`).join('')}</ul>` : '<p class="muted">Aún no tienes movimientos.</p>'}</div>`);
    PL.$('#wok', view).onclick = () => { const v = PL.$('#wc', view).value.trim(); if (!v) return PL.toast('Escribe el código'); PL.toast('Ese código no es válido'); };
    PL.$('#wm', view).onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; S.client.pay = b.dataset.m; PL.save(); PL.$$('[data-m]', view).forEach(x => x.setAttribute('aria-pressed', x === b)); PL.toast('Método de pago guardado'); };
  }, {tab: 'cuenta'});

  /* ——— notificaciones ——— */
  PL.route('notificaciones', view => {
    const S = PL.S; S.notif = Object.assign({pedidos: true, chat: true, recordatorios: true, novedades: false, push: true, correo: true, sms: false}, S.notif);
    const row = (k, t, sub) => `<label class="tgl"><span><b>${t}</b>${sub ? `<span>${sub}</span>` : ''}</span><input type="checkbox" data-k="${k}"${S.notif[k] ? ' checked' : ''}><i aria-hidden="true"></i></label>`;
    view.innerHTML = page('bell', 'Tu cuenta', 'Notificaciones', `
      <div class="set-sec" style="margin-top:0"><h2>Qué te avisamos</h2><div class="list">${row('pedidos', 'Estado de tus pedidos', 'Cuando aceptan, llegan o terminan')}${row('chat', 'Mensajes del chat', 'Respuestas y presupuestos')}${row('recordatorios', 'Recordatorios', 'Un día antes de tus pedidos programados')}${row('novedades', 'Novedades y promociones', '')}</div></div>
      <div class="set-sec"><h2>Por dónde</h2><div class="list">${row('push', 'En el celular', '')}${row('correo', 'Por correo', '')}${row('sms', 'Por SMS', '')}</div></div>`);
    view.querySelectorAll('[data-k]').forEach(x => x.onchange = () => { S.notif[x.dataset.k] = x.checked; PL.save(); });
  }, {tab: 'cuenta'});

  /* ——— ajustes ——— */
  PL.route('ajustes', view => {
    const S = PL.S;
    view.innerHTML = page('gear', 'Tu cuenta', 'Ajustes', `
      <div class="list">
        <a href="#/perfil">${PL.ic('user')}<span>Información personal</span>${PL.ic('chev', 'i chev')}</a>
        <a href="#/perfil?clave">${PL.ic('lock')}<span>Contraseña</span>${PL.ic('chev', 'i chev')}</a>
        <a href="#/direcciones">${PL.ic('pin')}<span>Direcciones</span>${PL.ic('chev', 'i chev')}</a>
        <a href="#/billetera">${PL.ic('wallet')}<span>Método de pago</span>${PL.ic('chev', 'i chev')}</a>
        <a href="#/notificaciones">${PL.ic('bell')}<span>Notificaciones</span>${PL.ic('chev', 'i chev')}</a>
        <a href="#/legal">${PL.ic('id')}<span>Información legal</span>${PL.ic('chev', 'i chev')}</a>
        <button type="button" id="wipe" style="color:#A1191F">${PL.ic('trash')}<span>Borrar mis datos de este dispositivo</span></button>
        ${S.session ? `<button type="button" id="out">${PL.ic('logout')}<span>Cerrar sesión</span></button>` : ''}
      </div>`);
    PL.$('#wipe', view).onclick = async () => { if (await PL.confirm({title: '¿Borrar tus datos?', text: 'Se borran tus pedidos, direcciones, favoritos y perfiles de este dispositivo. No se puede deshacer.', ok: 'Sí, borrar', cancel: 'Cancelar', danger: true})) { PL.reset(); PL.toast('Datos borrados'); PL.go('#/'); } };
    const out = PL.$('#out', view); if (out) out.onclick = () => { PL.logout(); PL.go('#/'); };
  }, {tab: 'cuenta'});

  /* ——— información legal ——— */
  PL.route('legal', view => {
    const doc = (t, items) => `<details class="faq"><summary>${t}</summary><div class="legal">${items.map(i => `<p>${i}</p>`).join('')}<p class="muted">[Texto legal completo por redactar y validar con un abogado]</p></div></details>`;
    view.innerHTML = page('id', 'Soporte', 'Información legal', `
      <div class="list">
        ${doc('Términos y condiciones', ['Agéndalo es una plataforma que conecta a clientes con trabajadores independientes y empresas de servicios.', 'Cada servicio se acuerda entre el cliente y quien lo realiza: alcance, fecha y precio.', 'Los trabajadores y las empresas pasan por una verificación antes de recibir pedidos.'])}
        ${doc('Política de privacidad', ['Tratamos tus datos personales conforme a la Ley N.° 29733, Ley de Protección de Datos Personales.', 'Usamos tus datos para gestionar tus pedidos, verificar perfiles y comunicarnos contigo.', 'Puedes pedir el acceso, la corrección o la eliminación de tus datos.'])}
        <a href="#/reclamaciones">${PL.ic('book')}<span>Libro de Reclamaciones</span>${PL.ic('chev', 'i chev')}</a>
      </div>`);
  }, {tab: 'cuenta'});

  /* ——— Libro de Reclamaciones (Código de Protección y Defensa del Consumidor, Ley N.° 29571) ——— */
  PL.route('reclamaciones', view => {
    const S = PL.S, c = S.client; S.claims = S.claims || [];
    let tipoBien = 'Servicio', tipo = 'Reclamo';
    const orders = S.orders.slice().sort((x, y) => y.createdAt - x.createdAt);
    view.innerHTML = page('book', 'Soporte', 'Libro de Reclamaciones', `
      <p class="muted" style="margin-bottom:22px">Proveedor: [Razón social] · RUC [por completar] · Conforme al Código de Protección y Defensa del Consumidor.</p>
      <form id="rf">
        <div class="set-sec" style="margin-top:0"><h2>1. Tus datos</h2>
          <label class="field"><span>Nombre y apellido</span><input class="in" id="r-n" maxlength="80" value="${PL.esc(c.name)}"></label>
          <div class="row2"><label class="field"><span>Documento</span><select class="in" id="r-dt"><option>DNI</option><option>Carné de extranjería</option><option>Pasaporte</option></select></label><label class="field"><span>Número</span><input class="in" id="r-dn" maxlength="12"></label></div>
          <label class="field"><span>Domicilio</span><input class="in" id="r-dom" maxlength="140"></label>
          <div class="row2"><label class="field"><span>Celular</span><input class="in" id="r-c" type="tel" maxlength="9" value="${PL.esc(c.phone)}"></label><label class="field"><span>Correo</span><input class="in" id="r-e" type="email" value="${PL.esc((S.account && S.account.email) || c.email || '')}"></label></div>
          <label class="check"><input type="checkbox" id="r-men"><span>Soy menor de edad</span></label>
          <label class="field" id="r-tutor" hidden><span>Nombre del padre, madre o apoderado</span><input class="in" id="r-tn" maxlength="80"></label>
        </div>
        <div class="set-sec"><h2>2. Lo contratado</h2>
          <div class="seg" style="max-width:320px;margin-bottom:14px" id="r-tb"><button type="button" data-b="Servicio" aria-pressed="true">Servicio</button><button type="button" data-b="Producto" aria-pressed="false">Producto</button></div>
          ${orders.length ? `<label class="field"><span>Pedido relacionado <em>(opcional)</em></span><select class="in" id="r-o"><option value="">Ninguno</option>${orders.map(o => `<option value="${o.id}">${PL.esc(PL.svc(o.svc).n)} · ${PL.esc(PL.fdate(o.createdAt))}</option>`).join('')}</select></label>` : ''}
          <div class="row2"><label class="field"><span>Monto reclamado (S/) <em>(opcional)</em></span><input class="in" id="r-m" type="number" min="0" inputmode="decimal"></label><label class="field"><span>Descripción</span><input class="in" id="r-d" maxlength="140"></label></div>
        </div>
        <div class="set-sec"><h2>3. Detalle</h2>
          <div class="seg" style="max-width:320px;margin-bottom:10px" id="r-t"><button type="button" data-t="Reclamo" aria-pressed="true">Reclamo</button><button type="button" data-t="Queja" aria-pressed="false">Queja</button></div>
          <p class="muted" id="r-tx" style="font-size:.88rem;margin-bottom:14px">Reclamo: disconformidad con el servicio contratado.</p>
          <label class="field"><span>Detalle</span><textarea class="in" id="r-det" maxlength="1500"></textarea></label>
          <label class="field"><span>Pedido del consumidor</span><textarea class="in" id="r-ped" maxlength="800" placeholder="Qué solución esperas"></textarea></label>
          <label class="check"><input type="checkbox" id="r-ok"><span>Declaro que los datos son verdaderos.</span></label>
          <button class="btn btn-t" type="submit" style="margin-top:8px">Enviar hoja de reclamación</button>
        </div>
      </form>`);
    PL.$('#r-men', view).onchange = e => { PL.$('#r-tutor', view).hidden = !e.target.checked; };
    PL.$('#r-tb', view).onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; tipoBien = b.dataset.b; PL.$$('[data-b]', view).forEach(x => x.setAttribute('aria-pressed', x === b)); };
    PL.$('#r-t', view).onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; tipo = b.dataset.t; PL.$$('[data-t]', view).forEach(x => x.setAttribute('aria-pressed', x === b)); PL.$('#r-tx', view).textContent = tipo === 'Reclamo' ? 'Reclamo: disconformidad con el servicio contratado.' : 'Queja: malestar con la atención, no relacionado con el servicio.'; };
    PL.$('#rf', view).onsubmit = e => {
      e.preventDefault();
      const v = id => PL.$(id, view) ? PL.$(id, view).value.trim() : '';
      if (v('#r-n').length < 3) return PL.toast('Escribe tu nombre');
      if (v('#r-dn').length < 8) return PL.toast('Escribe tu número de documento');
      if (v('#r-dom').length < 5) return PL.toast('Escribe tu domicilio');
      if (PL.$('#r-men', view).checked && v('#r-tn').length < 3) return PL.toast('Escribe el nombre de tu padre, madre o apoderado');
      if (v('#r-det').length < 10) return PL.toast('Describe el detalle');
      if (v('#r-ped').length < 5) return PL.toast('Escribe qué solución esperas');
      if (!PL.$('#r-ok', view).checked) return PL.toast('Marca la declaración');
      const code = `${new Date().getFullYear()}-${String(S.claims.length + 1).padStart(6, '0')}`;
      const claim = {code, at: Date.now(), tipo, tipoBien, nombre: v('#r-n'), doc: v('#r-dt') + ' ' + v('#r-dn'), domicilio: v('#r-dom'), celular: v('#r-c'), correo: v('#r-e'), tutor: v('#r-tn'), pedido: v('#r-o'), monto: v('#r-m'), descripcion: v('#r-d'), detalle: v('#r-det'), solicitud: v('#r-ped')};
      S.claims.push(claim); PL.save(); PL.toSheet(Object.assign({tipo_registro: 'libro de reclamaciones'}, claim));
      PL.$('.set', view).innerHTML = `<div class="wiz-done"><span class="done-ic">${PL.ic('check')}</span><h3>Hoja de reclamación N.° ${code}</h3><p class="muted">${PL.esc(tipo)} registrado el ${PL.esc(PL.fdate(claim.at))}. Guarda este número para tu seguimiento.</p><a class="btn btn-t" href="#/cuenta">Volver a mi cuenta</a></div>`;
    };
  }, {tab: 'cuenta'});
})();
