/* Agéndalo · ingresar y crear cuenta
   Con celular (código por SMS) o con correo y contraseña, en página propia o en una hoja cuando hace falta
   a mitad de un pedido. Mientras la app no tenga servidor, las cuentas viven en este dispositivo y el código
   SMS se muestra en un aviso. */
(function(){
  const PL = window.PL;
  PL.hash = async t => {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return 'h' + h; }
  };
  PL.okMail = m => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);
  const okPhone = p => /^9\d{8}$/.test(p);
  const digits = v => String(v || '').replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');
  PL.fmtPhone = p => String(p || '').replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
  const strength = pw => { let s = 0; if (pw.length >= 8) s++; if (pw.length >= 12) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^\w\s]/.test(pw)) s++; return Math.min(4, s); };

  function signIn(acc, msg){
    const S = PL.S;
    S.session = {id: acc.id, at: Date.now()};
    S.client.name = acc.name || S.client.name;
    if (acc.phone) S.client.phone = acc.phone;
    if (acc.email) S.client.email = acc.email;
    PL.save(); if (PL.syncTop) PL.syncTop(); PL.toast(msg);
  }
  const findBy = (k, v) => PL.S.accounts.find(a => a[k] && a[k] === v);
  /* ——— Google (OAuth 2.0 con Google Identity Services) ——— */
  const GID = () => (PL.CFG && PL.CFG.GOOGLE_CLIENT_ID) || '';
  let gsiP = null;
  PL.gsi = () => gsiP || (gsiP = new Promise((ok, ko) => {
    if (window.google && google.accounts && google.accounts.id) return ok();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = () => ok(); s.onerror = () => { gsiP = null; ko(new Error('gsi')); };
    document.head.appendChild(s);
  }));
  /* lee el token (JWT) que entrega Google. Sin servidor no se puede verificar la firma: se revisan emisor, destinatario y vencimiento.
     Cuando haya servidor, el token se tiene que verificar allá antes de abrir la sesión. */
  const jwt = t => { const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); const raw = atob(b + '==='.slice((b.length + 3) % 4)); return JSON.parse(decodeURIComponent(raw.split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''))); };
  function create(o){ const acc = Object.assign({id: 'a' + PL.uid(), at: Date.now()}, o); PL.S.accounts.push(acc); return acc; }

  const pwField = (id, label, auto, extra = '') => `<label class="field"><span>${label}</span><span class="pw"><input class="in" id="${id}" type="password" autocomplete="${auto}" minlength="8" maxlength="72">
    <button class="pw-eye" type="button" data-eye="${id}" aria-label="Mostrar contraseña">${PL.ic('eye')}</button></span>${extra}</label>`;
  const terms = () => `<label class="check au-terms"><input type="checkbox" id="au-t"><span>Acepto los <a href="#/legal" target="_blank">Términos y condiciones</a> y la <a href="#/legal" target="_blank">Política de privacidad</a>.</span></label>`;

  /* host: contenedor · o: {mode: 'in' | 'up', onDone, reason} */
  PL.authForm = (host, o = {}) => {
    const st = {mode: o.mode || 'in', me: 'cel', step: 'start', phone: '', name: '', email: '', code: '', purpose: '', wait: 0};
    let tick = null;
    const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };
    PL.onLeave(stopTick);

    function draw(){
      stopTick();
      const up = st.mode === 'up';
      if (st.step === 'otp') {
        host.innerHTML = `<div class="au">
          <button class="au-back" type="button" data-back>${PL.ic('back')}Cambiar número</button>
          <div class="au-h"><h2>Escribe el código</h2><p>Te lo enviamos por SMS al <b>+51 ${PL.fmtPhone(st.phone)}</b>.</p></div>
          <div class="pin-in au-pin">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" autocomplete="${i ? 'off' : 'one-time-code'}" maxlength="1" aria-label="Dígito ${i + 1}" data-o="${i}">`).join('')}</div>
          <p class="au-err" id="au-err" role="alert"></p>
          <button class="au-link" type="button" id="au-re" disabled></button></div>`;
        const ins = PL.$$('[data-o]', host), re = PL.$('#au-re', host);
        const count = () => { re.disabled = st.wait > 0; re.textContent = st.wait > 0 ? `Reenviar código en 0:${String(st.wait).padStart(2, '0')}` : 'Reenviar código'; };
        count(); tick = setInterval(() => { st.wait = Math.max(0, st.wait - 1); count(); if (!st.wait) stopTick(); }, 1000);
        re.onclick = () => sendCode();
        ins.forEach((x, i) => {
          x.oninput = () => {
            const v0 = x.value.replace(/\D/g, '');
            if (v0.length > 1) { v0.slice(0, 4).split('').forEach((d, k) => { if (ins[k]) ins[k].value = d; }); } else x.value = v0;
            if (x.value && ins[i + 1]) ins[i + 1].focus();
            const v = ins.map(y => y.value).join('');
            if (v.length === 4) verify(v, ins);
          };
          x.onkeydown = e => { if (e.key === 'Backspace' && !x.value && ins[i - 1]) ins[i - 1].focus(); };
        });
        PL.$('[data-back]', host).onclick = () => { st.step = st.purpose === 'reset' ? 'forgot' : 'start'; draw(); };
        setTimeout(() => ins[0].focus(), 50);
        return;
      }
      if (st.step === 'finish') {
        host.innerHTML = `<div class="au"><div class="au-h"><h2>Crea tu cuenta</h2><p>No hay una cuenta con el +51 ${PL.fmtPhone(st.phone)}. Ya lo verificaste: solo falta tu nombre.</p></div>
          <form id="au-f" novalidate><label class="field"><span>Nombre y apellido</span><input class="in" id="au-n" autocomplete="name" maxlength="60" value="${PL.esc(st.name || PL.S.client.name || '')}"></label>
          <label class="field"><span>Correo <em>(opcional)</em></span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80"></label>
          ${terms()}<p class="au-err" id="au-err" role="alert"></p><button class="btn btn-t btn-full" type="submit">Crear cuenta</button></form></div>`;
        PL.$('#au-f', host).onsubmit = e => {
          e.preventDefault();
          const n = PL.$('#au-n', host).value.trim(), em = PL.$('#au-e', host).value.trim().toLowerCase();
          if (n.length < 3) return err('Escribe tu nombre y apellido', '#au-n');
          if (em && !PL.okMail(em)) return err('Revisa el correo', '#au-e');
          if (em && findBy('email', em)) return err('Ese correo ya tiene una cuenta. Ingresa con él o usa otro.', '#au-e');
          if (!PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
          done(create({name: n, phone: st.phone, email: em || ''}), 'Cuenta creada');
        };
        return;
      }
      if (st.step === 'forgot') {
        host.innerHTML = `<div class="au"><button class="au-back" type="button" data-back>${PL.ic('back')}Volver</button>
          <div class="au-h"><h2>Recupera tu cuenta</h2><p>Escribe el correo de tu cuenta. Te enviaremos un código al celular que registraste.</p></div>
          <form id="au-f" novalidate><label class="field"><span>Correo</span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80" value="${PL.esc(st.email)}"></label>
          <p class="au-err" id="au-err" role="alert"></p><button class="btn btn-t btn-full" type="submit">Enviarme un código</button></form></div>`;
        PL.$('[data-back]', host).onclick = () => { st.step = 'start'; draw(); };
        PL.$('#au-f', host).onsubmit = e => {
          e.preventDefault();
          const em = PL.$('#au-e', host).value.trim().toLowerCase(), acc = findBy('email', em);
          if (!PL.okMail(em)) return err('Escribe un correo válido', '#au-e');
          if (!acc) return err('No hay una cuenta con ese correo', '#au-e');
          if (!acc.phone) return err('Esta cuenta no tiene celular para recuperarla. Escríbenos desde Ayuda y te ayudamos.');
          st.email = em; st.phone = acc.phone; st.purpose = 'reset'; sendCode();
        };
        return;
      }
      if (st.step === 'newpw') {
        host.innerHTML = `<div class="au"><div class="au-h"><h2>Nueva contraseña</h2><p>Para ${PL.esc(st.email)}.</p></div>
          <form id="au-f" novalidate>${pwField('au-p', 'Nueva contraseña', 'new-password', '<span class="pw-meter" id="au-m"><i></i><i></i><i></i><i></i></span>')}
          <p class="au-err" id="au-err" role="alert"></p><button class="btn btn-t btn-full" type="submit">Guardar e ingresar</button></form></div>`;
        bindPw();
        PL.$('#au-f', host).onsubmit = async e => {
          e.preventDefault();
          const pw = PL.$('#au-p', host).value, acc = findBy('email', st.email);
          if (pw.length < 8) return err('Usa al menos 8 caracteres', '#au-p');
          acc.hash = await PL.hash(pw); done(acc, 'Contraseña actualizada');
        };
        return;
      }
      /* inicio */
      const cel = st.me === 'cel';
      host.innerHTML = `<div class="au">
        <div class="au-h"><h2>${up ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</h2><p>${o.reason ? PL.esc(o.reason) : up ? 'Para pedir servicios, guardar tus direcciones y volver a contratar a quien te ayudó.' : 'Con tu celular o con tu correo.'}</p></div>
        ${GID() ? `<div class="au-google" id="au-g"></div><p class="au-gnote">Al continuar con Google aceptas los <a href="#/legal" target="_blank">Términos</a> y la <a href="#/legal" target="_blank">Política de privacidad</a>.</p><p class="au-or"><span>o con</span></p>` : ''}
        <div class="seg au-seg" role="group" aria-label="Cómo ${up ? 'crear la cuenta' : 'ingresar'}"><button type="button" data-me="cel" aria-pressed="${cel}">${PL.ic('phone')}Celular</button><button type="button" data-me="mail" aria-pressed="${!cel}">${PL.ic('mail')}Correo</button></div>
        <form id="au-f" novalidate>
          ${up ? `<label class="field"><span>Nombre y apellido</span><input class="in" id="au-n" autocomplete="name" maxlength="60" value="${PL.esc(st.name || PL.S.client.name || '')}"></label>` : ''}
          ${cel ? `<label class="field"><span>Celular</span><span class="tel"><span class="cc">+51</span><input class="in" id="au-ph" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" placeholder="9XX XXX XXX" value="${PL.esc(PL.fmtPhone(st.phone))}"></span></label>`
            : `<label class="field"><span>Correo</span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80" value="${PL.esc(st.email)}"></label>
               ${pwField('au-p', 'Contraseña', up ? 'new-password' : 'current-password', up ? '<span class="pw-meter" id="au-m"><i></i><i></i><i></i><i></i></span><small class="au-hint">Mínimo 8 caracteres. Mejor si mezclas letras, números y un símbolo.</small>' : '')}
               ${up ? '' : '<button class="au-link au-forgot" type="button" id="au-fg">¿Olvidaste tu contraseña?</button>'}`}
          ${up ? terms() : ''}
          <p class="au-err" id="au-err" role="alert"></p>
          <button class="btn btn-t btn-full" type="submit">${cel ? 'Enviarme un código' : up ? 'Crear cuenta' : 'Ingresar'}</button>
        </form>
        <p class="au-alt">${up ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'} <button type="button" class="au-link" data-sw>${up ? 'Ingresa' : 'Crea una'}</button></p>
      </div>`;
      if (GID()) googleBtn(PL.$('#au-g', host), up);
      PL.$('.au-seg', host).onclick = e => { const b = e.target.closest('[data-me]'); if (!b) return; keep(); st.me = b.dataset.me; draw(); };
      PL.$('[data-sw]', host).onclick = () => { keep(); st.mode = up ? 'in' : 'up'; draw(); if (o.onMode) o.onMode(st.mode); };
      const ph = PL.$('#au-ph', host);
      if (ph) ph.oninput = () => { const d = digits(ph.value).slice(0, 9); ph.value = d.length > 6 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d; };
      const fg = PL.$('#au-fg', host); if (fg) fg.onclick = () => { keep(); st.step = 'forgot'; draw(); };
      bindPw();
      PL.$('#au-f', host).onsubmit = async e => {
        e.preventDefault(); keep();
        if (up && st.name.length < 3) return err('Escribe tu nombre y apellido', '#au-n');
        if (cel) {
          if (!okPhone(st.phone)) return err('El celular tiene 9 dígitos y empieza con 9', '#au-ph');
          if (up && !PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
          st.purpose = up ? 'up' : 'in'; sendCode(); return;
        }
        const pw = PL.$('#au-p', host).value;
        if (!PL.okMail(st.email)) return err('Escribe un correo válido', '#au-e');
        if (pw.length < 8) return err(up ? 'Usa al menos 8 caracteres' : 'Correo o contraseña incorrectos', '#au-p');
        const acc = findBy('email', st.email);
        if (up) {
          if (acc) return err('Ya hay una cuenta con este correo. Ingresa con él.', '#au-e');
          if (!PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
          done(create({name: st.name, email: st.email, phone: '', hash: await PL.hash(pw)}), 'Cuenta creada');
        } else {
          if (!acc || !acc.hash || acc.hash !== await PL.hash(pw)) return err('Correo o contraseña incorrectos', '#au-p');
          done(acc, `Hola de nuevo, ${String(acc.name || '').split(' ')[0] || 'bienvenido'}`);
        }
      };
      const first = PL.$('#au-f .in', host); if (first && PL.isDesk() && !o.noFocus) first.focus();
    }
    function keep(){
      const n = PL.$('#au-n', host), ph = PL.$('#au-ph', host), em = PL.$('#au-e', host);
      if (n) st.name = n.value.trim(); if (ph) st.phone = digits(ph.value); if (em) st.email = em.value.trim().toLowerCase();
    }
    function err(msg, sel){
      const e = PL.$('#au-err', host); if (e) e.textContent = msg;
      PL.$$('.in.err', host).forEach(x => x.classList.remove('err'));
      const f = sel && PL.$(sel, host); if (f) { f.classList.add('err'); f.focus(); }
    }
    function bindPw(){
      PL.$$('[data-eye]', host).forEach(b => b.onclick = () => { const i = PL.$('#' + b.dataset.eye, host), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = PL.ic(show ? 'eyeoff' : 'eye'); b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
      const m = PL.$('#au-m', host), p = PL.$('#au-p', host);
      if (m && p) p.addEventListener('input', () => { const s = p.value ? strength(p.value) : 0; m.dataset.s = s; });
    }
    function sendCode(){
      st.code = String(PL.ri(1000, 9999)); st.wait = 30; st.step = 'otp'; draw();
      PL.toast(`SMS de Agéndalo: tu código es ${st.code}`, 7000);
    }
    function verify(v, ins){
      if (v !== st.code) { err('El código no coincide. Revisa el SMS e inténtalo otra vez.'); ins.forEach(y => { y.value = ''; y.classList.add('err'); }); ins[0].focus(); return; }
      const acc = findBy('phone', st.phone);
      if (st.purpose === 'reset') { st.step = 'newpw'; draw(); return; }
      if (acc) { done(acc, st.purpose === 'up' ? 'Ya tenías una cuenta con este número. Ingresaste.' : `Hola de nuevo, ${String(acc.name || '').split(' ')[0] || 'bienvenido'}`); return; }
      if (st.purpose === 'up') { done(create({name: st.name, phone: st.phone, email: ''}), 'Cuenta creada'); return; }
      st.mode = 'up'; st.step = 'finish'; draw();
    }
    function done(acc, msg){ stopTick(); signIn(acc, msg); if (o.onDone) o.onDone(acc); }
    function googleBtn(el, up){
      if (!el) return;
      el.innerHTML = '<span class="au-gload">Cargando Google…</span>';
      PL.gsi().then(() => {
        if (!el.isConnected) return;
        google.accounts.id.initialize({client_id: GID(), callback: r => onGoogle(r.credential), ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, context: up ? 'signup' : 'signin', itp_support: true});
        el.innerHTML = '';
        google.accounts.id.renderButton(el, {type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: up ? 'signup_with' : 'continue_with', logo_alignment: 'center', locale: 'es-419', width: Math.round(Math.min(400, Math.max(220, el.clientWidth || 320)))});
      }).catch(() => { if (el.isConnected) el.innerHTML = '<p class="au-err">No se pudo cargar el ingreso con Google. Usa tu celular o tu correo.</p>'; });
    }
    function onGoogle(cred){
      let p;
      try { p = jwt(cred); } catch (e) { err('No pudimos leer tu cuenta de Google. Inténtalo otra vez.'); return; }
      if (p.aud !== GID() || !/^(https:\/\/)?accounts\.google\.com$/.test(p.iss || '') || !(p.exp > Date.now() / 1000)) { err('El ingreso con Google no es válido. Inténtalo otra vez.'); return; }
      const em = String(p.email || '').toLowerCase();
      let acc = findBy('google', p.sub) || (p.email_verified && em ? findBy('email', em) : null);
      const nuevo = !acc;
      if (nuevo) acc = create({name: p.name || em, email: em, phone: '', google: p.sub, picture: p.picture || ''});
      else Object.assign(acc, {google: p.sub, picture: p.picture || acc.picture || '', name: acc.name || p.name || em, email: acc.email || em});
      done(acc, nuevo ? 'Cuenta creada con Google' : `Hola de nuevo, ${String(acc.name || '').split(' ')[0] || 'bienvenido'}`);
    }
    draw();
    return {setMode(m){ st.mode = m; st.step = 'start'; draw(); }};
  };

  /* a mitad de algo (por ejemplo, al enviar un pedido): se ingresa en una hoja y se sigue donde estaba */
  PL.authSheet = (o = {}) => PL.sheet({title: '', body: '<div id="auS"></div>', onOpen: s => {
    s.classList.add('sheet-au');
    PL.authForm(s.querySelector('#auS'), Object.assign({}, o, {onDone: acc => { PL.closeSheet(); if (o.onDone) setTimeout(() => o.onDone(acc), 60); }}));
  }, onClose: () => { const s = PL.$('#sheet'); if (s) s.classList.remove('sheet-au'); }});

  /* páginas: #/ingresar y #/crear-cuenta */
  function page(mode){
    return (view, a, qs) => {
      if (PL.me()) { PL.go(qs.get('next') || '#/cuenta'); return; }
      document.body.dataset.view = 'acceso';
      view.innerHTML = `<section class="acc-page">
        <div class="acc-art"><div class="acc-art-in">
          <svg class="acc-mark" viewBox="15 25 90 70" aria-hidden="true"><path fill="#fff" d="${PL.LOGO_D}"/></svg>
          <h1>Ayuda de confianza, <span>inmediata o programada.</span></h1>
          <ul><li>${PL.ic('check')}Personas y empresas verificadas</li><li>${PL.ic('check')}Tú pones el precio y pagas al terminar</li><li>${PL.ic('check')}Vuelve a contratar a quien te ayudó</li></ul>
        </div></div>
        <div class="acc-form" id="au"></div>
      </section>`;
      PL.authForm(PL.$('#au', view), {mode, onMode: m => history.replaceState(null, '', m === 'up' ? '#/crear-cuenta' : '#/ingresar'), onDone: () => PL.go(qs.get('next') || '#/')});
    };
  }
  PL.route('ingresar', page('in'), {tab: 'cuenta'});
  PL.route('crear-cuenta', page('up'), {tab: 'cuenta'});
})();
