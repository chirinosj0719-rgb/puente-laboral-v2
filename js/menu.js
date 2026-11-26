/* Agéndalo · menú de rayas (en la landing, la app y la página para empresas) */
(function(){
  const PL = window.PL;
  const inApp = () => !!PL.$('#view');
  const A = h => (inApp() ? '' : 'app.html') + h;

  PL.menuGroups = () => [
    ['Agéndalo', [['home', 'Inicio', 'index.html'], ['search', 'Abrir la app', A('#/')], ['bag', 'Para empresas', 'empresas.html'], ['users', 'Trabajar con Agéndalo', A('#/trabajar')]]],
    ['Tu cuenta', [['user', 'Información personal', A('#/perfil')], ['list', 'Historial de pedidos', A('#/pedidos?t=past')], ['pin', 'Direcciones', A('#/direcciones')], ['heart', 'Favoritos', A('#/equipo')], ['wallet', 'Billetera', A('#/billetera')], ['bell', 'Notificaciones', A('#/notificaciones')], ['gear', 'Ajustes', A('#/ajustes')]]],
    ['Soporte', [['help', 'Ayuda', '#ayuda'], ['id', 'Información legal', A('#/legal')], ['book', 'Libro de Reclamaciones', A('#/reclamaciones')]]]
  ];
  PL.menuHead = () => {
    const S = PL.S, acc = S.session && S.account;
    return acc
      ? `<a class="mh" href="${A('#/perfil')}">${PL.avatar(acc.name || acc.email, '#FFE3D4')}<span><b>${PL.esc(acc.name || 'Tu cuenta')}</b><span>${PL.esc(acc.email)}</span></span>${PL.ic('chev', 'i chev')}</a>`
      : `<div class="mh guest"><b>Tu cuenta</b><span>Guarda tus pedidos, direcciones y favoritos.</span><a class="btn btn-t btn-sm" href="${A('#/ingresar')}">Ingresar o crear cuenta</a></div>`;
  };
  PL.menuList = () => PL.menuGroups().map(([g, items]) => `<p class="mg">${g}</p><div class="ml">${items.map(([ic, t, h]) => `<a href="${h}"${h === '#ayuda' ? ' data-help' : ''}>${PL.ic(ic)}<span>${t}</span>${PL.ic('chev', 'i chev')}</a>`).join('')}</div>`).join('')
    + (PL.S.session ? `<button class="ml-out" type="button" data-logout>${PL.ic('logout')}Cerrar sesión</button>` : '');

  PL.logout = () => { PL.S.session = null; PL.save(); PL.toast('Cerraste sesión'); if (inApp()) PL.render(); };

  function open(){
    let d = PL.$('#drawer');
    if (!d) { d = document.createElement('dialog'); d.id = 'drawer'; d.className = 'drawer'; d.setAttribute('aria-label', 'Menú'); document.body.appendChild(d); bind(d); }
    d.innerHTML = `<div class="dr-h"><a class="logo" href="index.html"><svg viewBox="15 25 90 70" aria-hidden="true"><path fill="#FF5A1F" d="M15 57.5A2.5 2.5 0 0 1 17.5 55L32.5 55A2.5 2.5 0 0 1 35 57.5L35 64A1 1 0 0 0 36 65L54 65A1 1 0 0 0 55 64L55 57.5A2.5 2.5 0 0 1 57.5 55L64 55A1 1 0 0 0 65 54L65 47.5A2.5 2.5 0 0 1 67.5 45L74 45A1 1 0 0 0 75 44L75 37.5A2.5 2.5 0 0 1 77.5 35L84 35A1 1 0 0 0 85 34L85 27.5A2.5 2.5 0 0 1 87.5 25L95 25A10 10 0 0 1 105 35L105 42.5A2.5 2.5 0 0 1 102.5 45L96 45A1 1 0 0 0 95 46L95 52.5A2.5 2.5 0 0 1 92.5 55L86 55A1 1 0 0 0 85 56L85 62.5A2.5 2.5 0 0 1 82.5 65L76 65A1 1 0 0 0 75 66L75 72.5A2.5 2.5 0 0 1 72.5 75L66 75A1 1 0 0 0 65 76L65 82.5A2.5 2.5 0 0 1 62.5 85L56 85A1 1 0 0 0 55 86L55 92.5A2.5 2.5 0 0 1 52.5 95L37.5 95A2.5 2.5 0 0 1 35 92.5L35 86A1 1 0 0 0 34 85L27.5 85A2.5 2.5 0 0 1 25 82.5L25 76A1 1 0 0 0 24 75L17.5 75A2.5 2.5 0 0 1 15 72.5Z"/></svg><span>Agéndalo</span></a><button class="ibtn" type="button" data-x aria-label="Cerrar menú">${PL.ic('x')}</button></div>
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
  });
})();
