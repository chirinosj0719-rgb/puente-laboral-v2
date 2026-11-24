/* Puente Laboral · landing: explica qué es y lleva a la app (app.html) */
(function(){
  const PL = window.PL;
  const APP = 'app.html';
  const ART_YA = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><defs><linearGradient id="gYa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9466"/><stop offset="1" stop-color="#EE4A0E"/></linearGradient></defs><ellipse cx="78" cy="126" rx="42" ry="7" fill="#E9A182" opacity=".45"/><circle cx="78" cy="64" r="50" fill="url(#gYa)"/><circle cx="78" cy="64" r="49" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><path d="M86 24L58 70h19l-7 40 30-50H80z" fill="#fff"/><path d="M8 46h18M2 64h20M8 82h16" stroke="#EE4A0E" stroke-width="5" stroke-linecap="round" opacity=".45"/></svg>`;
  const ART_PROG = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><ellipse cx="75" cy="127" rx="46" ry="7" fill="#8ACDAE" opacity=".45"/><rect x="22" y="22" width="106" height="98" rx="20" fill="#fff"/><path d="M22 42a20 20 0 0 1 20-20h66a20 20 0 0 1 20 20v10H22z" fill="#18A058"/><rect x="46" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/><rect x="95" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/>${[68, 86, 104].map((y, r) => [44, 62, 80, 98].map((x, c) => (r === 1 && c === 2) ? '' : `<circle cx="${x + 4}" cy="${y}" r="4.5" fill="#E2D8CB"/>`).join('')).join('')}<circle cx="84" cy="86" r="13" fill="#FF5A1F"/><path d="M78 86l4 4 8-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const mav = ic => `<span class="mav">${PL.ic(ic)}</span>`;

  function render(){
    const land = PL.$('#land');
    document.body.dataset.view = 'inicio';
    const drumList = ['gasfitero', 'ninera', 'veterinaria', 'electricista', 'limpieza', 'mudanza', 'chofer', 'adulto', 'dj', 'profesor', 'jardinero', 'barman'].map(PL.svc);
    const appLink = h => h.replace(/href="#\//g, `href="${APP}#/`);
    land.innerHTML = `
    <section class="hero"><div class="hero-in">
      <a class="news rise" href="${APP}"><b>Demo</b>Prueba la app: pide al toque o programa ${PL.ic('arrow')}</a>
      <h1 class="rise">Ayuda de confianza, <span class="sel"><i aria-hidden="true"></i>al toque</span> o el día que quieras.</h1>
      <div class="hero-row rise">
        <div><p class="lead">Gasfiteros, niñeras, choferes, veterinarias, mudanzas y más, cerca de ti. Personas independientes y empresas con su equipo, en una sola app.</p>
          <div class="crowd">${PL.ic('shield')}<span>Cada trabajador y cada empresa pasa un filtro antes de su primer pedido</span></div></div>
        <div><form class="search-box" id="lq">${PL.ic('search')}<input id="lqi" type="search" placeholder="¿Qué necesitas? Ej.: gasfitero" aria-label="Buscar un servicio en la app" autocomplete="off"><button class="btn btn-a btn-sm" type="submit">Buscar</button></form>
          <div class="land-ctas"><a class="btn btn-w" href="${APP}">Abrir la app<span class="arr">${PL.ic('arrow')}</span></a><a class="btn btn-dl" href="${APP}#/trabajar">Quiero trabajar</a></div></div>
      </div>
    </div></section>
    <section class="modes" id="modos" aria-label="Dos formas de pedir">
      <a class="mode ya" href="${APP}#/?m=ya"><span class="go">${PL.ic('arrow')}</span><div><span class="eti">${PL.ic('bolt')}Ahora mismo</span><h3>Al toque</h3><p>Alguien va ahora, en minutos. Para lo urgente.</p><div class="tags"><span>Gasfitero</span><span>Cerrajero</span><span>Electricista</span><span>Niñera</span></div></div>${ART_YA}</a>
      <a class="mode prog" href="${APP}#/?m=prog"><span class="go">${PL.ic('arrow')}</span><div><span class="eti v">${PL.ic('cal')}Con anticipación</span><h3>Programado</h3><p>Eliges día y hora. Una vez, cada semana o cada mes.</p><div class="tags"><span>Eventos</span><span>Limpieza</span><span>Clases</span><span>Mudanza</span></div></div>${ART_PROG}</a>
    </section>
    <section class="band" id="scene" aria-label="Ejemplo de un pedido en el mapa"></section>
    <div class="wrap">
      <section class="drum-sec" aria-label="Oficios">
        <span class="eti">${PL.ic('bolt')}Para lo que necesites</span>
        <div class="drum" id="drum" role="button" tabindex="0" aria-label="Pedir el oficio del centro en la app"><ul>${drumList.map(s => `<li>${PL.esc(s.n)}</li>`).join('')}</ul></div>
        <div class="drum-foot"><span><b id="dn">1</b> de ${drumList.length}</span><span id="dc"></span></div>
      </section>
      <section class="sec" id="como">
        <div class="sec-h"><span class="eti">${PL.ic('bolt')}Cómo funciona</span><h2>Dos formas de pedir, <span class="k">una sola app.</span></h2><p>Lo urgente llega en minutos. Lo planeado, con calma y con la persona que tú elijas.</p></div>
        <div class="feats">
          <article class="feat"><div class="feat-art p"><div class="mock"><div class="mock-h"><span>gasfitero · disponibles</span><span>ahora</span></div><div class="mock-row">${mav('user')}<div><b>Gasfitero</b><span>Cerca de ti · verificado</span></div><span class="ok" style="margin-left:auto">Ver perfil</span></div><div class="mock-row">${mav('user')}<div><b>Gasfitera</b><span>Cerca de ti · verificada</span></div></div><div class="mock-row">${mav('bag')}<div><b>Empresa de gasfitería</b><span>Con su equipo</span></div></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('bolt')}Al toque</span><h3>Lo necesitas ya. Llega en minutos.</h3><p>Una fuga, te quedaste afuera, se fue la luz. Entras al servicio, ves quién está disponible y sigues en el mapa cuándo llega.</p><span class="pill a">Seguimiento en vivo</span></div></article>
          <article class="feat flip"><div class="feat-art m"><div class="mock"><div class="mock-h"><span>limpieza del hogar</span><span>programado</span></div><div class="mock-days">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<span class="${i === 5 ? 'on' : ''}">${d}<b>${23 + i}</b></span>`).join('')}</div><div class="mock-times"><span>8 a. m.</span><span class="on">9 a. m.</span><span>10 a. m.</span><span>11 a. m.</span></div><div style="margin-top:10px"><span class="pill m">${PL.ic('check')}Cada semana</span></div></div></div>
            <div class="feat-txt"><span class="eti v">${PL.ic('cal')}Programado</span><h3>Para el sábado, o para cada semana.</h3><p>Eventos, limpieza, clases, cuidado. Eliges día y hora con anticipación y, si quieres, se repite solo con la misma persona.</p><span class="pill m">Una vez, cada semana o cada mes</span></div></article>
          <article class="feat"><div class="feat-art p"><div class="mock"><div class="mock-h"><span>chat · presupuesto</span><span>antes de contratar</span></div><div class="mock-row">${mav('chat')}<div><b>¿Qué tamaño tiene el jardín?</b><span>Te pregunta el jardinero</span></div></div><div class="mock-row">${mav('cam')}<div><b>Foto enviada</b><span>Le muestras el trabajo</span></div></div><div style="padding:10px 4px 2px"><span class="btn btn-a btn-sm btn-full">Aceptar presupuesto</span></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('chat')}Chat y presupuesto</span><h3>Explícale todo antes de contratar.</h3><p>Escríbele al trabajador o a la empresa, mándale fotos y responde sus preguntas. Te arma un presupuesto con el detalle y tú pones el monto.</p><span class="pill a">Sin precios inventados</span></div></article>
          <article class="feat flip"><div class="feat-art l"><div class="mock"><div class="mock-h"><span>mis trabajadores</span><span>favoritos</span></div><div class="mock-row">${mav('heart')}<div><b>Tu ayuda de limpieza</b><span>Ya trabajó contigo</span></div></div><div class="mock-row">${mav('heart')}<div><b>Tu gasfitero</b><span>Ya trabajó contigo</span></div></div><div style="padding:10px 4px 2px"><span class="btn btn-t btn-sm btn-full">Volver a pedirle</span></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h3>¿Te gustó cómo trabajó? Vuelve a llamarle.</h3><p>Guarda a quien te dio un buen servicio y la próxima vez pídele directo a esa persona, al toque o para otro día.</p><span class="pill a">Pedido directo</span></div></article>
        </div>
      </section>
      <section class="sec" id="empresas">
        <div class="sec-h"><span class="eti">${PL.ic('bag')}Empresas</span><h2>También empresas <span class="k">con su equipo.</span></h2><p>Choferes, veterinarias, limpieza, mudanzas, seguridad y eventos. Les escribes por la app y te mandan a alguien de su equipo.</p></div>
        <div class="ords">${appLink(PL.bizList().slice(0, 6).map(PL.bizRow).join(''))}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px"><a class="btn btn-t" href="${APP}#/empresas">Ver empresas en la app<span class="arr">${PL.ic('arrow')}</span></a><a class="btn btn-l" href="${APP}#/empresa-registro">Registrar mi empresa</a></div>
      </section>
      <section class="safe" id="seguridad">
        <div class="safe-h"><span class="eti">${PL.ic('shield')}Seguridad</span><h2>Confianza para abrirle la puerta.</h2><p>Cada persona y cada empresa pasa un filtro antes de recibir su primer pedido.</p></div>
        <ul>
          <li><span class="ico">${PL.ic('id')}</span><div><b>DNI y RUC verificados</b><span>Revisamos la identidad de cada trabajador y el RUC de cada empresa.</span></div></li>
          <li><span class="ico">${PL.ic('shield')}</span><div><b>Antecedentes revisados</b><span>Pedimos el certificado de antecedentes.</span></div></li>
          <li><span class="ico">${PL.ic('star')}</span><div><b>Calificaciones reales</b><span>Solo califica quien contrató el servicio.</span></div></li>
          <li><span class="ico">${PL.ic('bolt')}</span><div><b>Código de inicio</b><span>El trabajo empieza cuando das tu código de 4 dígitos.</span></div></li>
          <li><span class="ico">${PL.ic('share')}</span><div><b>Comparte tu pedido</b><span>Tu familia puede ver quién va y a qué hora.</span></div></li>
          <li><span class="ico">${PL.ic('alert')}</span><div><b>Botón de emergencia</b><span>Desde el pedido llamas a la Policía (105) o reportas un problema.</span></div></li>
        </ul>
      </section>
      <section class="cta-work" id="trabajar">
        <div><span class="eti">${PL.ic('bag')}Para quienes trabajan</span><h2 style="margin-top:14px">¿Sabes un oficio? Gana con él.</h2><p>Recibe trabajos al toque o agenda los de otros días. Si tienes una empresa, súmala con tu equipo.</p><a class="btn btn-w" href="${APP}#/trabajar" style="margin-top:26px">Quiero trabajar<span class="arr">${PL.ic('arrow')}</span></a> <a class="btn btn-dl" href="${APP}#/empresa-registro" style="margin-top:26px">Tengo una empresa</a></div>
        <ul><li>Tú pones tus horarios</li><li>Trabajos cerca de casa</li><li>Cobras directo</li><li>Clientes que repiten</li></ul>
      </section>
      <section class="land-end">
        <h2>Pide tu primer servicio.</h2>
        <a class="btn btn-a" href="${APP}">Abrir la app<span class="arr">${PL.ic('arrow')}</span></a>
      </section>
    </div>
    ${PL.footer()}`;

    PL.$('#lq', land).onsubmit = e => { e.preventDefault(); const q = PL.$('#lqi', land).value.trim(); location.href = `${APP}#/${q ? '?q=' + encodeURIComponent(q) : ''}`; };
    PL.heroScene(PL.$('#scene', land));
    const drum = PL.$('#drum', land), ul = drum.querySelector('ul'), lis = Array.from(ul.children);
    let di = 0;
    const spin = () => {
      const h = lis[0].offsetHeight || 66;
      ul.style.transform = `translateY(${drum.offsetHeight / 2 - h / 2 - di * h}px)`;
      lis.forEach((li, k) => { li.className = k === di ? 'on' : Math.abs(k - di) === 1 ? 'n1' : ''; });
      PL.$('#dn', land).textContent = di + 1; PL.$('#dc', land).textContent = PL.cat(drumList[di].c).name;
    };
    spin();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { di = (di + 1) % lis.length; spin(); }, 1900);
    const openDrum = () => { const s = drumList[di]; location.href = `${APP}#/pedir/${s.id}?m=${PL.canNow(s) ? 'ya' : 'prog'}`; };
    drum.onclick = openDrum; drum.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrum(); } };
    /* menú: baja a cada sección sin cambiar el hash */
    document.addEventListener('click', e => { const a = e.target.closest('[data-to]'); if (!a) return; const t = document.getElementById(a.dataset.to); if (t) { e.preventDefault(); t.scrollIntoView({behavior: 'smooth'}); } });
  }
  window.addEventListener('DOMContentLoaded', render);
})();
