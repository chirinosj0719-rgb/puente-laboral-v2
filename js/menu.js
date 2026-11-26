/* Agéndalo · menú de rayas (en la landing, la app y la página para empresas) */
(function(){
  const PL = window.PL;
  const inApp = () => !!PL.$('#view');
  const A = h => (inApp() ? '' : 'app.html') + h;

  /* foto de la cuenta (la de Google) o sus iniciales */
  PL.meAv = (me, cls = '') => me && me.picture ? `<img class="av av-img ${cls}" src="${PL.esc(me.picture)}" alt="" referrerpolicy="no-referrer">` : PL.avatar((me && (me.name || me.phone)) || 'Tú', '#FFE3D4', cls);
  PL.menuGroups = () => [
    ['Agéndalo', [['home', 'Inicio', 'index.html'], ['search', 'Abrir la app', A('#/')], ['bag', 'Para empresas', 'empresas.html'], ['users', 'Trabajar con Agéndalo', A('#/trabajar')]]],
    ['Tu cuenta', [['user', 'Información personal', A('#/perfil')], ['list', 'Historial de pedidos', A('#/pedidos?t=past')], ['pin', 'Direcciones', A('#/direcciones')], ['heart', 'Favoritos', A('#/equipo')], ['wallet', 'Billetera', A('#/billetera')], ['bell', 'Notificaciones', A('#/notificaciones')], ['gear', 'Ajustes', A('#/ajustes')]]],
    ['Soporte', [['help', 'Ayuda', '#ayuda'], ['id', 'Información legal', A('#/legal')], ['book', 'Libro de Reclamaciones', A('#/reclamaciones')]]]
  ];
  PL.menuHead = () => {
    const acc = PL.me();
    return acc
      ? `<a class="mh" href="${A('#/perfil')}">${PL.meAv(acc)}<span><b>${PL.esc(acc.name || 'Tu cuenta')}</b><span>${PL.esc(acc.email || (acc.phone ? '+51 ' + PL.fmtPhone(acc.phone) : ''))}</span></span>${PL.ic('chev', 'i chev')}</a>`
      : `<div class="mh guest"><b>Tu cuenta</b><span>Guarda tus pedidos, direcciones y favoritos.</span><span class="mh-btns"><a class="btn btn-t btn-sm" href="${A('#/ingresar')}">Ingresar</a><a class="btn btn-l btn-sm" href="${A('#/crear-cuenta')}">Crear cuenta</a></span></div>`;
  };
  PL.menuList = () => PL.menuGroups().map(([g, items]) => `<p class="mg">${g}</p><div class="ml">${items.map(([ic, t, h]) => `<a href="${h}"${h === '#ayuda' ? ' data-help' : ''}>${PL.ic(ic)}<span>${t}</span>${PL.ic('chev', 'i chev')}</a>`).join('')}</div>`).join('')
    + (PL.S.session ? `<button class="ml-out" type="button" data-logout>${PL.ic('logout')}Cerrar sesión</button>` : '');

  PL.logout = () => { try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {} PL.S.session = null; PL.save(); PL.toast('Cerraste sesión'); PL.syncTop(); if (inApp()) PL.render(); };
  /* botón de cuenta en la barra de arriba: "Ingresar" o tu nombre */
  PL.syncTop = () => {
    const tb = PL.$('.top-in'); if (!tb) return;
    let b = PL.$('#acctTop');
    if (!b) { b = document.createElement('a'); b.id = 'acctTop'; tb.insertBefore(b, PL.$('#helpTop') || PL.$('.land-open') || null); }
    const me = PL.me();
    b.className = me ? 'acct-top me' : 'acct-top';
    b.href = A(me ? '#/cuenta' : '#/ingresar');
    b.innerHTML = me ? `${PL.meAv(me, 's')}<span>${PL.esc(String(me.name || 'Tu cuenta').split(' ')[0])}</span>` : `${PL.ic('user')}<span>Ingresar</span>`;
    b.setAttribute('aria-label', me ? 'Tu cuenta' : 'Ingresar o crear cuenta');
  };

  function open(){
    let d = PL.$('#drawer');
    if (!d) { d = document.createElement('dialog'); d.id = 'drawer'; d.className = 'drawer'; d.setAttribute('aria-label', 'Menú'); document.body.appendChild(d); bind(d); }
    d.innerHTML = `<div class="dr-h"><a class="logo" href="index.html"><svg viewBox="15 25 90 70" aria-hidden="true"><path fill="#FF5A1F" d="${PL.LOGO_D}"/></svg><span>Agéndalo</span></a><button class="ibtn" type="button" data-x aria-label="Cerrar menú">${PL.ic('x')}</button></div>
      <div class="dr-b">${PL.menuHead()}${PL.menuList()}</div>`;
    d.showModal();
  }
  function bind(d){
    d.addEventListener('click', e => {
      if (e.target === d || e.target.closest('[data-x]')) { d.close(); return; }
      if (e.target.closest('[data-help]')) { e.preventDefault(); d.close(); PL.helpCenter(); return; }
      if (e.target.closest('[data-logout]')) { d.close(); PL.logout(); return; }
      if (e.target.closest('a')) d.close();
    });
  }
  PL.openMenu = open;

  window.addEventListener('DOMContentLoaded', () => {
    const tb = PL.$('.top-in'); if (!tb || PL.$('#burger')) return;
    tb.insertAdjacentHTML('afterbegin', `<button class="burger" id="burger" type="button" aria-label="Abrir menú">${PL.ic('menu')}</button>`);
    PL.$('#burger').onclick = open;
    PL.syncTop();
  });
})();
