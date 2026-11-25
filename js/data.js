/* Puente Laboral · datos
   Todo lo que cambia el negocio vive aquí: catálogo,
   precios referenciales y distritos. */
window.PL = window.PL || {};

PL.CFG = {
  SHEETS_URL: '',             // URL de Apps Script (/exec) para guardar registros y pedidos en Google Sheets
  STORE: 'puente-laboral-v2'  // clave de guardado en este dispositivo
};

PL.REPEAT = {no:'Solo una vez', semana:'Cada semana', quincena:'Cada 15 días', mes:'Cada mes'};
PL.REPEAT_DAYS = {semana:7, quincena:14, mes:30};

PL.UNITS = {trabajo:'por trabajo', hora:'por hora', dia:'por día', turno:'por turno', evento:'por evento', paseo:'por paseo', servicio:'por servicio', clase:'por clase', visita:'por visita'};

PL.CATS = [
  {id:'hogar',   name:'Reparaciones'},
  {id:'casa',    name:'Limpieza y casa'},
  {id:'cuidado', name:'Cuidado'},
  {id:'mudanza', name:'Mudanzas y transporte'},
  {id:'belleza', name:'Belleza'},
  {id:'eventos', name:'Eventos y fiestas'},
  {id:'clases',  name:'Clases'},
  {id:'negocio', name:'Para negocios'}
];

/* Sin precios: el precio lo pone cada cliente y cada trabajador. u = cómo se suele cobrar (por trabajo, por hora…).
   team:1 = se puede pedir más de una persona (turnos para eventos y negocios).
   now:0  = solo se pide programado (eventos, clases y trabajos que se planifican). */
