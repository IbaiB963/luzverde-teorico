/* ==========================================================================
   Aprender: guías visuales, simuladores interactivos y recursos oficiales.
   ========================================================================== */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Vídeos oficiales (canal de YouTube de la DGT, comprobados el 7-11-2026) ---------- */
  const VIDEOS = [
    { id: 'D-F30Nmltq0', t: 'Modificaciones del Reglamento General de Circulación', d: 'Resumen oficial de la reforma en vigor desde el 1 de octubre de 2026.', tema: 'circulacion' },
    { id: 'vWqnaeXUhcw', t: 'Carril de emergencia en vías de alta capacidad', d: 'Cómo orillarse en una retención para dejar paso a los servicios de emergencia.', tema: 'circulacion' },
    { id: 'f8JEvgxMtP4', t: 'Carril nieve', d: 'Circulación por autopistas y autovías cuando la nieve dificulta el tráfico.', tema: 'adelantamiento' },
    { id: '1cNJv-RdBJw', t: 'Reforma del Reglamento: VMP', d: 'Nuevas obligaciones para usuarios de patinetes eléctricos.', tema: 'seguridad' },
    { id: 'S8JS4LrPX1U', t: 'Reforma del Reglamento: acera solo para peatones', d: 'Quién puede circular por la acera tras la reforma.', tema: 'circulacion' },
    { id: '-3Or5rQB9Xs', t: 'Reforma del Reglamento: motos', d: 'Guantes, calzado cerrado y circulación por el arcén en congestión.', tema: 'seguridad' },
    { id: 'rOihtajeoOk', t: 'Si conduces, solo conduce', d: 'Campaña de la DGT sobre las distracciones al volante (noviembre de 2026).', tema: 'factor' }
  ];
  const RECURSOS = [
    { url: 'https://www.dgt.es/estaticos/muevete-con-seguridad/percepcion-riesgo/introduction.html', t: 'Test de percepción del riesgo (DGT)', d: 'Vídeos reales de tráfico: detecta el peligro y mide tu tiempo de reacción. Muy útil para el nuevo enfoque del examen.', ico: 'play' },
    { url: 'https://www.dgt.es/.galleries/enlaces/sede/permisos/test-examen.html', t: 'Test de examen oficiales de la DGT', d: 'El simulador gratuito de la DGT, con el mismo formato que el examen.', ico: 'examen' },
    { url: 'https://www.dgt.es/muevete-con-seguridad/conviertete-en-un-buen-conductor/consejos-generales/como-circular-rotondas/', t: 'Glorietas: cómo circular de forma segura', d: 'Guía de la DGT sobre entrada, circulación y salida de glorietas.', ico: 'repaso' },
    { url: 'https://www.dgt.es/muevete-con-seguridad/conviertete-en-un-buen-conductor/consejos-generales/situaciones-de-riesgo-imprevistas-como-manejarlas/', t: 'Situaciones de riesgo imprevistas', d: 'Cómo actuar ante imprevistos en la carretera.', ico: 'alerta' },
    { url: 'https://www.dgt.es/comunicacion/notas-de-prensa/20260930-reforma-del-reglamento-de-circulacion-usuarios-vulnerables/', t: 'Reforma del Reglamento de Circulación (nota de la DGT)', d: 'Todos los cambios en vigor desde el 1 de octubre de 2026.', ico: 'norma' },
    { url: 'https://www.dgt.es/nuestros-servicios/permisos-de-conducir/tus-puntos-y-tus-permisos/recupera-tus-puntos/', t: 'Permiso por puntos: recupera tus puntos', d: 'Cómo funcionan los cursos y la recuperación de puntos.', ico: 'documentacion' },
    { url: 'https://revista.dgt.es/es/', t: 'Revista Tráfico y Seguridad Vial', d: 'La revista oficial de la DGT, con novedades y reportajes.', ico: 'libro' }
  ];

  /* ---------- Diagramas ---------- */
  const road = '#4b5567', lane = '#f4f1e8';
  const coche = (x, y, rot, col, id = '') => `<g ${id ? `id="${id}"` : ''} transform="translate(${x} ${y}) rotate(${rot})"><rect x="-9" y="-15" width="18" height="30" rx="5" fill="${col}"/><rect x="-6.5" y="-9" width="13" height="7" rx="2" fill="rgba(255,255,255,.75)"/></g>`;
  const DIAG = {
    glorieta: `<svg viewBox="0 0 320 240" role="img" aria-label="Animación: un coche entra en la glorieta, circula por el carril exterior y sale señalizando">
      <rect width="320" height="240" fill="#7fae6a" opacity=".35"/>
      <rect x="135" y="0" width="50" height="240" fill="${road}"/><rect x="0" y="95" width="320" height="50" fill="${road}"/>
      <circle cx="160" cy="120" r="78" fill="${road}"/><circle cx="160" cy="120" r="34" fill="#7fae6a"/>
      <circle cx="160" cy="120" r="56" fill="none" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/>
      <path id="tray" d="M172 240 L172 196 A68 68 0 0 0 228 132 L320 132" fill="none" stroke="#ffb547" stroke-width="2.5" stroke-dasharray="5 6" opacity=".9"/>
      <g>${coche(0, 0, 0, '#1846c7')}<animateMotion dur="5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#tray"/></animateMotion></g>
      <g transform="translate(108 120)">${coche(0, 0, 180, '#d4352b')}</g>
      <text x="8" y="18" font-size="10" fill="#111a2e" font-weight="700">Cede al entrar · carril exterior · intermitente derecho</text>
    </svg>`,
    prioridad: `<svg viewBox="0 0 320 240" role="img" aria-label="Intersección sin señalizar: el coche azul cede el paso al rojo, que viene por su derecha">
      <rect width="320" height="240" fill="#7fae6a" opacity=".35"/>
      <rect x="130" y="0" width="60" height="240" fill="${road}"/><rect x="0" y="90" width="320" height="60" fill="${road}"/>
      <line x1="160" y1="0" x2="160" y2="88" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/><line x1="160" y1="152" x2="160" y2="240" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/>
      <line x1="0" y1="120" x2="128" y2="120" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/><line x1="192" y1="120" x2="320" y2="120" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/>
      <g>${coche(0, 0, 0, '#1846c7')}<animateTransform attributeName="transform" type="translate" values="175 225;175 168;175 168;175 168;175 -30" keyTimes="0;.25;.6;.7;1" dur="6s" repeatCount="indefinite"/></g>
      <g>${coche(0, 0, -90, '#d4352b')}<animateTransform attributeName="transform" type="translate" values="340 105;250 105;-40 105;-40 105" keyTimes="0;.25;.6;1" dur="6s" repeatCount="indefinite"/></g>
      <text x="8" y="18" font-size="10" fill="#111a2e" font-weight="700">Sin señales: cede a quien viene por tu derecha</text>
    </svg>`,
    ciclista: `<svg viewBox="0 0 320 200" role="img" aria-label="Adelantamiento a un ciclista dejando 1,5 metros y reduciendo 20 km/h">
      <rect width="320" height="200" fill="#7fae6a" opacity=".35"/><rect x="0" y="40" width="320" height="120" fill="${road}"/>
      <line x1="0" y1="100" x2="320" y2="100" stroke="${lane}" stroke-width="3"/>
      <g transform="translate(170 135)"><circle r="7" fill="none" stroke="#ffb547" stroke-width="2.5" cx="-10"/><circle r="7" fill="none" stroke="#ffb547" stroke-width="2.5" cx="10"/><path d="M-10 0 L0 -10 L10 0 M0 -10 L2 -18" stroke="#ffb547" stroke-width="2.5" fill="none"/></g>
      <g>${coche(0, 0, 90, '#1846c7')}<animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path="M-20 135 L90 135 C120 135 120 82 150 82 L210 82 C240 82 240 135 270 135 L360 135"/></g>
      <line x1="170" y1="92" x2="170" y2="125" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/><text x="176" y="112" font-size="12" fill="#fff" font-weight="800">≥ 1,5 m</text>
      <text x="8" y="22" font-size="10" fill="#111a2e" font-weight="700">Interurbana: 1,5 m y 20 km/h menos que el límite</text>
    </svg>`,
    emergencia: `<svg viewBox="0 0 320 210" role="img" aria-label="Carril de emergencia en vías de dos y tres carriles">
      <rect width="320" height="210" fill="#7fae6a" opacity=".35"/>
      <rect x="20" y="20" width="110" height="180" fill="${road}"/><line x1="75" y1="20" x2="75" y2="200" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/>
      ${[50, 100, 150].map(y => coche(40, y, 0, '#1846c7') + coche(110, y, 0, '#1846c7')).join('')}
      <rect x="57" y="25" width="36" height="170" fill="#ffb547" opacity=".22"/><text x="75" y="15" font-size="11" text-anchor="middle" fill="#111a2e" font-weight="800">2 carriles</text>
      <rect x="170" y="20" width="135" height="180" fill="${road}"/><line x1="215" y1="20" x2="215" y2="200" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/><line x1="260" y1="20" x2="260" y2="200" stroke="${lane}" stroke-width="2" stroke-dasharray="8 8"/>
      ${[50, 100, 150].map(y => coche(186, y, 0, '#1846c7') + coche(246, y, 0, '#1846c7') + coche(286, y, 0, '#1846c7')).join('')}
      <rect x="198" y="25" width="34" height="170" fill="#ffb547" opacity=".22"/><text x="237" y="15" font-size="11" text-anchor="middle" fill="#111a2e" font-weight="800">3 carriles</text>
      <g>${coche(0, 0, 0, '#d4352b')}<animateTransform attributeName="transform" type="translate" values="75 230;75 -20" dur="4s" repeatCount="indefinite"/></g>
      <g>${coche(0, 0, 0, '#d4352b')}<animateTransform attributeName="transform" type="translate" values="215 230;215 -20" dur="4s" begin="1s" repeatCount="indefinite"/></g>
    </svg>`,
    senales: `<div class="grid g-4" style="gap:10px">${[['r2', 'Prioridad', 'Octógono rojo: STOP'], ['r1', 'Prioridad', 'Triángulo invertido: ceda el paso'], ['r101', 'Prohibición', 'Círculo rojo: prohíbe'], ['r402', 'Obligación', 'Círculo azul: obliga'], ['p20', 'Peligro', 'Triángulo rojo: advierte'], ['s13', 'Indicación', 'Cuadrado azul: informa'], ['r307', 'Prohibición', 'Ni parar ni estacionar'], ['r301-50', 'Prohibición', 'Velocidad máxima']].map(([f, c, t]) => `<div class="card flat" style="display:grid;justify-items:center;gap:8px;text-align:center;padding:14px"><img src="img/senales/${f}.svg" alt="${esc(t)}" style="height:74px;width:auto"><span class="chip">${c}</span><span class="small">${t}</span></div>`).join('')}</div>`
  };

  /* ---------- Guías ---------- */
  const GUIAS = [
    {
      id: 'novedades', t: 'Novedades 2026', tema: 'circulacion', d: 'Baliza V-16 y la reforma del Reglamento de octubre de 2026.', art: 'emergencia',
      html: () => `
        <div class="note warn">${ico('alerta')}<div>Dos cambios recientes que conviene dominar: la <b>baliza V-16 conectada</b> obligatoria desde el 1 de enero de 2026 y la <b>reforma del Reglamento General de Circulación</b> (RD 518/2026) en vigor desde el 1 de octubre de 2026.</div></div>
        <h3 class="h-m">Baliza V-16 (desde el 1-1-2026)</h3>
        <ul><li>Sustituye a los triángulos como preseñalización de un vehículo inmovilizado en turismos, furgonetas, autobuses y camiones.</li><li>Debe estar homologada y <b>conectada</b> a la plataforma DGT 3.0, que recibe su ubicación.</li><li>Se coloca en la parte más alta del vehículo (el techo) sin salir a la calzada. No llevarla: 80 € de multa, sin pérdida de puntos.</li></ul>
        <h3 class="h-m">Reforma del Reglamento (desde el 1-10-2026)</h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Tema</th><th>Qué cambia</th></tr></thead><tbody>
          <tr><td><b>Adelantar ciclistas</b></td><td>En interurbanas, reducir al menos 20 km/h respecto al límite, 1,5 m de separación y cambiar completamente de carril si hay más de uno por sentido.</td></tr>
          <tr><td><b>Ciclistas en ciudad</b></td><td>Circulan preferentemente por el centro del carril; los vehículos a motor deben mantener 5 m de distancia detrás de ellos.</td></tr>
          <tr><td><b>Casco ciclistas</b></td><td>Obligatorio para todos en vías interurbanas (sin exenciones).</td></tr>
          <tr><td><b>Patinetes (VMP)</b></td><td>Edad mínima 15 años, casco obligatorio, chaleco de noche o con poca visibilidad; alumbrado siempre encendido desde el 1-10-2027.</td></tr>
          <tr><td><b>Motos</b></td><td>Guantes en interurbanas y calzado cerrado siempre; pueden usar el arcén derecho en congestión, a 30 km/h máximo y si el tramo está señalizado.</td></tr>
          <tr><td><b>Carril de emergencia</b></td><td>En retención a paso de peatón: con 2 carriles, cada uno se orilla a su lado; con 3, el izquierdo a la izquierda y los otros dos a la derecha.</td></tr>
          <tr><td><b>Nieve en autovía</b></td><td>Prohibido adelantar; se circula por el carril derecho dejando el izquierdo para emergencias y quitanieves.</td></tr>
          <tr><td><b>Vehículos detenidos</b></td><td>Al rebasar un vehículo inmovilizado por accidente, avería o auxilio: 1,5 m de separación y 20 km/h menos que el límite.</td></tr>
          <tr><td><b>Cinturón</b></td><td>Se eliminan las exenciones de taxistas, repartidores y vehículos de autoescuela.</td></tr>
          <tr><td><b>Peatones</b></td><td>Prioridad en calles de plataforma única.</td></tr>
        </tbody></table></div>
        <div class="diagram">${DIAG.emergencia}</div>
        <p class="tiny muted">Fuentes: nota de prensa de la DGT de 30-9-2026 y BOE-A-2026-13889.</p>`
    },
    {
      id: 'velocidad', t: 'Límites de velocidad', tema: 'velocidad', d: 'Los genéricos para turismos y motos, mínimos y delitos.', art: null,
      html: () => `
        <div class="table-wrap"><table class="table"><thead><tr><th>Vía</th><th>Turismos y motos</th></tr></thead><tbody>
          <tr><td>Autopista y autovía</td><td><b>120 km/h</b> · mínima 60 km/h</td></tr>
          <tr><td>Carretera convencional</td><td><b>90 km/h</b></td></tr>
          <tr><td>Urbana con 2 o más carriles por sentido</td><td><b>50 km/h</b></td></tr>
          <tr><td>Urbana con un carril por sentido</td><td><b>30 km/h</b></td></tr>
          <tr><td>Urbana de plataforma única (calzada y acera al mismo nivel)</td><td><b>20 km/h</b></td></tr>
          <tr><td>Ciclomotores y cuadriciclos ligeros</td><td><b>45 km/h</b> en cualquier vía</td></tr>
        </tbody></table></div>
        <ul><li>No se puede superar el límite para adelantar (se eliminó el antiguo «+20»).</li><li>Mínima en autopista/autovía: la mitad de la máxima genérica del vehículo.</li><li>Es <b>delito</b> superar el límite en más de 60 km/h en vía urbana o en más de 80 km/h en interurbana.</li><li>La velocidad adecuada es la que permite detenerse ante cualquier obstáculo previsible: puede ser menor que el límite.</li></ul>`
    },
    {
      id: 'detencion', t: 'Distancia de detención', tema: 'velocidad', d: 'Simulador: cuánto necesitas para parar según velocidad y suelo.', art: null,
      html: () => `
        <p>La distancia de detención es la suma de la <b>distancia de reacción</b> (lo que recorres mientras reaccionas) y la <b>distancia de frenado</b> (desde que pisas el freno hasta parar). Mueve los controles:</p>
        <div class="card flat stack" style="--gap:16px">
          <div class="field"><label for="sv">Velocidad: <b id="svv">90</b> km/h</label><input id="sv" class="range" type="range" min="20" max="140" step="10" value="90"></div>
          <div class="field"><label for="sr">Tiempo de reacción: <b id="srv">1,0</b> s</label><input id="sr" class="range" type="range" min="0.5" max="3" step="0.1" value="1"><span class="tiny muted">Unos 0,75–1 s descansado; el doble o más con alcohol, sueño o el móvil.</span></div>
          <div class="field"><label>Estado del suelo</label><div class="seg" role="group" id="ss"><button data-mu="0.8" aria-pressed="true">Seco</button><button data-mu="0.5" aria-pressed="false">Mojado</button><button data-mu="0.2" aria-pressed="false">Nieve</button><button data-mu="0.1" aria-pressed="false">Hielo</button></div></div>
          <svg viewBox="0 0 600 70" class="chart" id="sbar"></svg>
          <div class="grid g-3" id="sres"></div>
        </div>
        <p class="tiny muted">Cálculo físico aproximado: reacción = v·t; frenado = v²/(2·μ·g) con coeficientes de adherencia orientativos. Sirve para entender proporciones, no como dato exacto de ningún vehículo.</p>`,
      montar: () => {
        const sv = document.getElementById('sv'), sr = document.getElementById('sr');
        let mu = .8;
        const calc = () => {
          const v = +sv.value, t = +sr.value, ms = v / 3.6;
          const dr = ms * t, df = ms * ms / (2 * mu * 9.81), tot = dr + df;
          document.getElementById('svv').textContent = v;
          document.getElementById('srv').textContent = t.toFixed(1).replace('.', ',');
          const max = 400, k = 580 / max;
          document.getElementById('sbar').innerHTML = `<rect x="10" y="20" width="${Math.min(dr * k, 580)}" height="28" rx="6" fill="var(--amber)"/><rect x="${10 + Math.min(dr * k, 580)}" y="20" width="${Math.max(0, Math.min(df * k, 580 - dr * k))}" height="28" rx="6" fill="var(--bad)"/><text x="10" y="14">0 m</text><text x="590" y="14" text-anchor="end">${max} m</text>`;
          document.getElementById('sres').innerHTML = [['Reacción', dr, 'var(--amber)'], ['Frenado', df, 'var(--bad)'], ['Detención total', tot, 'var(--ink)']].map(([l, d, c]) => `<div class="stat"><span class="stat-label"><i style="width:10px;height:10px;border-radius:3px;background:${c};display:inline-block"></i>${l}</span><span class="stat-value num">${Math.round(d)} m</span></div>`).join('');
        };
        sv.addEventListener('input', calc); sr.addEventListener('input', calc);
        document.querySelectorAll('#ss [data-mu]').forEach(b => b.addEventListener('click', () => { mu = +b.dataset.mu; document.querySelectorAll('#ss [data-mu]').forEach(x => x.setAttribute('aria-pressed', x === b)); calc(); }));
        calc();
      }
    },
    {
      id: 'glorietas', t: 'Glorietas', tema: 'maniobras', d: 'Entrar, circular y salir sin dudas.', art: 'glorieta',
      html: () => `
        <div class="diagram">${DIAG.glorieta}</div>
        <ul>
          <li><b>Para entrar</b>, cede el paso a quien ya circula por la glorieta (salvo señal que diga otra cosa).</li>
          <li><b>Dentro</b>, si vas a salir pronto, circula por el carril exterior. Los carriles interiores son para recorrer más trayecto.</li>
          <li><b>Para salir</b>, sitúate con antelación en el carril exterior y señaliza con el <b>intermitente derecho</b>. No cortes el carril exterior desde el interior.</li>
          <li>Bicicletas y ciclomotores pueden ir por el carril exterior aunque vayan a una salida posterior: no los adelantes en la salida.</li>
        </ul>`
    },
    {
      id: 'prioridad', t: 'Prioridad de paso', tema: 'prioridad', d: 'La regla de la derecha, sus excepciones y el orden de las señales.', art: 'prioridad',
      html: () => `
        <div class="diagram">${DIAG.prioridad}</div>
        <h3 class="h-m">Orden de prevalencia de las señales</h3>
        <ol style="margin:0;padding-left:20px;display:grid;gap:6px"><li>Agentes de la circulación.</li><li>Señalización circunstancial (balizamiento, obras).</li><li>Semáforos.</li><li>Señales verticales.</li><li>Marcas viales.</li></ol>
        <h3 class="h-m">Sin señales: manda la derecha, salvo…</h3>
        <ul><li>Quien circula por una vía <b>pavimentada</b> tiene prioridad sobre quien sale de una sin pavimentar.</li><li>Los vehículos sobre <b>raíles</b> tienen prioridad.</li><li>En <b>glorietas</b>, los que están dentro.</li><li>En autopistas y autovías, los que ya circulan por ellas frente a los que se incorporan.</li></ul>
        <h3 class="h-m">Estrechamientos</h3>
        <p>Pasa primero quien entró antes. Si no se sabe, en pendientes pronunciadas tiene preferencia el que sube; y entre distintos tipos de vehículo se aplica el orden reglamentario.</p>`
    },
    {
      id: 'ciclistas', t: 'Ciclistas y usuarios vulnerables', tema: 'adelantamiento', d: 'Cómo adelantar y convivir con bicis, patinetes y motos.', art: 'ciclista',
      html: () => `
        <div class="diagram">${DIAG.ciclista}</div>
        <ul><li><b>1,5 m</b> de separación lateral mínima al adelantar a ciclistas fuera de poblado.</li><li>En interurbana, reduce al menos <b>20 km/h</b> respecto al límite al adelantarles (desde octubre de 2026).</li><li>Con más de un carril por sentido, <b>cambia por completo de carril</b>.</li><li>Puedes rebasar la línea continua para adelantar a un ciclista si es seguro.</li><li>En ciudad, deja <b>5 m</b> detrás del ciclista que te precede en tu carril; ellos circulan preferentemente por el centro del carril.</li><li>Prohibido adelantar poniendo en peligro a ciclistas: 6 puntos.</li></ul>`
    },
    {
      id: 'alcohol', t: 'Alcohol y drogas', tema: 'alcohol', d: 'Tasas máximas, sanciones y mitos.', art: null,
      html: () => `
        <div class="table-wrap"><table class="table"><thead><tr><th>Conductor</th><th>Aire espirado</th><th>Sangre</th></tr></thead><tbody>
          <tr><td>General</td><td><b>0,25 mg/l</b></td><td>0,5 g/l</td></tr>
          <tr><td>Novel (2 primeros años) y profesional</td><td><b>0,15 mg/l</b></td><td>0,3 g/l</td></tr>
          <tr><td>Delito (cualquier conductor)</td><td><b>&gt; 0,60 mg/l</b></td><td>&gt; 1,2 g/l</td></tr>
        </tbody></table></div>
        <ul><li>Superar la tasa: 4 puntos y 500 €; superar el doble de la tasa permitida: 6 puntos y 1.000 €.</li><li>Conducir con presencia de drogas: 6 puntos y 1.000 €. Negarse a las pruebas: 6 puntos y además es delito.</li><li>Solo el tiempo elimina el alcohol: ni café, ni ducha, ni dormir un rato. La alcoholemia máxima llega entre 30 y 90 minutos después de beber.</li><li>Medicamentos: atento al pictograma del coche en el envase y consulta al médico.</li></ul>`
    },
    {
      id: 'puntos', t: 'Permiso por puntos', tema: 'documentacion', d: 'Saldo, pérdidas más habituales y recuperación.', art: null,
      html: () => `
        <ul><li>Empiezas con <b>8 puntos</b>; a los 2 años sin perder puntos pasas a <b>12</b>. Después, +2 a los 3 años (14) y +1 a otros 3 (máximo <b>15</b>).</li><li>Curso de recuperación parcial: <b>4 puntos</b> (Orden INT/914/2024), una vez cada 2 años.</li><li>Sin puntos: pérdida de vigencia; hay que esperar 6 meses (3 para profesionales), hacer el curso y aprobar el teórico.</li></ul>
        <div class="table-wrap"><table class="table"><thead><tr><th>Infracción</th><th>Puntos</th></tr></thead><tbody>
          <tr><td>Conducir sujetando el móvil con la mano</td><td><b>6</b></td></tr>
          <tr><td>Alcohol por encima del doble de la tasa · drogas · negarse a las pruebas</td><td><b>6</b></td></tr>
          <tr><td>Conducción temeraria · circular en sentido contrario</td><td><b>6</b></td></tr>
          <tr><td>Adelantar poniendo en peligro u obstaculizando a ciclistas</td><td><b>6</b></td></tr>
          <tr><td>Alcohol por encima de la tasa (sin llegar al doble)</td><td><b>4</b></td></tr>
          <tr><td>No usar cinturón, casco o sistema de retención infantil</td><td><b>4</b></td></tr>
          <tr><td>No respetar un stop, un ceda el paso o un semáforo en rojo</td><td><b>4</b></td></tr>
          <tr><td>Conducir con auriculares conectados</td><td><b>3</b></td></tr>
        </tbody></table></div>`
    },
    {
      id: 'alumbrado', t: 'Qué luz usar', tema: 'alumbrado', d: 'Posición, cruce, carretera y antinieblas sin dudas.', art: null,
      html: () => `
        <div class="table-wrap"><table class="table"><thead><tr><th>Luz</th><th>Cuándo</th></tr></thead><tbody>
          <tr><td><b>Posición</b></td><td>Siempre que se lleve otra luz delantera; sola, para ser visto (vehículo parado en vía mal iluminada).</td></tr>
          <tr><td><b>Cruce (corto alcance)</b></td><td>De noche en vías iluminadas o al cruzarse/seguir a otro; de día en túneles, carriles reversibles o adicionales, y siempre en motos.</td></tr>
          <tr><td><b>Carretera (largas)</b></td><td>De noche en vías sin iluminar, sin deslumbrar a nadie. Nunca en vía urbana iluminada.</td></tr>
          <tr><td><b>Antiniebla delantera</b></td><td>Niebla, lluvia o nieve intensas, humo o polvo, y en vías estrechas con muchas curvas señalizadas.</td></tr>
          <tr><td><b>Antiniebla trasera</b></td><td>Solo con condiciones muy desfavorables: niebla espesa, lluvia muy intensa, nevada densa, humo o polvo.</td></tr>
          <tr><td><b>Emergencia</b></td><td>Vehículo inmovilizado en la vía o para advertir de un peligro a los que vienen detrás.</td></tr>
        </tbody></table></div>
        <p>Si te deslumbran: reduce la velocidad y mira hacia el borde derecho de la calzada.</p>`
    },
    {
      id: 'senales', t: 'Formas y colores de las señales', tema: 'senales', d: 'Reconoce de un vistazo qué tipo de orden te da cada señal.', art: null,
      html: () => `${DIAG.senales}
        <ul style="margin-top:14px"><li><b>Triángulo con borde rojo</b>: peligro. <b>Círculo con borde rojo</b>: prohibición. <b>Círculo azul</b>: obligación. <b>Cuadrado o rectángulo azul</b>: indicación.</li><li>Las señales con fondo amarillo son provisionales (obras) y prevalecen sobre las fijas.</li><li>Una línea continua no se puede pisar ni rebasar; si va junto a una discontinua, obedece la que tengas más cerca.</li></ul>
        <p class="tiny muted">Imágenes de señales: reproducciones de dominio público del catálogo español (Wikimedia Commons).</p>`
    },
    {
      id: 'auxilio', t: 'Primeros auxilios: PAS', tema: 'accidentes', d: 'Proteger, Avisar y Socorrer, paso a paso.', art: null,
      html: () => `
        <div class="grid g-3">
          <div class="card flat"><b style="font-size:28px;font-family:var(--font-d);color:var(--brand)">P</b><h3 class="h-s">Proteger</h3><p class="small muted">Señaliza con la V-16, ponte el chaleco antes de salir, apaga el motor de los vehículos implicados y no fumes.</p></div>
          <div class="card flat"><b style="font-size:28px;font-family:var(--font-d);color:var(--amber)">A</b><h3 class="h-s">Avisar</h3><p class="small muted">Llama al <b>112</b>: lugar exacto (vía y punto kilométrico), número de heridos y su estado, riesgos (fuego, mercancías peligrosas).</p></div>
          <div class="card flat"><b style="font-size:28px;font-family:var(--font-d);color:var(--bad)">S</b><h3 class="h-s">Socorrer</h3><p class="small muted">No muevas a los heridos salvo peligro. Si está inconsciente y respira, posición lateral de seguridad. No quites el casco a un motorista, no des de beber, abriga y tranquiliza.</p></div>
        </div>
        <p>El 018 es el teléfono gratuito de atención a víctimas de siniestros de tráfico, según la DGT.</p>`
    }
  ];

  function vista(id) {
    if (id) {
      const g = GUIAS.find(x => x.id === id);
      if (!g) return `<div class="view empty"><span class="ico">${ico('alerta')}</span><p>No existe esta guía.</p><a class="btn btn-soft" href="#/aprender">Volver</a></div>`;
      const relacionados = VIDEOS.filter(v => v.tema === g.tema);
      const lecciones = Video.LECCIONES.filter(l => l.tema === g.tema);
      return `<div class="view stack" style="--gap:22px">
        <a href="#/aprender" class="small" style="display:inline-flex;gap:6px;align-items:center;text-decoration:none">${ico('atras', 'style="width:16px;height:16px"')}Aprender</a>
        <div class="page-head" style="margin-bottom:0"><div class="stack"><span class="eyebrow">${TEMA[g.tema].nombre}</span><h1 class="h-l">${g.t}</h1><p class="muted">${g.d}</p></div>
          <button class="btn btn-primary" data-go='${JSON.stringify({ modo: 'tema', tema: g.tema })}'>${ico('practicar')}Practicar este tema</button></div>
        <div class="card pad-l prose" style="max-width:none">${g.html()}</div>
        ${lecciones.length ? `<div><h2 class="h-m" style="margin-bottom:12px">Vídeo-lección</h2><div class="grid g-2">${lecciones.map(Video.tarjeta).join('')}</div></div>` : ''}
        ${relacionados.length ? `<div><h2 class="h-m" style="margin-bottom:12px">Vídeos oficiales relacionados</h2><div class="grid g-2">${relacionados.map(tarjetaVideo).join('')}</div></div>` : ''}
        ${UI.pie()}
      </div>`;
    }
    return `<div class="view stack" style="--gap:26px">
      <div class="page-head" style="margin-bottom:0"><div class="stack"><span class="eyebrow">Aprender</span><h1 class="h-l">Entiende las normas, no las memorices</h1><p class="muted">Vídeo-lecciones narradas, guías visuales, simuladores y recursos oficiales para los puntos que más se preguntan.</p></div></div>
      <section><div class="section-head"><h2 class="h-m">Vídeo-lecciones</h2><span class="small muted">${Video.LECCIONES.filter(l => M.S.videos[l.id]).length}/${Video.LECCIONES.length} vistas · con voz y subtítulos</span></div>
        <div class="grid g-3 reveal">${Video.LECCIONES.map(Video.tarjeta).join('')}</div></section>
      <section><div class="section-head"><h2 class="h-m">Guías y simuladores</h2></div>
      <div class="grid g-3 reveal">${GUIAS.map(g => `<a class="card guide" href="#/aprender/${g.id}">
        <div class="guide-art" style="${g.art ? '' : `background:color-mix(in oklab, ${TEMA[g.tema].color} 12%, var(--bg-2));color:${TEMA[g.tema].color}`}">${g.art ? DIAG[g.art] : `<span style="width:56px;height:56px">${ico('t_' + g.tema)}</span>`}</div>
        <span class="eyebrow">${TEMA[g.tema].corto}</span><h3 class="h-s" style="font-size:18px">${g.t}</h3><p class="small muted">${g.d}</p></a>`).join('')}</div></section>
      <section><div class="section-head"><h2 class="h-m">Vídeos oficiales de la DGT</h2><span class="small muted">Canal oficial en YouTube · comprobados el 7-11-2026${location.protocol === 'file:' ? ' · se abren en YouTube' : ''}</span></div>
        <div class="grid g-2">${VIDEOS.map(tarjetaVideo).join('')}</div></section>
      <section><div class="section-head"><h2 class="h-m">Recursos oficiales</h2></div>
        <div class="card"><div class="list">${RECURSOS.map(r => `<a class="li" href="${r.url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span class="li-ico" style="background:var(--brand-soft);color:var(--brand)">${ico(r.ico === 'documentacion' ? 't_documentacion' : r.ico)}</span><div style="flex:1"><b>${r.t}</b><div class="small muted">${r.d}</div></div>${ico('enlace', 'style="width:18px;height:18px;color:var(--muted)"')}</a>`).join('')}</div></div></section>
      ${UI.pie()}
    </div>`;
  }
  function tarjetaVideo(v) {
    return `<a class="card video" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener" data-yt="${v.id}" data-yt-t="${esc(v.t)}">
      <span style="position:relative;width:52px;height:52px;border-radius:14px;overflow:hidden;background:var(--bg-2);display:grid;place-items:center">
        <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">
        <span style="position:relative;color:#fff;filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));width:24px;height:24px">${ico('play')}</span></span>
      <div style="min-width:0"><b style="font-size:15px">${esc(v.t)}</b><div class="small muted">${esc(v.d)}</div></div>
      <span class="chip chip-ofi">DGT</span></a>`;
  }
  function montar(id) {
    const g = GUIAS.find(x => x.id === id); if (g && g.montar) g.montar();
    document.querySelectorAll('[data-yt]').forEach(a => a.addEventListener('click', ev => {
      if (location.protocol === 'file:') return; // enlace normal a YouTube
      ev.preventDefault(); Video.abrirYouTube(a.dataset.yt, a.dataset.ytT);
    }));
  }

  window.Aprender = { vista, montar, GUIAS, DIAG, VIDEOS };
})();
