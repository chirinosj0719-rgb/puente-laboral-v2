/* Agéndalo · datos
   Todo lo que cambia el negocio vive aquí: catálogo,
   precios referenciales y distritos. */
window.PL = window.PL || {};

PL.CFG = {
  SHEETS_URL: '',             // URL de Apps Script (/exec) para guardar registros y pedidos en Google Sheets
  STORE: 'puente-laboral-v2', // clave de guardado en este dispositivo
  /* Firebase Authentication (proyecto agendalo-31b1a): Google, celular por SMS y correo con contraseña.
     Esta configuración es pública por diseño (la protegen los dominios autorizados en Firebase).
     Si se deja vacía, las cuentas se guardan solo en este dispositivo. */
  FIREBASE: {
    apiKey: 'AIzaSyCRp8RMk86IzyXKlh_zCBjlggi5jAqeWJU',
    authDomain: 'agendalo-31b1a.firebaseapp.com',
    projectId: 'agendalo-31b1a',
    storageBucket: 'agendalo-31b1a.firebasestorage.app',
    messagingSenderId: '1044513366635',
    appId: '1:1044513366635:web:fa531af44b2b505bf1c72e'
  }
};

/* trazo del símbolo (check escalonado), viewBox "15 25 90 70" */
PL.LOGO_D = 'M15 57.5A2.5 2.5 0 0 1 17.5 55L32.5 55A2.5 2.5 0 0 1 35 57.5L35 64A1 1 0 0 0 36 65L54 65A1 1 0 0 0 55 64L55 57.5A2.5 2.5 0 0 1 57.5 55L64 55A1 1 0 0 0 65 54L65 47.5A2.5 2.5 0 0 1 67.5 45L74 45A1 1 0 0 0 75 44L75 37.5A2.5 2.5 0 0 1 77.5 35L84 35A1 1 0 0 0 85 34L85 27.5A2.5 2.5 0 0 1 87.5 25L95 25A10 10 0 0 1 105 35L105 42.5A2.5 2.5 0 0 1 102.5 45L96 45A1 1 0 0 0 95 46L95 52.5A2.5 2.5 0 0 1 92.5 55L86 55A1 1 0 0 0 85 56L85 62.5A2.5 2.5 0 0 1 82.5 65L76 65A1 1 0 0 0 75 66L75 72.5A2.5 2.5 0 0 1 72.5 75L66 75A1 1 0 0 0 65 76L65 82.5A2.5 2.5 0 0 1 62.5 85L56 85A1 1 0 0 0 55 86L55 92.5A2.5 2.5 0 0 1 52.5 95L37.5 95A2.5 2.5 0 0 1 35 92.5L35 86A1 1 0 0 0 34 85L27.5 85A2.5 2.5 0 0 1 25 82.5L25 76A1 1 0 0 0 24 75L17.5 75A2.5 2.5 0 0 1 15 72.5Z';

PL.REPEAT = {no:'Solo una vez', semana:'Cada semana', quincena:'Cada 15 días', mes:'Cada mes'};
PL.REPEAT_DAYS = {semana:7, quincena:14, mes:30};

PL.UNITS = {trabajo:'por trabajo', hora:'por hora', dia:'por día', turno:'por turno', evento:'por evento', paseo:'por paseo', servicio:'por servicio', clase:'por clase', visita:'por visita'};

PL.CATS = [
  {id:'hogar',    name:'Hogar',                  i:'herr', d:'Arreglos, limpieza y todo para tu casa', ex:'Gasfitero · Electricista · Limpieza'},
  {id:'belleza',  name:'Belleza y bienestar',    i:'esm',  d:'Uñas, maquillaje, masajes y más, en tu casa', ex:'Uñas · Maquillaje · Masajes'},
  {id:'clases',   name:'Clases particulares',    i:'lib',  d:'Profesores particulares en tu casa u online', ex:'Matemática · Inglés · Box · Yoga'},
  {id:'cuidado',  name:'Cuidado y salud',        i:'cor',  d:'Niñeras, adultos mayores, enfermería y terapia', ex:'Niñera · Adulto mayor · Terapia física'},
  {id:'mascotas', name:'Mascotas',               i:'pata', d:'Veterinaria, paseos, baño y cuidado', ex:'Veterinaria · Paseos · Baño y corte'},
  {id:'ayuda',    name:'Ayuda y encargos',       i:'carga',d:'Una mano para cargar, ordenar o hacer mandados', ex:'Maestro para todo · Cargar · Mandados'},
  {id:'mudanza',  name:'Mudanzas y transporte',  i:'cmn',  d:'Mudanzas, choferes y repartos', ex:'Mudanzas · Chofer · Delivery'},
  {id:'eventos',  name:'Eventos y fiestas',      i:'dj',   d:'Meseros, DJ, fotografía y más para tu evento', ex:'Meseros · DJ · Fotografía'},
  {id:'negocio',  name:'Para negocios',          i:'reg',  d:'Personal por turnos para tu negocio', ex:'Impulsadoras · Cajeros · Almacén'}
];

