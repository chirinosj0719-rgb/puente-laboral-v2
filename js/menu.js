/* Puente Laboral · menú de rayas (en la landing, la app y la página para empresas) */
(function(){
  const PL = window.PL;
  const inApp = () => !!PL.$('#view');
  const A = h => (inApp() ? '' : 'app.html') + h;

  PL.menuGroups = () => [
    ['Puente', [['home', 'Inicio', 'index.html'], ['search', 'Abrir la app', A('#/')], ['bag', 'Para empresas', 'empresas.html'], ['users', 'Trabajar con Puente', A('#/trabajar')]]],
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
    d.innerHTML = `<div class="dr-h"><a class="logo" href="index.html"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="25" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="5.5"/><circle cx="39" cy="32" r="12" fill="none" stroke="#FF5A1F" stroke-width="5.5"/></svg><span>Puente Laboral</span></a><button class="ibtn" type="button" data-x aria-label="Cerrar menú">${PL.ic('x')}</button></div>
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
