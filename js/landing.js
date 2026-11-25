/* Puente Laboral · landing: explica qué es y lleva a la app (app.html) */
(function(){
  const PL = window.PL;
  const APP = 'app.html';
  const ART_YA = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><defs><linearGradient id="gYa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9466"/><stop offset="1" stop-color="#EE4A0E"/></linearGradient></defs><ellipse cx="78" cy="126" rx="42" ry="7" fill="#E9A182" opacity=".45"/><circle cx="78" cy="64" r="50" fill="url(#gYa)"/><circle cx="78" cy="64" r="49" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><path d="M86 24L58 70h19l-7 40 30-50H80z" fill="#fff"/><path d="M8 46h18M2 64h20M8 82h16" stroke="#EE4A0E" stroke-width="5" stroke-linecap="round" opacity=".45"/></svg>`;
  const ART_PROG = `<svg class="mode-art" viewBox="0 0 150 136" aria-hidden="true"><ellipse cx="75" cy="127" rx="46" ry="7" fill="#8ACDAE" opacity=".45"/><rect x="22" y="22" width="106" height="98" rx="20" fill="#fff"/><path d="M22 42a20 20 0 0 1 20-20h66a20 20 0 0 1 20 20v10H22z" fill="#18A058"/><rect x="46" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/><rect x="95" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/>${[68, 86, 104].map((y, r) => [44, 62, 80, 98].map((x, c) => (r === 1 && c === 2) ? '' : `<circle cx="${x + 4}" cy="${y}" r="4.5" fill="#E2D8CB"/>`).join('')).join('')}<circle cx="84" cy="86" r="13" fill="#FF5A1F"/><path d="M78 86l4 4 8-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const mav = ic => `<span class="mav">${PL.ic(ic)}</span>`;
  /* recuadro con palabras que rotan: todas ocupan la misma celda, así el ancho no cambia y nada salta de línea */
  const rotBox = words => `<span class="sel rot" aria-label="${words[0]}"><i aria-hidden="true"></i>${words.map((w, k) => `<span class="rot-w${k ? '' : ' on'}" aria-hidden="${k ? 'true' : 'false'}">${w}</span>`).join('')}</span>`;

  function render(){
    const land = PL.$('#land');
    document.body.dataset.view = 'inicio';
    const words = [['gasfitero', 'Gasfitero'], ['ninera', 'Niñera'], ['veterinaria', 'Veterinaria'], ['electricista', 'Electricista'], ['limpieza', 'Limpieza'], ['mudanza', 'Mudanzas'], ['chofer', 'Chofer'], ['adulto', 'Cuidado'], ['jardinero', 'Jardinero'], ['cerrajero', 'Cerrajero'], ['dj', 'DJ'], ['profesor', 'Clases']].map(([id, label]) => Object.assign({label}, PL.svc(id)));
    const appLink = h => h.replace(/href="#\//g, `href="${APP}#/`);
    land.innerHTML = `
    <section class="hero"><div class="hero-in">
      <h1 class="rise hero-h"><span class="h-l1">Ayuda de confianza, ${rotBox(['inmediata', 'rápida', 'de emergencia', 'a domicilio'])}</span><span class="h-l2">o ${rotBox(['programada', 'con anticipación', 'semanal', 'a tu horario'])}.</span></h1>
      <div class="hero-row rise">
        <p class="lead">Profesionales independientes y empresas verificadas, cerca de ti.</p>
        <div><form class="search-box" id="lq">${PL.ic('search')}<input id="lqi" type="search" placeholder="¿Qué necesitas? Ej.: gasfitero" aria-label="Buscar un servicio en la app" autocomplete="off"><button class="btn btn-a btn-sm" type="submit">Buscar</button></form>
          <div class="land-ctas"><a class="btn btn-w" href="${APP}">Abrir la app<span class="arr">${PL.ic('arrow')}</span></a><a class="btn btn-dl" href="${APP}#/trabajar">Quiero trabajar</a></div></div>
      </div>
    </div></section>
    <section class="modes" id="modos" aria-label="Dos formas de pedir">
      <a class="mode ya" href="${APP}#/?m=ya"><span class="go">${PL.ic('arrow')}</span><div><span class="eti">${PL.ic('bolt')}Ahora</span><h3>Inmediato</h3><p>Atención en minutos.</p></div>${ART_YA}</a>
      <a class="mode prog" href="${APP}#/?m=prog"><span class="go">${PL.ic('arrow')}</span><div><span class="eti v">${PL.ic('cal')}Con anticipación</span><h3>Programado</h3><p>Elige día y hora, una vez o de forma recurrente.</p></div>${ART_PROG}</a>
    </section>
    <section class="band" id="scene" aria-label="Ejemplo de un pedido en el mapa"></section>
    <section class="wheel" id="wheel" style="--n:${words.length}" aria-label="Oficios">
      <div class="wheel-pin"><div class="wheel-stage" id="wst" role="button" tabindex="0" aria-label="Pedir el oficio del centro en la app">
        <ul>${words.map(s => `<li>${PL.esc(s.label)}</li>`).join('')}</ul><i class="wh-l" aria-hidden="true"></i><i class="wh-r" aria-hidden="true"></i>
      </div></div>
    </section>
    <div class="wrap">
      <section class="sec" id="como">
        <div class="sec-h"><span class="eti">${PL.ic('bolt')}Cómo funciona</span><h2>Dos formas de pedir, <span class="k">una sola app.</span></h2></div>
        <div class="feats">
          <article class="feat"><div class="feat-art p"><div class="mock"><div class="mock-h"><span>gasfitero · disponibles</span><span>ahora</span></div><div class="mock-row">${mav('user')}<div><b>Gasfitero</b><span>Cerca de ti · verificado</span></div><span class="ok" style="margin-left:auto">Ver perfil</span></div><div class="mock-row">${mav('user')}<div><b>Gasfitera</b><span>Cerca de ti · verificada</span></div></div><div class="mock-row">${mav('bag')}<div><b>Empresa de gasfitería</b><span>Con su equipo</span></div></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('bolt')}Inmediato</span><h3>Para lo urgente, en minutos.</h3><p>Una fuga, una cerradura o un corte de luz. Ves quién está disponible y sigues su llegada en el mapa.</p></div></article>
          <article class="feat flip"><div class="feat-art m"><div class="mock"><div class="mock-h"><span>limpieza del hogar</span><span>programado</span></div><div class="mock-days">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<span class="${i === 5 ? 'on' : ''}">${d}<b>${23 + i}</b></span>`).join('')}</div><div class="mock-times"><span>8 a. m.</span><span class="on">9 a. m.</span><span>10 a. m.</span><span>11 a. m.</span></div><div style="margin-top:10px"><span class="pill m">${PL.ic('check')}Cada semana</span></div></div></div>
            <div class="feat-txt"><span class="eti v">${PL.ic('cal')}Programado</span><h3>Con anticipación, una vez o cada semana.</h3><p>Eventos, limpieza, clases o cuidado. Elige día y hora y, si lo necesitas, el servicio se repite con la misma persona.</p></div></article>
          <article class="feat"><div class="feat-art p"><div class="mock"><div class="mock-h"><span>chat · presupuesto</span><span>antes de contratar</span></div><div class="mock-row">${mav('chat')}<div><b>¿Qué tamaño tiene el jardín?</b><span>Te pregunta el jardinero</span></div></div><div class="mock-row">${mav('cam')}<div><b>Foto enviada</b><span>Le muestras el trabajo</span></div></div><div style="padding:10px 4px 2px"><span class="btn btn-a btn-sm btn-full">Aceptar presupuesto</span></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('chat')}Chat y presupuesto</span><h3>Explica lo que necesitas antes de contratar.</h3><p>Escribe, envía fotos y responde sus preguntas. Recibes un presupuesto detallado y tú defines el monto.</p></div></article>
          <article class="feat flip"><div class="feat-art l"><div class="mock"><div class="mock-h"><span>mis trabajadores</span><span>favoritos</span></div><div class="mock-row">${mav('heart')}<div><b>Tu ayuda de limpieza</b><span>Ya trabajó contigo</span></div></div><div class="mock-row">${mav('heart')}<div><b>Tu gasfitero</b><span>Ya trabajó contigo</span></div></div><div style="padding:10px 4px 2px"><span class="btn btn-t btn-sm btn-full">Volver a pedirle</span></div></div></div>
            <div class="feat-txt"><span class="eti">${PL.ic('heart')}Mis trabajadores</span><h3>Vuelve a contratar a quien te dio un buen servicio.</h3><p>Guárdalo en tus trabajadores de confianza y solicítale directamente la próxima vez.</p></div></article>
        </div>
      </section>
      <section class="sec" id="empresas">
        <div class="sec-h"><span class="eti">${PL.ic('bag')}Empresas</span><h2>Empresas</h2></div>
        <div class="ords">${appLink(PL.bizList().slice(0, 6).map(PL.bizRow).join(''))}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px"><a class="btn btn-t" href="${APP}#/empresas">Ver empresas<span class="arr">${PL.ic('arrow')}</span></a><a class="btn btn-l" href="empresas.html">Registrar mi empresa</a></div>
      </section>
      <section class="safe" id="seguridad">
        <div class="safe-h"><span class="eti">${PL.ic('shield')}Seguridad</span><h2>Seguridad en cada servicio.</h2><p>Cada persona y cada empresa pasa un filtro antes de su primer pedido.</p></div>
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
        <div><span class="eti">${PL.ic('bag')}Para quienes trabajan</span><h2 style="margin-top:14px">Ofrece tus servicios con Puente.</h2><a class="btn btn-w" href="${APP}#/trabajar" style="margin-top:28px">Quiero trabajar<span class="arr">${PL.ic('arrow')}</span></a> <a class="btn btn-dl" href="empresas.html" style="margin-top:28px">Registrar mi empresa</a></div>
        <ul><li>Tú pones tus horarios</li><li>Trabajos cerca de casa</li><li>Cobras directo</li><li>Clientes que repiten</li></ul>
      </section>
      <section class="land-end">
        <h2>Solicita tu primer servicio.</h2>
        <a class="btn btn-a" href="${APP}">Abrir la app<span class="arr">${PL.ic('arrow')}</span></a>
      </section>
    </div>
    ${PL.footer()}`;

    PL.$('#lq', land).onsubmit = e => { e.preventDefault(); const q = PL.$('#lqi', land).value.trim(); location.href = `${APP}#/${q ? '?q=' + encodeURIComponent(q) : ''}`; };
    PL.heroScene(PL.$('#scene', land));
    /* el recuadro se ajusta al ancho de la palabra visible; la línea no se parte, así nada baja */
    PL.$$('.rot', land).forEach((box, b) => {
      const ws = Array.from(box.querySelectorAll('.rot-w')); let k = 0;
      const fit = () => { const cs = getComputedStyle(box); box.style.width = (ws[k].offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)) + 'px'; };
      const show = () => { ws.forEach((x, i) => { x.classList.toggle('on', i === k); x.setAttribute('aria-hidden', i === k ? 'false' : 'true'); }); box.setAttribute('aria-label', ws[k].textContent); fit(); };
      fit(); if (document.fonts) document.fonts.ready.then(fit); addEventListener('resize', fit);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => setInterval(() => { k = (k + 1) % ws.length; show(); }, 2600), b * 1300);
    });
    wheel(words);
    /* menú: baja a cada sección sin cambiar el hash */
    document.addEventListener('click', e => { const a = e.target.closest('[data-to]'); if (!a) return; const t = document.getElementById(a.dataset.to); if (t) { e.preventDefault(); t.scrollIntoView({behavior: 'smooth'}); } });
  }

  /* rueda de oficios que gira con el scroll (como la de tasteskill): la sección se queda fija y las palabras giran en un cilindro */
  function wheel(words){
    const sec = PL.$('#wheel'), stage = PL.$('#wst'), lis = Array.from(stage.querySelectorAll('li'));
    let cur = 0, ticking = false;
    const flat = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function paint(){
      ticking = false;
      const r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / (span || 1)));
      /* cada palabra se queda un momento al centro antes de pasar a la siguiente */
      const raw = p * (lis.length - 1), base = Math.floor(raw), t = raw - base;
      const e = t < .3 ? 0 : t > .7 ? 1 : (x => x * x * (3 - 2 * x))((t - .3) / .4);
      const f = Math.min(lis.length - 1, base + e), h = lis[0].offsetHeight;
      cur = Math.round(f);
      lis.forEach((li, k) => {
        const d = k - f, a = Math.abs(d);
        li.style.opacity = a > 3.2 ? 0 : Math.max(0, 1 - a * .3).toFixed(3);
        li.style.transform = flat ? `translateY(${d * h}px)` : `translateY(${(d * h * .86).toFixed(1)}px) rotateX(${(-d * 24).toFixed(1)}deg) scale(${(1 - Math.min(a, 3) * .07).toFixed(3)})`;
        li.classList.toggle('on', k === cur); li.style.color = k === cur ? 'var(--acc)' : '';
      });
    }
    const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask);
    paint();
    const open = () => { const s = words[cur]; location.href = `${APP}#/pedir/${s.id}?m=${PL.canNow(s) ? 'ya' : 'prog'}`; };
    stage.onclick = open; stage.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  }
  window.addEventListener('DOMContentLoaded', render);
})();
