/* Agéndalo · retratos planos de las personas de ejemplo (mismo estilo que las ilustraciones:
   formas sólidas, sin contornos, un color de fondo suave). Cada nombre da siempre la misma cara.
   Cuando los trabajadores reales suban su foto, se usa su foto. */
(function(){
  const PL = window.PL;
  const F = new Set(['rosa','milagros','yesenia','karina','maribel','fiorella','sonia','lucia','patricia','carmen','gladys','elena','ana','maria','julia','flor','diana','claudia','vanessa','katherine','roxana','silvia','jessica','andrea','pamela','monica','liliana','norma','teresa','giuliana','pilar','susana','lourdes','nancy','erika','mariela','cinthia','gabriela','paola','rocio','valeria','camila','sofia','daniela','mariana','luz','janet','ruth','yolanda','zoila']);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  PL.isFem = name => F.has(norm(name).split(/\s+/)[0]);
  const hash = s => { let h = 2166136261; for (const c of norm(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

  const BG = ['#FFE7DA', '#E0F3EA', '#E6ECFF', '#ECE8FF', '#FFF1CF', '#FFE4EE', '#DDF3EF', '#F2ECE3'];
  const SKIN = [['#F6D3B8', '#E9B996'], ['#EDBF98', '#DCA57C'], ['#D9A177', '#C4875D'], ['#C08458', '#A86E45'], ['#9C6640', '#83532F']];
  const HAIR = ['#2B211B', '#3B2618', '#1B130E', '#5A3A24', '#2B211B', '#7A5236'];
  const SHIRT = ['#3A55C4', '#18A058', '#FF5A1F', '#6E57E0', '#E0457B', '#14A08F', '#F2B21C', '#2B211B', '#C2410C', '#0E7A52'];

  function face(name){
    const h = hash(name), r = k => (h >>> (k * 3)) % 997, fem = PL.isFem(name);
    const bg = BG[r(1) % BG.length], [sk, sk2] = SKIN[r(2) % SKIN.length], hc = HAIR[r(3) % HAIR.length];
    let shirt = SHIRT[r(4) % SHIRT.length]; if (shirt === bg) shirt = '#2B211B';
    const style = fem ? ['long', 'bob', 'bun', 'pony', 'curly', 'long'][r(5) % 6] : ['short', 'side', 'buzz', 'curly', 'short', 'side'][r(5) % 6];
    const glasses = r(6) % 5 === 0, beard = !fem && r(7) % 4 === 0, earring = fem && r(8) % 3 === 0;
    let back = '', top = '';
    if (style === 'long') {
      back = `<path d="M27 46c0-17 9-28 21-28s21 11 21 28v24c0 3-3 5-6 5H33c-3 0-6-2-6-5z" fill="${hc}"/>`;
      top = `<path d="M30 42c0-14 8-23 18-23 11 0 18 8 18 21-7-1-13-5-17-12-3 7-10 12-19 14z" fill="${hc}"/>`;
    } else if (style === 'bob') {
      back = `<path d="M28 44c0-16 9-26 20-26s20 10 20 26v14c0 3-2 4-4 4H32c-2 0-4-1-4-4z" fill="${hc}"/>`;
      top = `<path d="M30 41c0-13 8-22 18-22s18 9 18 22c-10 0-20-4-26-11-2 5-5 9-10 11z" fill="${hc}"/>`;
    } else if (style === 'bun') {
      back = `<circle cx="48" cy="17" r="8" fill="${hc}"/>`;
      top = `<path d="M31 40c0-12 7-20 17-20s17 8 17 20c-4-5-10-8-17-8s-13 3-17 8z" fill="${hc}"/>`;
    } else if (style === 'pony') {
      back = `<path d="M62 28c8 4 10 14 8 26-1 6-5 9-8 8 2-9 1-20 0-34z" fill="${hc}"/>`;
      top = `<path d="M31 40c0-12 7-20 17-20s17 8 17 20c-5-6-12-9-19-9-6 0-11 3-15 9z" fill="${hc}"/>`;
    } else if (style === 'curly') {
      const c = [[34, 30, 7], [42, 23, 8], [53, 22, 8], [62, 29, 7], [31, 39, 5.5], [65, 39, 5.5]];
      if (fem) c.push([29, 50, 6], [67, 50, 6], [31, 60, 5], [65, 60, 5]);
      top = c.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${hc}"/>`).join('');
    } else if (style === 'short') {
      top = `<path d="M31 39c-1-13 7-21 17-21 11 0 18 7 17 20-3-4-7-7-11-8-6 3-14 5-23 9z" fill="${hc}"/>`;
    } else if (style === 'side') {
      top = `<path d="M31 40c-1-14 7-22 18-22 10 0 17 7 16 19-1-2-3-4-5-5-9 0-18-3-23-8-1 6-3 12-6 16z" fill="${hc}"/>`;
    } else {
      top = `<path d="M31 37c1-11 8-17 17-17s16 6 17 17c-5-3-11-5-17-5s-12 2-17 5z" fill="${hc}" opacity=".85"/>`;
    }
    const brow = fem ? 1.8 : 2.4;
    return `<svg viewBox="9 6 78 78" aria-hidden="true"><rect width="96" height="96" fill="${bg}"/>${back}
      <path d="M14 98c2-17 15-27 34-27s32 10 34 27z" fill="${shirt}"/>
      <path d="M41 58h14v14c-2 4-5 6-7 6s-5-2-7-6z" fill="${sk2}"/>
      <circle cx="30.5" cy="45" r="4.5" fill="${sk2}"/><circle cx="65.5" cy="45" r="4.5" fill="${sk2}"/>
      <ellipse cx="48" cy="43" rx="17" ry="20" fill="${sk}"/>
      ${beard ? `<path d="M31 45c0 13 7 21 17 21s17-8 17-21c-3 5-6 8-10 9-2-2-4-3-7-3s-5 1-7 3c-4-1-7-4-10-9z" fill="${hc}"/>` : ''}
      ${top}
      <path d="M38 39.5h6M52 39.5h6" stroke="${hc}" stroke-width="${brow}" stroke-linecap="round"/>
      <ellipse cx="41" cy="45.5" rx="2.1" ry="2.5" fill="#2B211B"/><ellipse cx="55" cy="45.5" rx="2.1" ry="2.5" fill="#2B211B"/>
      <circle cx="37" cy="52" r="3" fill="#FF7A6B" opacity=".18"/><circle cx="59" cy="52" r="3" fill="#FF7A6B" opacity=".18"/>
      <path d="M44 55.5q4 3.2 8 0" fill="none" stroke="${beard ? sk : '#2B211B'}" stroke-width="2" stroke-linecap="round"/>
      ${glasses ? `<rect x="35" y="41" width="12" height="9" rx="3.5" fill="none" stroke="#2B211B" stroke-width="1.6"/><rect x="49" y="41" width="12" height="9" rx="3.5" fill="none" stroke="#2B211B" stroke-width="1.6"/><path d="M47 45h2" stroke="#2B211B" stroke-width="1.6"/>` : ''}
      ${earring ? `<circle cx="30.5" cy="51" r="1.8" fill="#FF5A1F"/><circle cx="65.5" cy="51" r="1.8" fill="#FF5A1F"/>` : ''}
      <path d="M38 71l10 9 10-9" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  const cache = {};
  PL.face = name => cache[name] || (cache[name] = face(name).replace(/\n\s*/g, ''));
})();