/* Sin precios: el precio lo pone cada cliente y cada trabajador. u = cómo se suele cobrar (por trabajo, por hora…).
   team:1 = se puede pedir más de una persona (turnos para eventos y negocios).
   now:0  = solo se pide programado (eventos, clases y trabajos que se planifican). */
PL.SVCS = [
  {id:'gasfitero', n:'Gasfitero', c:'hogar', g:'Reparaciones', i:'llv', u:'trabajo', t:['Fuga de agua','Destapar desagüe','Instalar grifo','Cambiar inodoro','Terma']},
  {id:'electricista', n:'Electricista', c:'hogar', g:'Reparaciones', i:'bol', u:'trabajo', t:['Se fue la luz','Instalar tomacorriente','Instalar luminarias','Tablero eléctrico','Pozo a tierra']},
  {id:'armado', n:'Armado de muebles', c:'hogar', g:'Reparaciones', i:'mue', u:'trabajo', t:['Ropero','Cama','Escritorio','Repostero','Colgar TV']},
  {id:'carpintero', n:'Carpintero', c:'hogar', g:'Reparaciones', i:'mar', u:'trabajo', t:['Arreglar puerta','Mueble a medida','Bisagras y chapas','Closet']},
  {id:'pintor', now:0, n:'Pintor', c:'hogar', g:'Reparaciones', i:'rod', u:'dia', t:['Un cuarto','Toda la casa','Fachada','Local u oficina']},
  {id:'albanil', now:0, n:'Albañil', c:'hogar', g:'Reparaciones', i:'lad', u:'dia', t:['Tarrajeo','Mayólica','Pequeña remodelación','Pared o muro']},
  {id:'cerrajero', n:'Cerrajero', c:'hogar', g:'Reparaciones', i:'lla', u:'trabajo', t:['Me quedé afuera','Cambiar chapa','Duplicar llaves','Chapa de seguridad']},
  {id:'aire', n:'Técnico de aire y refrigeración', c:'hogar', g:'Reparaciones', i:'aire', u:'trabajo', t:['Mantenimiento','Instalación','Refrigeradora','Lavadora']},
  {id:'camaras', n:'Instalador de cámaras', c:'hogar', g:'Reparaciones', i:'cam', u:'trabajo', t:['Instalar cámaras','Revisar sistema','Intercomunicador','Cerco eléctrico']},
  {id:'tecnico', n:'Técnico de computadoras y celulares', c:'hogar', g:'Reparaciones', i:'lap', u:'trabajo', t:['Formatear','Pantalla rota','Wifi y redes','Impresora']},

  {id:'limpieza', n:'Limpieza del hogar', c:'hogar', g:'Limpieza y casa', i:'limp', u:'dia', team:1, t:['Limpieza general','Limpieza profunda','Después de una obra','Mudanza']},
  {id:'lavado', n:'Lavado y planchado', c:'hogar', g:'Limpieza y casa', i:'lav', u:'servicio', t:['Lavado de ropa','Planchado','Cortinas','Muebles y alfombras']},
  {id:'jardinero', n:'Jardinero', c:'hogar', g:'Limpieza y casa', i:'jar', u:'trabajo', t:['Cortar césped','Podar','Sembrar','Mantenimiento mensual']},
  {id:'cocinera', n:'Cocinera a domicilio', c:'hogar', g:'Limpieza y casa', i:'coc', u:'dia', t:['Menú de la semana','Almuerzo familiar','Cena especial','Loncheras']},

  {id:'ninera', n:'Niñera', c:'cuidado', i:'bebe', u:'hora', t:['Cuidar por horas','Recoger del colegio','Noche','Tareas escolares']},
  {id:'adulto', n:'Cuidado de adulto mayor', c:'cuidado', i:'cor', u:'dia', t:['Acompañamiento','Medicinas','Aseo personal','Noche']},
  {id:'enfermeria', n:'Enfermería a domicilio', c:'cuidado', i:'cruz', u:'visita', t:['Inyectables','Curaciones','Control de presión','Sonda']},
  {id:'fisio', n:'Terapia física a domicilio', c:'cuidado', i:'pes', u:'visita', t:['Rehabilitación','Dolor de espalda','Adulto mayor','Después de una operación']},
  {id:'veterinaria', n:'Veterinaria a domicilio', c:'mascotas', i:'pata', u:'visita', t:['Consulta','Vacunas','Desparasitación','Emergencia']},
  {id:'paseador', n:'Paseador de perros', c:'mascotas', i:'pata', u:'paseo', t:['Paseo de 30 min','Paseo de 1 hora','Paseo diario']},
  {id:'mascotas', n:'Cuidador de mascotas', c:'mascotas', i:'pata', u:'dia', t:['Mientras viajo','Visitas diarias','Dar comida y medicinas']},
  {id:'grooming', n:'Baño y corte de mascotas', c:'mascotas', i:'pata', u:'servicio', t:['Baño','Corte','Corte de uñas']},

  {id:'mudanza', n:'Mudanzas y cargadores', c:'mudanza', i:'cmn', u:'trabajo', team:1, t:['Mudanza completa','Pocas cosas','Subir o bajar pisos','Con camión']},
  {id:'chofer', n:'Chofer', c:'mudanza', i:'cho', u:'dia', t:['Con mi auto','Viaje fuera de la ciudad','Evento','Empresa']},
  {id:'motorizado', n:'Motorizado y delivery', c:'mudanza', i:'mot', u:'hora', team:1, t:['Repartos de mi negocio','Un envío','Trámites']},

  {id:'peluqueria', n:'Peluquería a domicilio', c:'belleza', g:'Belleza', i:'pel', u:'servicio', t:['Corte','Tinte','Peinado','Alisado']},
  {id:'barbero', n:'Barbero a domicilio', c:'belleza', g:'Belleza', i:'pei', u:'servicio', t:['Corte','Barba','Corte y barba']},
  {id:'manicure', n:'Uñas: manicure y pedicure', c:'belleza', g:'Belleza', i:'esm', u:'servicio', t:['Manicure','Pedicure','Uñas acrílicas','Gel']},
  {id:'maquillaje', n:'Maquillaje y estilismo', c:'belleza', g:'Belleza', i:'mak', u:'servicio', t:['Social','Novia','Sesión de fotos','Quinceañero']},
  {id:'cejas', n:'Cejas y pestañas', c:'belleza', g:'Belleza', i:'ojo', u:'servicio', t:['Diseño de cejas','Laminado de cejas','Lifting de pestañas','Extensiones']},
  {id:'depilacion', n:'Depilación', c:'belleza', g:'Belleza', i:'cera', u:'servicio', t:['Con cera','Con hilo','Piernas','Rostro','Axilas']},
  {id:'masajes', n:'Masajes a domicilio', c:'belleza', g:'Bienestar', i:'masa', u:'servicio', t:['Relajante','Descontracturante','Piedras calientes','Para dos']},
  {id:'facial', n:'Limpieza facial', c:'belleza', g:'Bienestar', i:'cara', u:'servicio', t:['Limpieza profunda','Hidratación','Antiacné']},

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


  /* clases particulares: en tu casa u online (se elige al pedir) */
  {id:'profesor', n:'Refuerzo escolar', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Tareas','Todas las materias','Primaria','Secundaria']},
  {id:'matematica', n:'Matemática', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Primaria','Secundaria','Preuniversitario','Universidad']},
  {id:'fisica', n:'Física y química', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Física','Química','Secundaria','Universidad']},
  {id:'literatura', n:'Comunicación y literatura', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Comprensión lectora','Redacción','Literatura','Ortografía']},
  {id:'preu', n:'Preuniversitario', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Examen de admisión','Razonamiento matemático','Razonamiento verbal','Simulacros']},
  {id:'universidad', n:'Cursos universitarios', c:'clases', g:'Colegio y universidad', i:'lib', u:'clase', t:['Cálculo','Estadística','Contabilidad','Economía']},
  {id:'ingles', n:'Inglés', c:'clases', g:'Idiomas', i:'glo', u:'clase', t:['Conversación','Para el colegio','Para el trabajo','Exámenes internacionales']},
  {id:'idiomas', now:0, n:'Otros idiomas', c:'clases', g:'Idiomas', i:'glo', u:'clase', t:['Portugués','Francés','Italiano','Alemán','Chino']},
  {id:'musica', now:0, n:'Música', c:'clases', g:'Música y arte', i:'mus', u:'clase', t:['Guitarra','Piano','Canto','Batería','Violín']},
  {id:'baile', now:0, n:'Baile', c:'clases', g:'Música y arte', i:'mus', u:'clase', t:['Salsa','Marinera','Bachata','Urbano']},
  {id:'dibujo', now:0, n:'Dibujo y pintura', c:'clases', g:'Música y arte', i:'lib', u:'clase', t:['Para niños','Acuarela','Óleo','Ilustración']},
  {id:'box', now:0, n:'Box', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Técnica básica','Cardio box','Para niños','Preparación física']},
  {id:'yoga', now:0, n:'Yoga y pilates', c:'clases', g:'Deporte y bienestar', i:'yoga', u:'clase', t:['Yoga','Pilates en colchoneta','Estiramiento','Para dos']},
  {id:'entrenador', now:0, n:'Entrenador personal', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Bajar de peso','Fuerza','En el parque','Para adultos mayores']},
  {id:'natacion', now:0, n:'Natación', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Para niños','Adultos','Perder el miedo al agua','Técnica']},
  {id:'artes', now:0, n:'Artes marciales', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Karate','Jiu-jitsu','Taekwondo','Defensa personal']},
  {id:'tenis', now:0, n:'Tenis', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Desde cero','Técnica','Para niños']},
  {id:'futbol', now:0, n:'Fútbol', c:'clases', g:'Deporte y bienestar', i:'pes', u:'clase', t:['Para niños','Técnica','Arquero']},
  {id:'computacion', n:'Computación y Excel', c:'clases', g:'Tecnología y otros', i:'lap', u:'clase', t:['Computación básica','Excel','Word y PowerPoint','Para adultos mayores']},
  {id:'programacion', now:0, n:'Programación', c:'clases', g:'Tecnología y otros', i:'lap', u:'clase', t:['Python','Páginas web','Para niños','Apps']},
  {id:'manejo', now:0, n:'Clases de manejo', c:'clases', g:'Tecnología y otros', i:'cho', u:'clase', t:['Primera vez','Para el examen de brevete','Auto mecánico','Auto automático']},
  {id:'cocinaclase', now:0, n:'Clases de cocina', c:'clases', g:'Tecnología y otros', i:'coc', u:'clase', t:['Cocina peruana','Repostería','Saludable']},
  {id:'impulsadora', n:'Impulsadoras y promotores', c:'negocio', i:'meg', u:'turno', team:1, t:['Supermercado','Degustación','Volanteo','Feria']},
  {id:'almacen', n:'Personal de almacén', c:'negocio', i:'caja', u:'turno', team:1, t:['Carga y descarga','Inventario','Despacho','Campaña']},
  {id:'cajero', n:'Cajeros', c:'negocio', i:'reg', u:'turno', team:1, t:['Tienda','Restaurante','Campaña de temporada']},
  {id:'vigilante', n:'Vigilante y portero', c:'negocio', i:'por', u:'turno', team:1, t:['Turno de día','Turno de noche','Edificio','Obra']},
  {id:'limpiezaof', n:'Limpieza de oficinas y locales', c:'negocio', i:'limp', u:'turno', team:1, t:['Oficina','Local comercial','Después de un evento']},

  /* ayuda y encargos: no es un oficio formal, pero se necesita (y mucha gente busca estos trabajos) */
  {id:'todero', n:'Maestro para todo', c:'ayuda', i:'herr', u:'trabajo', t:['Arreglo pequeño','Colgar cuadros o repisas','Instalar cortinas','Cambiar focos o enchufes','Ajustar puertas y chapas']},
  {id:'cargador', n:'Ayudante para cargar', c:'ayuda', i:'carga', u:'hora', team:1, t:['Subir o bajar cosas','Mover muebles en casa','Descargar un camión','Cargar compras']},
  {id:'deposito', n:'Ordenar depósito o cochera', c:'ayuda', i:'caja', u:'trabajo', t:['Sacar y ordenar cosas','Separar lo que se bota','Limpiar el espacio','Armar estantes']},
  {id:'desmonte', n:'Recojo de desmonte y cachivaches', c:'ayuda', i:'desm', u:'trabajo', t:['Desmonte de obra','Muebles viejos','Cachivaches','Ramas y hojas']},
  {id:'mandados', n:'Mandados y colas', c:'ayuda', i:'mand', u:'hora', t:['Hacer una cola','Recoger un paquete','Pagar recibos','Hacer compras']},
  {id:'mano', n:'Una mano por horas', c:'ayuda', i:'hora', u:'hora', team:1, t:['Ayuda en casa','Ayuda en un evento','Ayuda en tu negocio','Lo que necesites']},
  {id:'otro', n:'Pedido personalizado', c:'hogar', i:'otr', u:'trabajo', t:[], other:1}
];

/* Zona de servicio: Lima central y moderna, y las playas donde más se contrata (Ancón, La Punta y el sur hasta San Bartolo).
   Los límites reales de cada distrito están en js/zonas.js. */
PL.DISTRICTS_LIMA = ['Barranco','Breña','Cercado de Lima','Chorrillos','Jesús María','La Molina','La Victoria','Lince','Magdalena del Mar','Miraflores','Pueblo Libre','San Borja','San Isidro','San Luis','San Miguel','Santiago de Surco','Surquillo'];
PL.DISTRICTS_PLAYA = ['Ancón','La Punta','Punta Hermosa','Punta Negra','Santa María del Mar','San Bartolo'];
PL.DISTRICTS = PL.DISTRICTS_LIMA.concat(PL.DISTRICTS_PLAYA);

/* Perfiles de ejemplo: solo para el modo demo. */
PL.DEMO = {
  workers:['Carlos Mendoza','Rosa Quispe','Luis Huamán','Milagros Torres','Jhon Paredes','Yesenia Rojas','Wilmer Castillo','Karina Salazar','Edwin Vargas','Maribel Apaza','Jorge Ccori','Fiorella Díaz','Ángel Ramos','Sonia Mamani','Kevin Flores','Lucía Chávez','Raúl Gutiérrez','Patricia León'],
  clients:['Andrea','Miguel','Valeria','Diego','Camila','Renzo','Sofía','Martín','Daniela','Piero','Mariana','Óscar'],
  colors:['#FFD86B','#B4EEE1','#D4CBFF','#FFC2B0','#CDEBA8','#F7D2E8']
};

/* Íconos de oficios (48×48, trazo) */
PL.SI = {
  ojo:'<path d="M5 27s7-11 19-11 19 11 19 11-7 11-19 11S5 27 5 27z"/><circle cx="24" cy="27" r="5"/><path d="M13 15l-2-4M24 12V8M35 15l2-4"/>',
  cera:'<path d="M24 6s-12 13-12 22a12 12 0 0 0 24 0C36 19 24 6 24 6z"/><path d="M18 30a6 6 0 0 0 6 6"/>',
  masa:'<ellipse cx="24" cy="37" rx="15" ry="5"/><ellipse cx="24" cy="27" rx="10.5" ry="4.5"/><ellipse cx="24" cy="18.5" rx="6.5" ry="3.5"/><path d="M26 13c1-4 4-6 9-6-1 4-4 6-9 6z"/>',
  cara:'<circle cx="24" cy="24" r="16"/><path d="M18 21h.01M30 21h.01M18 30c3.5 3 8.5 3 12 0"/>',
  yoga:'<circle cx="24" cy="10" r="4"/><path d="M24 15v12M12 21l12 6 12-6M14 37l10-7 10 7M9 38h30"/>',
  herr:'<rect x="6" y="18" width="36" height="22" rx="3"/><path d="M18 18v-6h12v6M6 28h36M21 28v4h6v-4"/>',
  carga:'<path d="M7 8h5l7 26h21"/><circle cx="21" cy="39" r="3.5"/><rect x="19" y="13" width="18" height="15" rx="2"/><path d="M26 13v5h4v-5"/>',
  desm:'<path d="M9 14h30M18 14V9h12v5M13 14l2 26h18l2-26"/><path d="M21 20v14M27 20v14"/>',
  mand:'<path d="M10 16h28l-3 24H13z"/><path d="M18 16a6 6 0 0 1 12 0"/><path d="M19 27l4 4 7-8"/>',
  hora:'<circle cx="24" cy="27" r="14"/><path d="M24 27v-7M24 27l5 3M20 7h8M24 7v6"/>',
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
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.7M6.6 6.9C4 8.6 2.5 12 2.5 12s3.5 6 9.5 6a9 9 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  tool:'<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  note:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  wa:'<path d="M4.5 20l1.2-3.8A8 8 0 1 1 8.3 19z"/><path d="M9.2 8.6c.2 2.6 3.1 5.6 5.9 5.9l1.1-1.4-1.9-1-1 .9c-1-.4-2.1-1.5-2.5-2.5l.9-1-1-1.9z"/>'
};
