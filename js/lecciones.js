/* ==========================================================================
   Vídeo-lecciones propias: guion de cada escena (lo que dice la voz) y su animación.
   Contenido revisado con la normativa vigente en noviembre de 2026 (RGC con la reforma
   del RD 518/2026, RD 159/2021 de la baliza V-16, LSV y Código Penal).
   Tipos de escena: portada, cifras, lista, diag, senales, barras, jerarquia, consejo, detencion, v16, pas.
   ========================================================================== */
window.LECCIONES = [
  {
    id: 'examen', tema: 'documentacion', t: 'Así es el examen teórico', d: 'Formato, trucos para no fallar y cómo prepararlo.',
    escenas: [
      { tipo: 'portada', titulo: 'Así es el examen teórico', sub: 'Permiso B', voz: 'Hola, soy Semi. En menos de dos minutos te cuento cómo es el examen teórico del permiso B y cómo prepararlo para aprobar a la primera.' },
      { tipo: 'cifras', items: [['30', 'preguntas'], ['3', 'respuestas por pregunta'], ['30', 'minutos'], ['3', 'fallos como máximo']], voz: 'El examen tiene treinta preguntas tipo test. Cada una tiene tres respuestas y solo una es correcta. Dispones de treinta minutos y, para ser apto, puedes fallar como máximo tres preguntas.' },
      { tipo: 'lista', titulo: 'Trucos para el examen', items: ['Lee la pregunta entera', 'Ojo con «siempre», «nunca» y «solo»', 'Mira bien la imagen', 'No dejes ninguna en blanco'], voz: 'Lee siempre la pregunta completa antes de mirar las respuestas. Desconfía de las palabras absolutas, como siempre, nunca o solo. Fíjate bien en la imagen, porque muchas veces la clave está en una señal o en un detalle. Y no dejes ninguna en blanco: las que no contestes cuentan como fallo.' },
      { tipo: 'consejo', estado: 'celebra', titulo: 'Tu plan', texto: 'Un poco cada día, repasa tus fallos y, cuando aciertes más del 90 %, haz simulacros.', voz: 'La mejor forma de prepararlo es practicar un poco cada día y repasar tus fallos leyendo las explicaciones. Cuando aciertes más del noventa por ciento, haz simulacros completos con tiempo. ¡Vamos a por ello!' }
    ]
  },
  {
    id: 'glorietas', tema: 'maniobras', t: 'Glorietas sin miedo', d: 'Entrar, circular y salir sin dudas.',
    escenas: [
      { tipo: 'portada', titulo: 'Glorietas sin miedo', sub: 'Entrar · circular · salir', voz: 'Las glorietas generan muchas dudas, pero solo tienes que recordar tres momentos: entrar, circular y salir.' },
      { tipo: 'diag', d: 'glorieta', titulo: 'Para entrar, cede el paso', voz: 'Para entrar, cede el paso a los vehículos que ya circulan por la glorieta, salvo que una señal o un agente indiquen otra cosa.' },
      { tipo: 'lista', titulo: 'Dentro de la glorieta', items: ['¿Sales pronto? Carril exterior', 'Para recorrer más: carriles interiores', 'Bicis y ciclomotores pueden ir por el exterior'], voz: 'Dentro, si vas a tomar una de las primeras salidas, circula por el carril exterior. Los carriles interiores se usan para recorrer más trayecto. Recuerda que bicicletas y ciclomotores pueden ir por el carril exterior aunque vayan a una salida posterior.' },
      { tipo: 'lista', titulo: 'Para salir', items: ['Colócate antes en el carril exterior', 'Intermitente derecho', 'Nunca salgas desde un carril interior'], voz: 'Para salir, colócate con antelación en el carril exterior y señaliza con el intermitente derecho. Nunca salgas directamente desde un carril interior cortando el paso a los demás.' }
    ]
  },
  {
    id: 'prioridad', tema: 'prioridad', t: 'Quién pasa primero', d: 'La regla de la derecha, sus excepciones y el orden de las señales.',
    escenas: [
      { tipo: 'diag', d: 'prioridad', titulo: 'Sin señales: cede a la derecha', voz: 'En una intersección sin señalizar, la regla general es sencilla: debes ceder el paso a los vehículos que se acercan por tu derecha.' },
      { tipo: 'lista', titulo: 'Excepciones a la regla', items: ['Vía pavimentada frente a la que no lo está', 'Vehículos sobre raíles', 'Quien ya está en la glorieta', 'Quien ya circula por autopista o autovía'], voz: 'Hay excepciones. Tienen preferencia los que circulan por una vía pavimentada frente a los que salen de una sin pavimentar, los vehículos que van sobre raíles, los que ya están dentro de una glorieta, y los que circulan por una autopista o autovía frente a los que se incorporan.' },
      { tipo: 'jerarquia', titulo: '¿A quién obedezco primero?', items: ['Agentes', 'Señalización circunstancial', 'Semáforos', 'Señales verticales', 'Marcas viales'], voz: 'Si las indicaciones se contradicen, sigue este orden: primero los agentes de la circulación, luego la señalización circunstancial que modifica el régimen normal de la vía, después los semáforos, las señales verticales y, por último, las marcas viales.' },
      { tipo: 'consejo', estado: 'feliz', titulo: 'Vehículos prioritarios', texto: 'Con luces y sirena encendidas, apártate de forma segura y déjales paso.', voz: 'Y recuerda: los vehículos de emergencia en servicio, con las señales luminosas y acústicas encendidas, tienen prioridad. Facilítales el paso apartándote de forma segura.' }
    ]
  },
  {
    id: 'velocidad', tema: 'velocidad', t: 'Límites de velocidad', d: 'Los números que más caen, explicados en un minuto.',
    escenas: [
      { tipo: 'barras', titulo: 'Turismos y motos', items: [['Autopista y autovía', 120], ['Carretera convencional', 90], ['Urbana, 2 o más carriles por sentido', 50], ['Urbana, 1 carril por sentido', 30], ['Urbana de plataforma única', 20]], voz: 'Estos son los límites genéricos para turismos y motocicletas. Ciento veinte en autopista y autovía, y noventa en carretera convencional. En ciudad, cincuenta si hay dos o más carriles por sentido, treinta si hay uno solo, y veinte en las calles de plataforma única.' },
      { tipo: 'lista', titulo: 'Ojo con esto', items: ['No puedes superar el límite para adelantar', 'Mínima en autopista y autovía: 60 km/h', 'Delito: +60 km/h en urbana o +80 en interurbana'], voz: 'No se permite superar el límite para adelantar. En autopistas y autovías hay una velocidad mínima de sesenta kilómetros por hora para turismos. Y superar el límite en más de sesenta kilómetros por hora en vía urbana, o en más de ochenta en interurbana, es delito.' },
      { tipo: 'consejo', estado: 'piensa', titulo: 'Velocidad adecuada', texto: 'El límite es un máximo, no un objetivo.', voz: 'El límite es un máximo, no un objetivo. La velocidad adecuada es la que te permite detenerte ante cualquier obstáculo previsible, y con lluvia, niebla o mucho tráfico puede ser bastante menor.' }
    ]
  },
  {
    id: 'detencion', tema: 'velocidad', t: 'Distancia de detención', d: 'Por qué la velocidad multiplica la frenada.',
    escenas: [
      { tipo: 'detencion', titulo: 'Reacción + frenado', voz: 'La distancia de detención es la suma de dos partes: la distancia que recorres mientras reaccionas, y la que necesitas para frenar hasta parar.' },
      { tipo: 'cifras', items: [['25 m', 'en 1 segundo de reacción a 90 km/h'], ['×4', 'frenado si duplicas la velocidad']], voz: 'A noventa kilómetros por hora recorres unos veinticinco metros en solo un segundo de reacción. Y ojo: si duplicas la velocidad, la distancia de frenado se multiplica por cuatro.' },
      { tipo: 'lista', titulo: 'Qué la alarga', items: ['Alcohol, drogas, sueño o el móvil', 'Suelo mojado, nieve o hielo', 'Neumáticos o frenos en mal estado'], voz: 'El alcohol, el cansancio o mirar el móvil alargan el tiempo de reacción. El suelo mojado, la nieve o el hielo, y unos neumáticos o frenos en mal estado, alargan la frenada. Por eso hay que mantener siempre la distancia de seguridad.' }
    ]
  },
  {
    id: 'ciclistas', tema: 'adelantamiento', t: 'Adelantar a ciclistas', d: 'Las reglas nuevas de octubre de 2026.',
    escenas: [
      { tipo: 'diag', d: 'ciclista', titulo: '1,5 m y 20 km/h menos', voz: 'Desde octubre de dos mil veintiséis, para adelantar a un ciclista en vía interurbana debes reducir tu velocidad al menos veinte kilómetros por hora respecto al límite de la vía, y dejar como mínimo un metro y medio de separación.' },
      { tipo: 'lista', titulo: 'Además…', items: ['Más de un carril: cámbiate por completo', 'Puedes rebasar la línea continua si es seguro', 'En ciudad: 5 m detrás del ciclista'], voz: 'Si hay más de un carril en tu sentido, cambia por completo de carril. Puedes rebasar la línea continua para adelantar a un ciclista siempre que no haya peligro. Y en ciudad, si circulas detrás de un ciclista, mantén al menos cinco metros de distancia.' },
      { tipo: 'consejo', estado: 'animo', titulo: '6 puntos', texto: 'Poner en peligro u obstaculizar a un ciclista al adelantarlo cuesta 6 puntos.', voz: 'Poner en peligro u obstaculizar a un ciclista al adelantarlo cuesta seis puntos. Paciencia: unos segundos detrás de una bici no cambian tu viaje.' }
    ]
  },
  {
    id: 'alcohol', tema: 'alcohol', t: 'Alcohol y drogas', d: 'Tasas, mitos y sanciones.',
    escenas: [
      { tipo: 'cifras', items: [['0,25', 'mg/l en aire · general'], ['0,15', 'mg/l · noveles y profesionales'], ['> 0,60', 'mg/l · delito']], voz: 'La tasa máxima de alcohol para la mayoría de conductores es de cero coma veinticinco miligramos por litro en aire espirado. Para los conductores noveles, durante sus dos primeros años, y para los profesionales, es de cero coma quince. Y superar cero coma sesenta es delito.' },
      { tipo: 'lista', titulo: 'Mitos que no funcionan', items: ['El café no baja la tasa', 'Ni una ducha fría ni dormir un rato', 'Solo el tiempo elimina el alcohol'], voz: 'Ni el café, ni una ducha fría, ni dormir un rato eliminan el alcohol. Solo el tiempo lo hace, y la tasa máxima se alcanza entre media hora y hora y media después de beber.' },
      { tipo: 'consejo', estado: 'animo', titulo: 'Drogas: 6 puntos', texto: 'Conducir con presencia de drogas: 6 puntos y 1.000 €. La única tasa segura es cero.', voz: 'Conducir con presencia de drogas en el organismo supone seis puntos y mil euros de multa. La única tasa segura al volante es cero.' }
    ]
  },
  {
    id: 'novedades', tema: 'circulacion', t: 'Novedades 2026', d: 'Baliza V-16, carril de emergencia y la reforma del Reglamento.',
    escenas: [
      { tipo: 'v16', titulo: 'Baliza V-16 conectada', voz: 'Desde el uno de enero de dos mil veintiséis, la baliza V-16 conectada sustituye a los triángulos. Si tu coche se queda inmovilizado, la colocas en el techo sin necesidad de bajar a la calzada, y la baliza comunica tu ubicación a la DGT.' },
      { tipo: 'diag', d: 'emergencia', titulo: 'Carril de emergencia', voz: 'Con la reforma del Reglamento, en vigor desde octubre de dos mil veintiséis, en una retención en autopista o autovía hay que abrir un carril de emergencia. Con dos carriles, cada uno se aparta hacia su lado. Con tres, el de la izquierda se va a la izquierda y los otros dos a la derecha.' },
      { tipo: 'lista', titulo: 'Más cambios', items: ['Casco para ciclistas en interurbanas', 'Patinetes: 15 años y casco', 'Motos: guantes y calzado cerrado', 'Peatón con prioridad en plataforma única'], voz: 'Además, el casco es obligatorio para todos los ciclistas en vías interurbanas. Los usuarios de patinete deben tener al menos quince años y llevar casco. Los motoristas deben usar guantes en vías interurbanas y calzado cerrado. Y el peatón tiene prioridad en las calles de plataforma única.' }
    ]
  },
  {
    id: 'senales', tema: 'senales', t: 'Señales de un vistazo', d: 'Formas, colores y marcas viales.',
    escenas: [
      { tipo: 'senales', titulo: 'Forma y color', items: [['p20', 'Peligro'], ['r101', 'Prohibición'], ['r402', 'Obligación'], ['s13', 'Indicación']], voz: 'Las señales se reconocen por su forma y su color. Un triángulo con borde rojo avisa de un peligro. Un círculo con borde rojo prohíbe. Un círculo azul obliga. Y un cuadrado o rectángulo azul te informa.' },
      { tipo: 'senales', titulo: 'Formas únicas', items: [['r2', 'STOP: detención total'], ['r1', 'Ceda el paso']], voz: 'Dos señales tienen una forma única para reconocerlas incluso de espaldas o cubiertas de nieve: el octógono del stop, donde siempre hay que detenerse por completo, y el triángulo invertido del ceda el paso.' },
      { tipo: 'lista', titulo: 'Marcas viales', items: ['Línea continua: no se pisa ni se rebasa', 'Continua junto a discontinua: manda la más cercana', 'Fondo amarillo (obras): prevalece sobre las fijas'], voz: 'En las marcas viales, la línea continua no se puede pisar ni rebasar. Si hay una continua junto a una discontinua, obedece la que tengas más cerca. Y las señales con fondo amarillo son de obras, y prevalecen sobre las fijas.' }
    ]
  },
  {
    id: 'auxilio', tema: 'accidentes', t: 'Si ves un accidente: PAS', d: 'Proteger, avisar y socorrer, paso a paso.',
    escenas: [
      { tipo: 'pas', voz: 'Si llegas el primero a un accidente, recuerda tres letras: P, A, S. Proteger, Avisar y Socorrer, siempre en este orden.' },
      { tipo: 'lista', titulo: 'Proteger', items: ['Para en lugar seguro y enciende la emergencia', 'Chaleco antes de bajar', 'Señaliza con la V-16', 'Apaga el contacto de los accidentados'], voz: 'Proteger: detén tu vehículo en un lugar seguro, enciende las luces de emergencia, ponte el chaleco antes de bajar, señaliza con la baliza V-16 y apaga el contacto de los vehículos accidentados.' },
      { tipo: 'cifras', items: [['112', 'lugar exacto · heridos · riesgos']], voz: 'Avisar: llama al uno, uno, dos, e indica el lugar exacto, con la carretera y el punto kilométrico, cuántos heridos hay, y si existe algún riesgo, como fuego o mercancías peligrosas.' },
      { tipo: 'lista', titulo: 'Socorrer', items: ['No muevas a los heridos salvo peligro', 'No quites el casco a un motorista', 'No des de beber', 'Abriga y tranquiliza'], voz: 'Socorrer: no muevas a los heridos salvo que corran un peligro inminente, no le quites el casco a un motorista, no les des de beber, y abrígalos y tranquilízalos hasta que llegue la ayuda.' }
    ]
  }
];
