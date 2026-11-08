/* ==========================================================================
   Dibujos animados en SVG para guías y vídeo-lecciones (vista cenital y lateral).
   Circulación por la derecha; las glorietas se recorren en sentido antihorario.
   ========================================================================== */
(function () {
  const ASF = '#454e60', LIN = '#f4f1e8', ACERA = '#d9d3c4';
  const AZUL = '#1f5bea', ROJO = '#e0392f', AMBAR = '#f29a13';

  const defs = p => `<defs>
    <filter id="${p}-sombra" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2" dy="3" stdDeviation="2.2" flood-color="#000" flood-opacity=".33"/></filter>
    <linearGradient id="${p}-brillo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="${p}-cesped" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#8cbf72"/><circle cx="4" cy="5" r="1.2" fill="#7aad60"/><circle cx="13" cy="12" r="1.2" fill="#9ccd82"/></pattern>
  </defs>`;
  const arbol = (p, x, y, r = 15) => `<g filter="url(#${p}-sombra)"><circle cx="${x}" cy="${y}" r="${r}" fill="#3f8f3a"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .55}" fill="#5aab4d"/></g>`;

  // Coche visto desde arriba, apuntando hacia +x (para animateMotion con rotate="auto").
  // intermitente: 'der' | 'izq' | null (parpadea) · luces: rotativos de emergencia.
  function coche(p, col, o = {}) {
    const inter = lado => `<g opacity="0">${lado === 'der' ? '<rect x="22" y="12" width="6" height="5" rx="2" fill="#ffb000"/><rect x="-28" y="12" width="6" height="5" rx="2" fill="#ffb000"/>' : '<rect x="22" y="-17" width="6" height="5" rx="2" fill="#ffb000"/><rect x="-28" y="-17" width="6" height="5" rx="2" fill="#ffb000"/>'}<animate attributeName="opacity" values="1;0" dur=".7s" calcMode="discrete" repeatCount="indefinite"${o.interInicio ? ` begin="${o.interInicio}"` : ''}/></g>`;
    return `<g filter="url(#${p}-sombra)">
      <rect x="-28" y="-16" width="56" height="32" rx="9" fill="${col}"/>
      <rect x="-28" y="-16" width="56" height="32" rx="9" fill="url(#${p}-brillo)"/>
      <path d="M14 -12Q21 0 14 12L5 11V-11Z" fill="#cfe3ff" opacity=".93"/>
      <rect x="-6" y="-11" width="11" height="22" rx="3" fill="rgba(0,0,0,.17)"/>
      <path d="M-14 -11H-8V11H-14Q-19 0 -14 -11Z" fill="#cfe3ff" opacity=".72"/>
      <rect x="25" y="-14" width="3.5" height="7" rx="1.5" fill="#fff6c8"/><rect x="25" y="7" width="3.5" height="7" rx="1.5" fill="#fff6c8"/>
      <rect x="-28.5" y="-14" width="3" height="7" rx="1.5" fill="#ff4d4d"/><rect x="-28.5" y="7" width="3" height="7" rx="1.5" fill="#ff4d4d"/>
      ${o.cruz ? '<rect x="-12" y="-4" width="20" height="8" fill="#e0392f"/><rect x="-6" y="-10" width="8" height="20" fill="#e0392f"/>' : ''}
      ${o.luces ? `<rect x="0" y="-14" width="6" height="12" rx="2" fill="#2f63f0"><animate attributeName="fill" values="#2f63f0;#cfe0ff;#2f63f0" dur=".5s" repeatCount="indefinite"/></rect><rect x="0" y="2" width="6" height="12" rx="2" fill="#2f63f0"><animate attributeName="fill" values="#cfe0ff;#2f63f0;#cfe0ff" dur=".5s" repeatCount="indefinite"/></rect>` : ''}
      ${o.intermitente ? inter(o.intermitente) : ''}
    </g>`;
  }
  const bici = (p, col = '#16a34a') => `<g filter="url(#${p}-sombra)"><rect x="-18" y="-2.5" width="36" height="5" rx="2.5" fill="#222"/><ellipse cx="0" cy="0" rx="9" ry="11" fill="${col}"/><circle cx="2" cy="0" r="6" fill="#f5d000"/><circle cx="2" cy="0" r="3" fill="#f2c9a0"/></g>`;
  const ceda = (p, x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#${p}-sombra)"><path d="M-12 -9H12L0 11Z" fill="#fff" stroke="#c8102e" stroke-width="4" stroke-linejoin="round"/></g>`;
  const cebra = (x, y, w, h, vertical) => Array.from({ length: 6 }, (_, i) => vertical
    ? `<rect x="${x}" y="${y + i * (h / 6)}" width="${w}" height="${h / 12}" fill="#f1efe8"/>`
    : `<rect x="${x + i * (w / 6)}" y="${y}" width="${w / 12}" height="${h}" fill="#f1efe8"/>`).join('');
  const mover = (id, dur, extra = '') => `<animateMotion dur="${dur}" repeatCount="indefinite" rotate="auto" ${extra}><mpath href="#${id}"/></animateMotion>`;

  /* ---------- Glorieta ---------- */
  // A entra desde el sur, espera a que pase B (que ya circula dentro), entra por el carril exterior,
  // señaliza a la derecha y sale por el norte (segunda salida). Ciclo de 8 s.
  function glorieta() {
    const p = 'gl';
    const ruta = 'M220 430L220 298A100 100 0 0 0 220 102L220 -30';
    // Longitudes: 132 + 274 + 132 = 538. A se detiene con el morro en la línea de ceda (y=352, 78/538 ≈ 0,145).
    const rutaB = 'M104.1 228.4A100 100 0 1 0 295.9 171.6A100 100 0 1 0 104.1 228.4';
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Animación: el coche azul cede el paso al rojo, que ya circula por la glorieta, entra por el carril exterior y sale señalizando a la derecha">${defs(p)}
      <rect width="400" height="400" fill="url(#${p}-cesped)"/>
      ${arbol(p, 50, 50)}${arbol(p, 350, 52, 13)}${arbol(p, 345, 352)}${arbol(p, 48, 350, 12)}
      <rect x="148" y="0" width="104" height="400" fill="${ACERA}"/><rect x="0" y="148" width="400" height="104" fill="${ACERA}"/>
      <rect x="160" y="0" width="80" height="400" fill="${ASF}"/><rect x="0" y="160" width="400" height="80" fill="${ASF}"/>
      <circle cx="200" cy="200" r="132" fill="${ACERA}"/><circle cx="200" cy="200" r="124" fill="${ASF}"/>
      <circle cx="200" cy="200" r="58" fill="${ACERA}"/><circle cx="200" cy="200" r="52" fill="url(#${p}-cesped)"/>${arbol(p, 200, 200, 22)}${arbol(p, 178, 182, 9)}
      <circle cx="200" cy="200" r="88" fill="none" stroke="${LIN}" stroke-width="3" stroke-dasharray="14 12"/>
      <path d="M200 0V68M200 332V400M0 200H68M332 200H400" stroke="${LIN}" stroke-width="3" stroke-dasharray="14 12"/>
      ${cebra(163, 352, 74, 18)}${cebra(163, 30, 74, 18)}${cebra(30, 163, 18, 74, true)}${cebra(352, 163, 18, 74, true)}
      <path d="M200 324H240M200 76H160M76 200V240M324 200V160" stroke="${LIN}" stroke-width="3" stroke-dasharray="6 5"/>
      ${ceda(p, 258, 330)}${ceda(p, 142, 70, 180)}${ceda(p, 70, 258, 90)}${ceda(p, 330, 142, -90)}
      <path id="${p}-a" d="${ruta}" fill="none"/><path id="${p}-b" d="${rutaB}" fill="none"/>
      <path d="${ruta}" fill="none" stroke="#ffb547" stroke-width="3" stroke-dasharray="3 8" stroke-linecap="round" opacity=".85"/>
      <g>${coche(p, ROJO)}${mover(p + '-b', '8s')}</g>
      <g>${coche(p, AZUL, { intermitente: 'der' })}${mover(p + '-a', '8s', 'keyPoints="0;0.145;0.145;1" keyTimes="0;0.18;0.42;1" calcMode="linear"')}</g>
    </svg>`;
  }

  /* ---------- Intersección sin señalizar: prioridad a la derecha ---------- */
  function prioridad() {
    const p = 'pr';
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Animación: en un cruce sin señales, el coche azul espera a que pase el rojo, que viene por su derecha">${defs(p)}
      <rect width="400" height="400" fill="url(#${p}-cesped)"/>${arbol(p, 60, 60)}${arbol(p, 105, 95, 11)}${arbol(p, 340, 62, 17)}${arbol(p, 352, 345, 14)}${arbol(p, 55, 340, 13)}
      <rect x="148" y="0" width="104" height="400" fill="${ACERA}"/><rect x="0" y="148" width="400" height="104" fill="${ACERA}"/>
      <rect x="160" y="0" width="80" height="400" fill="${ASF}"/><rect x="0" y="160" width="400" height="80" fill="${ASF}"/>
      <path d="M200 0V150M200 250V400M0 200H150M250 200H400" stroke="${LIN}" stroke-width="3" stroke-dasharray="16 12"/>
      ${cebra(163, 254, 74, 20)}${cebra(163, 126, 74, 20)}${cebra(126, 163, 20, 74, true)}${cebra(254, 163, 20, 74, true)}
      <path id="${p}-a" d="M220 440V-40" fill="none"/><path id="${p}-b" d="M440 180H-40" fill="none"/>
      <g>${coche(p, ROJO)}${mover(p + '-b', '7s', 'keyPoints="0;0;1;1" keyTimes="0;0.1;0.6;1" calcMode="linear"')}</g>
      <g>${coche(p, AZUL)}${mover(p + '-a', '7s', 'keyPoints="0;0.32;0.32;1" keyTimes="0;0.25;0.5;1" calcMode="linear"')}</g>
      <g transform="translate(300 330)"><rect x="-58" y="-17" width="116" height="34" rx="17" fill="rgba(17,26,46,.82)"/><text y="6" font-family="Arial" font-weight="800" font-size="15" text-anchor="middle" fill="#fff">Cede a la derecha</text></g>
    </svg>`;
  }

  /* ---------- Adelantamiento a un ciclista ---------- */
  function ciclista() {
    const p = 'ci';
    return `<svg viewBox="0 0 440 240" role="img" aria-label="Animación: el coche adelanta al ciclista cambiando de carril, con 1,5 metros de separación y reduciendo la velocidad">${defs(p)}
      <rect width="440" height="240" fill="url(#${p}-cesped)"/>${arbol(p, 40, 24, 14)}${arbol(p, 330, 22, 12)}${arbol(p, 400, 220, 14)}${arbol(p, 120, 222, 12)}
      <rect x="0" y="44" width="440" height="8" fill="${ACERA}"/><rect x="0" y="188" width="440" height="8" fill="${ACERA}"/>
      <rect x="0" y="52" width="440" height="136" fill="${ASF}"/>
      <path d="M0 58H440M0 182H440" stroke="${LIN}" stroke-width="3"/><path d="M0 120H440" stroke="${LIN}" stroke-width="3" stroke-dasharray="22 16"/>
      <path id="${p}-a" d="M-50 152L110 152C160 152 165 88 215 88L285 88C335 88 340 152 390 152L500 152" fill="none"/>
      <g><g transform="translate(0 0)">${bici(p)}</g><animateTransform attributeName="transform" type="translate" values="170 168;270 168" dur="7s" repeatCount="indefinite"/></g>
      <g>${coche(p, AZUL, { intermitente: 'izq' })}${mover(p + '-a', '7s')}</g>
      <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.36;.42;.6;.66;1" dur="7s" repeatCount="indefinite"/>
        <path d="M222 106V158" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3"/><path d="M216 112L222 104 228 112M216 152L222 160 228 152" fill="none" stroke="#fff" stroke-width="2.5"/>
        <rect x="232" y="118" width="62" height="24" rx="12" fill="rgba(17,26,46,.85)"/><text x="263" y="135" font-family="Arial" font-weight="800" font-size="14" text-anchor="middle" fill="#fff">≥ 1,5 m</text></g>
      <g transform="translate(372 30)"><circle r="22" fill="#fff" stroke="#c8102e" stroke-width="5"/><text y="6" font-family="Arial" font-weight="900" font-size="15" text-anchor="middle" fill="#111">−20</text></g>
    </svg>`;
  }

  /* ---------- Carril de emergencia ---------- */
  function emergencia() {
    const p = 'em';
    const cocheV = (x, y, col, dx, retraso = 0) => `<g transform="translate(${x} ${y})"><g><g transform="rotate(-90)">${coche(p, col)}</g><animateTransform attributeName="transform" type="translate" values="0 0;${dx} 0;${dx} 0;0 0" keyTimes="0;.18;.85;1" dur="7s" begin="${retraso}s" repeatCount="indefinite"/></g></g>`;
    const amb = (x, retraso) => `<g><g transform="rotate(-90)">${coche(p, '#f7f7f7', { cruz: true, luces: true })}</g><animateTransform attributeName="transform" type="translate" values="${x} 470;${x} 470;${x} -60;${x} -60" keyTimes="0;.2;.9;1" dur="7s" begin="${retraso}s" repeatCount="indefinite"/></g>`;
    const filas = [90, 200, 310];
    return `<svg viewBox="0 0 440 400" role="img" aria-label="Animación: en una retención, los coches se apartan para abrir un carril de emergencia por el que pasa una ambulancia">${defs(p)}
      <rect width="440" height="400" fill="url(#${p}-cesped)"/>
      <rect x="22" y="0" width="140" height="400" fill="${ASF}"/><path d="M28 0V400M156 0V400" stroke="${LIN}" stroke-width="3"/><path d="M92 0V400" stroke="${LIN}" stroke-width="3" stroke-dasharray="20 14"/>
      <rect x="232" y="0" width="190" height="400" fill="${ASF}"/><path d="M238 0V400M416 0V400" stroke="${LIN}" stroke-width="3"/><path d="M297 0V400M357 0V400" stroke="${LIN}" stroke-width="3" stroke-dasharray="20 14"/>
      ${filas.map(y => cocheV(60, y, AZUL, -19) + cocheV(124, y, AMBAR, 19)).join('')}
      ${filas.map(y => cocheV(267, y, AZUL, -21) + cocheV(327, y, '#8b4fe6', 17) + cocheV(387, y, AMBAR, 12)).join('')}
      ${amb(92, 0)}${amb(297, .3)}
      <g font-family="Arial" font-weight="900" font-size="15" text-anchor="middle" fill="#fff"><rect x="40" y="10" width="104" height="26" rx="13" fill="rgba(17,26,46,.82)"/><text x="92" y="28">2 carriles</text><rect x="275" y="10" width="104" height="26" rx="13" fill="rgba(17,26,46,.82)"/><text x="327" y="28">3 carriles</text></g>
    </svg>`;
  }

  /* ---------- Coche de perfil (vídeos de frenada y V-16) ---------- */
  const perfil = (col = AZUL) => `<g filter="url(#perf-sombra)">
    <path d="M6 -18Q8 -34 30 -36L64 -38Q78 -58 104 -60L150 -60Q172 -60 188 -40L222 -36Q238 -33 240 -18V-8H6Z" fill="${col}"/>
    <path d="M6 -18Q8 -34 30 -36L64 -38Q78 -58 104 -60L150 -60Q172 -60 188 -40L222 -36Q238 -33 240 -18V-8H6Z" fill="url(#perf-brillo)"/>
    <path d="M74 -40Q86 -54 104 -55H124V-40Z" fill="#cfe3ff"/><path d="M130 -55H150Q166 -55 180 -40H130Z" fill="#cfe3ff"/>
    <path d="M60 -28H200" stroke="rgba(0,0,0,.18)" stroke-width="2"/><rect x="226" y="-30" width="12" height="7" rx="3" fill="#fff6c8"/><rect x="6" y="-30" width="8" height="7" rx="3" fill="#ff4d4d"/>
    ${[52, 192].map(x => `<g transform="translate(${x} -6)"><circle r="20" fill="#1a1f2b"/><circle r="11" fill="#9aa3b5"/><circle r="4" fill="#59627a"/></g>`).join('')}
  </g>`;
  const defsPerfil = `<defs><filter id="perf-sombra" x="-20%" y="-30%" width="140%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#000" flood-opacity=".35"/></filter>
    <linearGradient id="perf-brillo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="perf-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a4f"/><stop offset="1" stop-color="#36507f"/></linearGradient></defs>`;

  function detencion() {
    return `<svg viewBox="0 0 640 260" role="img" aria-label="Animación: el coche recorre la distancia de reacción y después la de frenado hasta detenerse">${defsPerfil}
      <rect width="640" height="260" fill="url(#perf-cielo)" opacity=".0"/>
      <rect x="0" y="176" width="640" height="84" fill="#3b4558"/><rect x="0" y="172" width="640" height="6" fill="#59627a"/><path d="M0 214H640" stroke="${LIN}" stroke-width="4" stroke-dasharray="26 20"/>
      <g opacity="0"><animate attributeName="opacity" values="0;1;1" keyTimes="0;.05;1" dur="6s" repeatCount="indefinite"/><rect x="40" y="232" width="190" height="16" rx="8" fill="#ffb547"/><text x="135" y="120" font-family="Arial" font-weight="900" font-size="22" text-anchor="middle" fill="#ffb547">Reacción</text></g>
      <g opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.4;.45;1" dur="6s" repeatCount="indefinite"/><rect x="230" y="232" width="350" height="16" rx="8" fill="#ff5a4e"/><text x="405" y="120" font-family="Arial" font-weight="900" font-size="22" text-anchor="middle" fill="#ff5a4e">Frenado</text></g>
      <g><g transform="scale(.62)">${perfil()}</g><animateTransform attributeName="transform" type="translate" values="-110 178;80 178;300 178;340 178;340 178" keyTimes="0;.4;.75;.9;1" keySplines="0 0 1 1;.1 .6 .3 1;.2 .8 .4 1;0 0 1 1" calcMode="spline" dur="6s" repeatCount="indefinite"/></g>
      <g transform="translate(600 120)"><rect x="-4" y="0" width="8" height="56" fill="#888"/><circle cy="-6" r="20" fill="#ff5a4e" stroke="#fff" stroke-width="3"/><text y="0" font-family="Arial" font-weight="900" font-size="15" text-anchor="middle" fill="#fff">!</text></g>
    </svg>`;
  }

  function v16() {
    return `<svg viewBox="0 0 640 280" role="img" aria-label="Animación: coche detenido en el arcén con la baliza V-16 encendida en el techo, que envía su posición a la DGT">${defsPerfil}
      <rect x="0" y="200" width="640" height="80" fill="#3b4558"/><rect x="0" y="196" width="640" height="6" fill="#59627a"/><path d="M0 238H640" stroke="${LIN}" stroke-width="4" stroke-dasharray="26 20"/>
      <g transform="translate(150 206)">${perfil('#e8edf5')}
        <g transform="translate(118 -66)"><rect x="-11" y="-8" width="22" height="12" rx="4" fill="#ffb000"><animate attributeName="fill" values="#ffb000;#fff3c4;#ffb000" dur=".6s" repeatCount="indefinite"/></rect>
          ${[0, .8].map(b => `<circle r="14" fill="none" stroke="#ffb000" stroke-width="3"><animate attributeName="r" values="12;60" dur="1.6s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.6s" begin="${b}s" repeatCount="indefinite"/></circle>`).join('')}</g>
        <g><animate attributeName="opacity" values="1;.25;1" dur="1s" repeatCount="indefinite"/><rect x="226" y="-30" width="12" height="7" rx="3" fill="#ffb000"/><rect x="4" y="-30" width="9" height="7" rx="3" fill="#ffb000"/></g></g>
      <path d="M290 120Q400 40 500 66" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 8"><animate attributeName="stroke-dashoffset" values="28;0" dur="1s" repeatCount="indefinite"/></path>
      <g transform="translate(548 70)" filter="url(#perf-sombra)"><path d="M-50 18a26 26 0 0 1 10-50 34 34 0 0 1 62-8 24 24 0 0 1 28 36 16 16 0 0 1-10 22Z" fill="#fff"/><text x="0" y="6" font-family="Arial" font-size="17" font-weight="900" text-anchor="middle" fill="#1846c7">DGT 3.0</text></g>
    </svg>`;
  }

  window.DIBUJO = { glorieta, prioridad, ciclista, emergencia, detencion, v16 };
})();