PL.SVCS = [
  {id:'gasfitero', n:'Gasfitero', c:'hogar', i:'llv', u:'trabajo', t:['Fuga de agua','Destapar desagüe','Instalar grifo','Cambiar inodoro','Terma']},
  {id:'electricista', n:'Electricista', c:'hogar', i:'bol', u:'trabajo', t:['Se fue la luz','Instalar tomacorriente','Instalar luminarias','Tablero eléctrico','Pozo a tierra']},
  {id:'armado', n:'Armado de muebles', c:'hogar', i:'mue', u:'trabajo', t:['Ropero','Cama','Escritorio','Repostero','Colgar TV']},
  {id:'carpintero', n:'Carpintero', c:'hogar', i:'mar', u:'trabajo', t:['Arreglar puerta','Mueble a medida','Bisagras y chapas','Closet']},
  {id:'pintor', now:0, n:'Pintor', c:'hogar', i:'rod', u:'dia', t:['Un cuarto','Toda la casa','Fachada','Local u oficina']},
  {id:'albanil', now:0, n:'Albañil', c:'hogar', i:'lad', u:'dia', t:['Tarrajeo','Mayólica','Pequeña remodelación','Pared o muro']},
  {id:'cerrajero', n:'Cerrajero', c:'hogar', i:'lla', u:'trabajo', t:['Me quedé afuera','Cambiar chapa','Duplicar llaves','Chapa de seguridad']},
  {id:'aire', n:'Técnico de aire y refrigeración', c:'hogar', i:'aire', u:'trabajo', t:['Mantenimiento','Instalación','Refrigeradora','Lavadora']},
  {id:'camaras', n:'Instalador de cámaras', c:'hogar', i:'cam', u:'trabajo', t:['Instalar cámaras','Revisar sistema','Intercomunicador','Cerco eléctrico']},
  {id:'tecnico', n:'Técnico de computadoras y celulares', c:'hogar', i:'lap', u:'trabajo', t:['Formatear','Pantalla rota','Wifi y redes','Impresora']},

  {id:'limpieza', n:'Limpieza del hogar', c:'casa', i:'limp', u:'dia', team:1, t:['Limpieza general','Limpieza profunda','Después de una obra','Mudanza']},
  {id:'lavado', n:'Lavado y planchado', c:'casa', i:'lav', u:'servicio', t:['Lavado de ropa','Planchado','Cortinas','Muebles y alfombras']},
  {id:'jardinero', n:'Jardinero', c:'casa', i:'jar', u:'trabajo', t:['Cortar césped','Podar','Sembrar','Mantenimiento mensual']},
  {id:'cocinera', n:'Cocinera a domicilio', c:'casa', i:'coc', u:'dia', t:['Menú de la semana','Almuerzo familiar','Cena especial','Loncheras']},

  {id:'ninera', n:'Niñera', c:'cuidado', i:'bebe', u:'hora', t:['Cuidar por horas','Recoger del colegio','Noche','Tareas escolares']},
  {id:'adulto', n:'Cuidado de adulto mayor', c:'cuidado', i:'cor', u:'dia', t:['Acompañamiento','Medicinas','Aseo personal','Noche']},
  {id:'enfermeria', n:'Enfermería a domicilio', c:'cuidado', i:'cruz', u:'visita', t:['Inyectables','Curaciones','Control de presión','Sonda']},
  {id:'veterinaria', n:'Veterinaria a domicilio', c:'cuidado', i:'pata', u:'visita', t:['Consulta','Vacunas','Desparasitación','Emergencia']},
  {id:'paseador', n:'Paseador de perros', c:'cuidado', i:'pata', u:'paseo', t:['Paseo de 30 min','Paseo de 1 hora','Paseo diario']},
  {id:'mascotas', n:'Cuidador de mascotas', c:'cuidado', i:'pata', u:'dia', t:['Mientras viajo','Visitas diarias','Dar comida y medicinas']},
  {id:'grooming', n:'Baño y corte de mascotas', c:'cuidado', i:'pata', u:'servicio', t:['Baño','Corte','Corte de uñas']},

  {id:'mudanza', n:'Mudanzas y cargadores', c:'mudanza', i:'cmn', u:'trabajo', team:1, t:['Mudanza completa','Pocas cosas','Subir o bajar pisos','Con camión']},
  {id:'chofer', n:'Chofer', c:'mudanza', i:'cho', u:'dia', t:['Con mi auto','Viaje fuera de la ciudad','Evento','Empresa']},
  {id:'motorizado', n:'Motorizado y delivery', c:'mudanza', i:'mot', u:'hora', team:1, t:['Repartos de mi negocio','Un envío','Trámites']},

  {id:'peluqueria', n:'Peluquería a domicilio', c:'belleza', i:'pel', u:'servicio', t:['Corte','Tinte','Peinado','Alisado']},
  {id:'barbero', n:'Barbero a domicilio', c:'belleza', i:'pei', u:'servicio', t:['Corte','Barba','Corte y barba']},
  {id:'manicure', n:'Manicure y pedicure', c:'belleza', i:'esm', u:'servicio', t:['Manicure','Pedicure','Uñas acrílicas','Gel']},
  {id:'maquillaje', n:'Maquillaje y estilismo', c:'belleza', i:'mak', u:'servicio', t:['Social','Novia','Sesión de fotos','Quinceañero']},

  {id:'mesero', n:'Meseros', c:'eventos', i:'mes', u:'turno', team:1, t:['Matrimonio','Cumpleaños','Evento de empresa','Restaurante']},
  {id:'barman', n:'Barman', c:'eventos', i:'bar', u:'turno', team:1, t:['Barra libre','Cócteles de autor','Bar o discoteca']},
  {id:'anfitriona', n:'Anfitrionas', c:'eventos', i:'anf', u:'turno', team:1, t:['Recepción','Feria o stand','Evento de empresa']},
  {id:'seguridad', n:'Seguridad para eventos', c:'eventos', i:'seg', u:'turno', team:1, t:['Puerta','Control de acceso','Fiesta privada','Concierto']},
  {id:'cocinero', now:0, n:'Cocinero para eventos', c:'eventos', i:'coc', u:'turno', team:1, t:['Parrilla','Buffet','Bocaditos','Comida criolla']},
  {id:'dj', now:0, n:'DJ', c:'eventos', i:'dj', u:'evento', t:['Cumpleaños','Matrimonio','Con equipo de sonido','Discoteca']},
  {id:'animador', now:0, n:'Animador infantil', c:'eventos', i:'ani', u:'evento', t:['Fiesta infantil','Show de títeres','Juegos y concursos']},
  {id:'mago', now:0, n:'Mago o payaso', c:'eventos', i:'mag', u:'evento', t:['Show de magia','Payaso','Globoflexia']},
  {id:'fotografo', now:0, n:'Fotógrafo o filmmaker', c:'eventos', i:'fot', u:'evento', t:['Fotos del evento','Video','Sesión de fotos','Producto']},
  {id:'musicos', now:0, n:'Músicos en vivo', c:'eventos', i:'mus', u:'evento', t:['Serenata','Criollo','Grupo de cumbia','Violín para boda']},
  {id:'montaje', now:0, n:'Montaje y desmontaje', c:'eventos', i:'caja', u:'turno', team:1, t:['Toldos y carpas','Escenario','Stand de feria','Mobiliario']},

  {id:'profesor', n:'Profesor particular', c:'clases', i:'lib', u:'hora', t:['Matemática','Comunicación','Ciencias','Preuniversitario']},
  {id:'idiomas', now:0, n:'Clases de idiomas', c:'clases', i:'glo', u:'clase', t:['Inglés','Portugués','Francés','Conversación']},
  {id:'musica', now:0, n:'Clases de música o baile', c:'clases', i:'mus', u:'clase', t:['Guitarra','Piano','Canto','Baile']},
  {id:'entrenador', now:0, n:'Entrenador personal', c:'clases', i:'pes', u:'clase', t:['Bajar de peso','Fuerza','En el parque','Para adultos mayores']},

  {id:'impulsadora', n:'Impulsadoras y promotores', c:'negocio', i:'meg', u:'turno', team:1, t:['Supermercado','Degustación','Volanteo','Feria']},
  {id:'almacen', n:'Personal de almacén', c:'negocio', i:'caja', u:'turno', team:1, t:['Carga y descarga','Inventario','Despacho','Campaña']},
  {id:'cajero', n:'Cajeros', c:'negocio', i:'reg', u:'turno', team:1, t:['Tienda','Restaurante','Campaña de temporada']},
  {id:'vigilante', n:'Vigilante y portero', c:'negocio', i:'por', u:'turno', team:1, t:['Turno de día','Turno de noche','Edificio','Obra']},
  {id:'limpiezaof', n:'Limpieza de oficinas y locales', c:'negocio', i:'limp', u:'turno', team:1, t:['Oficina','Local comercial','Después de un evento']},

  {id:'otro', n:'Otro trabajo', c:'hogar', i:'otr', u:'trabajo', t:[], other:1}
];

