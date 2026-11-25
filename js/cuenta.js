/* Puente Laboral · cuenta: centro de todas las secciones de la cuenta */
(function(){
  const PL = window.PL;
  const FAQ = [
    ['¿Cuánto cuesta?', 'Tú propones el precio y se lo pagas directamente a quien hizo el trabajo, al terminar. [Comisión de Puente Laboral: por definir]'],
    ['¿Cómo se paga?', 'En efectivo, Yape o Plin, directamente a la persona o empresa que hizo el trabajo.'],
    ['¿Cómo verifican a los trabajadores y empresas?', 'Revisamos el DNI y el certificado de antecedentes de cada trabajador, y el RUC de cada empresa, antes de activarlos.'],
    ['¿Para qué es el código de inicio?', 'Es un número de 4 dígitos que solo tú tienes. Cuando llega la persona, se lo das y así confirmas que es quien aceptó tu pedido.'],
    ['¿Qué hago si algo sale mal?', 'Dentro del pedido usa el botón Ayuda: puedes llamar a emergencias o reportar el problema. También puedes registrar un reclamo en el Libro de Reclamaciones.'],
    ['¿Cómo empiezo a trabajar con Puente?', 'Entra a Trabajar con Puente, verifica tu celular y sube tus documentos. Las empresas se registran desde la página Para empresas.']
  ];

  PL.route('cuenta', view => {
    const S = PL.S, acc = S.session && S.account;
    const name = (acc && acc.name) || S.client.name;
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">${PL.ic('user')}Tu cuenta</span><h1>${name ? `Hola, <span class="k">${PL.esc(name.split(' ')[0])}</span>` : 'Tu cuenta'}</h1></div>
      <div class="acc">
        <div><div class="menu-page">${PL.menuHead()}${PL.menuList()}</div></div>
        <div><p class="eti">${PL.ic('help')}Preguntas frecuentes</p><div class="list">${FAQ.map(f => `<details class="faq"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div>
          <div class="list" style="margin-top:22px"><button type="button" id="rep">${PL.ic('chat')}<span>Reportar un problema</span>${PL.ic('chev', 'i chev')}</button></div></div>
      </div></div>${PL.footer()}`;
    PL.$('#rep', view).onclick = () => PL.report();
    view.querySelector('.menu-page').addEventListener('click', e => {
      if (e.target.closest('[data-help]')) { e.preventDefault(); PL.helpCenter(); }
      if (e.target.closest('[data-logout]')) PL.logout();
    });
  }, {tab: 'cuenta'});
})();
