/* Agéndalo · personas que ofrecen cada servicio (perfiles de muestra)
   Cada servicio tiene su gente, siempre la misma: dónde vive, hasta dónde llega, lo que hace,
   su descripción, su experiencia y sus estudios. Sin calificaciones ni precios inventados.
   Solo aparecen quienes llegan hasta tu dirección, como los restaurantes en una app de reparto. */
(function(){
  const PL = window.PL;
  const YEAR = 2026;
  PL.FACES = PL.FACES || new Set(PL.DEMO.workers);

  /* números al azar, pero siempre los mismos para el mismo texto */
  const rng = s => {
    let h = 1779033703 ^ s.length;
    for (const c of s) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = h << 13 | h >>> 19; }
    return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  };
  const pickR = (r, a) => a[Math.floor(r() * a.length)];
  const low = s => s.charAt(0).toLowerCase() + s.slice(1);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  const FEM = ['Rosa', 'Milagros', 'Yesenia', 'Karina', 'Maribel', 'Fiorella', 'Sonia', 'Lucía', 'Patricia', 'Carmen', 'Gladys', 'Elena', 'Ana', 'María', 'Julia', 'Flor', 'Diana', 'Claudia', 'Vanessa', 'Katherine', 'Roxana', 'Silvia', 'Jessica', 'Andrea', 'Pamela', 'Mónica', 'Liliana', 'Norma', 'Teresa', 'Giuliana', 'Pilar', 'Susana', 'Lourdes', 'Nancy', 'Erika', 'Mariela', 'Cinthia', 'Gabriela', 'Paola', 'Rocío'];
  const MAS = ['Carlos', 'Luis', 'Jhon', 'Wilmer', 'Edwin', 'Jorge', 'Ángel', 'Kevin', 'Raúl', 'Juan', 'José', 'Miguel', 'Pedro', 'César', 'Víctor', 'Óscar', 'Hugo', 'Martín', 'Ricardo', 'Fernando', 'Eduardo', 'Alberto', 'Marco', 'Javier', 'Daniel', 'Renzo', 'Diego', 'Franco', 'Iván', 'Julio', 'Manuel', 'Walter', 'Freddy', 'Elmer', 'Percy', 'Gustavo', 'Henry', 'Roberto', 'Alonso', 'Gonzalo'];
  const APE = ['Quispe', 'Huamán', 'Mendoza', 'Rojas', 'Torres', 'Flores', 'Chávez', 'Vargas', 'Castillo', 'Ramos', 'Salazar', 'Paredes', 'Gutiérrez', 'Díaz', 'León', 'Mamani', 'Apaza', 'Ccori', 'Rivas', 'Campos', 'Sánchez', 'Cárdenas', 'Medina', 'Ortiz', 'Herrera', 'Silva', 'Vega', 'Navarro', 'Espinoza', 'Cruz', 'Morales', 'Ríos', 'Aguilar', 'Romero', 'Soto', 'Palomino', 'Cáceres', 'Villanueva', 'Zevallos', 'Yupanqui', 'Condori', 'Ticona', 'Benavides', 'Arana', 'Pacheco', 'Valdivia'];

  /* oficio de cada servicio: [él, ella, qué tan seguido es una mujer (0 a 1)] */
  const ROLE = {
    gasfitero: ['gasfitero', 'gasfitera', .1], electricista: ['electricista', 'electricista', .1], armado: ['armador de muebles', 'armadora de muebles', .15],
    carpintero: ['carpintero', 'carpintera', .1], pintor: ['pintor', 'pintora', .15], albanil: ['albañil', 'albañil', .05], cerrajero: ['cerrajero', 'cerrajera', .1],
    aire: ['técnico en aire acondicionado y refrigeración', 'técnica en aire acondicionado y refrigeración', .1], camaras: ['técnico en cámaras de seguridad', 'técnica en cámaras de seguridad', .15],
    tecnico: ['técnico en computadoras y celulares', 'técnica en computadoras y celulares', .3],
    limpieza: ['encargado de limpieza', 'encargada de limpieza', .85], lavado: ['lavandero', 'lavandera', .85], jardinero: ['jardinero', 'jardinera', .2], cocinera: ['cocinero', 'cocinera', .8],
    ninera: ['niñero', 'niñera', .92], adulto: ['cuidador de adultos mayores', 'cuidadora de adultos mayores', .8], enfermeria: ['técnico en enfermería', 'técnica en enfermería', .75],
    fisio: ['terapeuta físico', 'terapeuta física', .55], veterinaria: ['médico veterinario', 'médica veterinaria', .55], paseador: ['paseador de perros', 'paseadora de perros', .45],
    mascotas: ['cuidador de mascotas', 'cuidadora de mascotas', .6], grooming: ['groomer', 'groomer', .6],
    mudanza: ['encargado de mudanzas', 'encargada de mudanzas', .05], chofer: ['chofer', 'chofer', .15], motorizado: ['motorizado', 'motorizada', .15],
    peluqueria: ['estilista', 'estilista', .75], barbero: ['barbero', 'barbera', .1], manicure: ['manicurista', 'manicurista', .95], maquillaje: ['maquillador', 'maquilladora', .85],
    cejas: ['especialista en cejas y pestañas', 'especialista en cejas y pestañas', .95], depilacion: ['especialista en depilación', 'especialista en depilación', .95],
    masajes: ['masajista', 'masajista', .6], facial: ['cosmetólogo', 'cosmetóloga', .85],
    mesero: ['mesero', 'mesera', .45], barman: ['barman', 'bartender', .25], anfitriona: ['anfitrión', 'anfitriona', .85], seguridad: ['agente de seguridad', 'agente de seguridad', .15],
    cocinero: ['cocinero', 'cocinera', .4], dj: ['DJ', 'DJ', .2], animador: ['animador infantil', 'animadora infantil', .6], mago: ['mago y payaso', 'maga y payasa', .2],
    fotografo: ['fotógrafo', 'fotógrafa', .35], musicos: ['músico', 'música', .3], montaje: ['técnico de montaje', 'técnica de montaje', .1],
    profesor: ['profesor de refuerzo escolar', 'profesora de refuerzo escolar', .7], matematica: ['profesor de matemática', 'profesora de matemática', .4],
    fisica: ['profesor de física y química', 'profesora de física y química', .4], literatura: ['profesor de comunicación', 'profesora de comunicación', .65],
    preu: ['profesor preuniversitario', 'profesora preuniversitaria', .35], universidad: ['profesor de cursos universitarios', 'profesora de cursos universitarios', .4],
    ingles: ['profesor de inglés', 'profesora de inglés', .6], idiomas: ['profesor de idiomas', 'profesora de idiomas', .6], musica: ['profesor de música', 'profesora de música', .4],
    baile: ['profesor de baile', 'profesora de baile', .6], dibujo: ['profesor de dibujo y pintura', 'profesora de dibujo y pintura', .55], box: ['entrenador de box', 'entrenadora de box', .3],
    yoga: ['instructor de yoga y pilates', 'instructora de yoga y pilates', .8], entrenador: ['entrenador personal', 'entrenadora personal', .4], natacion: ['profesor de natación', 'profesora de natación', .45],
    artes: ['instructor de artes marciales', 'instructora de artes marciales', .25], tenis: ['profesor de tenis', 'profesora de tenis', .35], futbol: ['entrenador de fútbol', 'entrenadora de fútbol', .1],
    computacion: ['profesor de computación', 'profesora de computación', .5], programacion: ['profesor de programación', 'profesora de programación', .3], manejo: ['instructor de manejo', 'instructora de manejo', .25],
    cocinaclase: ['chef instructor', 'chef instructora', .5],
    impulsadora: ['promotor de ventas', 'impulsadora', .75], almacen: ['operario de almacén', 'operaria de almacén', .2], cajero: ['cajero', 'cajera', .6], vigilante: ['vigilante', 'vigilante', .1],
    limpiezaof: ['operario de limpieza', 'operaria de limpieza', .6],
    todero: ['maestro para todo', 'maestra para todo', .1], cargador: ['ayudante de carga', 'ayudante de carga', .05], deposito: ['ayudante de orden y limpieza', 'ayudante de orden y limpieza', .3],
    desmonte: ['ayudante de recojo', 'ayudante de recojo', .05], mandados: ['encargado de mandados', 'encargada de mandados', .4], mano: ['ayudante por horas', 'ayudante por horas', .4]
  };
  /* estudios o certificados (no todos los tienen) */
  const EDU = {
    gasfitero: ['Certificado técnico en gasfitería'], electricista: ['Técnico electricista certificado', 'Técnica electricista certificada'], aire: ['Técnico en refrigeración', 'Técnica en refrigeración'],
    camaras: ['Técnico en sistemas de seguridad', 'Técnica en sistemas de seguridad'], tecnico: ['Técnico en computación e informática', 'Técnica en computación e informática'],
    enfermeria: ['Técnico en enfermería titulado', 'Técnica en enfermería titulada'], fisio: ['Licenciado en Terapia Física', 'Licenciada en Terapia Física'], adulto: ['Curso de cuidado del adulto mayor'], ninera: ['Curso de primeros auxilios infantiles'],
    veterinaria: ['Médico veterinario colegiado', 'Médica veterinaria colegiada'], grooming: ['Curso de grooming profesional'],
    peluqueria: ['Estudios de estilismo profesional'], barbero: ['Curso de barbería profesional'], maquillaje: ['Curso de maquillaje profesional'], cejas: ['Curso de diseño de cejas y pestañas'],
    depilacion: ['Curso de cosmetología'], facial: ['Estudios de cosmetología'], masajes: ['Curso de masoterapia'],
    barman: ['Curso de coctelería'], fotografo: ['Estudios de fotografía'], cocinero: ['Estudios de cocina'], cocinera: ['Estudios de cocina'],
    profesor: ['Licenciado en Educación Primaria', 'Licenciada en Educación Primaria'], matematica: ['Bachiller en Ingeniería', 'Bachiller en Ingeniería'], fisica: ['Bachiller en Ingeniería Química', 'Bachiller en Ingeniería Química'],
    literatura: ['Licenciado en Literatura', 'Licenciada en Literatura'], preu: ['Ingeniero de profesión', 'Ingeniera de profesión'], universidad: ['Magíster en Economía', 'Magíster en Economía'],
    ingles: ['Certificación internacional de inglés, nivel C1'], idiomas: ['Certificación internacional del idioma'], musica: ['Estudios de música en conservatorio'],
    baile: ['Bailarín profesional', 'Bailarina profesional'], dibujo: ['Artista plástico', 'Artista plástica'], box: ['Certificación como entrenador deportivo', 'Certificación como entrenadora deportiva'],
    yoga: ['Certificación internacional de yoga'], entrenador: ['Licenciado en Educación Física', 'Licenciada en Educación Física'], natacion: ['Certificación como entrenador de natación', 'Certificación como entrenadora de natación'],
    artes: ['Cinturón negro'], tenis: ['Certificación como entrenador de tenis', 'Certificación como entrenadora de tenis'], futbol: ['Certificación como entrenador de fútbol', 'Certificación como entrenadora de fútbol'],
    computacion: ['Técnico en computación e informática', 'Técnica en computación e informática'], programacion: ['Ingeniero de software', 'Ingeniera de software'], manejo: ['Instructor de manejo certificado', 'Instructora de manejo certificada'],
    cocinaclase: ['Chef de profesión'], vigilante: ['Curso de seguridad aprobado'], seguridad: ['Curso de seguridad aprobado']
  };
  const ind = c => c.g('independiente', 'independiente');

  /* cómo se presentan: una apertura, lo que hacen (en sus palabras) y un cierre */
  const MID = {
    gasfitero: 'Arreglo fugas, destapo desagües e instalo termas, grifos e inodoros.', electricista: 'Soluciono cortes de luz, instalo tomacorrientes y luminarias y reviso tableros eléctricos.',
    armado: 'Armo roperos, camas, escritorios y reposteros, y cuelgo televisores con soporte.', carpintero: 'Arreglo puertas, cambio bisagras y chapas, y hago muebles y clósets a medida.',
    pintor: 'Pinto cuartos, casas completas, fachadas y locales, con acabado prolijo y sin manchar.', albanil: 'Hago tarrajeo, enchapes de mayólica, muros y pequeñas remodelaciones.',
    cerrajero: 'Abro puertas cuando te quedas afuera, cambio chapas e instalo cerraduras de seguridad.', aire: 'Instalo y doy mantenimiento a aires acondicionados, y reparo refrigeradoras y lavadoras.',
    camaras: 'Instalo cámaras de seguridad, intercomunicadores y cercos eléctricos, y los dejo configurados en tu celular.', tecnico: 'Formateo computadoras, cambio pantallas de celulares y configuro el wifi y las impresoras.',
    limpieza: 'Hago limpieza general y profunda, también después de una obra o de una mudanza.', lavado: 'Lavo y plancho ropa, cortinas, muebles y alfombras, con cuidado de cada tela.',
    jardinero: 'Corto césped, podo, siembro y hago mantenimiento mensual de jardines.', cocinera: 'Preparo el menú de la semana, almuerzos familiares, cenas especiales y loncheras.',
    ninera: 'Cuido niños por horas o de noche, los recojo del colegio y los ayudo con sus tareas.', adulto: 'Acompaño a adultos mayores, doy sus medicinas a la hora y ayudo con su aseo personal.',
    enfermeria: 'Pongo inyectables, hago curaciones, controlo la presión y manejo sondas.', fisio: 'Hago rehabilitación en casa: dolor de espalda, recuperación después de una operación y terapia para adultos mayores.',
    veterinaria: 'Hago consultas, vacunas y desparasitación en casa, y atiendo emergencias.', paseador: 'Paseo perros de todos los tamaños: media hora, una hora o todos los días.',
    mascotas: 'Cuido a tu mascota mientras viajas: visitas diarias, comida y medicinas.', grooming: 'Baño y corto el pelo de perros y gatos, y les corto las uñas.',
    mudanza: 'Hago mudanzas completas o de pocas cosas, subo y bajo muebles por escaleras y trabajo con camión.', chofer: 'Manejo tu auto o el mío para el día a día, eventos, empresas y viajes fuera de Lima.',
    motorizado: 'Hago repartos para negocios, envíos y trámites en toda Lima.',
    peluqueria: 'Hago cortes, tintes, peinados y alisados en la comodidad de tu casa.', barbero: 'Hago cortes clásicos y modernos, arreglo de barba y perfilado.',
    manicure: 'Hago manicure, pedicure, uñas acrílicas y esmaltado en gel.', maquillaje: 'Maquillo para eventos sociales, novias, quinceañeros y sesiones de fotos.',
    cejas: 'Hago diseño y laminado de cejas, lifting y extensiones de pestañas.', depilacion: 'Depilo con cera o con hilo: piernas, rostro y axilas.',
    masajes: 'Doy masajes relajantes, descontracturantes y con piedras calientes, también para dos.', facial: 'Hago limpiezas faciales profundas, hidratación y tratamientos para el acné.',
    mesero: 'Atiendo matrimonios, cumpleaños, eventos de empresa y restaurantes.', barman: 'Preparo barras libres y cócteles de autor para fiestas, bares y discotecas.',
    anfitriona: 'Recibo a los invitados, atiendo stands de ferias y apoyo en eventos de empresa.', seguridad: 'Controlo el acceso y la puerta en fiestas privadas, conciertos y eventos.',
    cocinero: 'Cocino parrillas, buffets, bocaditos y comida criolla para eventos.', dj: 'Pongo música en cumpleaños, matrimonios y discotecas.',
    animador: 'Animo fiestas infantiles con juegos, concursos y shows de títeres.', mago: 'Hago shows de magia, de payaso y globoflexia para fiestas infantiles.',
    fotografo: 'Hago fotos y videos de eventos, sesiones de fotos y fotos de producto.', musicos: 'Toco serenatas, música criolla, cumbia y violín para bodas.',
    montaje: 'Monto y desmonto toldos, carpas, escenarios, stands y mobiliario.',
    profesor: 'Ayudo con las tareas y refuerzo todas las materias de primaria y secundaria.', matematica: 'Enseño matemática de primaria, secundaria, preuniversitario y universidad.',
    fisica: 'Enseño física y química de secundaria y de los primeros ciclos de universidad.', literatura: 'Trabajo comprensión lectora, redacción, literatura y ortografía.',
    preu: 'Preparo para el examen de admisión: razonamiento matemático, verbal y simulacros.', universidad: 'Enseño cálculo, estadística, contabilidad y economía a universitarios.',
    ingles: 'Doy clases de conversación, inglés para el colegio, para el trabajo y para exámenes internacionales.', idiomas: 'Enseño portugués, francés, italiano y alemán, desde lo básico.',
    musica: 'Doy clases de guitarra, piano, canto, batería y violín.', baile: 'Enseño salsa, marinera, bachata y baile urbano.', dibujo: 'Doy clases de dibujo para niños, acuarela, óleo e ilustración.',
    box: 'Enseño técnica básica de box, cardio box y preparación física, también a niños.', yoga: 'Doy clases de yoga, pilates en colchoneta y estiramiento, también para dos.',
    entrenador: 'Entreno para bajar de peso o ganar fuerza, en casa o en el parque.', natacion: 'Enseño a nadar a niños y adultos, y ayudo a perderle el miedo al agua.',
    artes: 'Enseño karate, jiu-jitsu, taekwondo y defensa personal.', tenis: 'Enseño tenis desde cero y técnica, a niños y adultos.', futbol: 'Entreno técnica de fútbol para niños y preparo arqueros.',
    computacion: 'Enseño computación básica, Excel, Word y PowerPoint, también a adultos mayores.', programacion: 'Enseño Python, páginas web y apps, también a niños.',
    manejo: 'Doy clases de manejo para principiantes y preparo para el examen de brevete.', cocinaclase: 'Enseño cocina peruana, repostería y cocina saludable.',
    impulsadora: 'Trabajo en supermercados, degustaciones, volanteo y ferias.', almacen: 'Hago carga y descarga, inventarios, despachos y apoyo en campañas.',
    cajero: 'Atiendo caja en tiendas, restaurantes y campañas de temporada.', vigilante: 'Hago turnos de día o de noche en edificios, locales y obras.',
    limpiezaof: 'Limpio oficinas y locales comerciales, también después de un evento.', todero: 'Cuelgo cuadros y repisas, instalo cortinas, cambio focos y enchufes y ajusto puertas.',
    cargador: 'Subo y bajo cosas, muevo muebles, descargo camiones y cargo compras.', deposito: 'Ordeno depósitos y cocheras, separo lo que se bota, limpio y armo estantes.',
    desmonte: 'Recojo desmonte de obra, muebles viejos, cachivaches, ramas y hojas.', mandados: 'Hago colas, recojo paquetes, pago recibos y hago compras por ti.',
    mano: 'Ayudo en casa, en eventos o en tu negocio, por las horas que necesites.'
  };
  const OPEN = {
    rep: [c => `Soy ${c.role} desde hace ${c.y} años y atiendo casas, departamentos y pequeños negocios.`, c => `Trabajé ${c.yb} años en una empresa de mantenimiento de edificios; ahora atiendo por mi cuenta.`, c => `Llevo ${c.y} años trabajando como ${c.role}.`, c => `Atiendo en ${c.d} y distritos cercanos hace ${c.y} años.`, c => `Empecé como ayudante y hoy llevo ${c.y} años como ${c.role}.`],
    casa: [c => `Llevo ${c.y} años trabajando en casas de familia en ${c.d} y alrededores.`, c => `Soy ${c.role} con ${c.y} años de experiencia.`, c => `Me dedico a esto hace ${c.y} años y tengo familias que me llaman cada semana.`, c => `Trabajo con familias de ${c.d} y ${c.d2} hace ${c.y} años.`, c => `Llevo ${c.y} años en esto y me gusta hacerlo bien.`],
    cuidado: [c => `Soy ${c.role} con ${c.y} años de experiencia acompañando a familias.`, c => `He trabajado ${c.y} años en casas y en clínicas.`, c => `Llevo ${c.y} años cuidando a personas en sus casas, en ${c.d} y alrededores.`],
    mascotas: [c => `Trabajo con perros y gatos hace ${c.y} años.`, c => `Soy ${c.role} y los animales son lo mío desde siempre.`, c => `Llevo ${c.y} años como ${c.role}.`, c => `Atiendo en ${c.d} y alrededores hace ${c.y} años.`],
    belleza: [c => `Soy ${c.role} con ${c.y} años de experiencia en salones de ${c.d2}.`, c => `Atiendo a domicilio hace ${c.y} años, también para novias y eventos.`, c => `Llevo ${c.y} años como ${c.role}.`, c => `Me formé en salones de ${c.d2} y hoy atiendo por mi cuenta.`],
    eventos: [c => `Trabajo en eventos hace ${c.y} años: matrimonios, cumpleaños y eventos de empresa.`, c => `Soy ${c.role} con ${c.y} años de experiencia.`, c => `Llevo ${c.y} años trabajando en fiestas y eventos de todo tipo.`],
    clases: [c => `Soy ${c.role} hace ${c.y} años.`, c => `Doy clases particulares hace ${c.y} años, a niños, jóvenes y adultos.`, c => `Enseño hace ${c.y} años y disfruto ver avanzar a mis alumnos.`, c => `Llevo ${c.y} años enseñando en ${c.d} y online.`],
    negocio: [c => `He trabajado ${c.y} años en tiendas, supermercados y campañas de temporada.`, c => `Soy ${c.role} con ${c.y} años de experiencia.`, c => `Tengo ${c.y} años de experiencia en atención al público y trabajo en equipo.`],
    ayuda: [c => `Hago trabajos pequeños y encargos hace ${c.y} años.`, c => `Llevo ${c.y} años dando una mano en casas y negocios de ${c.d}.`, c => `Vivo en ${c.d} y trabajo en la zona hace ${c.y} años.`],
    traslado: [c => `Soy ${c.role} hace ${c.y} años.`]
  };
  const OPEN_SVC = {
    mudanza: [c => `Trabajo en mudanzas hace ${c.y} años.`], chofer: [c => `Soy chofer profesional hace ${c.y} años.`], motorizado: [c => `Trabajo con mi moto hace ${c.y} años.`],
    ninera: [c => `Cuido niños hace ${c.y} años, desde bebés hasta la edad escolar.`, c => `Soy niñera hace ${c.y} años y tengo referencias de familias en ${c.d}.`],
    adulto: [c => `Hace ${c.y} años que cuido a personas mayores en sus casas.`, c => `Soy ${c.role} con ${c.y} años de experiencia.`],
    vigilante: [c => `Trabajo en seguridad hace ${c.y} años.`]
  };
  const CLOSE = {
    rep: ['Llego puntual y con mis herramientas, y antes de empezar te explico qué voy a hacer.', 'Trabajo limpio y ordenado. Si hay que comprar repuestos, te paso la lista antes.', 'Reviso primero, te digo qué encontré y recién ahí empiezo.', 'Si algo falla después, regreso a revisarlo.', 'Cuido tu casa como si fuera la mía: protejo el piso y limpio al terminar.'],
    casa: [c => `Soy ${c.g('ordenado', 'ordenada')}, ${c.g('discreto', 'discreta')} y me gusta dejar todo impecable.`, 'Respeto tus indicaciones y la forma en que te gusta que se hagan las cosas.', 'Si quieres, puedo ir el mismo día cada semana.', 'Llego puntual y aviso si me voy a retrasar.'],
    cuidado: ['Trato con paciencia y cariño, y te mantengo al tanto de todo por el chat.', 'Llego a la hora, sigo las indicaciones al pie de la letra y aviso cualquier novedad.', 'Me gusta que la familia esté tranquila y sepa siempre cómo va todo.', 'Tengo referencias de las familias con las que he trabajado.'],
    mascotas: ['Trato a cada mascota como si fuera mía y te mando fotos durante el servicio.', 'Voy con calma para no estresar a tu mascota.', 'Atiendo perros y gatos de todos los tamaños.'],
    belleza: ['Voy a tu casa con todo lo necesario y dejo el espacio limpio.', 'Uso productos de buena calidad y te asesoro según lo que buscas.', c => `Soy muy ${c.g('cuidadoso', 'cuidadosa')} con los detalles y con la higiene de mis herramientas.`, 'Escucho lo que quieres y te muestro opciones antes de empezar.'],
    eventos: ['Llego antes de la hora, con uniforme, y me adapto al estilo del evento.', 'Trabajo bien en equipo y con buena actitud de principio a fin.', 'Me encargo de que todo salga a tiempo y bien atendido.'],
    clases: ['Preparo cada clase según el nivel y el ritmo del alumno.', 'Explico con paciencia y con ejemplos prácticos hasta que quede claro.', 'Después de cada clase te envío un resumen de lo que avanzamos.', 'Le dejo ejercicios para practicar entre clase y clase.'],
    negocio: ['Soy puntual, responsable y aprendo rápido las indicaciones del negocio.', 'Trato amable con los clientes y buena presencia.', 'Me adapto a los horarios del negocio.'],
    ayuda: [c => `Soy ${c.g('rápido', 'rápida')}, ${c.g('cuidadoso', 'cuidadosa')} y llego puntual.`, 'Si algo no lo sé hacer, te lo digo desde el inicio.', 'Trabajo rápido y dejo todo ordenado.'],
    traslado: ['Puntual y con cuidado de principio a fin.']
  };
  const CLOSE_SVC = {
    mudanza: ['Embalo con cuidado, protejo los muebles y llevo herramientas para desarmar y armar.', 'Cuando el trabajo lo necesita, voy con un ayudante de confianza.'],
    chofer: ['Conozco bien Lima y las rutas a las playas. Puntual y prudente al volante.', 'Tengo brevete profesional y récord limpio.'], motorizado: ['Moto propia, con caja para el pedido. Te aviso apenas entrego.'],
    cocinera: ['Cocino con ingredientes frescos y me adapto a los gustos de la familia.'], jardinero: ['Llevo mis herramientas y dejo todo limpio al terminar.'],
    dj: ['Tengo equipo de sonido y luces propio, y armo la lista de música contigo.'], fotografo: ['Entrego las fotos editadas en pocos días.'], animador: ['Los niños la pasan bien y los papás descansan.'],
    musicos: ['Toco con mi propio equipo y preparo el repertorio contigo.'], vigilante: ['Tengo experiencia en edificios, obras y locales.'], veterinaria: ['Llevo lo necesario para atender en casa y te explico todo con calma.'],
    ninera: ['Los niños están seguros y entretenidos, y te aviso de todo por el chat.']
  };
  const KIND = s => ({hogar: s.g === 'Reparaciones' ? 'rep' : 'casa', cuidado: 'cuidado', mascotas: 'mascotas', belleza: 'belleza', eventos: 'eventos', clases: 'clases', negocio: 'negocio', ayuda: 'ayuda', mudanza: 'traslado'})[s.c] || 'ayuda';
  const CV = {
    rep: c => [[`${cap(c.role)} en una empresa de mantenimiento`, 'Edificios y oficinas'], [`${cap(c.role)} ${ind(c)}`, `${c.d} y alrededores`]],
    casa: c => c.id === 'cocinera' ? [['Cocina de un restaurante', c.d2], [`${cap(c.role)} a domicilio`, `Familias en ${c.d}`]] : c.id === 'jardinero' ? [['Mantenimiento de áreas verdes', `Condominio en ${c.d2}`], [`${cap(c.role)} ${ind(c)}`, `${c.d} y alrededores`]] : [['Trabajo en casa de familia', c.d2], ['Empresa de servicios de limpieza', 'Oficinas y departamentos']],
    cuidado: c => c.id === 'ninera' ? [[cap(c.role), `Familia en ${c.d2}`], ['Auxiliar de nido', `Nido en ${c.d}`]] : c.id === 'adulto' ? [[cap(c.role), `Familia en ${c.d2}`], ['Atención en casa', cap(ind(c))]] : [['Clínica privada', 'Hospitalización'], ['Atención en casa', `Familias en ${c.d2}`]],
    mascotas: c => c.id === 'veterinaria' ? [['Clínica veterinaria', c.d2], ['Atención a domicilio', cap(ind(c))]] : [['Petshop', c.d2], [`${cap(c.role)} ${ind(c)}`, `${c.d} y alrededores`]],
    belleza: c => [[`${cap(c.role)} en salón`, c.d2], ['Atención a domicilio', cap(ind(c))]],
    eventos: c => [['Empresa de eventos y banquetes', 'Lima'], [`${cap(c.role)} ${ind(c)}`, 'Matrimonios, cumpleaños y empresas']],
    clases: c => ['box', 'yoga', 'entrenador', 'natacion', 'artes', 'tenis', 'futbol'].includes(c.id) ? [[cap(c.role), `Club deportivo en ${c.d2}`], ['Clases particulares', cap(ind(c))]]
      : ['ingles', 'idiomas'].includes(c.id) ? [[cap(c.role), 'Instituto de idiomas'], ['Clases particulares', cap(ind(c))]] : [['Docente', `Colegio particular en ${c.d2}`], ['Clases particulares', cap(ind(c))]],
    negocio: c => c.id === 'vigilante' ? [['Agente de seguridad', 'Empresa de seguridad'], [cap(c.role), `Edificio en ${c.d2}`]] : [['Tienda por departamentos', 'Lima'], ['Campañas de temporada', 'Varias marcas']],
    ayuda: c => [['Ayudante de obra', 'Construcción'], [cap(c.role), `${c.d} y alrededores`]],
    traslado: c => c.id === 'chofer' ? [['Chofer de empresa', 'Transporte de personal'], ['Chofer particular', `Familias en ${c.d}`]] : c.id === 'motorizado' ? [['Delivery de restaurantes', c.d2], ['Repartos por mi cuenta', 'Lima']] : [['Empresa de mudanzas', 'Lima'], [`${cap(c.role)} ${ind(c)}`, 'Lima y playas']]
  };
  const DAYS = ['Lunes a sábado', 'Todos los días', 'Lunes a viernes', 'Martes a domingo'], DAYS_EV = ['Fines de semana y feriados', 'Todos los días, con reserva'];
  const HOURS = ['de 7 a. m. a 7 p. m.', 'de 8 a. m. a 6 p. m.', 'mañanas y tardes', 'de 9 a. m. a 8 p. m.'], HOURS_EV = ['tardes y noches', 'según el evento'];

  /* dónde viven: Lima central (llegan a 4–7 km) y las playas (llegan a todo su tramo de playas) */
  const BEACH = [['Punta Hermosa', 15], ['Ancón', 9], ['La Punta', 7]];
  const cache = {};
  PL.pros = svcId => {
    if (cache[svcId]) return cache[svcId];
    const s = PL.svc(svcId); if (!s || s.other) return (cache[svcId] = []);
    const r = rng('agendalo:' + svcId), role = ROLE[svcId] || [low(s.n), low(s.n), .5];
    const central = PL.DISTRICTS_LIMA.slice().sort(() => r() - .5).slice(0, 9);
    const homes = central.map(d => [d, 4.5 + r() * 2.5]).concat(BEACH);
    const used = new Set(), ev = s.c === 'eventos';
    const kind = KIND(s), o0 = Math.floor(r() * 7), c0 = Math.floor(r() * 7);
    const out = homes.map(([d, radius], k) => {
      const fem = r() < role[2];
      let name;
      do { name = `${pickR(r, fem ? FEM : MAS)} ${pickR(r, APE)}`; } while (used.has(name));
      used.add(name); PL.FACES.add(name);
      const g = (m, f) => fem ? f : m;
      const y = 2 + Math.floor(r() * 13), d2 = pickR(r, PL.DISTRICTS_LIMA.filter(x => x !== d));
      const edu = EDU[svcId] && r() < .7 ? (EDU[svcId][fem && EDU[svcId][1] ? 1 : 0]) : '';
      const c = {id: svcId, c: s.c, role: fem ? role[1] : role[0], g, y, yb: Math.max(2, Math.round(y * .6)), d, d2, edu};
      /* una apertura, lo que hace (en sus palabras) y un cierre */
      const opens = OPEN_SVC[svcId] || OPEN[kind];
      const open = opens[(k + o0) % opens.length](c);  /* rotan dentro del servicio: en la lista no se repiten seguidas */
      const closers = (CLOSE_SVC[svcId] || []).concat(CLOSE[kind]);
      const close = closers[(k + c0) % closers.length];
      const closeTxt = typeof close === 'function' ? close(c) : close;
      const bio = [open, MID[svcId] || '', closeTxt].filter(Boolean).join(' '), blurb = `${open} ${closeTxt}`;
      const title = r() < .5 ? `${cap(c.role)} con ${y} años de experiencia` : edu ? `${cap(c.role)} · ${edu}` : `${cap(c.role)} en ${d} y alrededores`;
      const split = Math.max(1, Math.round(y * .45)), cv = CV[kind](c);
      const z = PL.zoneCenter ? PL.zoneCenter(d) : [-12.1, -77.03];
      return {id: `${svcId}-${k}`, name, fem, svc: svcId, c: s.c, district: d, radius, pos: [z[0] + (r() - .5) * .012, z[1] + (r() - .5) * .012],
        years: y, title, bio, blurb, edu, does: s.t.slice(), now: s.now !== 0 && r() < .62,
        cv: [{r: cv[0][0], p: cv[0][1], y: `${YEAR - y} – ${YEAR - split}`}, {r: cv[1][0], p: cv[1][1], y: `Desde ${YEAR - split}`}],
        days: pickR(r, ev ? DAYS_EV : DAYS), hours: pickR(r, ev ? HOURS_EV : HOURS), color: PL.pick ? PL.DEMO.colors[k % PL.DEMO.colors.length] : '#FFD86B'};
    });
    return (cache[svcId] = out);
  };
  PL.pro = id => { const m = /^(.+)-(\d+)$/.exec(id || ''); return m ? PL.pros(m[1])[Number(m[2])] || null : null; };

  /* quienes llegan hasta tu dirección, del más cercano al más lejano */
  PL.prosNear = (svcId, loc, o = {}) => {
    if (!loc || !loc.lat || !PL.km) return [];
    return PL.pros(svcId).map(w => ({w, km: PL.km([loc.lat, loc.lng], w.pos)}))
      .filter(x => x.km <= x.w.radius && (!o.now || x.w.now)).sort((a, b) => a.km - b.km);
  };
  /* las empresas que atienden tu distrito */
  PL.bizNear = (svcId, district) => PL.bizFor(svcId).filter(b => !district || b.mine || b.d.includes(district));
  /* distritos a los que llega una persona */
  PL.proZones = w => PL.DISTRICTS.filter(d => PL.km(PL.zoneCenter(d), w.pos) <= w.radius + .6);
  PL.kmTxt = km => km < 1 ? `${Math.max(100, Math.round(km * 1000 / 50) * 50)} m` : `${km.toFixed(1).replace('.', ',')} km`;
  /* el trabajador como lo usan el pedido y el seguimiento */
  PL.proW = w => ({name: w.name, color: w.color, pro: w.id, isBiz: false});
})();