PL.DISTRICTS = ['Ancón','Ate','Barranco','Bellavista','Breña','Callao','Carabayllo','Carmen de la Legua','Chaclacayo','Chorrillos','Cieneguilla','Comas','El Agustino','Independencia','Jesús María','La Molina','La Perla','La Punta','La Victoria','Cercado de Lima','Lince','Los Olivos','Lurigancho-Chosica','Lurín','Magdalena del Mar','Mi Perú','Miraflores','Pachacámac','Pucusana','Pueblo Libre','Puente Piedra','Punta Hermosa','Punta Negra','Rímac','San Bartolo','San Borja','San Isidro','San Juan de Lurigancho','San Juan de Miraflores','San Luis','San Martín de Porres','San Miguel','Santa Anita','Santa María del Mar','Santa Rosa','Santiago de Surco','Surquillo','Ventanilla','Villa El Salvador','Villa María del Triunfo'];

/* Perfiles de ejemplo: solo para el modo demo. */
PL.DEMO = {
  workers:['Carlos Mendoza','Rosa Quispe','Luis Huamán','Milagros Torres','Jhon Paredes','Yesenia Rojas','Wilmer Castillo','Karina Salazar','Edwin Vargas','Maribel Apaza','Jorge Ccori','Fiorella Díaz','Ángel Ramos','Sonia Mamani','Kevin Flores','Lucía Chávez','Raúl Gutiérrez','Patricia León'],
  clients:['Andrea','Miguel','Valeria','Diego','Camila','Renzo','Sofía','Martín','Daniela','Piero','Mariana','Óscar'],
  colors:['#FFD86B','#B4EEE1','#D4CBFF','#FFC2B0','#CDEBA8','#F7D2E8']
};

