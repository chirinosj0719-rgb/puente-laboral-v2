/* Agéndalo · ingresar y crear cuenta
   Con Google, con el celular (código por SMS) o con correo y contraseña; en página propia o en una hoja
   a mitad de un pedido. Las cuentas viven en Firebase Authentication (PL.CFG.FIREBASE). Si esa
   configuración está vacía, la app sigue funcionando con cuentas guardadas solo en este dispositivo. */
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
  const first = acc => String((acc && acc.name) || '').split(' ')[0];
  const hello = acc => first(acc) ? `Hola de nuevo, ${first(acc)}` : 'Ingresaste a tu cuenta';
  const inApp = () => !!PL.$('#view');

  function signIn(acc, msg){
    const S = PL.S;
    S.session = {id: acc.id, at: Date.now()};
    S.client.name = acc.name || S.client.name;
    if (acc.phone) S.client.phone = acc.phone;
    if (acc.email) S.client.email = acc.email;
    PL.save(); if (PL.syncTop) PL.syncTop(); if (msg) PL.toast(msg, 3600);
  }
  const findBy = (k, v) => PL.S.accounts.find(a => a[k] && a[k] === v);
  function create(o){ const acc = Object.assign({id: 'a' + PL.uid(), at: Date.now()}, o); PL.S.accounts.push(acc); return acc; }

  /* ——— Firebase Authentication ———
     El SDK (versión compat) se carga solo cuando hace falta: al abrir un formulario de ingreso o si la sesión
     guardada es de Firebase. La sesión de Firebase manda: si allá se cerró, aquí también. */
  const FBV = '12.6.0';
  const FBC = () => (PL.CFG && PL.CFG.FIREBASE && PL.CFG.FIREBASE.apiKey) ? PL.CFG.FIREBASE : null;
  const script = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = () => { s.remove(); ko(new Error('net')); }; document.head.appendChild(s); });
  let fbP = null;
  const ERR = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos', 'auth/invalid-login-credentials': 'Correo o contraseña incorrectos',
    'auth/wrong-password': 'Correo o contraseña incorrectos', 'auth/user-not-found': 'Correo o contraseña incorrectos',
    'auth/email-already-in-use': 'Ya hay una cuenta con este correo. Ingresa con él.',
    'auth/credential-already-in-use': 'Ese correo ya lo usa otra cuenta.',
    'auth/invalid-email': 'Escribe un correo válido',
    'auth/weak-password': 'Usa una contraseña más segura, de al menos 8 caracteres.',
    'auth/too-many-requests': 'Hubo demasiados intentos. Espera unos minutos e inténtalo otra vez.',
    'auth/network-request-failed': 'No hay conexión. Revisa tu internet e inténtalo otra vez.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes de este sitio e inténtalo otra vez.',
    'auth/popup-closed-by-user': '', 'auth/cancelled-popup-request': '', 'auth/user-cancelled': '',
    'auth/invalid-phone-number': 'Revisa el número: tiene 9 dígitos y empieza con 9.',
    'auth/missing-phone-number': 'Escribe tu número de celular.',
    'auth/invalid-verification-code': 'El código no coincide. Revisa el SMS e inténtalo otra vez.',
    'auth/missing-verification-code': 'Escribe los 6 dígitos del código.',
    'auth/code-expired': 'El código venció. Pide uno nuevo.',
    'auth/session-expired': 'El código venció. Pide uno nuevo.',
    'auth/quota-exceeded': 'Por hoy ya no podemos enviar más SMS. Ingresa con tu correo o con Google.',
    'auth/captcha-check-failed': 'No pudimos comprobar que no eres un robot. Recarga la página e inténtalo otra vez.',
    'auth/invalid-app-credential': 'No pudimos comprobar que no eres un robot. Recarga la página e inténtalo otra vez.',
    'auth/operation-not-allowed': 'Este método de ingreso no está disponible por ahora. Prueba con otro.',
    'auth/unauthorized-domain': 'Desde esta dirección no se puede ingresar. Abre Agéndalo desde su página oficial.',
    'auth/account-exists-with-different-credential': 'Ese correo ya tiene una cuenta. Ingresa con tu correo y contraseña.',
    'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a ingresar e inténtalo otra vez.',
    'auth/user-disabled': 'Esta cuenta está desactivada. Escríbenos desde Ayuda.',
    'auth/web-storage-unsupported': 'Tu navegador no permite guardar la sesión. Desactiva el modo privado e inténtalo otra vez.'
  };
  /* la cuenta local que acompaña al usuario de Firebase (para el perfil, el menú y los pedidos) */
  function upsert(u, extra = {}){
    const S = PL.S; S.accounts = S.accounts || [];
    let acc = S.accounts.find(a => a.fb === u.uid);
    if (!acc) { acc = {id: 'f' + u.uid, fb: u.uid, at: Date.now()}; S.accounts.push(acc); }
    const prov = (u.providerData || []).map(p => p.providerId);
    Object.assign(acc, {
      name: extra.name || u.displayName || acc.name || '',
      email: String(u.email || extra.email || acc.email || '').toLowerCase(),
      phone: digits(u.phoneNumber) || acc.phone || '',
      picture: u.photoURL || acc.picture || '',
      pw: prov.includes('password'), google: prov.includes('google.com'), cel: prov.includes('phone'),
      login: String(u.email || '').toLowerCase(), verified: !!u.emailVerified
    });
    delete acc.hash;
    return acc;
  }
  function onUser(u){
    const S = PL.S, me = PL.me();
    if (u) {
      const acc = upsert(u);
      /* mientras hay un formulario de ingreso abierto, él decide (puede faltar el nombre) */
      if ((!me || me.id !== acc.id) && !PL.$('.au')) { signIn(acc); if (inApp()) PL.render(); }
      else PL.save();
    } else if (me && me.fb) {
      S.session = null; PL.save(); if (PL.syncTop) PL.syncTop(); if (inApp()) PL.render();
    }
  }
  PL.fb = {
    on: () => !!FBC(),
    auth: () => (window.firebase && firebase.apps && firebase.apps.length) ? firebase.auth() : null,
    ready: () => fbP || (fbP = (async () => {
      if (!FBC()) throw new Error('off');
      if (!(window.firebase && firebase.auth)) {
        await script(`https://www.gstatic.com/firebasejs/${FBV}/firebase-app-compat.js`);
        await script(`https://www.gstatic.com/firebasejs/${FBV}/firebase-auth-compat.js`);
      }
      if (!firebase.apps.length) firebase.initializeApp(FBC());
      const auth = firebase.auth(); auth.languageCode = 'es-419';
      auth.onAuthStateChanged(onUser);
      return auth;
    })().catch(e => { fbP = null; throw e; })),
    msg: e => { const c = e && e.code; if (c in ERR) return ERR[c]; console.warn('[Agéndalo] ingreso', e); return 'Algo salió mal. Inténtalo otra vez.'; },
    out: () => { if (FBC() && (fbP || PL.fb.auth())) PL.fb.ready().then(a => a.signOut()).catch(() => {}); },
    user: async () => { const a = await PL.fb.ready(); if (!a.currentUser) { const e = new Error('no user'); e.code = 'auth/requires-recent-login'; throw e; } return a.currentUser; },
    sync: u => { const acc = upsert(u); PL.save(); if (PL.syncTop) PL.syncTop(); return acc; },
    setName: async n => { const u = await PL.fb.user(); await u.updateProfile({displayName: n}); return PL.fb.sync(u); },
    changeEmail: async em => { const u = await PL.fb.user(); await u.verifyBeforeUpdateEmail(em); },
    changePw: async (old, nw) => { const u = await PL.fb.user(); await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, old)); await u.updatePassword(nw); },
    addPw: async (em, pw) => { const u = await PL.fb.user(); await u.linkWithCredential(firebase.auth.EmailAuthProvider.credential(em, pw)); await u.reload(); return PL.fb.sync(firebase.auth().currentUser); },
    verifyMail: async () => { const u = await PL.fb.user(); await u.sendEmailVerification(); },
    resetMail: async em => { const a = await PL.fb.ready(); await a.sendPasswordResetEmail(em); },
    remove: async () => { const u = await PL.fb.user(); const id = 'f' + u.uid; await u.delete(); PL.S.accounts = PL.S.accounts.filter(a => a.id !== id); PL.S.session = null; PL.save(); }
  };
  /* sesión guardada de Firebase: se confirma con el servidor al abrir la página */
  window.addEventListener('load', () => { const me = PL.me(); if (inApp() && me && me.fb && FBC()) PL.fb.ready().catch(() => {}); });

  /* reCAPTCHA invisible para el SMS: un contenedor propio fuera del formulario, que se rehace en cada envío */
  let rcv = null;
  function verifier(){
    if (rcv) { try { rcv.clear(); } catch (e) {} rcv = null; }
    const old = document.getElementById('rc-box'); if (old) old.remove();
    const box = document.createElement('div'); box.id = 'rc-box'; document.body.appendChild(box);
    rcv = new firebase.auth.RecaptchaVerifier(box, {size: 'invisible'});
    return rcv;
  }
  /* si reCAPTCHA muestra el desafío de imágenes y la persona lo cierra, Firebase no avisa: se detecta aquí */
  function challengeClosed(){
    let seen = false, t = null;
    const p = new Promise(res => { t = setInterval(() => {
      const f = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]'), box = f && f.closest('body > div');
      if (box && getComputedStyle(box).visibility === 'visible') seen = true;
      else if (seen) { clearInterval(t); res('closed'); }
    }, 500); });
    p.stop = () => clearInterval(t);
    return p;
  }
  const GLOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';

  const pwField = (id, label, auto, extra = '') => `<label class="field"><span>${label}</span><span class="pw"><input class="in" id="${id}" type="password" autocomplete="${auto}" minlength="8" maxlength="72">
    <button class="pw-eye" type="button" data-eye="${id}" aria-label="Mostrar contraseña">${PL.ic('eye')}</button></span>${extra}</label>`;
  const terms = () => `<label class="check au-terms"><input type="checkbox" id="au-t"><span>Acepto los <a href="#/legal" target="_blank">Términos y condiciones</a> y la <a href="#/legal" target="_blank">Política de privacidad</a>.</span></label>`;
  const N = () => FBC() ? 6 : 4; /* dígitos del código: Firebase manda 6 */

  /* host: contenedor · o: {mode: 'in' | 'up', onDone, reason, onMode} */
  PL.authForm = (host, o = {}) => {
    const st = {mode: o.mode || 'in', me: 'cel', step: 'start', phone: '', name: '', email: '', code: '', purpose: '', wait: 0, conf: null, user: null};
    const fb = !!FBC();
    let tick = null;
    const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };
    PL.onLeave(stopTick);
    if (fb) PL.fb.ready().then(() => { const g = PL.$('#au-g', host); if (g) g.disabled = false; }).catch(() => { const g = PL.$('#au-g', host); if (g) g.closest('.au-gwrap').innerHTML = '<p class="au-gnote">No se pudo conectar. Revisa tu internet y recarga la página.</p>'; });

    function draw(){
      stopTick();
      const up = st.mode === 'up';
      if (st.step === 'otp') {
        const n = N();
        host.innerHTML = `<div class="au">
          <button class="au-back" type="button" data-back>${PL.ic('back')}Cambiar número</button>
          <div class="au-h"><h2>Escribe el código</h2><p>Te lo enviamos por SMS al <b>+51 ${PL.fmtPhone(st.phone)}</b>. Puede tardar unos segundos.</p></div>
          <div class="pin-in au-pin" style="--n:${n}">${Array.from({length: n}, (_, i) => `<input inputmode="numeric" autocomplete="${i ? 'off' : 'one-time-code'}" maxlength="${i ? 1 : n}" aria-label="Dígito ${i + 1}" data-o="${i}">`).join('')}</div>
          <p class="au-err" id="au-err" role="alert"></p>
          <button class="au-link" type="button" id="au-re" disabled></button></div>`;
        const ins = PL.$$('[data-o]', host), re = PL.$('#au-re', host);
        const count = () => { re.disabled = st.wait > 0; re.textContent = st.wait > 0 ? `Reenviar código en 0:${String(st.wait).padStart(2, '0')}` : 'Reenviar código'; };
        count(); tick = setInterval(() => { st.wait = Math.max(0, st.wait - 1); count(); if (!st.wait) stopTick(); }, 1000);
        re.onclick = () => sendCode(re);
        ins.forEach((x, i) => {
          x.oninput = () => {
            const v0 = x.value.replace(/\D/g, '');
            if (v0.length > 1) { v0.slice(0, n).split('').forEach((d, k) => { if (ins[k]) ins[k].value = d; }); (ins[Math.min(n, v0.length) - 1] || x).focus(); } else { x.value = v0; if (v0 && ins[i + 1]) ins[i + 1].focus(); }
            const v = ins.map(y => y.value).join('');
            if (v.length === n) verify(v, ins);
          };
          x.onkeydown = e => { if (e.key === 'Backspace' && !x.value && ins[i - 1]) ins[i - 1].focus(); };
        });
        PL.$('[data-back]', host).onclick = () => { st.step = st.purpose === 'reset' ? 'forgot' : 'start'; draw(); };
        setTimeout(() => ins[0].focus(), 50);
        return;
      }
      if (st.step === 'finish') {
        host.innerHTML = `<div class="au"><div class="au-h"><h2>Crea tu cuenta</h2><p>Verificaste el +51 ${PL.fmtPhone(st.phone)}. Solo falta tu nombre.</p></div>
          <form id="au-f" novalidate><label class="field"><span>Nombre y apellido</span><input class="in" id="au-n" autocomplete="name" maxlength="60" value="${PL.esc(st.name || '')}"></label>
          <label class="field"><span>Correo <em>(opcional)</em></span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80"></label>
          ${terms()}<p class="au-err" id="au-err" role="alert"></p><button class="btn btn-t btn-full" type="submit">Crear cuenta</button></form></div>`;
        PL.$('#au-f', host).onsubmit = async e => {
          e.preventDefault();
          const n = PL.$('#au-n', host).value.trim(), em = PL.$('#au-e', host).value.trim().toLowerCase();
          if (n.length < 3) return err('Escribe tu nombre y apellido', '#au-n');
          if (em && !PL.okMail(em)) return err('Revisa el correo', '#au-e');
          if (!PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
          if (fb) {
            const b = busy(e.submitter, 'Creando tu cuenta…');
            try { await st.user.updateProfile({displayName: n}); done(upsert(st.user, {name: n, email: em}), 'Cuenta creada'); }
            catch (x) { b(); err(PL.fb.msg(x)); }
            return;
          }
          if (em && findBy('email', em)) return err('Ese correo ya tiene una cuenta. Ingresa con él o usa otro.', '#au-e');
          done(create({name: n, phone: st.phone, email: em || ''}), 'Cuenta creada');
        };
        return;
      }
      if (st.step === 'forgot') {
        host.innerHTML = `<div class="au"><button class="au-back" type="button" data-back>${PL.ic('back')}Volver</button>
          <div class="au-h"><h2>Recupera tu cuenta</h2><p>${fb ? 'Escribe el correo de tu cuenta. Te enviaremos un enlace para crear una contraseña nueva.' : 'Escribe el correo de tu cuenta. Te enviaremos un código al celular que registraste.'}</p></div>
          <form id="au-f" novalidate><label class="field"><span>Correo</span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80" value="${PL.esc(st.email)}"></label>
          <p class="au-err" id="au-err" role="alert"></p><button class="btn btn-t btn-full" type="submit">${fb ? 'Enviarme el enlace' : 'Enviarme un código'}</button></form></div>`;
        PL.$('[data-back]', host).onclick = () => { st.step = 'start'; draw(); };
        PL.$('#au-f', host).onsubmit = async e => {
          e.preventDefault();
          const em = PL.$('#au-e', host).value.trim().toLowerCase();
          if (!PL.okMail(em)) return err('Escribe un correo válido', '#au-e');
          st.email = em;
          if (fb) {
            const b = busy(e.submitter, 'Enviando…');
            try { const a = await PL.fb.ready(); await a.sendPasswordResetEmail(em); st.step = 'sent'; draw(); }
            catch (x) { b(); err(PL.fb.msg(x), '#au-e'); }
            return;
          }
          const acc = findBy('email', em);
          if (!acc) return err('No hay una cuenta con ese correo', '#au-e');
          if (!acc.phone) return err('Esta cuenta no tiene celular para recuperarla. Escríbenos desde Ayuda y te ayudamos.');
          st.phone = acc.phone; st.purpose = 'reset'; sendCode(e.submitter);
        };
        return;
      }
      if (st.step === 'sent') {
        host.innerHTML = `<div class="au"><div class="au-h"><span class="au-ok">${PL.ic('mail')}</span><h2>Revisa tu correo</h2>
          <p>Si hay una cuenta con <b>${PL.esc(st.email)}</b>, te llegará un enlace para crear una contraseña nueva. Si no lo ves en unos minutos, revisa la carpeta de spam.</p></div>
          <button class="btn btn-t btn-full" type="button" data-back>Volver a ingresar</button></div>`;
        PL.$('[data-back]', host).onclick = () => { st.step = 'start'; st.me = 'mail'; st.mode = 'in'; draw(); };
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
        <div class="au-h"><h2>${up ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</h2><p>${o.reason ? PL.esc(o.reason) : up ? 'Para pedir servicios, guardar tus direcciones y volver a contratar a quien te ayudó.' : fb ? 'Con Google, tu celular o tu correo.' : 'Con tu celular o con tu correo.'}</p></div>
        ${fb ? `<div class="au-gwrap"><button class="btn btn-full au-gbtn" type="button" id="au-g"${PL.fb.auth() ? '' : ' disabled'}>${GLOGO}<span>${up ? 'Crear cuenta con Google' : 'Continuar con Google'}</span></button>
          ${up ? '<p class="au-gnote">Al continuar con Google aceptas los <a href="#/legal" target="_blank">Términos</a> y la <a href="#/legal" target="_blank">Política de privacidad</a>.</p>' : ''}</div><p class="au-or"><span>o con</span></p>` : ''}
        <div class="seg au-seg" role="group" aria-label="Cómo ${up ? 'crear la cuenta' : 'ingresar'}"><button type="button" data-me="cel" aria-pressed="${cel}">${PL.ic('phone')}Celular</button><button type="button" data-me="mail" aria-pressed="${!cel}">${PL.ic('mail')}Correo</button></div>
        <form id="au-f" novalidate>
          ${up ? `<label class="field"><span>Nombre y apellido</span><input class="in" id="au-n" autocomplete="name" maxlength="60" value="${PL.esc(st.name || '')}"></label>` : ''}
          ${cel ? `<label class="field"><span>Celular</span><span class="tel"><span class="cc">+51</span><input class="in" id="au-ph" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" placeholder="9XX XXX XXX" value="${PL.esc(PL.fmtPhone(st.phone))}"></span></label>`
            : `<label class="field"><span>Correo</span><input class="in" id="au-e" type="email" autocomplete="email" maxlength="80" value="${PL.esc(st.email)}"></label>
               ${pwField('au-p', 'Contraseña', up ? 'new-password' : 'current-password', up ? '<span class="pw-meter" id="au-m"><i></i><i></i><i></i><i></i></span><small class="au-hint">Mínimo 8 caracteres. Mejor si mezclas letras, números y un símbolo.</small>' : '')}
               ${up ? '' : '<button class="au-link au-forgot" type="button" id="au-fg">¿Olvidaste tu contraseña?</button>'}`}
          ${up ? terms() : ''}
          <p class="au-err" id="au-err" role="alert"></p>
          <button class="btn btn-t btn-full" type="submit">${cel ? 'Enviarme un código' : up ? 'Crear cuenta' : 'Ingresar'}</button>
          ${cel && fb ? '<p class="au-cap">Te enviaremos un SMS con un código. Este sitio usa reCAPTCHA de Google para evitar abusos.</p>' : ''}
        </form>
        <p class="au-alt">${up ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'} <button type="button" class="au-link" data-sw>${up ? 'Ingresa' : 'Crea una'}</button></p>
      </div>`;
      const g = PL.$('#au-g', host); if (g) g.onclick = () => google(g);
      PL.$('.au-seg', host).onclick = e => { const b = e.target.closest('[data-me]'); if (!b) return; keep(); st.me = b.dataset.me; draw(); };
      PL.$('[data-sw]', host).onclick = () => { keep(); st.mode = up ? 'in' : 'up'; draw(); if (o.onMode) o.onMode(st.mode); };
      const ph = PL.$('#au-ph', host);
      if (ph) ph.oninput = () => { const d = digits(ph.value).slice(0, 9); ph.value = d.length > 6 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d; };
      const fg = PL.$('#au-fg', host); if (fg) fg.onclick = () => { keep(); st.step = 'forgot'; draw(); };
      bindPw();
      PL.$('#au-f', host).onsubmit = async e => {
        e.preventDefault(); keep();
        const btn = e.submitter || PL.$('#au-f [type=submit]', host);
        if (up && st.name.length < 3) return err('Escribe tu nombre y apellido', '#au-n');
        if (cel) {
          if (!okPhone(st.phone)) return err('El celular tiene 9 dígitos y empieza con 9', '#au-ph');
          if (up && !PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
          st.purpose = up ? 'up' : 'in'; sendCode(btn); return;
        }
        const pw = PL.$('#au-p', host).value;
        if (!PL.okMail(st.email)) return err('Escribe un correo válido', '#au-e');
        if (pw.length < 8) return err(up ? 'Usa al menos 8 caracteres' : 'Correo o contraseña incorrectos', '#au-p');
        if (up && !PL.$('#au-t', host).checked) return err('Para continuar, acepta los términos');
        if (fb) {
          const b = busy(btn, up ? 'Creando tu cuenta…' : 'Ingresando…');
          try {
            const a = await PL.fb.ready();
            if (up) {
              const c = await a.createUserWithEmailAndPassword(st.email, pw);
              await c.user.updateProfile({displayName: st.name});
              c.user.sendEmailVerification().catch(() => {});
              done(upsert(c.user, {name: st.name}), 'Cuenta creada. Te enviamos un correo para confirmarlo.');
            } else {
              const c = await a.signInWithEmailAndPassword(st.email, pw);
              const acc = upsert(c.user); done(acc, hello(acc));
            }
          } catch (x) { b(); err(PL.fb.msg(x), /email/.test(x.code || '') ? '#au-e' : '#au-p'); }
          return;
        }
        const acc = findBy('email', st.email);
        if (up) {
          if (acc) return err('Ya hay una cuenta con este correo. Ingresa con él.', '#au-e');
          done(create({name: st.name, email: st.email, phone: '', hash: await PL.hash(pw)}), 'Cuenta creada');
        } else {
          if (!acc || !acc.hash || acc.hash !== await PL.hash(pw)) return err('Correo o contraseña incorrectos', '#au-p');
          done(acc, hello(acc));
        }
      };
      const f1 = PL.$('#au-f .in', host); if (f1 && PL.isDesk() && !o.noFocus) f1.focus();
    }
    function keep(){
      const n = PL.$('#au-n', host), ph = PL.$('#au-ph', host), em = PL.$('#au-e', host);
      if (n) st.name = n.value.trim(); if (ph) st.phone = digits(ph.value); if (em) st.email = em.value.trim().toLowerCase();
    }
    function err(msg, sel){
      const e = PL.$('#au-err', host); if (e) e.textContent = msg || '';
      PL.$$('.in.err', host).forEach(x => x.classList.remove('err'));
      const f = msg && sel && PL.$(sel, host); if (f) { f.classList.add('err'); f.focus(); }
    }
    /* botón ocupado mientras responde el servidor; devuelve cómo soltarlo */
    function busy(b, label){
      if (!b) return () => {};
      const html = b.innerHTML; b.disabled = true; b.classList.add('is-busy'); b.innerHTML = `<span class="spin" aria-hidden="true"></span>${label}`;
      return () => { if (b.isConnected) { b.disabled = false; b.classList.remove('is-busy'); b.innerHTML = html; } };
    }
    function bindPw(){
      PL.$$('[data-eye]', host).forEach(b => b.onclick = () => { const i = PL.$('#' + b.dataset.eye, host), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = PL.ic(show ? 'eyeoff' : 'eye'); b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
      const m = PL.$('#au-m', host), p = PL.$('#au-p', host);
      if (m && p) p.addEventListener('input', () => { const s = p.value ? strength(p.value) : 0; m.dataset.s = s; });
    }
    async function sendCode(btn){
      if (!fb) {
        st.code = String(PL.ri(1000, 9999)); st.wait = 30; st.step = 'otp'; draw();
        PL.toast(`Código de prueba (en esta versión no se envía SMS): ${st.code}`, 8000);
        return;
      }
      const b = busy(btn, 'Enviando el código…'), closed = challengeClosed();
      try {
        const a = await PL.fb.ready();
        const r = await Promise.race([a.signInWithPhoneNumber('+51' + st.phone, verifier()), closed]);
        if (r === 'closed') { b(); return; }
        st.conf = r; st.wait = 45; st.step = 'otp'; draw();
      } catch (x) { b(); err(PL.fb.msg(x), st.step === 'start' ? '#au-ph' : null); }
      finally { closed.stop(); }
    }
    async function verify(v, ins){
      const wrong = msg => { err(msg); ins.forEach(y => { y.value = ''; y.classList.add('err'); y.disabled = false; }); ins[0].focus(); };
      if (fb) {
        ins.forEach(y => { y.disabled = true; y.classList.remove('err'); }); err('');
        try {
          const c = await st.conf.confirm(v), u = c.user, nuevo = !!(c.additionalUserInfo && c.additionalUserInfo.isNewUser);
          st.user = u;
          if (st.purpose === 'up') {
            if (nuevo || !u.displayName) { await u.updateProfile({displayName: st.name}); done(upsert(u, {name: st.name}), 'Cuenta creada'); }
            else { const acc = upsert(u); done(acc, 'Ya tenías una cuenta con este número. Ingresaste.'); }
            return;
          }
          if (u.displayName) { const acc = upsert(u); done(acc, hello(acc)); return; }
          st.mode = 'up'; st.step = 'finish'; draw();
        } catch (x) { wrong(PL.fb.msg(x)); }
        return;
      }
      if (v !== st.code) return wrong('El código no coincide. Revisa el SMS e inténtalo otra vez.');
      const acc = findBy('phone', st.phone);
      if (st.purpose === 'reset') { st.step = 'newpw'; draw(); return; }
      if (acc) { done(acc, st.purpose === 'up' ? 'Ya tenías una cuenta con este número. Ingresaste.' : hello(acc)); return; }
      if (st.purpose === 'up') { done(create({name: st.name, phone: st.phone, email: ''}), 'Cuenta creada'); return; }
      st.mode = 'up'; st.step = 'finish'; draw();
    }
    /* Google: la ventana se abre en el mismo clic (si no, el navegador la bloquea), por eso el SDK ya está cargado */
    async function google(btn){
      const a = PL.fb.auth(); if (!a) return;
      const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt: 'select_account'});
      const b = busy(btn, 'Esperando a Google…'); err('');
      try {
        const c = await a.signInWithPopup(p), nuevo = !!(c.additionalUserInfo && c.additionalUserInfo.isNewUser);
        const acc = upsert(c.user); done(acc, nuevo ? 'Cuenta creada con Google' : hello(acc));
      } catch (x) { b(); err(PL.fb.msg(x)); }
    }
    function done(acc, msg){ stopTick(); signIn(acc, msg); if (o.onDone) o.onDone(acc); }
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
          <h1>Ayuda de confianza, <span>el día que la necesitas.</span></h1>
          <ul><li>${PL.ic('check')}Personas y empresas verificadas</li><li>${PL.ic('check')}Pagas en el momento, en efectivo o como acuerden</li><li>${PL.ic('check')}Vuelve a contratar a quien te ayudó</li></ul>
        </div></div>
        <div class="acc-form" id="au"></div>
      </section>`;
      PL.authForm(PL.$('#au', view), {mode, onMode: m => history.replaceState(null, '', m === 'up' ? '#/crear-cuenta' : '#/ingresar'), onDone: () => PL.go(qs.get('next') || '#/')});
    };
  }
  PL.route('ingresar', page('in'), {tab: 'cuenta'});
  PL.route('crear-cuenta', page('up'), {tab: 'cuenta'});
})();
