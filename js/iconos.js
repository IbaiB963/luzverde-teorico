/* Iconos de trazo (24×24) dibujados para la plataforma. */
(function () {
  const P = {
    inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    practicar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    examen: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    progreso: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trofeo: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
    libro: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    mas: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
    llama: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-10-2 1.5-3 3.5-3 5.5C10.5 9 9.5 8 9 6.5 6.5 8.5 5 11.5 5 15c0 4.3 3 7 7 7Z"/><path d="M12 22c-1.7 0-3-1.3-3-3.2 0-2 1.5-3 3-4.8 1.5 1.8 3 2.8 3 4.8 0 1.9-1.3 3.2-3 3.2Z"/>',
    rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    bandera: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    capas: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    repaso: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    alerta: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/>',
    estrella: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    diana: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    escudo: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    descargar: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    subir: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
    papelera: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z" fill="currentColor"/>',
    enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    norma: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    bombilla: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    luna: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>',
    medalla: '<circle cx="12" cy="15" r="6"/><path d="m9 3 3 6 3-6M8 3h8"/><path d="m12 12.5.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3.9-1.8Z" fill="currentColor"/>',
    mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    pausa: '<rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/>',
    reproducir: '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z" fill="currentColor"/>',
    anterior: '<path d="M6 5v14M19 5 9 12l10 7V5Z"/>',
    siguiente: '<path d="M18 5v14M5 5l10 7-10 7V5Z"/>',
    volumen: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mudo: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 5 6M22 9l-5 6"/>',
    subtitulos: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 13h4M13 13h4M7 16h7"/>',
    pantalla: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    cofre: '<path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v9H3v-9Z"/><path d="M3 11h18M10 11v3h4v-3"/>',
    movil: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    pluma: '<path d="M20 4c-8 0-13 5-14 12l-2 4 4-2c7-1 12-6 12-14Z"/><path d="M6 16 14 8"/>',
    voz: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    // Temas
    t_senales: '<path d="M12 3 2.5 19.5h19L12 3Z"/><path d="M12 9.5v4.5M12 16.5v.3"/>',
    t_prioridad: '<path d="M12 2v20M2 12h20"/><path d="m9 5 3-3 3 3M19 9l3 3-3 3"/>',
    t_velocidad: '<path d="M4.5 18a9 9 0 1 1 15 0"/><path d="m12 14 4-5"/><circle cx="12" cy="14" r="1.4" fill="currentColor"/>',
    t_adelantamiento: '<path d="M7 21V9l-3 3M7 9l3 3"/><path d="M17 21V3l-3 3M17 3l3 3"/>',
    t_maniobras: '<path d="M7 21V10a5 5 0 0 1 10 0v4"/><path d="m13 11 4 4 4-4"/>',
    t_estacionamiento: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>',
    t_circulacion: '<path d="M8 3 5 21M16 3l3 18"/><path d="M12 4v3M12 10.5v3M12 17v3"/>',
    t_alumbrado: '<path d="M10 6c-4 0-6 2.7-6 6s2 6 6 6h1V6h-1Z"/><path d="M14 8h7M14 12h7M14 16h7"/>',
    t_alcohol: '<path d="M7 3h10l-1 8a4 4 0 0 1-8 0L7 3Z"/><path d="M12 15v6M8 21h8M7.5 7h9"/>',
    t_factor: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    t_seguridad: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z"/><path d="M12 8v8M8 12h8"/>',
    t_documentacion: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.3 1.7-2 3-2s2.4.7 3 2M14 10h4M14 13h3"/>',
    t_mantenimiento: '<path d="M14.7 6.3a4 4 0 0 0-5.3 5.3L3 18l3 3 6.4-6.4a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"/>',
    t_eficiente: '<path d="M5 20c0-9 6-15 15-15 0 9-6 15-15 15Z"/><path d="M5 20 13 12"/>',
    t_accidentes: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>'
  };
  window.ico = function (name, extra) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra ? ' ' + extra : ''}>${P[name] || P.info}</svg>`;
  };

  window.TEMAS = [
    { id: 'senales', nombre: 'Señales y agentes', corto: 'Señales', color: '#d4352b', desc: 'Señales verticales, marcas viales, semáforos y órdenes de los agentes.' },
    { id: 'prioridad', nombre: 'Prioridad de paso', corto: 'Prioridad', color: '#e0700f', desc: 'Intersecciones, glorietas, estrechamientos y vehículos prioritarios.' },
    { id: 'velocidad', nombre: 'Velocidad y distancias', corto: 'Velocidad', color: '#c2410c', desc: 'Límites genéricos, velocidad adecuada, distancia de detención.' },
    { id: 'adelantamiento', nombre: 'Adelantamientos', corto: 'Adelantar', color: '#1846c7', desc: 'Cuándo, cómo y dónde adelantar; ciclistas y prohibiciones.' },
    { id: 'maniobras', nombre: 'Maniobras', corto: 'Maniobras', color: '#0e7490', desc: 'Incorporaciones, giros, glorietas, cambio de sentido y marcha atrás.' },
    { id: 'estacionamiento', nombre: 'Parada y estacionamiento', corto: 'Estacionar', color: '#2563eb', desc: 'Dónde y cómo parar y estacionar; prohibiciones.' },
    { id: 'circulacion', nombre: 'Normas de circulación', corto: 'Circulación', color: '#475569', desc: 'Posición en la vía, carriles, autopistas, túneles y otros usuarios.' },
    { id: 'alumbrado', nombre: 'Alumbrado y señales ópticas', corto: 'Alumbrado', color: '#ca8a04', desc: 'Qué luz usar en cada caso, intermitentes y deslumbramientos.' },
    { id: 'alcohol', nombre: 'Alcohol, drogas y medicamentos', corto: 'Alcohol', color: '#9333ea', desc: 'Tasas, efectos, controles y sanciones.' },
    { id: 'factor', nombre: 'Factor humano', corto: 'Factor humano', color: '#7c3aed', desc: 'Atención, fatiga, sueño, distracciones, emociones y salud.' },
    { id: 'seguridad', nombre: 'Seguridad vial', corto: 'Seguridad vial', color: '#128a49', desc: 'Seguridad activa y pasiva, usuarios vulnerables y siniestralidad.' },
    { id: 'documentacion', nombre: 'Documentación y normativa', corto: 'Normativa', color: '#334155', desc: 'Permisos, puntos, sanciones, delitos y leyes de tráfico.' },
    { id: 'mantenimiento', nombre: 'Vehículo y mantenimiento', corto: 'Mantenimiento', color: '#57534e', desc: 'Neumáticos, frenos, suspensión, ITV y averías.' },
    { id: 'eficiente', nombre: 'Conducción eficiente', corto: 'Eficiente', color: '#16a34a', desc: 'Ahorro de combustible, emisiones y distintivos ambientales.' },
    { id: 'accidentes', nombre: 'Accidentes y primeros auxilios', corto: 'Auxilio', color: '#dc2626', desc: 'Conducta PAS, 112, señalización y atención a heridos.' }
  ];
  window.TEMA = Object.fromEntries(window.TEMAS.map(t => [t.id, t]));

  /* Semi, la mascota: un semáforo con cara. Estados: feliz, celebra, piensa, animo. */
  window.mascota = function (estado = 'feliz', size = 96) {
    const luz = { feliz: 2, celebra: 2, piensa: 1, animo: 0 }[estado] ?? 2;
    const col = ['#ff5a4e', '#ffb547', '#22c06c'];
    const boca = {
      feliz: '<path d="M50 88q10 9 20 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
      celebra: '<path d="M47 85q13 16 26 0Z" fill="#fff"/><path d="M53 92q7 4 14 0" fill="#ff8b80"/>',
      piensa: '<path d="M52 90h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
      animo: '<path d="M51 92q9-7 18 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'
    }[estado];
    const brazos = estado === 'celebra'
      ? '<path d="M24 74 10 52M96 74l14-22" stroke="#24345e" stroke-width="7" stroke-linecap="round"/><circle cx="10" cy="50" r="6" fill="#24345e"/><circle cx="110" cy="50" r="6" fill="#24345e"/>'
      : '<path d="M24 82 12 96M96 82l12 14" stroke="#24345e" stroke-width="7" stroke-linecap="round"/>';
    const mirada = estado === 'piensa' ? -3 : 0;
    const cejas = estado === 'animo' ? '<path d="M40 52l12 4M80 52l-12 4" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>' : '';
    return `<svg class="semi semi-${estado}" viewBox="0 0 120 140" width="${size}" height="${size * 140 / 120}" aria-hidden="true">
      <ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.12)"/>
      ${brazos}
      <path d="M46 120v10M74 120v10" stroke="#24345e" stroke-width="7" stroke-linecap="round"/>
      <rect x="24" y="14" width="72" height="110" rx="30" fill="#24345e"/>
      <rect x="24" y="14" width="72" height="110" rx="30" fill="url(#semi-brillo)" opacity=".5"/>
      <defs><linearGradient id="semi-brillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b74b8"/><stop offset=".6" stop-color="#24345e" stop-opacity="0"/></linearGradient></defs>
      <rect x="36" y="22" width="48" height="18" rx="9" fill="#18233f"/>
      ${[0, 1, 2].map(i => `<circle cx="${46 + i * 14}" cy="31" r="5.5" fill="${i === luz ? col[i] : '#3a4870'}"${i === luz ? ` class="semi-luz" style="filter:drop-shadow(0 0 5px ${col[i]})"` : ''}/>`).join('')}
      ${cejas}
      <g class="semi-ojos"><ellipse cx="46" cy="66" rx="9" ry="11" fill="#fff"/><ellipse cx="74" cy="66" rx="9" ry="11" fill="#fff"/>
      <circle cx="${47 + mirada}" cy="${68 + mirada}" r="5" fill="#111a2e"/><circle cx="${75 + mirada}" cy="${68 + mirada}" r="5" fill="#111a2e"/>
      <circle cx="${49 + mirada}" cy="${65 + mirada}" r="1.8" fill="#fff"/><circle cx="${77 + mirada}" cy="${65 + mirada}" r="1.8" fill="#fff"/></g>
      <circle cx="36" cy="82" r="5" fill="#ff8b80" opacity=".45"/><circle cx="84" cy="82" r="5" fill="#ff8b80" opacity=".45"/>
      ${boca}
    </svg>`;
  };
})();