/* Íconos de oficios (48×48, trazo) */
PL.SI = {
  limp:'<path d="M10 20h28l-3 22H13z"/><path d="M15 20c0-9 18-9 18 0"/>',
  bar:'<path d="M8 10h32L24 28z"/><path d="M24 28v12M16 40h16"/>',
  seg:'<path d="M24 6l14 5v11c0 9-6 16-14 20C16 38 10 31 10 22V11z"/><path d="M18 24l5 5 8-9"/>',
  por:'<rect x="12" y="6" width="24" height="36" rx="2"/><circle cx="31" cy="25" r="1.5"/>',
  anf:'<rect x="12" y="8" width="24" height="34" rx="3"/><path d="M19 8h10v5H19zM18 22h12M18 29h12"/>',
  pel:'<circle cx="14" cy="34" r="5"/><circle cx="14" cy="14" r="5"/><path d="M18 17l22 18M18 31L40 13"/>',
  cho:'<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="4"/><path d="M7 24h13M28 24h13M24 28v13"/>',
  dj:'<path d="M8 28v-4a16 16 0 0 1 32 0v4"/><rect x="6" y="28" width="9" height="14" rx="3"/><rect x="33" y="28" width="9" height="14" rx="3"/>',
  mes:'<path d="M8 32a16 16 0 0 1 32 0z"/><path d="M5 36h38M24 12v4"/>',
  fot:'<rect x="5" y="14" width="38" height="26" rx="4"/><circle cx="24" cy="27" r="7"/><path d="M17 14l3-5h8l3 5"/>',
  ani:'<ellipse cx="24" cy="19" rx="12" ry="14"/><path d="M24 33l-3 4h6zM24 37c0 4-4 5-4 9"/>',
  jar:'<path d="M14 30h20l-3 12H17z"/><path d="M24 30V16M24 22c-8 0-10-6-10-10 8 0 10 4 10 10zM24 18c6 0 9-4 9-8-6 0-9 3-9 8z"/>',
  coc:'<path d="M14 28v10h20V28"/><path d="M14 28a8 8 0 0 1 2-15 8 8 0 0 1 16 0 8 8 0 0 1 2 15z"/>',
  otr:'<circle cx="24" cy="24" r="17"/><path d="M24 16v16M16 24h16"/>',
  mus:'<path d="M18 36V10l20-4v26"/><circle cx="12" cy="36" r="6"/><circle cx="32" cy="32" r="6"/>',
  mag:'<path d="M12 36h24M16 36V12h16v24M16 28h16"/>',
  caja:'<path d="M6 16l18-8 18 8v18l-18 8-18-8z"/><path d="M6 16l18 8 18-8M24 24v18"/>',
  llv:'<path d="M32 8a9 9 0 0 0-8 12L8 36l4 4 16-16a9 9 0 0 0 12-8l-6 6-5-1-1-5z"/>',
  bol:'<path d="M26 6L12 28h10l-2 14 16-24H26z"/>',
  mar:'<rect x="8" y="8" width="24" height="10" rx="2"/><path d="M20 18v24"/>',
  rod:'<rect x="8" y="8" width="26" height="10" rx="2"/><path d="M34 13h6v10H24v8"/><rect x="21" y="31" width="6" height="11" rx="1"/>',
  lla:'<circle cx="16" cy="24" r="8"/><path d="M24 24h18M36 24v7M42 24v5"/>',
  aire:'<rect x="6" y="10" width="36" height="14" rx="3"/><path d="M12 30l-2 8M24 30v10M36 30l2 8"/>',
  cam:'<path d="M8 16h22v14H8z"/><path d="M30 20l10-5v16l-10-5"/>',
  lap:'<rect x="9" y="10" width="30" height="21" rx="2"/><path d="M4 38h40"/>',
  pata:'<circle cx="14" cy="20" r="4"/><circle cx="22" cy="12" r="4"/><circle cx="32" cy="12" r="4"/><circle cx="40" cy="20" r="4"/><path d="M27 24c-8 0-13 8-10 14 2 4 6 3 10 3s8 1 10-3c3-6-2-14-10-14z"/>',
  cor:'<path d="M24 40S8 30 8 19a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 11-16 21-16 21z"/>',
  cruz:'<rect x="6" y="6" width="36" height="36" rx="6"/><path d="M24 14v20M14 24h20"/>',
  pes:'<path d="M6 20v8M12 16v16M36 16v16M42 20v8M12 24h24"/>',
  lib:'<path d="M6 10c6-2 12-2 18 2 6-4 12-4 18-2v28c-6-2-12-2-18 2-6-4-12-4-18-2z"/><path d="M24 12v28"/>',
  glo:'<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-8 8-8 26 0 34M24 7c8 8 8 26 0 34"/>',
  mak:'<rect x="18" y="24" width="12" height="18" rx="2"/><path d="M20 24v-8l4-8 4 8v8"/>',
  esm:'<rect x="16" y="22" width="16" height="20" rx="3"/><path d="M20 22v-6h8v6M22 16v-8h4v8"/>',
  pei:'<path d="M8 12h32v8H8z"/><path d="M12 20v8M18 20v8M24 20v8M30 20v8M36 20v8"/>',
  cmn:'<path d="M4 14h26v20H4zM30 22h8l6 6v6H30z"/><circle cx="14" cy="36" r="3"/><circle cx="36" cy="36" r="3"/>',
  mot:'<circle cx="12" cy="32" r="6"/><circle cx="36" cy="32" r="6"/><path d="M12 32l8-12h8l8 12M24 20l-4-6h-6"/>',
  meg:'<path d="M8 20v8h6l16 8V12l-16 8z"/><path d="M36 18a8 8 0 0 1 0 12"/>',
  reg:'<rect x="8" y="22" width="32" height="18" rx="2"/><path d="M14 22v-8h20v8M14 30h8"/>',
  bebe:'<path d="M8 12h14a14 14 0 0 1 14 14H8z"/><path d="M36 26l3-12h4"/><circle cx="14" cy="38" r="4"/><circle cx="31" cy="38" r="4"/>',
  lad:'<path d="M6 12h36v8H6zM6 20h36v8H6zM6 28h36v8H6z"/><path d="M18 12v8M30 20v8M18 28v8"/>',
  lav:'<rect x="10" y="6" width="28" height="36" rx="4"/><circle cx="24" cy="27" r="9"/><path d="M10 14h28M16 10h2"/>',
  mue:'<path d="M8 18h32v20H8z"/><path d="M8 28h32M14 38v4M34 38v4M20 23h8M20 33h8"/>'
};

/* Íconos de interfaz (24×24, trazo) */
PL.UI = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  bag:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  wallet:'<path d="M4 7h15a1 1 0 0 1 1 1v11H5a1 1 0 0 1-1-1z"/><path d="M4 7l12-3v3M16 13h2"/>',
  cash:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9v.01M17.5 15v.01"/>',
  power:'<path d="M12 3v9M6.3 7a8 8 0 1 0 11.4 0"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 16a3.5 3.5 0 0 1 7 0M15 10h3M15 14h3"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  nav:'<path d="M4 11l16-7-7 16-2-7z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  book:'<path d="M5 4h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3z"/><path d="M5 18a3 3 0 0 1 3-3h11M9 8h6"/>',
  logout:'<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  wa:'<path d="M4.5 20l1.2-3.8A8 8 0 1 1 8.3 19z"/><path d="M9.2 8.6c.2 2.6 3.1 5.6 5.9 5.9l1.1-1.4-1.9-1-1 .9c-1-.4-2.1-1.5-2.5-2.5l.9-1-1-1.9z"/>'
};
