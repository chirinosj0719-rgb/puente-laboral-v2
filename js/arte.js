/* Agéndalo · ilustraciones planas (estilo del calendario original): formas sólidas, sin contorno, sin degradado y sin sombra.
   Un color principal, blanco, beige y un solo acento naranja. PL.art(clave, clase) devuelve el SVG listo para usar. */
(function(){
  const PL = window.PL;
  /* estilo del calendario original: formas planas y sólidas, sin contorno, sin degradado y sin sombra.
     Un color principal, blanco, un beige neutro (#E2D8CB) y un solo acento naranja. Leve inclinación. viewBox 0 0 150 136 */
  const BE = '#E2D8CB', OR = '#FF5A1F', DK = '#2B211B';
  const S = (rot, body, defs = '') => `<svg viewBox="0 0 150 136" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}<g transform="rotate(${rot} 75 68)">${body}</g></svg>`;
  PL.ART = {
    servicios: S(-4, `<path d="M54 40V30a10 10 0 0 1 10-10h22a10 10 0 0 1 10 10v10" fill="none" stroke="#C2410C" stroke-width="9" stroke-linecap="round"/>
      <rect x="18" y="38" width="114" height="80" rx="18" fill="${OR}"/><rect x="18" y="68" width="114" height="7" fill="#E04A12"/>
      <rect x="61" y="58" width="28" height="26" rx="8" fill="#fff"/><rect x="70" y="67" width="10" height="8" rx="2.5" fill="${OR}"/>`),
    /* birrete: el tablero azul, la copa más oscura y la borla naranja */
    clases: S(-5, `<path d="M38 64v26c0 11 17 19 37 19s37-8 37-19V64L75 80z" fill="#2C44A8"/>
      <path d="M38 88c6 7 20 12 37 12s31-5 37-12v3c0 11-17 18-37 18s-37-7-37-18z" fill="#24398F"/>
      <path d="M70 21a12 12 0 0 1 10 0l55 25c5 2.4 5 7.6 0 10L80 81a12 12 0 0 1-10 0L15 56c-5-2.4-5-7.6 0-10z" fill="#3A55C4"/>
      <path d="M75 48l40 9v30" fill="none" stroke="${OR}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="75" cy="48" r="6" fill="${OR}"/>
      <path d="M109 86h12l3 20a4 4 0 0 1-4 4.5h-10a4 4 0 0 1-4-4.5z" fill="${OR}"/><rect x="109" y="82" width="12" height="7" rx="3" fill="#E04A12"/>`),
    emergencia: S(-3, `<path d="M75 10v14M32 28l10 10M118 28l-10 10M14 66h14M122 66h14" stroke="#E5342A" stroke-width="7" stroke-linecap="round"/>
      <path d="M44 100V74a31 31 0 0 1 62 0v26z" fill="#E5342A"/><rect x="58" y="62" width="9" height="26" rx="4.5" fill="#fff"/>
      <rect x="32" y="98" width="86" height="22" rx="8" fill="${DK}"/>`),
    personal: S(4, `<path d="M36 44h22a13 13 0 1 1 26 0h22v22a13 13 0 1 1 0 26v22H36V92a13 13 0 1 0 0-26z" fill="#14A08F"/>
      <circle cx="71" cy="80" r="18" fill="${OR}"/><path d="M63 80l6 6 11-12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
    hogar: S(-3, `<rect x="96" y="26" width="14" height="28" rx="4" fill="#C2410C"/>
      <rect x="32" y="62" width="86" height="58" rx="12" fill="#fff"/>
      <path d="M68 22a10 10 0 0 1 14 0l46 40c5 5 2 12-5 12H27c-7 0-10-7-5-12z" fill="${OR}"/>
      <rect x="62" y="88" width="26" height="32" rx="8" fill="${BE}"/><rect x="42" y="84" width="14" height="14" rx="4" fill="${BE}"/><rect x="94" y="84" width="14" height="14" rx="4" fill="${BE}"/>`),
    belleza: S(4, `<rect x="61" y="12" width="28" height="40" rx="9" fill="#3A2A30"/><rect x="57" y="48" width="36" height="12" rx="5" fill="${DK}"/>
      <rect x="38" y="56" width="74" height="64" rx="24" fill="#E0457B"/>
      <rect x="54" y="80" width="42" height="22" rx="11" fill="#fff"/><path d="M75 97s-7-4.6-7-8.6a3.6 3.6 0 0 1 7-1.2 3.6 3.6 0 0 1 7 1.2c0 4-7 8.6-7 8.6z" fill="${OR}"/>`),
    cuidado: S(-4, `<path d="M75 116C40 94 24 74 24 53c0-17 13-30 29-30 10 0 17 5 22 13 5-8 12-13 22-13 16 0 29 13 29 30 0 21-16 41-51 63z" fill="#6E57E0"/>
      <path d="M67 44h16v15h15v16H83v15H67V75H52V59h15z" fill="#fff"/>`),
    mascotas: S(3, `<path d="M40 34c-14 4-19 32-11 46 5 8 15 4 17-6l4-34z" fill="#B57A48"/><path d="M110 34c14 4 19 32 11 46-5 8-15 4-17-6l-4-34z" fill="#B57A48"/>
      <rect x="38" y="22" width="74" height="86" rx="35" fill="#E8C49A"/><ellipse cx="75" cy="88" rx="25" ry="18" fill="#fff"/>
      <circle cx="60" cy="60" r="6" fill="${DK}"/><circle cx="90" cy="60" r="6" fill="${DK}"/>
      <path d="M66 78h18a3 3 0 0 1 2 5l-9 7a3 3 0 0 1-4 0l-9-7a3 3 0 0 1 2-5z" fill="${DK}"/><path d="M69 94h12v7a6 6 0 0 1-12 0z" fill="${OR}"/>
      <rect x="46" y="106" width="58" height="9" rx="4.5" fill="#18A058"/>`),
    ayuda: S(-4, `<rect x="26" y="56" width="98" height="64" rx="10" fill="#E3AF70"/><rect x="20" y="42" width="110" height="24" rx="8" fill="#F0C994"/>
      <rect x="66" y="42" width="18" height="78" fill="#C98B4D"/><rect x="36" y="86" width="22" height="16" rx="3" fill="#fff"/>
      <circle cx="116" cy="40" r="20" fill="${OR}"/><path d="M116 31v18M107 40h18" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`),
    mudanza: S(-2, `<rect x="18" y="32" width="80" height="62" rx="10" fill="#F2B21C"/>
      <path d="M98 52h22a9 9 0 0 1 8 5l9 15a9 9 0 0 1 1 4v18H98z" fill="${OR}"/><path d="M104 58h14l8 14h-22z" fill="#fff"/>
      <rect x="14" y="92" width="126" height="9" rx="4.5" fill="${DK}"/>
      <circle cx="42" cy="104" r="12" fill="${DK}"/><circle cx="42" cy="104" r="5" fill="${BE}"/><circle cx="114" cy="104" r="12" fill="${DK}"/><circle cx="114" cy="104" r="5" fill="${BE}"/>`),
    eventos: S(0, `<path d="M24 122l40-80q34 8 46 44z" fill="${OR}"/>
      <g clip-path="url(#evc)"><path d="M30 104l60-24M40 82l60-22" stroke="#fff" stroke-width="8" stroke-linecap="round"/></g>
      <ellipse cx="88" cy="64" rx="25" ry="10" transform="rotate(40 88 64)" fill="#FFD3AA"/>
      <path d="M98 42q10-20 28-18" fill="none" stroke="#14A08F" stroke-width="6" stroke-linecap="round"/>
      <rect x="106" y="12" width="11" height="7" rx="2" transform="rotate(30 111 15)" fill="#14A08F"/><circle cx="130" cy="44" r="5" fill="#F2B21C"/>
      <rect x="118" y="68" width="11" height="7" rx="2" transform="rotate(-20 123 71)" fill="#14A08F"/><circle cx="96" cy="22" r="4.5" fill="#F2B21C"/>`, `<clipPath id="evc"><path d="M24 122l40-80q34 8 46 44z"/></clipPath>`),
    negocio: S(3, `<rect x="48" y="10" width="54" height="22" rx="7" fill="${DK}"/><text x="75" y="26" text-anchor="middle" font-family="Google Sans Flex, system-ui, sans-serif" font-weight="800" font-size="13" letter-spacing="1" fill="#fff">24 H</text>
      <rect x="63" y="32" width="4" height="12" fill="${DK}"/><rect x="83" y="32" width="4" height="12" fill="${DK}"/>
      <rect x="24" y="50" width="102" height="70" rx="10" fill="#fff"/>
      <path d="M18 42h114v13a9.5 9.5 0 0 1-19 0 9.5 9.5 0 0 1-19 0 9.5 9.5 0 0 1-19 0 9.5 9.5 0 0 1-19 0 9.5 9.5 0 0 1-19 0 9.5 9.5 0 0 1-19 0z" fill="${OR}"/>
      <path d="M37 42v13a9.5 9.5 0 0 1-19 0V42zM75 42v13a9.5 9.5 0 0 1-19 0V42zM113 42v13a9.5 9.5 0 0 1-19 0V42z" fill="#fff"/>
      <rect x="36" y="78" width="28" height="42" rx="6" fill="${BE}"/><rect x="74" y="78" width="40" height="26" rx="6" fill="${BE}"/>`)
  };
  /* las dos de la primera portada: el rayo (lo antes posible) y el calendario (agendar) */
  PL.ART.ya = `<svg viewBox="0 0 150 136" aria-hidden="true"><defs><linearGradient id="gYa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9466"/><stop offset="1" stop-color="#EE4A0E"/></linearGradient></defs><ellipse cx="78" cy="126" rx="42" ry="7" fill="#E9A182" opacity=".45"/><circle cx="78" cy="64" r="50" fill="url(#gYa)"/><circle cx="78" cy="64" r="49" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><path d="M86 24L58 70h19l-7 40 30-50H80z" fill="#fff"/><path d="M8 46h18M2 64h20M8 82h16" stroke="#EE4A0E" stroke-width="5" stroke-linecap="round" opacity=".45"/></svg>`;
  PL.ART.prog = `<svg viewBox="0 0 150 136" aria-hidden="true"><ellipse cx="75" cy="127" rx="46" ry="7" fill="#8ACDAE" opacity=".45"/><rect x="22" y="22" width="106" height="98" rx="20" fill="#fff"/><path d="M22 42a20 20 0 0 1 20-20h66a20 20 0 0 1 20 20v10H22z" fill="#18A058"/><rect x="46" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/><rect x="95" y="11" width="9" height="24" rx="4.5" fill="#0E7A52"/>${[68, 86, 104].map((y, r) => [44, 62, 80, 98].map((x, c) => (r === 1 && c === 2) ? '' : `<circle cx="${x + 4}" cy="${y}" r="4.5" fill="#E2D8CB"/>`).join('')).join('')}<circle cx="84" cy="86" r="13" fill="#FF5A1F"/><path d="M78 86l4 4 8-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  /* sombra suave en el piso, como las originales (las originales ya la traen) */
  const SHADOW = '<ellipse cx="75" cy="129" rx="42" ry="6" fill="#1B130E" opacity=".07"/>';
  PL.art = (k, cls = '', shadow = false) => {
    let s = PL.ART[k]; if (!s) return '';
    if (shadow && !s.includes('<ellipse')) s = s.replace(/(<svg[^>]*>)/, '$1' + SHADOW);
    return `<span class="${cls}" aria-hidden="true">${s}</span>`;
  };
  /* franja de entrada, de lado a lado (portada y app). Cada celda entera lleva a su sección y, además,
     tiene atajos directos (sectores, materias, emergencias comunes). Servicios y Clases arriba; Emergencia y Pedido personalizado abajo. */
  const SECT_CHIPS = [['hogar', 'Hogar'], ['belleza', 'Belleza'], ['cuidado', 'Cuidado'], ['mascotas', 'Mascotas'], ['mudanza', 'Mudanzas'], ['eventos', 'Eventos'], ['ayuda', 'Encargos'], ['negocio', 'Negocios']];
  const CLASS_CHIPS = [['matematica', 'Matemática'], ['ingles', 'Inglés'], ['profesor', 'Refuerzo escolar'], ['musica', 'Música'], ['box', 'Box'], ['yoga', 'Yoga']];
  const SOS_CHIPS = [['gasfitero', 'Fuga de agua'], ['electricista', 'Se fue la luz'], ['cerrajero', 'Me quedé afuera']];
  const chip = (href, label, art) => `<a class="eb-chip${art ? ' art' : ''}" href="${href}">${art ? PL.art(art, 'eb-chip-art') : ''}<span>${label}</span></a>`;
  const ebCell = o => `<div class="eb-cell ${o.cls}">
      <a class="eb-main" href="${o.href}" aria-label="${o.title}"></a>
      ${PL.art(o.art, 'eb-art', true)}
      <div class="eb-txt"><span class="eti ${o.ec}">${PL.ic(o.icon)}${o.eti}</span><h3>${o.title}</h3><p>${o.p}</p></div>
      ${o.chips ? `<div class="eb-chips">${o.chips}</div>` : ''}${o.extra || ''}
      <span class="go" aria-hidden="true">${PL.ic('arrow')}</span></div>`;
  PL.entryBand = (base = '', id = '') => `<section class="eb"${id ? ` id="${id}"` : ''} aria-label="Qué necesitas">
      ${ebCell({href: base + '#/servicios', cls: 'sv', eti: 'Agenda', ec: 'v', icon: 'cal', title: 'Servicios', p: 'Eliges el servicio, a la persona y el día.', art: 'prog',
        chips: SECT_CHIPS.map(([id, n]) => chip(`${base}#/sector/${id}`, n, id)).join('')})}
      ${ebCell({href: base + '#/sector/clases', cls: 'cl', eti: 'Profesores', ec: 'b', icon: 'user', title: 'Clases particulares', p: 'En tu casa u online, para todas las edades.', art: 'clases',
        chips: CLASS_CHIPS.map(([id, n]) => chip(`${base}#/servicio/${id}`, n)).join('')})}
      ${ebCell({href: base + '#/emergencia', cls: 'em', eti: 'Hoy mismo', ec: '', icon: 'bolt', title: 'Emergencia', p: 'Alguien cerca sale hacia ti lo antes posible.', art: 'ya',
        chips: SOS_CHIPS.map(([id, t]) => chip(`${base}#/servicio/${id}?m=ya&t=${encodeURIComponent(t)}`, t)).join('')})}
      ${ebCell({href: base + '#/pedir/otro', cls: 'pp', eti: 'A medida', ec: 't', icon: 'plus', title: 'Pedido personalizado', p: 'Para lo que no está en la lista: lo describes y te llegan ofertas.', art: 'personal',
        extra: `<span class="eb-ask" aria-hidden="true">${PL.ic('chat')}<span>Ej.: armar una repisa y colgar dos cuadros</span></span>`})}
    </section>`;
  /* sectores en franja: celdas pegadas, de lado a lado */
  PL.sectCell = (c, base = '') => `<a class="mode" href="${base}#/sector/${c.id}" data-c="${c.id}"><span class="go">${PL.ic('arrow')}</span><div><h3>${PL.esc(c.name)}</h3><p>${PL.esc(c.ex || '')}</p></div>${PL.art(c.id, 'mode-art', true)}</a>`;
})();
