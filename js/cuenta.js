/* Puente Laboral · cuenta, ayuda y datos */
(function(){
  const PL = window.PL;
  const FAQ = [
    ['¿Cuánto cuesta?', 'Tú propones el precio y se lo pagas directo al trabajador cuando termina. [Comisión de Puente Laboral: por definir]'],
    ['¿Cómo se paga?', 'En efectivo, Yape o Plin, directo a la persona que hizo el trabajo. Puedes dejar propina si quieres.'],
    ['¿Cómo verifican a los trabajadores?', 'Revisamos su DNI y su certificado de antecedentes antes de activar su cuenta. Después, las calificaciones de los clientes muestran cómo trabaja.'],
    ['¿Para qué es el código de inicio?', 'Es un número de 4 dígitos que solo tú tienes. Cuando el trabajador llega, se lo das: así confirmas que es la persona que aceptó tu pedido.'],
    ['¿Qué pasa si algo sale mal?', 'Usa el botón Ayuda dentro del pedido: llamas a emergencias o reportas el problema desde la app. Si el trabajo quedó mal, repórtalo desde el resumen del pedido.'],
    ['¿Cómo empiezo a trabajar?', 'Entra a Trabajar, crea tu perfil y sube tus documentos. Cuando lo activemos, te conectas y empiezan a llegar pedidos.']
  ];

  PL.route('cuenta', view => {
    const S = PL.S, c = S.client;
    view.innerHTML = `<div class="wrap"><div class="page-h"><span class="eti">Tu cuenta</span><h1>Hola${c.name ? ', <span class="k">' + PL.esc(c.name.split(' ')[0]) + '</span>' : ''}</h1></div>
      <div class="acc">
        <div style="display:grid;gap:14px">
          <form class="card" id="cf"><div class="who" style="margin-bottom:16px">${c.name ? PL.avatar(c.name, '#FFD86B') : `<span class="av" style="background:var(--papel)">${PL.ic('user')}</span>`}<div><b>${PL.esc(c.name || 'Tus datos')}</b><span class="muted">Para que sepan a quién atienden</span></div></div>
            <label class="field"><span>Nombre</span><input class="in" id="an" autocomplete="name" maxlength="40" value="${PL.esc(c.name)}"></label>
            <label class="field"><span>Celular</span><input class="in" id="ap" type="tel" inputmode="numeric" maxlength="9" placeholder="9XXXXXXXX" value="${PL.esc(c.phone)}"></label>
            <p class="blk-t" style="margin-top:0;font-size:.9rem;font-family:var(--f-b);font-weight:600">Distrito</p>
            <button class="in" type="button" id="ad" style="display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;margin-bottom:16px">${PL.ic('pin')}<span style="flex:1">${PL.esc(c.district || 'Elige tu distrito')}</span>${PL.ic('chev')}</button>
            <button class="btn btn-t btn-full" type="submit">Guardar</button></form>
          <div class="list">
            <a href="#/pedidos">${PL.ic('list')}<span>Mis pedidos<span class="sub">${S.orders.length} en total</span></span>${PL.ic('chev', 'i chev')}</a>
            <a href="#/equipo">${PL.ic('heart')}<span>Mis trabajadores<span class="sub">${S.favs.length ? S.favs.length + ' de confianza' : 'Guarda a quien te gustó'}</span></span>${PL.ic('chev', 'i chev')}</a>
            <a href="${S.biz ? '#/mi-empresa' : '#/empresa-registro'}">${PL.ic('users')}<span>${S.biz ? 'Mi empresa' : 'Registrar mi empresa'}<span class="sub">${S.biz ? PL.esc(S.biz.n) : 'Para empresas con varios trabajadores'}</span></span>${PL.ic('chev', 'i chev')}</a>
            <a href="#/trabajar">${PL.ic('bag')}<span>Modo trabajador<span class="sub">${S.worker ? 'Tu panel de trabajo' : 'Gana con tu oficio'}</span></span>${PL.ic('chev', 'i chev')}</a>
            <button type="button" id="demo">${PL.ic('help')}<span>Qué es la demo<span class="sub">Lo que es de ejemplo y lo que no</span></span>${PL.ic('chev', 'i chev')}</button>
          </div>
        </div>
        <div style="display:grid;gap:14px">
          <div class="list"><p class="eti">Preguntas frecuentes</p>${FAQ.map(f => `<details class="faq"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div>
          <div class="list">
            <button type="button" id="rep">${PL.ic('chat')}<span>Reportar un problema<span class="sub">Cuéntanos qué pasó</span></span>${PL.ic('chev', 'i chev')}</button>
            <button type="button" id="wipe" style="color:#9B1C10">${PL.ic('trash')}<span>Borrar mis datos de este dispositivo<span class="sub">Pedidos, perfil y ganancias de la demo</span></span></button>
          </div>
        </div>
      </div></div>${PL.footer()}`;
    let dist = c.district;
    PL.$('#ad', view).onclick = () => PL.pickDistrict(dist, d => { dist = d; PL.$('#ad span', view).textContent = d; });
    PL.$('#cf', view).onsubmit = e => {
      e.preventDefault();
      const n = PL.$('#an', view), p = PL.$('#ap', view);
      if (p.value && !/^9\d{8}$/.test(p.value.trim())) { p.classList.add('err'); p.focus(); PL.toast('El celular tiene 9 dígitos y empieza con 9'); return; }
      c.name = n.value.trim(); c.phone = p.value.trim(); c.district = dist; PL.save(); PL.toast('Datos guardados'); PL.render();
    };
    PL.$('#demo', view).onclick = PL.demoInfo;
    PL.$('#rep', view).onclick = () => PL.report();
    PL.$('#wipe', view).onclick = async () => {
      if (await PL.confirm({title: '¿Borrar tus datos?', text: 'Se borran tus pedidos, tu perfil de trabajador y tus ganancias de este dispositivo. No se puede deshacer.', ok: 'Sí, borrar', cancel: 'Cancelar', danger: true})) { PL.reset(); PL.toast('Listo, empezamos de cero'); PL.go('#/'); }
    };
  }, {tab: 'cuenta'});
})();
