/* ==========================================================================
   Luz Verde · Teórico B — interfaz
   ========================================================================== */
(function () {
  const M = window.M;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('es-ES');
  const pct = (x, d = 0) => (x * 100).toFixed(d).replace('.', ',') + '%';
  const LETRAS = ['A', 'B', 'C'];
  // Versión pública (para compartir): solo contiene preguntas propias, sin material de la DGT.
  const PUB = !!(window.DGT_META && window.DGT_META.publica);
  const app = $('#vista');

  /* ---------- Tema claro/oscuro ---------- */
  function aplicarTema() {
    const t = M.S.ajustes.tema;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }
  aplicarTema();

  /* ---------- Sonido opcional ---------- */
  let actx;
  // Sonidos sintetizados (sin ficheros): acierto, fallo, racha de aciertos y celebración.
  const MELODIAS = {
    ok: [[660, 0, .09], [990, .08, .16]],
    bad: [[196, 0, .16, 'triangle'], [165, .1, .2, 'triangle']],
    combo: [[660, 0, .07], [880, .06, .07], [1175, .12, .16]],
    fiesta: [[523, 0, .12], [659, .1, .12], [784, .2, .12], [1047, .3, .3]]
  };
  function sonar(tipo) {
    if (!M.S.ajustes.sonido) return;
    if (tipo === true) tipo = 'ok'; else if (tipo === false) tipo = 'bad';
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime;
      for (const [f, ini, dur, forma] of MELODIAS[tipo] || MELODIAS.ok) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = forma || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t0 + ini); g.gain.exponentialRampToValueAtTime(.11, t0 + ini + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + ini + dur);
        o.connect(g).connect(actx.destination); o.start(t0 + ini); o.stop(t0 + ini + dur + .02);
      }
    } catch (e) { /* sin audio */ }
  }
  const vibrar = p => { if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } };

  /* ---------- Recompensas: misiones, subida de nivel y logros ---------- */
  let nivelPrevio = M.nivel().n;
  function premiar() {
    const m = M.revisarMisiones();
    m.nuevas.forEach(x => toast('Misión completada', x.txt + ' · +20 XP', 'diana'));
    if (m.cofre) setTimeout(() => toast('¡Cofre del día abierto!', 'Has completado las 3 misiones · +50 XP', 'cofre'), 500);
    const n = M.nivel().n;
    if (n > nivelPrevio) { nivelPrevio = n; setTimeout(() => subirNivel(n), 700); }
    anunciarLogros();
  }
  function subirNivel(n) {
    sonar('fiesta'); confeti();
    const ov = document.createElement('div');
    ov.className = 'overlay';
    const acc = ACCESORIOS.find(a => a.nivel === n);
    ov.innerHTML = `<div class="modal levelup" role="dialog" aria-modal="true" aria-labelledby="lvt">${mascota('celebra', 110, acc ? acc.id : undefined)}<span class="eyebrow">¡Subes de nivel!</span><h3 class="h-xl num" id="lvt">Nivel ${n}</h3>
      <p class="muted">${acc ? `Has desbloqueado <b>${acc.nombre}</b> para Semi.` : 'Cada respuesta te acerca al aprobado. Sigue así.'}</p>
      <div class="row" style="justify-content:center">${acc ? `<button class="btn btn-soft btn-lg" data-poner="${acc.id}">Ponérselo</button>` : ''}<button class="btn btn-primary btn-lg" data-r>Continuar</button></div></div>`;
    const pon = $('[data-poner]', ov); if (pon) pon.addEventListener('click', () => { M.S.ajustes.accesorio = pon.dataset.poner; M.guardar(); ov.remove(); render(); });
    const cerrar = () => ov.remove();
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-r]')) cerrar(); });
    document.body.appendChild(ov); $('[data-r]', ov).focus();
  }

  /* ---------- Avisos (toasts), modales y lightbox ---------- */
  function toast(titulo, sub, icono = 'trofeo') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="t-ico">${ico(icono)}</span><div>${esc(titulo)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
    box.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .4s, transform .4s'; el.style.opacity = '0'; el.style.transform = 'translateY(-10px)'; setTimeout(() => el.remove(), 400); }, 3800);
  }
  function anunciarLogros() {
    const nuevos = M.revisarLogros();
    if (nuevos.length > 2) toast(`${nuevos.length} logros desbloqueados`, nuevos.map(l => l.nombre).join(' · '), 'trofeo');
    else nuevos.forEach(l => toast('Logro desbloqueado: ' + l.nombre, l.desc, l.ico));
  }
  function modal({ titulo, texto, ok = 'Aceptar', cancelar = 'Cancelar', peligro = false }) {
    return new Promise(res => {
      const ov = document.createElement('div');
      ov.className = 'overlay';
      ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 class="h-m" id="mt">${esc(titulo)}</h3><p class="muted">${texto}</p><div class="row">${cancelar ? `<button class="btn btn-ghost" data-r="0">${esc(cancelar)}</button>` : ''}<button class="btn ${peligro ? 'btn-danger' : 'btn-primary'}" data-r="1">${esc(ok)}</button></div></div>`;
      const cerrar = v => { ov.remove(); document.removeEventListener('keydown', tecla); res(v); };
      const tecla = e => { if (e.key === 'Escape') cerrar(false); };
      ov.addEventListener('click', e => { if (e.target === ov) cerrar(false); const b = e.target.closest('[data-r]'); if (b) cerrar(b.dataset.r === '1'); });
      document.addEventListener('keydown', tecla);
      document.body.appendChild(ov);
      $('[data-r="1"]', ov).focus();
    });
  }
  function lightbox(src, alt) {
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}">`;
    lb.addEventListener('click', () => lb.remove());
    document.addEventListener('keydown', function f(e) { if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', f); } });
    document.body.appendChild(lb);
  }
  function confeti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
    const x = c.getContext('2d'); const dpr = devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.scale(dpr, dpr);
    const cols = ['#1846c7', '#22c06c', '#ffb547', '#ff6b5f', '#a28dff', '#ffffff'];
    const ps = Array.from({ length: 160 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .3 }));
    let t = 0;
    (function frame() {
      x.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
      if (++t < 170) requestAnimationFrame(frame); else c.remove();
    })();
  }

  /* ---------- Piezas reutilizables ---------- */
  const temaIco = (t, size = 44) => `<span class="tema-ico" style="width:${size}px;height:${size}px;background:color-mix(in oklab, ${TEMA[t].color} 13%, transparent);color:${TEMA[t].color}">${ico('t_' + t)}</span>`;
  const chipFuente = q => q.src === 'oficial'
    ? `<span class="chip chip-ofi" title="Pregunta de los test de examen públicos de la DGT">${ico('escudo')}Oficial DGT${q.bat.includes('B') ? ' · Permiso B' : q.bat.includes('AM') ? ' · Test AM' : ' · Test recup. puntos'}</span>`
    : PUB ? `<span class="chip chip-pra" title="Pregunta propia elaborada a partir de la normativa vigente. No es una pregunta oficial de la DGT.">${ico('norma')}Luz Verde</span>`
    : `<span class="chip chip-pra" title="Pregunta propia elaborada a partir de la normativa vigente. No es oficial.">${ico('norma')}Práctica · no oficial</span>`;
  const barra = (v, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, v)) * 100)}%"></i></div>`;
  const estadoTema = s => ({ dominado: '<span class="chip chip-ok">Dominado</span>', reforzar: '<span class="chip chip-bad">Reforzar</span>', progreso: '<span class="chip chip-amber">En progreso</span>', nuevo: '<span class="chip">Sin empezar</span>' }[s.estado]);
  const imgSenal = src => /\/senales\//.test(src || '');

  function saludo() {
    const h = new Date().getHours();
    const s = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
    return M.S.nombre ? `${s}, ${esc(M.S.nombre)}` : s;
  }
  function mensajeMotivador(prep, tot) {
    if (tot.n === 0) return 'Empieza con un test rápido: en 3 minutos sabrás desde dónde partes.';
    if (prep.pocas) return `Llevas ${nf.format(tot.n)} respuestas. Con unas pocas más podremos estimar si estás listo para el examen.`;
    if (prep.p >= .85) return 'Vas muy bien. Haz simulacros completos para confirmar que tu nivel se mantiene en condiciones reales.';
    if (prep.p >= .6) return 'Buen ritmo. Refuerza tus temas débiles y estarás muy cerca del aprobado.';
    if (prep.p >= .3) return 'Estás construyendo la base. Repasa las falladas cada día: es lo que más rápido sube tu nota.';
    return 'Cada respuesta cuenta. Céntrate en un tema cada día y repasa tus errores con las explicaciones.';
  }

  /* ---------- Recomendación para «continuar» ---------- */
  function siguientePaso() {
    const rep = M.pendientesRepaso().length, fal = M.falladasIds().length, tot = M.totales();
    if (tot.n === 0) return { modo: 'rapido', titulo: 'Empezar a practicar', sub: 'Test rápido de 10 preguntas' };
    if (rep >= 5) return { modo: 'repaso', titulo: 'Continuar: repaso pendiente', sub: `${rep} preguntas tocan hoy según tu curva de olvido` };
    if (fal >= 5) return { modo: 'falladas', titulo: 'Continuar: corregir falladas', sub: `${fal} preguntas falladas por recuperar` };
    const deb = M.temasDebiles(1)[0];
    if (deb) return { modo: 'tema', tema: deb.t.id, titulo: 'Continuar: ' + deb.t.nombre, sub: deb.s.n ? `Tu acierto en este tema: ${pct(deb.s.pct)}` : 'Tema que aún no has practicado' };
    return { modo: 'rapido', titulo: 'Continuar estudiando', sub: 'Test rápido adaptado a tus puntos débiles' };
  }

  /* ==========================================================================
     VISTAS
     ========================================================================== */
  const V = {};

  /* ---------- Inicio ---------- */
  V.inicio = function () {
    const tot = M.totales(), prep = M.preparacion(), nv = M.nivel(), racha = M.racha(), hoy = M.dia(), sig = siguientePaso();
    const ringPct = prep.pocas ? 0 : prep.p;
    const C = 2 * Math.PI * 88;
    const ult = M.S.examenes.slice(-4).reverse();
    const deb = M.temasDebiles(3);
    const metaPct = Math.min(1, hoy.n / M.S.metaDiaria);
    const semana = Array.from({ length: 7 }, (_, i) => { const d = M.diaMas(M.hoyStr(), i - 6); const x = M.S.dias[d]; const [y, m, dd] = d.split('-').map(Number); return { d, on: x && x.n > 0, hoy: i === 6, l: 'LMXJVSD'[(new Date(y, m - 1, dd).getDay() + 6) % 7] }; });
    const enCurso = M.S.examenActivo && !M.S.examenActivo.libre ? M.S.examenActivo : null;
    const humor = hoy.meta ? 'celebra' : tot.n && prep.p < .3 && !prep.pocas ? 'animo' : 'feliz';
    return `
    <div class="view reveal stack" style="--gap:22px">
      <section class="hero">
        <div class="hero-grid">
          <div class="stack" style="--gap:16px">
            <span class="eyebrow" style="color:rgba(255,255,255,.75)">Permiso B · Examen teórico</span>
            <div class="hero-hi"><span class="hero-semi">${mascota(humor, 62)}</span><h1 class="h-xl">${saludo()}</h1></div>
            <p class="lead">${mensajeMotivador(prep, tot)}</p>
            <div class="row wrap-r" style="margin-top:6px">
              ${enCurso ? `<a class="btn btn-primary btn-lg" href="#/examen/en-curso">${ico('reloj')}Reanudar simulacro</a>` : `<button class="btn btn-primary btn-lg" data-go='${JSON.stringify(sig)}'>${ico('play')}${esc(sig.titulo)}</button>`}
              <a class="btn btn-ghost btn-lg" href="#/examen">${ico('examen')}Simulacro de examen</a>
            </div>
            ${enCurso ? '' : `<p class="small" style="color:rgba(255,255,255,.7)">${esc(sig.sub)}</p>`}
            <div class="hero-stats">
              <div class="hero-stat"><b class="num">${nf.format(tot.n)}</b><span>respuestas</span></div>
              <div class="hero-stat"><b class="num">${tot.n ? pct(tot.pct) : '—'}</b><span>acierto global</span></div>
              <div class="hero-stat"><b class="num">${racha}</b><span>${racha === 1 ? 'día de racha' : 'días de racha'}</span></div>
            </div>
          </div>
          <div class="ring-wrap" title="Probabilidad estimada de aprobar">
            <svg class="ring" viewBox="0 0 200 200" role="img" aria-label="Preparación estimada ${prep.pocas ? 'sin datos suficientes' : pct(prep.p)}">
              <circle class="ring-track" cx="100" cy="100" r="88" fill="none" stroke-width="14"/>
              <circle class="ring-val" cx="100" cy="100" r="88" fill="none" stroke-width="14" stroke-linecap="round" transform="rotate(-90 100 100)" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-target="${C * (1 - ringPct)}"/>
            </svg>
            <div class="ring-center"><b class="num">${prep.pocas ? '—' : Math.round(prep.p * 100) + '%'}</b><span>${prep.pocas ? `Faltan ${40 - prep.respondidas} preguntas para estimar` : 'preparación estimada'}</span></div>
          </div>
        </div>
      </section>

      <div class="grid g-3">
        <div class="card">
          <div class="row" style="justify-content:space-between"><span class="stat-label">${ico('diana')}Objetivo de hoy</span><span class="chip ${hoy.meta ? 'chip-ok' : ''}">${hoy.meta ? '¡Cumplido!' : `${hoy.n}/${M.S.metaDiaria}`}</span></div>
          <div class="stat-value num" style="margin:10px 0 12px">${hoy.n} <span class="muted" style="font-size:16px;font-weight:600">de ${M.S.metaDiaria} preguntas</span></div>
          ${barra(metaPct, hoy.meta ? 'ok' : '')}
          <p class="stat-foot" style="margin-top:10px">${hoy.meta ? '+30 XP de bonificación conseguidos hoy.' : `Te quedan ${M.S.metaDiaria - hoy.n}. Al completarlo ganas +30 XP.`}</p>
        </div>
        <div class="card">
          <div class="streak"><span class="flame ${racha ? '' : 'off'}">${ico('llama')}</span><div><div class="stat-value num">${racha} ${racha === 1 ? 'día' : 'días'}</div><div class="stat-foot">Mejor racha: ${M.mejorRacha()} ${M.mejorRacha() === 1 ? 'día' : 'días'}</div></div></div>
          <div class="week">${semana.map(s => `<div><i class="${s.on ? 'on' : ''} ${s.hoy ? 'hoy' : ''}">${s.on ? ico('check') : ''}</i>${s.l}</div>`).join('')}</div>
        </div>
        <div class="card">
          <div class="level"><span class="level-badge num">${nv.n}</span><div class="stack" style="--gap:8px"><div class="row" style="justify-content:space-between"><b>Nivel ${nv.n}</b><span class="small muted num">${nf.format(nv.xp)} XP</span></div>${barra(nv.pct)}<span class="stat-foot">${nf.format(nv.hasta - nv.xp)} XP para el nivel ${nv.n + 1}</span></div></div>
          <a href="#/logros" class="btn btn-soft btn-sm" style="margin-top:16px">${ico('trofeo')}${Object.keys(M.S.logros).length}/${M.LOGROS.length} logros</a>
        </div>
      </div>

      <div class="grid g-3">
        ${tarjetaMisiones()}
        ${tarjetaCamino()}
        ${tarjetaFecha()}
      </div>

      <div class="grid g-2">
        <div class="card">
          <div class="section-head"><h2 class="h-m">Qué te conviene reforzar</h2><a class="small" href="#/estadisticas">Ver progreso</a></div>
          <div class="list">
            ${deb.length ? deb.map(({ t, s }) => `
              <button class="li" style="width:100%;background:none;border:0;border-bottom:1px solid var(--line);text-align:left" data-go='${JSON.stringify({ modo: 'tema', tema: t.id })}'>
                ${temaIco(t.id, 40)}
                <div style="flex:1;min-width:0"><div class="tema-name">${t.nombre}</div><div class="small muted">${s.n ? `Acierto ${pct(s.pct)} · ${s.vistas}/${s.total} vistas` : 'Aún sin practicar'}</div></div>
                ${ico('flecha', 'style="width:18px;height:18px;color:var(--muted)"')}
              </button>`).join('') : '<p class="muted">Has dominado todos los temas. Mantén el nivel con simulacros.</p>'}
          </div>
        </div>
        <div class="card">
          <div class="section-head"><h2 class="h-m">Últimos simulacros</h2><a class="small" href="#/examen">Nuevo</a></div>
          ${ult.length ? `<div class="list">${ult.map(e => `
            <a class="li" href="#/resultado/${e.id}" style="text-decoration:none;color:inherit">
              <span class="li-ico" style="background:${e.aprobado ? 'var(--ok-soft)' : 'var(--bad-soft)'};color:${e.aprobado ? 'var(--ok)' : 'var(--bad)'}">${ico(e.aprobado ? 'check' : 'x')}</span>
              <div style="flex:1"><b>${e.aprobado ? 'Apto' : 'No apto'}</b> <span class="muted small">· ${e.errores} ${e.errores === 1 ? 'fallo' : 'fallos'}</span><div class="small muted">${new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
              <span class="num small muted">${e.total - e.errores}/${e.total}</span>
            </a>`).join('')}</div>` : `<div class="empty" style="padding:20px"><span class="ico">${ico('examen')}</span><p class="muted small">Aún no has hecho ningún simulacro. Son 30 preguntas en 30 minutos, como el examen real.</p><a class="btn btn-soft btn-sm" href="#/examen">Hacer el primero</a></div>`}
        </div>
      </div>

      ${videoRecomendado()}

      <div>
        <div class="section-head"><h2 class="h-m">Practicar ahora</h2><a class="small" href="#/practicar">Todos los modos</a></div>
        <div class="grid g-4">
          ${tarjetaModo('rapido')}${tarjetaModo('repaso')}${tarjetaModo('falladas')}${tarjetaModo('libre')}
        </div>
      </div>
      ${pie()}
    </div>`;
  };
  V.inicio.montar = () => {
    requestAnimationFrame(() => { const r = $('.ring-val'); if (r) r.style.strokeDashoffset = r.dataset.target; });
    const f = $('[data-fecha-inicio]');
    if (f) f.addEventListener('change', () => { if (!f.value) return; M.S.fechaExamen = f.value; M.guardar(); render(); toast('Fecha guardada', 'Te diremos cuánto practicar cada día', 'calendario'); });
    if (!M.S.bienvenida && !M.totales().n) bienvenida();
  };

  /* ---------- Bloques del inicio ---------- */
  function tarjetaMisiones() {
    const ms = M.misionesHoy(), hechas = ms.filter(x => x.hecha).length;
    return `<div class="card stack" style="--gap:12px">
      <div class="row" style="justify-content:space-between"><span class="stat-label">${ico('diana')}Misiones de hoy</span><span class="chip ${hechas === 3 ? 'chip-ok' : ''}">${hechas}/3</span></div>
      <div class="misiones">${ms.map(x => `<div class="mision ${x.hecha ? 'hecha' : ''}"><span class="mision-ico">${ico(x.hecha ? 'check' : x.ico)}</span><div style="flex:1;min-width:0"><div class="small" style="font-weight:700">${esc(x.txt)}</div>${barra(x.prog / x.meta, x.hecha ? 'ok' : '')}</div><span class="tiny num muted">${x.prog}/${x.meta}</span></div>`).join('')}</div>
      <div class="cofre ${hechas === 3 ? 'abierto' : ''}">${ico('cofre')}<span class="small">${hechas === 3 ? '¡Cofre abierto! +50 XP' : 'Completa las 3 y abre el cofre: +50 XP'}</span></div>
    </div>`;
  }
  function unidadActual() {
    const c = M.camino();
    return c.find(u => u.abierta && !u.completa) || c[c.length - 1];
  }
  function tarjetaCamino() {
    const u = unidadActual(), t = TEMA[u.t], total = M.camino().reduce((s, x) => s + x.hechos, 0);
    const nivel = Math.min(u.hechos, M.NIVELES.length - 1);
    return `<div class="card stack" style="--gap:12px">
      <div class="row" style="justify-content:space-between"><span class="stat-label">${ico('mapa')}Tu camino</span><span class="small muted num">${total}/${M.ORDEN_CAMINO.length * 3} niveles</span></div>
      <div class="row" style="--gap:12px">${temaIco(u.t, 48)}<div style="min-width:0"><div class="tiny muted">Unidad ${u.i + 1} de ${M.ORDEN_CAMINO.length}</div><b>${t.nombre}</b>
        <div class="niveles">${M.NIVELES.map((n, k) => `<i class="${k < u.hechos ? 'on' : ''}" title="${n}">${ico('estrella')}</i>`).join('')}</div></div></div>
      <div class="row wrap-r" style="margin-top:auto"><button class="btn btn-primary btn-sm" data-go='${JSON.stringify({ modo: 'camino', tema: u.t, nivel })}'>${ico('play')}${u.completa ? 'Repasar' : 'Nivel ' + M.NIVELES[nivel].toLowerCase()}</button><a class="btn btn-ghost btn-sm" href="#/camino">Ver camino</a></div>
    </div>`;
  }
  function tarjetaFecha() {
    const dd = M.diasExamen(), r = M.ritmo();
    if (dd === null || dd < 0) return `<div class="card stack" style="--gap:12px">
      <span class="stat-label">${ico('calendario')}Tu examen</span>
      <b style="font-size:18px">¿Cuándo te examinas?</b>
      <p class="small muted">Pon la fecha y te diremos cuántas preguntas hacer al día para llegar preparado.</p>
      <input type="date" class="input" data-fecha-inicio min="${M.hoyStr()}" aria-label="Fecha del examen">
    </div>`;
    return `<div class="card stack" style="--gap:10px">
      <div class="row" style="justify-content:space-between"><span class="stat-label">${ico('calendario')}Tu examen</span><a class="small" href="#/ajustes">Cambiar</a></div>
      <div class="stat-value num">${dd === 0 ? '¡Es hoy!' : dd === 1 ? 'Mañana' : `${dd} días`}</div>
      <span class="small muted">${new Date(M.S.fechaExamen + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      ${dd === 0 ? '<p class="small">Mucha suerte. Lee cada pregunta con calma: tienes un minuto por pregunta.</p>' : r ? `<p class="small">Ritmo recomendado: <b>${r} preguntas al día</b> para ver todo el banco y repasar tus fallos antes del examen.</p>` : ''}
    </div>`;
  }
  function videoRecomendado() {
    const L = window.Video ? Video.LECCIONES : [];
    const v = L.find(l => !M.S.videos[l.id]);
    if (!v) return '';
    return `<div><div class="section-head"><h2 class="h-m">Aprende en 2 minutos</h2><a class="small" href="#/aprender">Todas las lecciones</a></div><div class="grid g-2">${Video.tarjeta(v)}${L.filter(l => !M.S.videos[l.id])[1] ? Video.tarjeta(L.filter(l => !M.S.videos[l.id])[1]) : ''}</div></div>`;
  }
  function bienvenida() {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal bienvenida" role="dialog" aria-modal="true" aria-labelledby="bvt">
      ${mascota('feliz', 96)}
      <h3 class="h-l" id="bvt">¡Hola! Soy Semi</h3>
      <p class="muted">Te acompaño hasta el aprobado. Dos datos y empezamos:</p>
      <div class="field" style="text-align:left"><label for="bvn">¿Cómo te llamas?</label><input class="input" id="bvn" maxlength="30" placeholder="Tu nombre (opcional)" autocomplete="given-name"></div>
      <div class="field" style="text-align:left"><label>¿Cuántas preguntas al día?</label><div class="seg" role="group">${[[10, 'Tranqui'], [20, 'Normal'], [40, 'Intenso'], [60, 'A tope']].map(([n, t]) => `<button data-bm="${n}" aria-pressed="${n === M.S.metaDiaria}">${n} · ${t}</button>`).join('')}</div></div>
      <div class="field" style="text-align:left"><label for="bvf">Fecha del examen (si la sabes)</label><input class="input" type="date" id="bvf" min="${M.hoyStr()}"></div>
      <button class="btn btn-primary btn-lg btn-block" data-bvok>${ico('play')}Empezar</button>
    </div>`;
    document.body.appendChild(ov);
    $$('[data-bm]', ov).forEach(b => b.addEventListener('click', () => { M.S.metaDiaria = +b.dataset.bm; $$('[data-bm]', ov).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
    $('[data-bvok]', ov).addEventListener('click', () => {
      M.S.nombre = $('#bvn', ov).value.trim(); M.S.fechaExamen = $('#bvf', ov).value || ''; M.S.bienvenida = true; M.guardar();
      ov.remove(); render();
    });
    $('#bvn', ov).focus();
  }

  function infoModo(m) {
    const fal = M.falladasIds().length, rep = M.pendientesRepaso().length, dif = M.dificiles().length, marc = Object.keys(M.S.marcadas).length;
    const nuevas = M.banco().filter(q => !M.S.q[q.id]).length;
    const retoHecho = M.S.retos[M.hoyStr()];
    return {
      rapido: { ico: 'rayo', col: 'var(--amber)', bg: 'var(--amber-soft)', t: 'Test rápido', d: '10 preguntas variadas, adaptadas a tus puntos débiles.', c: `${nf.format(M.banco().length)} en el banco` },
      repaso: { ico: 'repaso', col: 'var(--brand)', bg: 'var(--brand-soft)', t: 'Repaso inteligente', d: 'Las que tocan hoy según la repetición espaciada.', c: rep ? `${rep} pendientes hoy` : 'Nada pendiente hoy', off: !rep },
      falladas: { ico: 'x', col: 'var(--bad)', bg: 'var(--bad-soft)', t: 'Falladas', d: 'Se guardan solas al fallar y salen al acertarlas.', c: fal ? `${fal} por recuperar` : 'Ninguna pendiente', off: !fal },
      dificiles: { ico: 'alerta', col: '#c2410c', bg: 'color-mix(in oklab, #c2410c 12%, transparent)', t: 'Difíciles', d: 'Las que más fallas y las de redacción traicionera.', c: `${dif} disponibles` },
      reto: { ico: 'trofeo', col: 'var(--violet)', bg: 'var(--violet-soft)', t: 'Reto del día', d: '10 preguntas, las mismas para todo el día. +50 XP.', c: retoHecho ? `Hecho hoy: ${retoHecho.ok}/10` : 'Disponible' },
      nuevas: { ico: 'estrella', col: 'var(--ok)', bg: 'var(--ok-soft)', t: 'Nunca vistas', d: 'Preguntas que todavía no has respondido.', c: `${nuevas} sin ver`, off: !nuevas },
      marcadas: { ico: 'bandera', col: 'var(--amber)', bg: 'var(--amber-soft)', t: 'Marcadas', d: 'Las que has guardado para repasar.', c: marc ? `${marc} marcadas` : 'Ninguna marcada', off: !marc },
      experto: { ico: 'medalla', col: '#b91c1c', bg: 'color-mix(in oklab, #b91c1c 12%, transparent)', t: 'Nivel experto', d: 'Solo preguntas difíciles, con trampas como en el examen.', c: `${M.banco().filter(q => q.d).length} preguntas difíciles` },
      contrarreloj: { ico: 'reloj', col: '#f36a1d', bg: 'color-mix(in oklab, #f36a1d 13%, transparent)', t: 'Contrarreloj', d: '60 segundos: acierta todas las que puedas.', c: (M.S.records || {}).contrarreloj ? `Tu récord: ${M.S.records.contrarreloj}` : 'Sin récord todavía' },
      duelo: { ico: 'usuario', col: '#db2777', bg: 'color-mix(in oklab, #db2777 12%, transparent)', t: 'Reta a un amigo', d: '10 preguntas iguales para todos. Envía el enlace y compara.', c: 'Comparte tu resultado' },
      libre: { ico: 'pluma', col: '#0e7490', bg: 'color-mix(in oklab, #0e7490 12%, transparent)', t: 'Práctica libre', d: 'Te dice qué está bien y qué mal, pero no cuenta para nada.', c: 'Sin presión · no se guarda' }
    }[m];
  }
  function tarjetaModo(m) {
    const i = infoModo(m);
    return `<button class="card mode" data-go='${JSON.stringify({ modo: m })}' ${i.off ? 'data-off="1"' : ''}>
      <span class="mode-ico" style="background:${i.bg};color:${i.col}">${ico(i.ico)}</span>
      <h3>${i.t}</h3><p>${i.d}</p><span class="count">${i.c}</span></button>`;
  }

  /* ---------- Practicar ---------- */
  V.practicar = function () {
    return `
    <div class="view">
      <div class="page-head"><div class="stack"><span class="eyebrow">Practicar</span><h1 class="h-l">Elige cómo quieres estudiar</h1><p class="muted">Las respuestas de estos modos se guardan y alimentan tu repaso y tus estadísticas. ¿Prefieres practicar sin que cuente? Usa la práctica libre.</p></div></div>
      <section class="card libre-panel reveal" id="libre">
        <div class="libre-head">${mascota('piensa', 64)}<div class="stack" style="--gap:6px"><span class="chip chip-libre">${ico('pluma')}Modo libre · no cuenta para nada</span><h2 class="h-m">Práctica libre</h2>
          <p class="small muted">Te dice al momento si aciertas o fallas y por qué, pero <b>no guarda nada</b>: ni respuestas, ni estadísticas, ni XP, ni racha, ni falladas. Ideal para probarte sin presión.</p></div></div>
        <div class="libre-form">
          <div class="field"><label for="lt">Tema</label><select class="input" id="lt"><option value="">Todos los temas mezclados</option>${TEMAS.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('')}</select></div>
          <div class="field"><label>Preguntas</label><div class="seg" role="group" id="ln">${[10, 20, 30].map(n => `<button data-ln="${n}" aria-pressed="${n === 20}">${n}</button>`).join('')}</div></div>
          <div class="row wrap-r"><button class="btn btn-primary" data-libre>${ico('play')}Empezar práctica libre</button><button class="btn btn-ghost" data-examen-libre>${ico('examen')}Simulacro libre</button></div>
        </div>
      </section>
      <div class="grid g-4 reveal" style="margin-top:22px">${['rapido', 'experto', 'contrarreloj', 'duelo', 'repaso', 'falladas', 'dificiles', 'reto', 'nuevas', 'marcadas'].map(tarjetaModo).join('')}
        <a class="card mode" href="#/examen"><span class="mode-ico" style="background:var(--ink);color:var(--bg)">${ico('examen')}</span><h3>Simulacro de examen</h3><p>30 preguntas, 30 minutos, máximo 3 fallos.</p><span class="count">Condiciones del examen real</span></a>
      </div>
      <div class="section">
        <div class="section-head"><h2 class="h-m">Por temas</h2><span class="small muted">${TEMAS.length} temas del temario</span></div>
        <div class="grid g-3 reveal">
          ${TEMAS.map(t => { const s = M.precisionTema(t.id); return `
            <button class="card tema-card" data-go='${JSON.stringify({ modo: 'tema', tema: t.id })}'>
              <div class="row">${temaIco(t.id)}<div style="min-width:0;flex:1"><div class="tema-name">${t.nombre}</div><div class="small muted">${s.total} preguntas</div></div>${estadoTema(s)}</div>
              ${barra(s.dominio, s.estado === 'dominado' ? 'ok' : '')}
              <div class="tema-meta"><span>${s.vistas} vistas</span><span>${s.n ? 'Acierto ' + pct(s.pct) : '—'}</span></div>
            </button>`; }).join('')}
        </div>
      </div>
      ${pie()}
    </div>`;
  };

  V.practicar.montar = function () {
    let n = 20;
    $$('[data-ln]').forEach(b => b.addEventListener('click', () => { n = +b.dataset.ln; $$('[data-ln]').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
    $('[data-libre]').addEventListener('click', () => iniciar({ modo: 'libre', tema: $('#lt').value || null, n }));
    $('[data-examen-libre]').addEventListener('click', empezarExamenLibre);
  };
  async function empezarExamenLibre() {
    if (M.S.examenActivo && !M.S.examenActivo.libre) { location.hash = '#/examen/en-curso'; return; }
    if (!(await modal({ titulo: 'Simulacro libre', texto: '30 preguntas y 30 minutos, igual que el real. Al final verás si serías APTO y la corrección completa, pero <b>no se guardará nada</b> en tu progreso.', ok: 'Empezar' }))) return;
    M.crearExamen({ libre: true }); location.hash = '#/examen/en-curso';
  }

  /* ---------- Camino ---------- */
  V.camino = function () {
    const c = M.camino(), actual = unidadActual();
    const total = c.reduce((s, u) => s + u.hechos, 0), max = c.length * M.NIVELES.length;
    const offs = [0, 70, 0, -70];
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Camino</span><h1 class="h-l">De cero al aprobado, paso a paso</h1><p class="muted">15 unidades, una por tema, con 3 niveles cada una: Básico, Avanzado y Maestro. Supera un nivel con ${M.CAMINO_APROBADO} aciertos de 8 y desbloquea el siguiente.</p></div></div>
      <div class="card row wrap-r" style="--gap:16px">${ico('mapa', 'style="width:26px;height:26px;color:var(--brand)"')}<div style="flex:1;min-width:200px"><b>${total} de ${max} niveles superados</b>${barra(total / max, total === max ? 'ok' : '')}</div><span class="chip chip-amber">${ico('rayo')}+25 XP por nivel nuevo</span></div>
      <div class="camino">
        ${c.map(u => { const t = TEMA[u.t]; const lec = (window.Video ? Video.LECCIONES : []).find(l => l.tema === u.t); const guia = window.Aprender.GUIAS.find(g => g.tema === u.t); return `
        <section class="unidad ${u.abierta ? '' : 'cerrada'}" style="--tc:${t.color}">
          <div class="unidad-head">
            <div class="stack" style="--gap:4px"><span class="tiny" style="opacity:.85;font-weight:700">UNIDAD ${u.i + 1}</span><h2 class="h-m" style="color:inherit">${t.nombre}</h2><span class="small" style="opacity:.85">${t.desc}</span></div>
            <div class="row wrap-r" style="--gap:8px">${lec ? `<a class="btn btn-sm unidad-btn" href="#/video/${lec.id}">${ico('play')}Vídeo</a>` : ''}${guia ? `<a class="btn btn-sm unidad-btn" href="#/aprender/${guia.id}">${ico('libro')}Guía</a>` : ''}</div>
          </div>
          <div class="nodos">
            ${M.NIVELES.map((n, k) => { const hecho = k < u.hechos, disp = u.abierta && k <= u.hechos, cur = u.t === actual.t && k === u.hechos; return `
            <div class="nodo-wrap" style="--x:${offs[(u.i * 3 + k) % 4]}px">
              ${cur ? `<span class="nodo-semi">${mascota('feliz', 54)}</span>` : ''}
              <button class="nodo ${hecho ? 'hecho' : ''} ${cur ? 'cur' : ''}" ${disp ? `data-go='${JSON.stringify({ modo: 'camino', tema: u.t, nivel: k })}'` : 'disabled'} aria-label="${t.nombre}, nivel ${n}${hecho ? ', superado' : disp ? '' : ', bloqueado'}">${ico(hecho ? 'estrella' : disp ? (k === 2 ? 'trofeo' : 'play') : 'candado')}</button>
              <span class="nodo-lbl">${n}${u.mejor[k] ? ` · ${u.mejor[k]}/8` : ''}</span>
              ${cur ? '<span class="nodo-empieza">¡Empieza aquí!</span>' : ''}
            </div>`; }).join('')}
          </div>
        </section>`; }).join('')}
        <div class="meta-final">${mascota(total === max ? 'celebra' : 'feliz', 80)}<b>${total === max ? '¡Camino completado! Ahora, simulacros.' : 'Al final del camino: simulacros como el examen real'}</b><a class="btn btn-soft btn-sm" href="#/examen">${ico('examen')}Ir al simulacro</a></div>
      </div>
      ${pie()}
    </div>`;
  };
  V.camino.montar = () => { const cur = $('.nodo.cur'); if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150); };

  /* ---------- Sesión de práctica ---------- */
  let sesion = null;
  function iniciar(cfg) {
    if (cfg.modo === 'examen') { location.hash = '#/examen'; return; }
    if (cfg.modo === 'duelo' && !cfg.semilla) cfg = { ...cfg, semilla: Math.random().toString(36).slice(2, 8) };
    const s = M.crearSesion(cfg.modo, cfg);
    if (!s.ids.length) {
      const msg = { falladas: 'No tienes preguntas falladas pendientes. ¡Bien hecho!', repaso: 'No hay repasos pendientes hoy. Vuelve mañana o haz un test rápido.', marcadas: 'Aún no has marcado ninguna pregunta. Usa la bandera durante la práctica.', nuevas: 'Ya has visto todas las preguntas del banco.' }[cfg.modo] || 'No hay preguntas disponibles con los filtros actuales.';
      modal({ titulo: 'Nada por aquí', texto: msg, cancelar: null });
      return;
    }
    sesion = s;
    location.hash = '#/sesion';
    if (location.hash === '#/sesion') render();
  }

  V.sesion = function () {
    if (!sesion) return V.inicio();
    if (sesion.i >= sesion.ids.length) return finSesion();
    const q = M.POR_ID[sesion.ids[sesion.i]];
    const resp = sesion.resp[q.id];
    const contestada = resp !== undefined;
    const tituloModo = nombreSesion(sesion);
    const marcada = !!M.S.marcadas[q.id];
    return `
    <div class="sesion view">
      <div class="sesion-top">
        <button class="btn btn-ghost btn-icon" data-salir title="Salir">${ico('x')}</button>
        ${rutaProgreso((sesion.i + (contestada ? 1 : 0)) / sesion.ids.length, sesion.libre)}
        ${sesion.combo >= 3 ? `<span class="combo num" title="Aciertos seguidos">${ico('llama')}${sesion.combo}</span>` : ''}
        ${sesion.limite ? `<span class="timer num" id="crono">${ico('reloj')}<span>${Math.max(0, Math.ceil((sesion.limite - Date.now()) / 1000))}</span></span><span class="chip chip-ok num">${sesion.aciertos} ✓</span>` : ''}
        ${sesion.limite ? '' : `<span class="num small" style="font-weight:800">${sesion.i + 1}/${sesion.ids.length}</span>`}
      </div>
      ${sesion.rival ? `<div class="libre-aviso" style="color:#db2777;background:color-mix(in oklab, #db2777 10%, transparent)">${ico('usuario')}${esc(sesion.rival.nombre || 'Tu amigo')} sacó ${sesion.rival.p}/10. ¡A por ello!</div>` : ''}
      ${sesion.libre ? `<div class="libre-aviso">${ico('pluma')}Práctica libre: no cuenta para tu progreso</div>` : ''}
      <article class="qcard ${contestada ? '' : 'nueva'}">
        <div class="qgrid ${q.img ? '' : 'noimg'}">
          ${q.img ? `<div class="qmedia ${imgSenal(q.img) ? "" : "foto"}"><img src="${q.img}" alt="Imagen de la pregunta" class="${imgSenal(q.img) ? "sign" : ""}" data-zoom loading="eager">${imgSenal(q.img) ? '' : `<button class="btn btn-ghost btn-sm zoom" data-zoom-btn style="background:var(--surface)">${ico('zoom')}Ampliar</button>`}</div>` : ''}
          <div class="qbody">
            <div class="qmeta">${chipFuente(q)}<span class="chip">${ico('t_' + q.t)}${TEMA[q.t].corto}</span><span class="spacer"></span>
              <button class="btn btn-ghost btn-sm" data-marcar aria-pressed="${marcada}" title="Marcar para repasar" style="${marcada ? 'color:var(--amber);border-color:var(--amber)' : ''}">${ico('bandera')}${marcada ? 'Marcada' : 'Marcar'}</button></div>
            <h2 class="qtext">${esc(q.q)}</h2>
            <div class="opts ${contestada ? 'locked' : ''}" role="group" aria-label="Respuestas">
              ${q.o.map((o, i) => {
                let cls = '';
                if (contestada) { if (i === q.c) cls = 'ok'; else if (i === resp) cls = 'bad'; else cls = 'dim'; }
                return `<button class="opt ${cls}" data-op="${i}" ${contestada ? 'aria-disabled="true"' : ''}><span class="key">${LETRAS[i]}</span><span>${esc(o)}</span><span class="mark">${ico(i === q.c ? 'check' : 'x')}</span></button>`;
              }).join('')}
            </div>
          </div>
        </div>
        ${contestada ? explicacion(q, resp) : ''}
        <div class="sesion-actions">
          <span class="kbd">Teclas <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> para responder · <kbd>Intro</kbd> para seguir</span>
          <span class="spacer"></span>
          ${contestada ? `<button class="btn btn-primary" data-sig autofocus>${sesion.i + 1 === sesion.ids.length ? 'Ver resultado' : 'Siguiente'}${ico('flecha')}</button>` : `<button class="btn btn-ghost" data-saltar>Saltar</button>`}
        </div>
      </article>
      <p class="tiny muted" style="text-align:center;margin-top:14px">${esc(tituloModo)}</p>
    </div>`;
  };
  // Barra de progreso en forma de carretera, con un coche que avanza hasta la meta.
  const rutaProgreso = (v, libre) => `<div class="ruta ${libre ? 'libre' : ''}" role="progressbar" aria-valuenow="${Math.round(v * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${(v * 100).toFixed(1)}%"></i><span class="ruta-coche" style="left:${(v * 100).toFixed(1)}%"><svg viewBox="0 0 40 24"><rect x="2" y="7" width="34" height="12" rx="5" fill="currentColor"/><path d="M9 8 13 2h12l5 6Z" fill="currentColor"/><path d="M14 4h4v4h-6ZM20 4h4l3 4h-7Z" fill="#cfe3ff"/><circle cx="10" cy="19" r="4" fill="#111a2e"/><circle cx="29" cy="19" r="4" fill="#111a2e"/></svg></span><span class="ruta-meta">🏁</span></div>`;
  const estrellas = p => { const n = p >= .95 ? 3 : p >= .8 ? 2 : p >= .6 ? 1 : 0; return `<div class="estrellas" aria-label="${n} de 3 estrellas">${[0, 1, 2].map(k => `<span class="${k < n ? 'on' : ''}" style="animation-delay:${.25 + k * .25}s">${ico('estrella')}</span>`).join('')}</div>`; };
  const ANIMOS_OK = ['¡Correcto!', '¡Bien visto!', '¡Exacto!', '¡Eso es!', '¡Perfecto!'];
  const ANIMOS_BAD = ['Casi. Mira por qué:', 'Esta es traicionera:', 'Ahora ya no se te olvida:'];
  function nombreSesion(s) {
    if (s.modo === 'camino') return `${TEMA[s.tema].nombre} · Nivel ${M.NIVELES[s.nivel]}`;
    if (s.modo === 'tema' || (s.modo === 'libre' && s.tema)) return (s.libre ? 'Práctica libre · ' : '') + TEMA[s.tema].nombre;
    return M.MODOS[s.modo].nombre;
  }
  function explicacion(q, resp) {
    const ok = resp === q.c;
    const n = sesion ? sesion.i : 0;
    const frase = ok ? (sesion && sesion.combo >= 3 ? `¡${sesion.combo} seguidas!` : ANIMOS_OK[n % ANIMOS_OK.length]) : ANIMOS_BAD[n % ANIMOS_BAD.length];
    return `<div class="explica ${ok ? 'es-ok' : 'es-bad'}" aria-live="polite">
      <div class="verdict ${ok ? 'ok' : 'bad'}"><span class="verdict-semi">${mascota(ok ? (sesion && sesion.combo >= 3 ? 'celebra' : 'feliz') : 'animo', 44)}</span>${frase}${sesion && sesion.ultXP ? `<span class="xp-pop">+${sesion.ultXP} XP</span>` : ''}${sesion && sesion.libre ? '<span class="chip chip-libre" style="margin-left:auto">No cuenta</span>' : ''}</div>
      ${ok ? `<p><b>Respuesta correcta: ${LETRAS[q.c]}.</b> ${esc(q.o[q.c])}</p>` : `<p><b>Tu respuesta (${LETRAS[resp]}) no es correcta.</b> La correcta es la <b>${LETRAS[q.c]}</b>: ${esc(q.o[q.c])}</p>`}
      <p>${esc(q.e)}</p>
      ${q.r ? `<div class="ref">${ico('norma')}<span><b>Normativa:</b> ${esc(q.r)}</span></div>` : ''}
      ${q.k ? `<div class="tip">${ico('bombilla')}<span><b>Para recordarlo:</b> ${esc(q.k)}</span></div>` : ''}
    </div>`;
  }
  let cronoInt = null;
  function acabarCrono() {
    sesion.ids = sesion.ids.filter(id => sesion.resp[id] !== undefined);
    sesion.i = sesion.ids.length; sesion.limite = null; sesion.crono = true;
    sonar('fiesta'); render();
  }
  V.sesion.montar = function () {
    document.body.classList.add('en-sesion');
    clearInterval(cronoInt);
    if (sesion && sesion.limite && sesion.i < sesion.ids.length) cronoInt = setInterval(() => {
      if (!sesion || !sesion.limite || ruta().v !== 'sesion') { clearInterval(cronoInt); return; }
      const rest = sesion.limite - Date.now(), el = $('#crono');
      if (el) { $('span', el).textContent = Math.max(0, Math.ceil(rest / 1000)); el.classList.toggle('low', rest < 10000); }
      if (rest <= 0) { clearInterval(cronoInt); acabarCrono(); }
    }, 250);
    const q = sesion && sesion.i < sesion.ids.length ? M.POR_ID[sesion.ids[sesion.i]] : null;
    $$('[data-op]').forEach(b => b.addEventListener('click', () => contestar(+b.dataset.op)));
    const sig = $('[data-sig]'); if (sig) { sig.addEventListener('click', avanzar); sig.focus({ preventScroll: true }); }
    const sal = $('[data-saltar]'); if (sal) sal.addEventListener('click', () => { sesion.ids.push(sesion.ids.splice(sesion.i, 1)[0]); render(); });
    const salir = $('[data-salir]'); if (salir) salir.addEventListener('click', async () => {
      const resp = Object.keys(sesion.resp).length;
      if (resp && sesion.i < sesion.ids.length && !(await modal({ titulo: '¿Salir de la sesión?', texto: sesion.libre ? 'Es práctica libre: no se guarda nada.' : `Tus ${resp} ${resp === 1 ? 'respuesta ya está guardada' : 'respuestas ya están guardadas'} en tu progreso.`, ok: 'Salir' }))) return;
      const volver = sesion.modo === 'camino' ? '#/camino' : '#/practicar';
      sesion = null; location.hash = volver;
    });
    const mk = $('[data-marcar]'); if (mk && q) mk.addEventListener('click', () => { if (M.S.marcadas[q.id]) delete M.S.marcadas[q.id]; else M.S.marcadas[q.id] = Date.now(); M.guardar(); render(); });
    const cd = $('[data-compartir-duelo]'); if (cd) cd.addEventListener('click', () => {
      const nombre = (M.S.nombre || '').replace(/[~#/?&]/g, '').slice(0, 20);
      const url = baseURL() + `#/duelo/${sesion.semilla}~${encodeURIComponent(nombre)}~${sesion.aciertos}`;
      compartir({ title: 'Reto Luz Verde', text: `He sacado ${sesion.aciertos}/10 en este reto del teórico del carnet. ¿Me superas?`, url });
    });
    $$('[data-contar]').forEach(el => {
      const fin = +el.dataset.contar, t0 = performance.now();
      (function paso(t) { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); })(t0);
    });
    const img = $('[data-zoom]'); if (img) img.addEventListener('click', () => lightbox(img.src, 'Imagen ampliada'));
    const zb = $('[data-zoom-btn]'); if (zb) zb.addEventListener('click', () => lightbox(img.src, 'Imagen ampliada'));
  };
  function contestar(i) {
    const q = M.POR_ID[sesion.ids[sesion.i]];
    if (sesion.resp[q.id] !== undefined) return;
    sesion.resp[q.id] = i;
    const ok = i === q.c;
    if (ok) { sesion.aciertos++; sesion.combo++; sesion.maxCombo = Math.max(sesion.maxCombo, sesion.combo); } else sesion.combo = 0;
    if (sesion.libre) {
      // Práctica libre: solo se corrige; no se registra nada.
      sesion.ultXP = 0;
      sonar(ok ? (sesion.combo >= 3 && sesion.combo % 3 === 0 ? 'combo' : 'ok') : 'bad');
      if (!ok) vibrar(40);
      render();
      return;
    }
    const r = M.responder(q.id, ok, sesion.modo);
    sesion.ultXP = r.xp; sesion.xp += r.xp;
    if (ok && sesion.combo >= 3) M.registrarCombo(sesion.combo);
    sonar(ok ? (sesion.combo >= 3 && sesion.combo % 3 === 0 ? 'combo' : 'ok') : 'bad');
    if (!ok) vibrar(40); else if (sesion.combo >= 3 && sesion.combo % 3 === 0) vibrar([20, 40, 20]);
    render();
    if (r.metaCumplida) toast('¡Objetivo diario cumplido!', '+30 XP de bonificación', 'diana');
    premiar();
    // En la contrarreloj, si aciertas se pasa sola a la siguiente; si fallas, puedes leer la explicación.
    if (sesion.limite && ok) { const s = sesion, k = s.i; setTimeout(() => { if (sesion === s && s.i === k && s.limite) avanzar(); }, 600); }
  }
  function avanzar() { sesion.i++; sesion.ultXP = 0; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  // Cierra la sesión una sola vez (premios del reto y del camino) y guarda el resumen.
  function cerrarSesion(s) {
    if (s.fin) return s.fin;
    const n = Object.keys(s.resp).length, ok = s.aciertos;
    const fin = { n, ok, p: n ? ok / n : 0, extra: 0, camino: null, min: Math.max(1, Math.round((Date.now() - s.inicio) / 60000)) };
    if (!s.libre) {
      if (s.modo === 'reto' && !M.S.retos[M.hoyStr()]) { M.S.retos[M.hoyStr()] = { ok, n }; M.sumarXP(50); M.guardar(); fin.extra += 50; setTimeout(() => toast('Reto del día completado', '+50 XP', 'trofeo'), 300); }
      if (s.modo === 'contrarreloj') { const rec = M.S.records.contrarreloj || 0; fin.recPrevio = rec; fin.record = ok > rec; if (fin.record) { M.S.records.contrarreloj = ok; M.guardar(); } }
      if (s.modo === 'duelo') { M.S.records.duelos = (M.S.records.duelos || 0) + 1; M.guardar(); }
      if (s.modo === 'camino' && n === s.ids.length) { fin.camino = M.completarNivel(s.tema, s.nivel, ok, n); if (fin.camino.nuevo) fin.extra += 25; }
      setTimeout(premiar, 600);
    }
    if (fin.p >= .9 || (fin.camino && fin.camino.nuevo)) setTimeout(() => { confeti(); sonar('fiesta'); }, 250);
    return (s.fin = fin);
  }
  function finSesion() {
    const s = sesion, f = cerrarSesion(s), { n, ok, p } = f;
    const falladas = s.ids.filter(id => s.resp[id] !== undefined && s.resp[id] !== M.POR_ID[id].c);
    let msg = p === 1 ? 'Sesión perfecta. Así se hace.' : p >= .9 ? 'Excelente: nivel de aprobado.' : p >= .75 ? 'Buen trabajo. Repasa los fallos para fijarlos.' : 'Los fallos de hoy son los aciertos del examen. Repásalos.';
    let titulo = `${ok} de ${n} correctas`, otra = { modo: s.modo, tema: s.tema, nivel: s.nivel, n: s.modo === 'libre' ? s.ids.length : undefined };
    const c = f.camino;
    if (c) {
      if (c.unidadCompleta) { titulo = '¡Unidad completada!'; msg = `Has superado los 3 niveles de ${TEMA[s.tema].nombre}. La siguiente unidad te espera.`; }
      else if (c.nuevo) { titulo = `¡Nivel ${M.NIVELES[s.nivel]} superado!`; msg = `${ok} de ${n} correctas. Has desbloqueado el siguiente paso del camino.`; otra = { modo: 'camino', tema: s.tema, nivel: s.nivel + 1 }; }
      else if (!c.superado) { msg = `Necesitas ${Math.ceil(n * M.CAMINO_APROBADO / 8)} aciertos para superarlo. Lee las explicaciones de tus fallos y vuelve a intentarlo.`; }
    }
    if (s.modo === 'contrarreloj') {
      titulo = `${ok} ${ok === 1 ? 'acierto' : 'aciertos'} en 60 segundos`;
      msg = f.record ? (f.recPrevio ? `¡Nuevo récord! Superas tu marca anterior de ${f.recPrevio}.` : '¡Primer récord registrado! Intenta superarlo.') : `Tu récord está en ${f.recPrevio}. ¡Otra y lo superas!`;
    }
    if (s.modo === 'duelo') {
      const r = s.rival;
      msg = !r ? 'Ahora reta a tus amigos: recibirán estas mismas 10 preguntas y verán tu resultado.'
        : ok > r.p ? `¡Has ganado a ${esc(r.nombre || 'tu amigo')} (${r.p}/10)! Devuélvele el reto.` : ok === r.p ? `Empate con ${esc(r.nombre || 'tu amigo')} (${r.p}/10).` : `${esc(r.nombre || 'Tu amigo')} sacó ${r.p}/10. ¡Casi! Prueba otro reto.`;
      otra = { modo: 'duelo' };
    }
    const xpTotal = s.xp + f.extra;
    const humor = p >= .9 || (c && c.nuevo) ? 'celebra' : p >= .6 ? 'feliz' : 'animo';
    return `
    <div class="view sesion stack" style="--gap:20px">
      <section class="card pad-l fin-card" style="text-align:center;display:grid;gap:14px;justify-items:center">
        <div class="fin-semi">${mascota(humor, 104)}</div>
        ${s.modo === 'contrarreloj' ? '' : estrellas(p)}
        <span class="eyebrow">${esc(nombreSesion(s))}</span>
        <h1 class="h-l">${titulo}</h1>
        <p class="lead">${msg}</p>
        <div class="row wrap-r" style="justify-content:center">
          ${s.libre ? `<span class="chip chip-libre">${ico('pluma')}Práctica libre: no se ha guardado nada</span>` : `<span class="chip chip-amber">${ico('rayo')}+<b class="num" data-contar="${xpTotal}">0</b> XP</span>`}
          <span class="chip">${ico('reloj')}${f.min} min</span>
          <span class="chip ${p >= .9 ? 'chip-ok' : ''}">${pct(p)} acierto</span>
          ${s.maxCombo >= 3 ? `<span class="chip">${ico('llama')}Mejor racha: ${s.maxCombo}</span>` : ''}
        </div>
        <div class="row wrap-r" style="justify-content:center;margin-top:6px">
          ${c && c.unidadCompleta ? `<a class="btn btn-primary" href="#/camino">${ico('mapa')}Ver el camino</a>` : `<button class="btn btn-primary" data-go='${JSON.stringify(otra)}'>${ico(c && c.nuevo ? 'flecha' : 'repaso')}${c && c.nuevo ? 'Siguiente nivel' : c && !c.superado ? 'Reintentar' : 'Otra ronda'}</button>`}
          ${s.modo === 'duelo' ? `<button class="btn btn-soft" data-compartir-duelo style="color:#db2777">${ico('usuario')}Retar a mis amigos</button>` : ''}
          ${falladas.length && !s.libre ? `<button class="btn btn-soft" data-go='${JSON.stringify({ modo: 'falladas' })}'>${ico('x')}Repasar falladas</button>` : ''}
          <a class="btn btn-ghost" href="${s.modo === 'camino' ? '#/camino' : '#/inicio'}">${s.modo === 'camino' ? 'Volver al camino' : 'Volver al inicio'}</a>
        </div>
      </section>
      ${falladas.length ? `<section class="card"><h2 class="h-m" style="margin-bottom:6px">Tus fallos de esta sesión</h2>${falladas.map((id, k) => itemRevision(M.POR_ID[id], s.resp[id], k + 1)).join('')}</section>` : ''}
    </div>`;
  }
  function itemRevision(q, r, n) {
    const ok = r === q.c;
    return `<div class="review-item"><span class="review-n ${ok ? 'ok' : 'bad'} num">${n}</span><div>
      <div class="qmeta" style="margin-bottom:6px">${chipFuente(q)}<span class="chip">${TEMA[q.t].corto}</span></div>
      <div class="review-q">${esc(q.q)}</div>
      <div class="review-a">${r === null || r === undefined ? '<span class="yo">Sin responder</span>' : ok ? '' : `<span class="yo">${ico('x', 'style="width:14px;height:14px;display:inline;vertical-align:-2px"')} Tu respuesta: ${LETRAS[r]}. ${esc(q.o[r])}</span>`}<span class="bien">${ico('check', 'style="width:14px;height:14px;display:inline;vertical-align:-2px"')} Correcta: ${LETRAS[q.c]}. ${esc(q.o[q.c])}</span></div>
      <details class="more"><summary>Ver explicación${q.img ? ' e imagen' : ''}</summary>${q.img ? `<img src="${q.img}" alt="" style="max-height:220px;border-radius:12px;margin:6px 0 10px;${imgSenal(q.img) ? 'width:120px' : ''}" loading="lazy">` : ''}<p class="small">${esc(q.e)}</p>${q.r ? `<p class="tiny muted" style="margin-top:6px">${ico('norma', 'style="width:13px;height:13px;display:inline;vertical-align:-2px"')} ${esc(q.r)}</p>` : ''}${q.k ? `<p class="tiny" style="margin-top:6px;color:var(--amber)">${esc(q.k)}</p>` : ''}</details>
    </div></div>`;
  }

  /* ---------- Examen: portada ---------- */
  V.examen = function () {
    const E = M.EXAMEN, ex = M.S.examenes, apr = ex.filter(e => e.aprobado).length;
    const mejor = ex.length ? Math.min(...ex.map(e => e.errores)) : null;
    return `
    <div class="view stack" style="--gap:24px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Simulacro</span><h1 class="h-l">Examen teórico del permiso B</h1><p class="muted">Reproduce las condiciones de la prueba oficial de la DGT.</p></div></div>
      ${M.S.examenActivo ? `<div class="note warn">${ico('reloj')}<div><b>Tienes un simulacro en curso.</b> El tiempo sigue corriendo aunque cierres la página. <a href="#/examen/en-curso">Reanudar ahora</a></div></div>` : ''}
      <div class="grid g-2">
        <div class="card pad-l stack" style="--gap:18px">
          <div class="grid g-3k" style="gap:10px">
            <div class="stat"><span class="stat-label">${ico('examen')}Preguntas</span><span class="stat-value num">${E.preguntas}</span></div>
            <div class="stat"><span class="stat-label">${ico('reloj')}Tiempo</span><span class="stat-value num">${E.minutos} min</span></div>
            <div class="stat"><span class="stat-label">${ico('x')}Fallos máx.</span><span class="stat-value num">${E.maxFallos}</span></div>
          </div>
          <ul class="prose" style="padding-left:18px;margin:0">
            <li>Una pregunta por pantalla, con 3 opciones y una sola correcta.</li>
            <li>Puedes moverte entre preguntas, marcarlas y cambiar respuestas hasta finalizar.</li>
            <li>Las preguntas sin responder cuentan como fallo. Al acabar el tiempo se corrige automáticamente.</li>
            <li>Apto con ${E.preguntas - E.maxFallos} aciertos o más (como máximo ${E.maxFallos} fallos).</li>
          </ul>
          <div class="row wrap-r">
            ${M.S.examenActivo ? `<a class="btn btn-primary btn-lg" href="#/examen/en-curso">${ico('reloj')}Reanudar simulacro${M.S.examenActivo.libre ? ' libre' : ''}</a>` : `<button class="btn btn-primary btn-lg" data-empezar>${ico('play')}Empezar simulacro</button><button class="btn btn-ghost btn-lg" data-examen-libre title="Se corrige pero no se guarda en tu progreso">${ico('pluma')}Simulacro libre</button>`}
          </div>
          <p class="small muted" style="margin:0">El <b>simulacro libre</b> se corrige igual, pero no cuenta para tus estadísticas, XP ni repaso.</p>
          <p class="tiny muted">Formato verificado en dgt.es (noviembre de 2026): 30 preguntas, 30 minutos y un máximo de 3 errores para el permiso B. Cada simulacro combina preguntas de todos los temas y evita repetir las de tus últimos simulacros.</p>
        </div>
        <div class="card stack" style="--gap:16px">
          <h2 class="h-m">Tu historial</h2>
          <div class="grid g-3k" style="gap:10px">
            <div class="stat"><span class="stat-label">Hechos</span><span class="stat-value num">${ex.length}</span></div>
            <div class="stat"><span class="stat-label">Aptos</span><span class="stat-value num" style="color:var(--ok)">${apr}</span></div>
            <div class="stat"><span class="stat-label">Mejor</span><span class="stat-value num">${mejor === null ? '—' : mejor + (mejor === 1 ? ' fallo' : ' fallos')}</span></div>
          </div>
          ${ex.length ? graficoExamenes(ex.slice(-12)) : '<p class="muted small">Cuando hagas simulacros verás aquí tu evolución.</p>'}
          ${ex.length ? `<div class="list">${ex.slice(-5).reverse().map(e => `<a class="li" href="#/resultado/${e.id}" style="text-decoration:none;color:inherit"><span class="chip ${e.aprobado ? 'chip-ok' : 'chip-bad'}">${e.aprobado ? 'Apto' : 'No apto'}</span><span class="num">${e.errores} ${e.errores === 1 ? 'fallo' : 'fallos'}</span><span class="spacer"></span><span class="small muted">${new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span></a>`).join('')}</div>` : ''}
        </div>
      </div>
      ${pie()}
    </div>`;
  };
  V.examen.montar = () => {
    const b = $('[data-empezar]'); if (b) b.addEventListener('click', () => { M.crearExamen(); location.hash = '#/examen/en-curso'; });
    const l = $('[data-examen-libre]'); if (l) l.addEventListener('click', empezarExamenLibre);
  };

  /* ---------- Examen: en curso ---------- */
  let reloj = null;
  V.examenCurso = function () {
    const e = M.S.examenActivo;
    if (!e) return V.examen();
    const q = M.POR_ID[e.ids[e.i]];
    const resp = e.resp[q.id];
    const contestadas = Object.keys(e.resp).length;
    return `
    <div class="view">
      <div class="sesion-top" style="max-width:none">
        <span class="eyebrow">Simulacro · Permiso B</span>${e.libre ? `<span class="chip chip-libre">${ico('pluma')}Libre · no cuenta</span>` : ''}
        <span class="spacer"></span>
        <span class="small muted num"><b style="color:var(--ink)">${contestadas}</b>/30 contestadas</span>
        <span class="timer" id="timer">${ico('reloj')}<span>--:--</span></span>
      </div>
      <div class="exam-layout">
        <article class="qcard">
          <div class="qgrid ${q.img ? '' : 'noimg'}">
            ${q.img ? `<div class="qmedia ${imgSenal(q.img) ? "" : "foto"}"><img src="${q.img}" alt="Imagen de la pregunta" class="${imgSenal(q.img) ? "sign" : ""}" data-zoom></div>` : ""}
            <div class="qbody">
              <div class="qmeta"><span class="chip num">Pregunta ${e.i + 1} de ${e.ids.length}</span><span class="spacer"></span>
                <button class="btn btn-ghost btn-sm" data-flag style="${e.flags[q.id] ? 'color:var(--amber);border-color:var(--amber)' : ''}">${ico('bandera')}${e.flags[q.id] ? 'Marcada' : 'Marcar'}</button></div>
              <h2 class="qtext">${esc(q.q)}</h2>
              <div class="opts">${q.o.map((o, i) => `<button class="opt ${resp === i ? 'sel' : ''}" data-op="${i}" aria-pressed="${resp === i}"><span class="key">${LETRAS[i]}</span><span>${esc(o)}</span><span class="mark"></span></button>`).join('')}</div>
            </div>
          </div>
          <div class="sesion-actions">
            <button class="btn btn-ghost" data-prev ${e.i === 0 ? 'disabled' : ''}>${ico('atras')}Anterior</button>
            <span class="spacer"></span>
            ${e.i < e.ids.length - 1 ? `<button class="btn btn-primary" data-next>Siguiente${ico('flecha')}</button>` : `<button class="btn btn-primary" data-fin>Finalizar examen${ico('check')}</button>`}
          </div>
        </article>
        <aside class="card navq">
          <div class="row" style="justify-content:space-between;margin-bottom:12px"><b>Preguntas</b><span class="small muted">${30 - contestadas} pendientes</span></div>
          <div class="navq-grid">${e.ids.map((id, k) => `<button class="nq num ${e.resp[id] !== undefined ? 'done' : ''} ${k === e.i ? 'cur' : ''} ${e.flags[id] ? 'flag' : ''}" data-ir="${k}" aria-label="Pregunta ${k + 1}">${k + 1}</button>`).join('')}</div>
          <div class="legend"><span><i style="background:var(--brand-soft)"></i>Contestada</span><span><i style="background:var(--surface-2);border:1px solid var(--line)"></i>Pendiente</span><span><i style="background:var(--amber);border-radius:50%"></i>Marcada</span></div>
          <button class="btn btn-ghost btn-block" data-fin style="margin-top:16px">Finalizar y corregir</button>
          ${e.libre ? `<button class="btn btn-ghost btn-block btn-sm" data-abandonar style="margin-top:8px;color:var(--muted)">Abandonar sin corregir</button>` : ''}
        </aside>
      </div>
    </div>`;
  };
  V.examenCurso.montar = function () {
    document.body.classList.add('en-sesion');
    const e = M.S.examenActivo; if (!e) return;
    const q = M.POR_ID[e.ids[e.i]];
    const tick = () => {
      const t = $('#timer'); if (!t || !M.S.examenActivo) { clearInterval(reloj); return; }
      const rest = Math.max(0, e.limite - Date.now());
      const m = Math.floor(rest / 60000), s = Math.floor(rest % 60000 / 1000);
      $('span', t).textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      t.classList.toggle('low', rest < 5 * 60000);
      if (rest <= 0) { clearInterval(reloj); terminarExamen(true); }
    };
    clearInterval(reloj); reloj = setInterval(tick, 1000); tick();
    $$('[data-op]').forEach(b => b.addEventListener('click', () => { e.resp[q.id] = +b.dataset.op; M.guardar(); render(); }));
    $$('[data-ir]').forEach(b => b.addEventListener('click', () => { e.i = +b.dataset.ir; M.guardar(); render(); }));
    const nx = $('[data-next]'); if (nx) nx.addEventListener('click', () => { e.i++; M.guardar(); render(); });
    const pv = $('[data-prev]'); if (pv) pv.addEventListener('click', () => { e.i--; M.guardar(); render(); });
    $('[data-flag]').addEventListener('click', () => { if (e.flags[q.id]) delete e.flags[q.id]; else e.flags[q.id] = 1; M.guardar(); render(); });
    $$('[data-fin]').forEach(b => b.addEventListener('click', async () => {
      const pend = e.ids.length - Object.keys(e.resp).length;
      const ok = await modal({ titulo: '¿Finalizar el examen?', texto: pend ? `Te quedan <b>${pend}</b> ${pend === 1 ? 'pregunta' : 'preguntas'} sin responder, que contarán como fallo.` : 'Has respondido todas las preguntas. Una vez finalizado no podrás cambiar las respuestas.', ok: 'Finalizar y corregir', cancelar: 'Seguir revisando' });
      if (ok) terminarExamen(false);
    }));
    const ab = $('[data-abandonar]'); if (ab) ab.addEventListener('click', async () => {
      if (!(await modal({ titulo: '¿Abandonar el simulacro libre?', texto: 'No se corregirá ni se guardará nada.', ok: 'Abandonar' }))) return;
      clearInterval(reloj); M.S.examenActivo = null; M.guardar(); location.hash = '#/examen';
    });
    const img = $('[data-zoom]'); if (img) img.addEventListener('click', () => lightbox(img.src, 'Imagen ampliada'));
  };
  function terminarExamen(porTiempo) {
    clearInterval(reloj);
    const r = M.corregirExamen(porTiempo);
    if (!r) return;
    location.hash = '#/resultado/' + (r.libre ? 'libre' : r.id);
    if (r.aprobado) setTimeout(() => { confeti(); sonar('fiesta'); }, 250);
    if (!r.libre) setTimeout(premiar, 900);
  }

  /* ---------- Resultado del examen ---------- */
  V.resultado = function (id) {
    const r = id === 'libre' ? M.ultimoLibre : M.S.examenes.find(e => e.id === id);
    if (!r) return `<div class="view empty"><span class="ico">${ico('alerta')}</span><p>No se encuentra este simulacro.</p><a class="btn btn-soft" href="#/examen">Volver</a></div>`;
    const E = M.EXAMEN;
    const porTema = {};
    r.preguntas.forEach(p => { const t = M.POR_ID[p.id] ? M.POR_ID[p.id].t : null; if (!t) return; porTema[t] = porTema[t] || { n: 0, f: 0 }; porTema[t].n++; if (!p.ok) porTema[t].f++; });
    const temasFallo = Object.entries(porTema).filter(([, v]) => v.f).sort((a, b) => b[1].f - a[1].f);
    const min = Math.floor(r.dur / 60000), seg = Math.round(r.dur % 60000 / 1000);
    const idx = M.S.examenes.indexOf(r);
    return `
    <div class="view stack" style="--gap:22px">
      <section class="result-hero ${r.aprobado ? 'pass' : 'fail'}">
        <span class="eyebrow" style="color:rgba(255,255,255,.8)">${r.libre ? 'Simulacro libre · no se ha guardado' : 'Simulacro nº ' + (idx + 1)} ·${new Date(r.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        <h1 style="margin-top:10px">${r.aprobado ? 'APTO' : 'NO APTO'}</h1>
        <p class="lead" style="margin-top:8px">${r.aprobado ? (r.errores === 0 ? 'Examen perfecto, sin un solo fallo.' : `Has aprobado con ${r.errores} ${r.errores === 1 ? 'fallo' : 'fallos'}. El límite son ${E.maxFallos}.`) : `Has cometido ${r.errores} fallos y el máximo permitido es ${E.maxFallos}.${r.porTiempo ? ' El tiempo se agotó.' : ''}`}</p>
        <div class="result-kpis">
          <div><b class="num">${r.total - r.errores}/${r.total}</b><span>aciertos</span></div>
          <div><b class="num">${r.errores}</b><span>fallos${r.sinResponder ? ` (${r.sinResponder} sin responder)` : ''}</span></div>
          <div><b class="num">${min}:${String(seg).padStart(2, '0')}</b><span>tiempo usado</span></div>
          <div><b class="num">${pct((r.total - r.errores) / r.total)}</b><span>acierto</span></div>
        </div>
      </section>
      <div class="grid g-2">
        <div class="card stack" style="--gap:14px">
          <h2 class="h-m">Recomendaciones</h2>
          ${temasFallo.length ? `<p class="muted small">Tus fallos se concentran en:</p><div class="list">${temasFallo.slice(0, 4).map(([t, v]) => `<button class="li" style="width:100%;background:none;border:0;border-bottom:1px solid var(--line);text-align:left" data-go='${JSON.stringify({ modo: 'tema', tema: t })}'>${temaIco(t, 38)}<div style="flex:1"><b>${TEMA[t].nombre}</b><div class="small muted">${v.f} de ${v.n} falladas en este simulacro</div></div><span class="btn btn-soft btn-sm">Practicar</span></button>`).join('')}</div>` : '<p class="muted">Sin fallos: lo mejor ahora es seguir haciendo simulacros de vez en cuando para mantener el nivel.</p>'}
          <div class="row wrap-r"><button class="btn btn-primary" data-otro>${ico('repaso')}Otro simulacro</button>${r.errores && !r.libre ? `<button class="btn btn-soft" data-go='${JSON.stringify({ modo: 'falladas' })}'>Repasar falladas</button>` : ''}</div>
        </div>
        <div class="card"><h2 class="h-m" style="margin-bottom:12px">Mapa del examen</h2>
          <div class="navq-grid" style="grid-template-columns:repeat(10,1fr)">${r.preguntas.map((p, k) => `<a href="#q${k + 1}" class="nq num ${p.ok ? 'r-ok' : 'r-bad'}" style="text-decoration:none">${k + 1}</a>`).join('')}</div>
          <p class="small muted" style="margin-top:14px">Toca un número para ir a su corrección.</p>
        </div>
      </div>
      <section class="card">
        <div class="section-head"><h2 class="h-m">Revisión completa</h2><div class="seg" role="group"><button data-filtro="fallos" aria-pressed="true">Solo fallos</button><button data-filtro="todas" aria-pressed="false">Todas</button></div></div>
        <div id="revision">${r.preguntas.map((p, k) => M.POR_ID[p.id] ? `<div id="q${k + 1}" data-ok="${p.ok ? 1 : 0}" ${p.ok ? 'hidden' : ''}>${itemRevision(M.POR_ID[p.id], p.r, k + 1)}</div>` : '').join('')}</div>
        ${r.errores ? '' : '<p class="muted">No hay fallos que revisar. Pulsa «Todas» para ver la corrección completa.</p>'}
      </section>
    </div>`;
  };
  V.resultado.montar = function (arg) {
    $$('[data-filtro]').forEach(b => b.addEventListener('click', () => {
      $$('[data-filtro]').forEach(x => x.setAttribute('aria-pressed', x === b));
      $$('#revision [data-ok]').forEach(d => d.hidden = b.dataset.filtro === 'fallos' && d.dataset.ok === '1');
    }));
    $$('a.nq').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); const el = document.getElementById(a.getAttribute('href').slice(1)); if (el) { el.hidden = false; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
    const o = $('[data-otro]'); if (o) o.addEventListener('click', () => { M.crearExamen({ libre: arg === 'libre' }); location.hash = '#/examen/en-curso'; });
  };

  /* ---------- Estadísticas ---------- */
  function graficoDias(n = 14) {
    const dias = Array.from({ length: n }, (_, i) => { const d = M.diaMas(M.hoyStr(), i - n + 1); return { d, ...(M.S.dias[d] || { n: 0, ok: 0 }) }; });
    const max = Math.max(10, ...dias.map(d => d.n));
    const W = 560, H = 180, bw = W / n;
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Preguntas respondidas en los últimos ${n} días">
      ${[0, .5, 1].map(f => `<line class="grid-l" x1="0" x2="${W}" y1="${H - f * H}" y2="${H - f * H}"/><text x="${W}" y="${H - f * H - 4}" text-anchor="end">${Math.round(max * f)}</text>`).join('')}
      ${dias.map((d, i) => { const h = d.n / max * H, ho = d.ok / max * H; const [y, m, dd] = d.d.split('-'); return `<g><title>${dd}/${m}: ${d.n} respondidas, ${d.ok} correctas</title><rect class="b-all" x="${i * bw + 4}" y="${H - h}" width="${bw - 8}" height="${h}" rx="5"/><rect class="b-ok" x="${i * bw + 4}" y="${H - ho}" width="${bw - 8}" height="${ho}" rx="5"/><text x="${i * bw + bw / 2}" y="${H + 17}" text-anchor="middle">${+dd}</text></g>`; }).join('')}
    </svg>`;
  }
  function graficoSemanas(k = 8) {
    const sem = Array.from({ length: k }, (_, i) => {
      let n = 0, ok = 0;
      for (let j = 0; j < 7; j++) { const d = M.S.dias[M.diaMas(M.hoyStr(), -(k - 1 - i) * 7 - j)]; if (d) { n += d.n; ok += d.ok; } }
      return { n, ok, p: n ? ok / n : null };
    });
    const W = 560, H = 160;
    const pts = sem.map((s, i) => s.p === null ? null : [i * (W - 30) / (k - 1) + 15, H - s.p * H]);
    const path = pts.filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Porcentaje de acierto por semana">
      ${[.5, .75, 1].map(f => `<line class="grid-l" x1="0" x2="${W}" y1="${H - f * H}" y2="${H - f * H}"/><text x="0" y="${H - f * H - 4}">${Math.round(f * 100)}%</text>`).join('')}
      ${path ? `<path class="ln" d="${path}"/>` : ''}
      ${pts.map((p, i) => p ? `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="5"><title>Semana ${i - k + 1 || 'actual'}: ${pct(sem[i].p)} (${sem[i].n} respuestas)</title></circle>` : '').join('')}
      ${sem.map((s, i) => `<text x="${i * (W - 30) / (k - 1) + 15}" y="${H + 17}" text-anchor="middle">${i === k - 1 ? 'Esta' : 'S' + (i - k + 1)}</text>`).join('')}
    </svg>`;
  }
  function graficoExamenes(ex) {
    const W = 560, H = 150, max = Math.max(8, ...ex.map(e => e.errores)), bw = W / Math.max(ex.length, 6);
    const y3 = H - 3 / max * H;
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Fallos por simulacro">
      <line class="limit" x1="0" x2="${W}" y1="${y3}" y2="${y3}"/><text x="${W}" y="${y3 - 5}" text-anchor="end" style="fill:var(--bad)">límite: 3 fallos</text>
      ${ex.map((e, i) => { const h = Math.max(4, e.errores / max * H); return `<g><title>${new Date(e.fecha).toLocaleDateString('es-ES')}: ${e.errores} fallos</title><rect class="${e.aprobado ? 'pass' : 'fail'}" x="${i * bw + 6}" y="${H - h}" width="${bw - 12}" height="${h}" rx="5"/><text x="${i * bw + bw / 2}" y="${H + 16}" text-anchor="middle">${e.errores}</text></g>`; }).join('')}
    </svg>`;
  }
  V.estadisticas = function () {
    const tot = M.totales(), prep = M.preparacion(), ex = M.S.examenes;
    const temas = TEMAS.map(t => ({ t, s: M.precisionTema(t.id) }));
    const dominados = temas.filter(x => x.s.estado === 'dominado').length;
    const pendientes = temas.filter(x => x.s.estado !== 'dominado').length;
    const mejor = ex.length ? Math.min(...ex.map(e => e.errores)) : null;
    const heat = Array.from({ length: 70 }, (_, i) => { const d = M.diaMas(M.hoyStr(), i - 69); const x = M.S.dias[d]; const n = x ? x.n : 0; return { d, l: n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4, hoy: i === 69, n }; });
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Progreso</span><h1 class="h-l">Tus estadísticas</h1><p class="muted">Todo se calcula con tus respuestas reales guardadas en este dispositivo.</p></div></div>
      <div class="grid g-4 reveal">
        <div class="card stat"><span class="stat-label">${ico('capas')}Respondidas</span><span class="stat-value num">${nf.format(tot.n)}</span><span class="stat-foot">${tot.vistas} preguntas distintas de ${tot.banco}</span></div>
        <div class="card stat"><span class="stat-label">${ico('check')}Acierto</span><span class="stat-value num">${tot.n ? pct(tot.pct, 1) : '—'}</span><span class="stat-foot">${nf.format(tot.ok)} correctas</span></div>
        <div class="card stat"><span class="stat-label">${ico('llama')}Racha</span><span class="stat-value num">${M.racha()} ${M.racha() === 1 ? "día" : "días"}</span><span class="stat-foot">Mejor: ${M.mejorRacha()} ${M.mejorRacha() === 1 ? 'día' : 'días'}</span></div>
        <div class="card stat"><span class="stat-label">${ico('medalla')}Mejor simulacro</span><span class="stat-value num">${mejor === null ? '—' : mejor + (mejor === 1 ? ' fallo' : ' fallos')}</span><span class="stat-foot">${ex.length} hechos · ${ex.filter(e => e.aprobado).length} aptos</span></div>
      </div>

      <div class="card pad-l">
        <div class="grid g-2" style="align-items:center;gap:28px">
          <div class="stack" style="--gap:12px">
            <span class="eyebrow">Probabilidad estimada de aprobar</span>
            <div class="stat-value num" style="font-size:52px">${prep.pocas ? '—' : Math.round(prep.p * 100) + '%'}</div>
            ${barra(prep.pocas ? 0 : prep.p, prep.p >= .8 ? 'ok' : '')}
            <p class="small muted">${prep.pocas ? `Necesitamos al menos 40 preguntas respondidas para estimarla (llevas ${prep.respondidas}).` : `Basada en tu acierto reciente (${pct(prep.acierto)} en tus últimas ${prep.respondidas} preguntas), la cobertura del temario (${pct(prep.cobertura)})${prep.simulacros >= 3 ? ` y tus últimos ${prep.simulacros} simulacros` : ''}.`}</p>
          </div>
          <div class="note">${ico('info')}<div><b>Es una estimación, no una garantía.</b> Calculamos la probabilidad de cometer 3 fallos o menos en 30 preguntas suponiendo que el examen se parece a tu práctica (modelo binomial), y la ajustamos por los temas que aún no has tocado y por tus simulacros reales. El examen oficial puede incluir preguntas que no están en este banco.</div></div>
        </div>
      </div>

      <div class="grid g-2">
        <div class="card"><div class="section-head"><h2 class="h-m">Últimos 14 días</h2><span class="small muted"><span style="color:var(--brand)">■</span> correctas · <span style="color:color-mix(in oklab, var(--brand) 25%, var(--bg))">■</span> total</span></div>${graficoDias()}</div>
        <div class="card"><div class="section-head"><h2 class="h-m">Acierto semanal</h2><span class="small muted">8 semanas</span></div>${graficoSemanas()}</div>
      </div>

      <div class="grid g-2">
        <div class="card"><div class="section-head"><h2 class="h-m">Constancia</h2><span class="small muted">10 semanas</span></div>
          <div class="heat">${heat.map(h => `<i data-l="${h.l}" class="${h.hoy ? 'today' : ''}" title="${h.d}: ${h.n} preguntas"></i>`).join('')}</div>
        </div>
        <div class="card"><div class="section-head"><h2 class="h-m">Simulacros</h2><a class="small" href="#/examen">Hacer uno</a></div>${ex.length ? graficoExamenes(ex.slice(-12)) : '<p class="muted small">Aún no hay simulacros.</p>'}</div>
      </div>

      <div class="card">
        <div class="section-head"><h2 class="h-m">Por temas</h2><span class="small muted"><b style="color:var(--ok)">${dominados}</b> dominados · <b>${pendientes}</b> pendientes</span></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Tema</th><th>Vistas</th><th>Acierto</th><th>Errores</th><th style="min-width:140px">Dominio</th><th></th></tr></thead>
          <tbody>${temas.sort((a, b) => b.s.dominio - a.s.dominio).map(({ t, s }) => `<tr>
            <td><div class="row" style="--gap:10px">${temaIco(t.id, 32)}<b style="font-size:14px">${t.nombre}</b></div></td>
            <td class="num">${s.vistas}/${s.total}</td><td class="num">${s.n ? pct(s.pct) : '—'}</td><td class="num">${s.n - s.ok}</td>
            <td>${barra(s.dominio, s.estado === 'dominado' ? 'ok' : '')}</td><td>${estadoTema(s)}</td></tr>`).join('')}</tbody>
        </table></div>
        <p class="tiny muted" style="margin-top:12px">«Dominado»: has visto al menos el ${'60'}% de las preguntas del tema (máx. 20) con un acierto suavizado ≥ 90%. «Reforzar»: acierto suavizado por debajo del 75%.</p>
      </div>
      ${pie()}
    </div>`;
  };

  /* ---------- Logros ---------- */
  V.logros = function () {
    const nv = M.nivel(), got = Object.keys(M.S.logros).length;
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Logros</span><h1 class="h-l">Nivel ${nv.n} · ${got} de ${M.LOGROS.length} logros</h1><p class="muted">Ganas XP con cada respuesta (+10 si aciertas, +2 si fallas), al cumplir el objetivo diario (+30), con el reto del día (+50) y con los simulacros (+50, +100 si apruebas).</p></div></div>
      <div class="card"><div class="level"><span class="level-badge num">${nv.n}</span><div class="stack" style="--gap:8px"><div class="row" style="justify-content:space-between"><b>${nf.format(nv.xp)} XP</b><span class="small muted">${nf.format(nv.hasta - nv.xp)} para el nivel ${nv.n + 1}</span></div>${barra(nv.pct)}</div></div></div>
      <section class="card garaje"><div class="section-head"><h2 class="h-m">${ico('estrella')} Garaje de Semi</h2><span class="small muted">Sube de nivel para desbloquear complementos</span></div>
        <div class="garaje-grid">${ACCESORIOS.map(a => { const libre = nv.n >= a.nivel, puesto = (M.S.ajustes.accesorio || '') === a.id; return `<button class="garaje-item ${puesto ? 'puesto' : ''}" ${libre ? `data-acc="${a.id}"` : 'disabled'} aria-pressed="${puesto}">${mascota(puesto ? 'celebra' : 'feliz', 64, a.id)}<b>${a.nombre}</b><span class="tiny ${libre ? 'muted' : ''}">${libre ? (puesto ? 'Puesto' : 'Desbloqueado') : `${ico('candado', 'style="width:12px;height:12px;display:inline;vertical-align:-2px"')} Nivel ${a.nivel}`}</span></button>`; }).join('')}</div>
      </section>
      <div class="grid g-3 reveal">${M.LOGROS.map(l => { const t = M.S.logros[l.id]; return `<div class="card ach ${t ? 'got' : ''}"><span class="ach-ico">${ico(l.ico)}</span><div><b>${l.nombre}</b><div class="small muted">${l.desc}</div>${t ? `<div class="tiny" style="color:var(--ok);margin-top:4px;font-weight:700">Conseguido el ${new Date(t).toLocaleDateString('es-ES')}</div>` : ''}</div></div>`; }).join('')}</div>
      ${pie()}
    </div>`;
  };

  V.logros.montar = () => $$('[data-acc]').forEach(b => b.addEventListener('click', () => { M.S.ajustes.accesorio = b.dataset.acc; M.guardar(); sonar('combo'); render(); }));

  /* ---------- Más (móvil) ---------- */
  V.mas = function () {
    const items = [['#/aprender', 'play', 'Aprender y vídeo-lecciones', 'Lecciones narradas, guías visuales y vídeos oficiales'], ['#/estadisticas', 'progreso', 'Estadísticas', 'Evolución, temas y probabilidad de aprobar'], ['#/logros', 'trofeo', 'Logros y nivel', 'Tu progreso gamificado'], ['#/fuentes', 'escudo', 'Fuentes y fiabilidad', 'De dónde sale cada pregunta'], ['#/ajustes', 'ajustes', 'Ajustes', 'Nombre, objetivo, copia de seguridad']];
    return `<div class="view stack" style="--gap:12px"><div class="page-head"><h1 class="h-l">Más</h1></div>${esLocal() ? '' : `<button class="card li" data-compartir-app style="width:100%;text-align:left;padding:16px;border:1px solid var(--line);cursor:pointer;font:inherit;color:inherit"><span class="li-ico" style="background:color-mix(in oklab, #db2777 12%, transparent);color:#db2777">${ico('enlace')}</span><div style="flex:1"><b>Compartir con amigos</b><div class="small muted">Envíales la app por WhatsApp o donde quieras</div></div></button>`}${items.map(([h, i, t, d]) => `<a class="card li" href="${h}" style="text-decoration:none;color:inherit;padding:16px"><span class="li-ico" style="background:var(--brand-soft);color:var(--brand)">${ico(i)}</span><div style="flex:1"><b>${t}</b><div class="small muted">${d}</div></div>${ico('flecha', 'style="width:18px;height:18px;color:var(--muted)"')}</a>`).join('')}${pie()}</div>`;
  };

  V.mas.montar = () => { const b = $('[data-compartir-app]'); if (b) b.addEventListener('click', compartirApp); };

  /* ---------- Fuentes ---------- */
  V.fuentes = function () {
    if (PUB) return fuentesPublica();
    const meta = window.DGT_META || {};
    const ofi = M.PREGUNTAS.filter(q => q.src === 'oficial');
    const deB = ofi.filter(q => q.bat.includes('B')).length, deAM = ofi.filter(q => q.bat.includes('AM') && !q.bat.includes('B')).length;
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Fuentes y fiabilidad</span><h1 class="h-l">De dónde sale cada pregunta</h1><p class="muted">La prioridad es que el contenido sea fiable y corresponda a la normativa vigente.</p></div></div>
      <div class="note">${ico('info')}<div><b>Plataforma independiente.</b> Luz Verde no es un servicio de la Dirección General de Tráfico ni está vinculada a ella. No se usa el logotipo de la DGT porque su aviso legal protege sus signos distintivos y su uso podría hacer creer que esta web es oficial.</div></div>
      <div class="grid g-3">
        <div class="card stat"><span class="stat-label">${ico('escudo')}Oficiales DGT</span><span class="stat-value num">${ofi.length}</span><span class="stat-foot">${deB} del test de Permiso B · ${deAM} del test AM · ${ofi.length - deB - deAM} de los test de recuperación de puntos</span></div>
        <div class="card stat"><span class="stat-label">${ico('norma')}Práctica (no oficiales)</span><span class="stat-value num">${M.PREGUNTAS.length - ofi.length}</span><span class="stat-foot">Redactadas a partir del Reglamento General de Circulación y normativa vigente</span></div>
        <div class="card stat"><span class="stat-label">${ico('calendario')}Última verificación</span><span class="stat-value num" style="font-size:24px">${meta.oficiales ? new Date(meta.oficiales.extraido).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span><span class="stat-foot">Extracción y revisión del banco</span></div>
      </div>
      <div class="card prose" style="max-width:none">
        <h2 class="h-m">Preguntas oficiales</h2>
        <p>Proceden de los <a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/obtener-un-nuevo-permiso-de-conducir/requisitos-preparacion-y-presentacion-a-examen/" target="_blank" rel="noopener">«Test de examen» gratuitos de la DGT</a>, que según la propia DGT contienen «preguntas reales» con el mismo formato del examen. Se marcan con la etiqueta <span class="chip chip-ofi">${ico('escudo')}Oficial DGT</span> e indican de qué batería salen: <b>Permiso B</b> (prueba común), <b>AM</b> o <b>recuperación de puntos</b> (preguntas de seguridad vial y factor humano, también presentes en el temario del B).</p>
        <p>La respuesta correcta es la que marca el propio simulador de la DGT al corregir; no se ha modificado. Las <b>explicaciones, referencias y trucos</b> son de elaboración propia para ayudarte a entender cada respuesta.</p>
        <p class="note warn" style="margin:0">${ico('alerta')}<span>El aviso legal de dgt.es solo permite reproducir sus contenidos para <b>uso personal y privado</b>. Por eso esta plataforma está pensada para tu estudio personal y no debe publicarse ni distribuirse con estas preguntas e imágenes.</span></p>
        <h2 class="h-m">Preguntas de práctica</h2>
        <p>Cuando el banco oficial no cubre un tema con suficiente profundidad (por ejemplo, novedades como la baliza V-16 obligatoria desde el 1 de enero de 2026), se añaden preguntas propias marcadas como <span class="chip chip-pra">${ico('norma')}Práctica · no oficial</span>, siempre con la norma de la que salen. Nunca se presentan como oficiales.</p>
        <h2 class="h-m">Cambios normativos recientes</h2>
        <p>El 1 de octubre de 2026 entró en vigor la reforma del Reglamento General de Circulación (RD 518/2026): adelantamiento a ciclistas reduciendo 20 km/h, carril de emergencia en retenciones, prohibición de adelantar con nieve en autovías, casco para usuarios de patinete y ciclistas en interurbanas, guantes para motoristas, entre otros. El banco oficial que publica la DGT puede tardar en reflejar estos cambios: las preguntas de práctica sobre la reforma se han redactado a partir de la <a href="https://www.dgt.es/comunicacion/notas-de-prensa/20260930-reforma-del-reglamento-de-circulacion-usuarios-vulnerables/" target="_blank" rel="noopener">nota oficial de la DGT</a> y del BOE. Si alguna pregunta oficial quedase en contradicción con la norma nueva, se retirará en <code>contenido/revisiones.json</code>.</p>
        <h2 class="h-m">Formato del examen</h2>
        <p>30 preguntas con 3 opciones, 30 minutos y un máximo de 3 fallos para el permiso B (prueba de control de conocimientos). Comprobado en noviembre de 2026.</p>
        <h2 class="h-m">Normativa de referencia</h2>
        <ul>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noopener">Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial (RDL 6/2015)</a> — «LSV».</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514" target="_blank" rel="noopener">Reglamento General de Circulación (RD 1428/2003)</a> — «RGC», incluida la <a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2026-13889" target="_blank" rel="noopener">reforma del RD 518/2026</a> sobre usuarios vulnerables, en vigor desde el 1 de octubre de 2026.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noopener">Reglamento General de Conductores (RD 818/2009)</a> — «RGCond».</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826" target="_blank" rel="noopener">Reglamento General de Vehículos (RD 2822/1998)</a> — «RGV».</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2021-4194" target="_blank" rel="noopener">RD 159/2021, servicios de auxilio en las vías públicas (baliza V-16)</a>.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2024-17780" target="_blank" rel="noopener">Orden INT/914/2024, cursos de sensibilización y reeducación vial</a>.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noopener">Código Penal, delitos contra la seguridad vial (arts. 379-385)</a>.</li>
        </ul>
        <h2 class="h-m">Mantenimiento del contenido</h2>
        <p>El banco se actualiza con herramientas incluidas en la carpeta <code>tools/</code>: <code>extraer-oficiales.js</code> vuelve a leer los test de la DGT (y conserva lo ya extraído), <code>pendientes.js</code> lista las preguntas nuevas sin explicación y <code>construir-datos.js</code> regenera los datos y avisa de cualquier incoherencia. Si una pregunta queda desactualizada se retira o se marca en <code>contenido/revisiones.json</code> y deja de aparecer en la práctica y en los simulacros. Las instrucciones están en <code>LEEME.md</code>.</p>
      </div>
      ${pie()}
    </div>`;
  };

  function fuentesPublica() {
    const meta = window.DGT_META || {};
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Fuentes y fiabilidad</span><h1 class="h-l">De dónde sale el contenido</h1><p class="muted">La prioridad es que todo corresponda a la normativa vigente.</p></div></div>
      <div class="note">${ico('info')}<div><b>Plataforma independiente y gratuita.</b> Luz Verde no es un servicio de la Dirección General de Tráfico ni está vinculada a ella.</div></div>
      <div class="grid g-3">
        <div class="card stat"><span class="stat-label">${ico('norma')}Preguntas</span><span class="stat-value num">${M.PREGUNTAS.length}</span><span class="stat-foot">De elaboración propia, con explicación y norma de referencia</span></div>
        <div class="card stat"><span class="stat-label">${ico('play')}Vídeo-lecciones</span><span class="stat-value num">${window.Video ? Video.LECCIONES.length : 0}</span><span class="stat-foot">Propias, narradas y animadas</span></div>
        <div class="card stat"><span class="stat-label">${ico('calendario')}Última revisión</span><span class="stat-value num" style="font-size:24px">${meta.generado ? new Date(meta.generado + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span><span class="stat-foot">Se actualiza sola al abrirla con conexión</span></div>
      </div>
      <div class="card prose" style="max-width:none">
        <h2 class="h-m">Las preguntas</h2>
        <p>Todas las preguntas están redactadas para esta plataforma a partir del Reglamento General de Circulación y el resto de normativa vigente, con el mismo formato del examen (tres opciones, una correcta). <b>No son preguntas oficiales del examen de la DGT.</b> Para practicar también con preguntas oficiales, usa los <a href="https://www.dgt.es/.galleries/enlaces/sede/permisos/test-examen.html" target="_blank" rel="noopener">test de examen gratuitos de la DGT</a>.</p>
        <h2 class="h-m">Cambios normativos recientes</h2>
        <p>Incluye la baliza V-16 obligatoria desde el 1 de enero de 2026 y la reforma del Reglamento General de Circulación (RD 518/2026) en vigor desde el 1 de octubre de 2026, según la <a href="https://www.dgt.es/comunicacion/notas-de-prensa/20260930-reforma-del-reglamento-de-circulacion-usuarios-vulnerables/" target="_blank" rel="noopener">nota oficial de la DGT</a> y el BOE.</p>
        <h2 class="h-m">Formato del examen</h2>
        <p>30 preguntas con 3 opciones, 30 minutos y un máximo de 3 fallos para el permiso B. Comprobado en noviembre de 2026.</p>
        <h2 class="h-m">Normativa de referencia</h2>
        <ul>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noopener">Ley sobre Tráfico y Seguridad Vial (RDL 6/2015)</a> — «LSV».</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514" target="_blank" rel="noopener">Reglamento General de Circulación (RD 1428/2003)</a> — «RGC», con la <a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2026-13889" target="_blank" rel="noopener">reforma del RD 518/2026</a>.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noopener">Reglamento General de Conductores (RD 818/2009)</a>.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826" target="_blank" rel="noopener">Reglamento General de Vehículos (RD 2822/1998)</a>.</li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2021-4194" target="_blank" rel="noopener">RD 159/2021 (baliza V-16)</a> · <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noopener">Código Penal (arts. 379-385)</a>.</li>
        </ul>
        <p>Los vídeos oficiales enlazados pertenecen al canal de YouTube de la DGT. Las señales son reproducciones de dominio público.</p>
      </div>
      ${pie()}
    </div>`;
  }

  /* ---------- Ajustes ---------- */
  V.ajustes = function () {
    const A = M.S.ajustes;
    return `
    <div class="view stack" style="--gap:22px">
      <div class="page-head"><div class="stack"><span class="eyebrow">Ajustes</span><h1 class="h-l">Tu plataforma</h1></div></div>
      ${M.almacenOk() ? '' : `<div class="note bad">${ico('alerta')}<div><b>El navegador no permite guardar datos.</b> Tu progreso se perderá al cerrar la página (por ejemplo, en modo incógnito). Usa la copia de seguridad para no perderlo.</div></div>`}
      <div class="grid g-2">
        <div class="card stack" style="--gap:18px">
          <div class="field"><label for="nombre">¿Cómo te llamas?</label><input class="input" id="nombre" maxlength="30" value="${esc(M.S.nombre)}" placeholder="Para saludarte en el inicio" autocomplete="given-name"></div>
          <div class="field"><label>Objetivo diario</label><div class="seg" role="group" aria-label="Objetivo diario">${[10, 20, 40, 60].map(n => `<button data-meta="${n}" aria-pressed="${M.S.metaDiaria === n}">${n} preguntas</button>`).join('')}</div></div>
          <div class="field"><label>Apariencia</label><div class="seg" role="group" aria-label="Apariencia">${[['auto', 'Automática'], ['light', 'Clara'], ['dark', 'Oscura']].map(([v, t]) => `<button data-tema="${v}" aria-pressed="${A.tema === v}">${t}</button>`).join('')}</div></div>
          <div class="field"><label for="fexa">Fecha de tu examen</label><div class="row" style="--gap:8px"><input class="input" type="date" id="fexa" value="${esc(M.S.fechaExamen)}" min="${M.hoyStr()}" style="flex:1">${M.S.fechaExamen ? '<button class="btn btn-ghost btn-sm" data-fexa-borrar>Quitar</button>' : ''}</div><span class="tiny muted">Sirve para la cuenta atrás y el ritmo diario recomendado.</span></div>
          ${window.speechSynthesis ? `<div class="field"><label for="ajvoz">Voz de las vídeo-lecciones</label><div class="row" style="--gap:8px"><select class="input" id="ajvoz" data-voz-sel style="flex:1;min-width:0">${Video.opcionesVoz()}</select><button class="btn btn-ghost btn-sm" data-probar-voz>${ico('volumen')}Probar</button></div><span class="tiny muted">Gratis, del propio navegador. Las más realistas: «Natural» en Microsoft Edge y las de Google en Chrome y Android.</span></div>` : ''}
        </div>
        <div class="card">
          ${PUB ? '' : `<label class="switch"><div><b>Incluir preguntas de recuperación de puntos en los simulacros</b><div class="small muted">Son oficiales de la DGT y tratan seguridad vial y factor humano, pero no salen del test del permiso B.</div></div><input type="checkbox" class="toggle" data-aj="incluirPuntos" ${A.incluirPuntos ? 'checked' : ''}></label>
          <label class="switch"><div><b>Solo preguntas oficiales</b><div class="small muted">Oculta las preguntas de práctica propias en todos los modos.</div></div><input type="checkbox" class="toggle" data-aj="soloOficiales" ${A.soloOficiales ? 'checked' : ''}></label>`}
          <label class="switch"><div><b>Sonidos</b><div class="small muted">Tonos breves al acertar, fallar, encadenar aciertos y subir de nivel.</div></div><input type="checkbox" class="toggle" data-aj="sonido" ${A.sonido ? 'checked' : ''}></label>
        </div>
      </div>
      ${bloqueApp()}
      <div class="card stack" style="--gap:14px">
        <h2 class="h-m">Tus datos</h2>
        <p class="muted small">El progreso se guarda automáticamente en este navegador (almacenamiento local), sin cuentas ni servidores. Para pasarlo a otro dispositivo o protegerlo, descarga una copia de seguridad.</p>
        <div class="row wrap-r">
          <button class="btn btn-soft" data-exportar>${ico('descargar')}Descargar copia de seguridad</button>
          <label class="btn btn-ghost">${ico('subir')}Restaurar copia<input type="file" accept="application/json,.json" data-importar hidden></label>
          <span class="spacer"></span>
          <button class="btn btn-danger" data-reset>${ico('papelera')}Borrar todo el progreso</button>
        </div>
      </div>
      ${pie()}
    </div>`;
  };
  V.ajustes.montar = function () {
    const n = $('#nombre'); n.addEventListener('change', () => { M.S.nombre = n.value.trim(); M.guardar(); toast('Nombre guardado', '', 'usuario'); });
    $$('[data-meta]').forEach(b => b.addEventListener('click', () => { M.S.metaDiaria = +b.dataset.meta; M.guardar(); render(); }));
    $$('[data-tema]').forEach(b => b.addEventListener('click', () => { M.S.ajustes.tema = b.dataset.tema; M.guardar(); aplicarTema(); render(); }));
    $$('[data-aj]').forEach(c => c.addEventListener('change', () => { M.S.ajustes[c.dataset.aj] = c.checked; M.guardar(); if (c.dataset.aj === 'sonido' && c.checked) sonar('ok'); }));
    const fx = $('#fexa'); fx.addEventListener('change', () => { M.S.fechaExamen = fx.value; M.guardar(); toast(fx.value ? 'Fecha del examen guardada' : 'Fecha quitada', '', 'calendario'); render(); });
    const fb = $('[data-fexa-borrar]'); if (fb) fb.addEventListener('click', () => { M.S.fechaExamen = ''; M.guardar(); render(); });
    const vz = $('#ajvoz'); if (vz) vz.addEventListener('change', () => { M.S.ajustes.voz = vz.value; M.guardar(); });
    const pv = $('[data-probar-voz]'); if (pv) pv.addEventListener('click', () => {
      const s = window.speechSynthesis; s.cancel();
      const u = new SpeechSynthesisUtterance('Hola, soy Semi. Así sonarán tus vídeo-lecciones. ¡A por el aprobado!');
      const v = Video.mejorVoz(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-ES';
      u.rate = M.S.ajustes.vozVel || 1; s.speak(u);
    });
    montarApp();
    $('[data-exportar]').addEventListener('click', () => {
      const blob = new Blob([M.exportar()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `luzverde-progreso-${M.hoyStr()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('[data-importar]').addEventListener('change', async ev => {
      const f = ev.target.files[0]; if (!f) return;
      if (!(await modal({ titulo: '¿Restaurar esta copia?', texto: 'Sustituirá todo tu progreso actual por el del archivo.', ok: 'Restaurar' }))) return;
      try { M.importar(await f.text()); aplicarTema(); toast('Copia restaurada', 'Tu progreso se ha recuperado', 'check'); render(); }
      catch (e) { modal({ titulo: 'No se pudo restaurar', texto: esc(e.message), cancelar: null }); }
    });
    $('[data-reset]').addEventListener('click', async () => {
      if (await modal({ titulo: '¿Borrar todo el progreso?', texto: 'Se eliminarán respuestas, estadísticas, simulacros y logros de este navegador. No se puede deshacer (salvo que tengas una copia de seguridad).', ok: 'Borrar todo', peligro: true })) { M.reiniciar(); aplicarTema(); render(); toast('Progreso borrado', '', 'papelera'); }
    });
  };

  /* ---------- Compartir y retos entre amigos ---------- */
  const baseURL = () => location.origin + location.pathname.replace(/index\.html$/, '');
  const esLocal = () => location.protocol === 'file:' || /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  async function compartir({ title, text, url }) {
    if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast('Enlace copiado', 'Pégalo en WhatsApp o donde quieras', 'enlace'); }
    catch (e) { modal({ titulo: 'Copia este enlace', texto: `<input class="input" value="${esc(url)}" readonly onclick="this.select()">`, cancelar: null }); }
  }
  function compartirApp() { compartir({ title: 'Luz Verde · Teórico B', text: 'Estoy preparando el teórico del carnet con esta app gratis. ¡Pruébala!', url: baseURL() }); }

  V.duelo = function (arg = '') {
    const [semilla, nombre, p] = arg.split('~');
    if (!/^[a-z0-9]{4,12}$/i.test(semilla || '')) return `<div class="view empty"><span class="ico">${ico('alerta')}</span><p>Este enlace de reto no es válido.</p><a class="btn btn-soft" href="#/practicar">Ir a practicar</a></div>`;
    const rival = p !== undefined && /^\d{1,2}$/.test(p) ? { nombre: decodeURIComponent(nombre || '').slice(0, 20), p: Math.min(10, +p) } : null;
    return `<div class="view stack" style="--gap:22px;max-width:640px;margin-inline:auto">
      <section class="card pad-l" style="text-align:center;display:grid;gap:14px;justify-items:center">
        ${mascota(rival ? 'piensa' : 'feliz', 100)}
        <span class="eyebrow" style="color:#db2777">Reto entre amigos</span>
        <h1 class="h-l">${rival ? `${esc(rival.nombre || 'Un amigo')} te reta` : 'Reto nuevo'}</h1>
        <p class="lead">${rival ? `Ha acertado <b>${rival.p} de 10</b> en estas preguntas. ¿Le superas?` : '10 preguntas iguales para todos los que abran el enlace.'}</p>
        <button class="btn btn-primary btn-lg" data-aceptar>${ico('play')}${rival ? 'Aceptar el reto' : 'Empezar'}</button>
        <p class="tiny muted">Cuenta para tu progreso como cualquier práctica.</p>
      </section>
      ${pie()}
    </div>`;
  };
  V.duelo.montar = function (arg = '') {
    const [semilla, nombre, p] = arg.split('~');
    const b = $('[data-aceptar]'); if (!b) return;
    const rival = p !== undefined && /^\d{1,2}$/.test(p) ? { nombre: decodeURIComponent(nombre || '').slice(0, 20), p: Math.min(10, +p) } : null;
    b.addEventListener('click', () => iniciar({ modo: 'duelo', semilla, rival }));
  };

  /* ---------- Aplicación instalable (PWA) y uso sin conexión ---------- */
  let instalarEvt = null;
  const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); instalarEvt = e; if (ruta().v === 'ajustes') render(); });
  window.addEventListener('appinstalled', () => { instalarEvt = null; toast('¡Luz Verde instalada!', 'Ya la tienes como una aplicación más', 'movil'); });
  const CACHE_MEDIA = 'lv-media-v1';
  const urlsMedia = () => [...new Set(M.PREGUNTAS.filter(q => q.img).map(q => q.img))];
  function bloqueApp() {
    const local = location.protocol === 'file:';
    return `<div class="card stack" style="--gap:14px" id="app">
      <div class="row wrap-r" style="--gap:12px">${ico('movil', 'style="width:26px;height:26px;color:var(--brand)"')}<h2 class="h-m">Aplicación</h2>${instalada() ? '<span class="chip chip-ok">Instalada</span>' : ''}<span class="spacer"></span>${esLocal() ? '' : `<button class="btn btn-soft btn-sm" data-compartir-app>${ico('enlace')}Compartir con amigos</button>`}</div>
      <p class="tiny muted" style="margin:0">Versión del contenido: ${esc((window.DGT_META || {}).version || (window.DGT_META || {}).generado || '—')} · se actualiza sola al abrirla con conexión.</p>
      ${local ? `<p class="small">Ahora la estás abriendo como archivo. Para <b>instalarla como aplicación</b> (con su icono, a pantalla completa y sin conexión), haz doble clic en <code>Abrir Luz Verde.cmd</code> dentro de la carpeta del proyecto y pulsa <b>Instalar</b> en la página que se abre.</p>`
        : instalada() ? '<p class="small">Estás usando la aplicación instalada. Funciona sin conexión con todo lo que hayas guardado abajo.</p>'
        : `<p class="small">Instálala para abrirla como una aplicación más, con su propio icono y a pantalla completa.</p>
           <div class="row wrap-r">${instalarEvt ? `<button class="btn btn-primary" data-instalar>${ico('descargar')}Instalar Luz Verde</button>` : '<span class="small muted">Si no ves el botón: en Chrome o Edge pulsa el icono de instalar de la barra de direcciones (o menú ⋮ → «Instalar Luz Verde»). En iPhone: Compartir → «Añadir a pantalla de inicio».</span>'}</div>`}
      ${local ? '' : `<div class="stack" style="--gap:8px"><b class="small">Usar sin conexión</b><p class="small muted">La aplicación ya funciona sin internet. Las imágenes de las preguntas se guardan a medida que las ves; si quieres, guárdalas todas ahora (unos 23 MB).</p>
        <div class="row wrap-r"><button class="btn btn-soft btn-sm" data-offline>${ico('descargar')}Guardar todas las imágenes</button><span class="small muted num" id="offline-estado"></span></div></div>`}
      ${PUB ? `<details class="more"><summary>Instalarla en el móvil</summary><ol class="small" style="padding-left:18px;display:grid;gap:6px;margin:10px 0 0"><li><b>Android (Chrome):</b> abre esta web, menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».</li><li><b>iPhone (Safari):</b> botón Compartir → «Añadir a pantalla de inicio».</li><li>Se actualiza sola: cada vez que la abras con internet recibirás las mejoras.</li></ol></details>` : `<details class="more"><summary>Instalarla en el móvil</summary>
        <ol class="small" style="padding-left:18px;display:grid;gap:6px;margin:10px 0 0">
          <li>Conecta el móvil a la misma wifi que el ordenador.</li>
          <li>En el ordenador, haz doble clic en <code>Abrir en el movil.cmd</code>: aparecerá una dirección como <code>http://192.168.1.20:8081</code>.</li>
          <li>Ábrela en Chrome del móvil. Ya puedes practicar (tu progreso del móvil es independiente del ordenador; pásalo con la copia de seguridad).</li>
          <li>Para <b>instalarla y usarla sin el ordenador</b>, Android exige una conexión segura: en Chrome del móvil abre <code>chrome://flags</code>, busca «Insecure origins treated as secure», escribe esa dirección, actívalo y reinicia Chrome. Después: menú ⋮ → «Instalar aplicación» y, en Ajustes → Aplicación, «Guardar todas las imágenes».</li>
        </ol>
        <p class="tiny muted" style="margin-top:8px">No se publica en internet porque el aviso legal de la DGT solo permite usar sus preguntas e imágenes para estudio personal y privado.</p>
      </details>`}
    </div>`;
  }
  function montarApp() {
    const ca = $('[data-compartir-app]'); if (ca) ca.addEventListener('click', compartirApp);
    const bi = $('[data-instalar]'); if (bi) bi.addEventListener('click', async () => { instalarEvt.prompt(); await instalarEvt.userChoice; instalarEvt = null; render(); });
    const bo = $('[data-offline]'), est = $('#offline-estado');
    if (!bo || !window.caches) { if (bo) bo.disabled = true; return; }
    const urls = urlsMedia();
    caches.open(CACHE_MEDIA).then(c => c.keys()).then(ks => { const n = ks.filter(r => /\/img\/oficiales\//.test(r.url)).length; est.textContent = `${n} de ${urls.length} guardadas`; if (n >= urls.length) bo.disabled = true; });
    bo.addEventListener('click', async () => {
      bo.disabled = true;
      const c = await caches.open(CACHE_MEDIA);
      let hechas = 0, fallos = 0;
      for (let i = 0; i < urls.length; i += 8) {
        await Promise.all(urls.slice(i, i + 8).map(async u => { try { if (!(await c.match(u))) await c.add(u); hechas++; } catch (e) { fallos++; } }));
        if (est.isConnected) est.textContent = `Guardando… ${hechas} de ${urls.length}`;
      }
      if (est.isConnected) est.textContent = fallos ? `${hechas} guardadas · ${fallos} no se pudieron guardar` : `Listo: las ${hechas} imágenes están disponibles sin conexión`;
      toast('Imágenes guardadas', 'Ya puedes practicar sin conexión', 'check');
    });
  }

  function pie() {
    if (PUB) return `<footer class="foot-legal">Luz Verde · Teórico B es una plataforma independiente y gratuita de estudio, sin vinculación con la Dirección General de Tráfico. Todas las preguntas, explicaciones y lecciones son de elaboración propia a partir de la normativa vigente (revisada en noviembre de 2026); no son preguntas oficiales del examen. Comprueba siempre la normativa en <a href="https://www.dgt.es" target="_blank" rel="noopener">dgt.es</a> y <a href="https://www.boe.es" target="_blank" rel="noopener">boe.es</a>.</footer>`;
    return `<footer class="foot-legal">Luz Verde · Teórico B es una plataforma independiente de estudio personal y no está vinculada a la Dirección General de Tráfico. Las preguntas marcadas «Oficial DGT» proceden de los test de examen públicos de la DGT y se usan para estudio personal y privado. Contenido revisado en noviembre de 2026: comprueba siempre la normativa vigente en <a href="https://www.dgt.es" target="_blank" rel="noopener">dgt.es</a> y <a href="https://www.boe.es" target="_blank" rel="noopener">boe.es</a>.</footer>`;
  }

  /* ==========================================================================
     ENRUTADOR
     ========================================================================== */
  function ruta() {
    const h = location.hash.replace(/^#\/?/, '') || 'inicio';
    const [a, b] = h.split('/');
    if (a === 'examen' && b === 'en-curso') return { v: 'examenCurso', nav: 'examen' };
    if (a === 'resultado') return { v: 'resultado', arg: b, nav: 'examen' };
    if (a === 'aprender') return { v: 'aprender', arg: b, nav: innerWidth <= 960 ? 'mas' : 'aprender' };
    if (a === 'senales') return { v: 'senales', nav: innerWidth <= 960 ? 'mas' : 'aprender' };
    if (a === 'duelo') return { v: 'duelo', arg: h.slice(6), nav: 'practicar' };
    if (a === 'video') return { v: 'video', arg: b, nav: innerWidth <= 960 ? 'mas' : 'aprender' };
    if (V[a]) return { v: a, nav: ['estadisticas', 'logros', 'fuentes', 'ajustes', 'mas'].includes(a) && innerWidth <= 960 ? 'mas' : a };
    return { v: 'inicio', nav: 'inicio' };
  }
  let ultimaVista = '';
  function render() {
    const r = ruta();
    if (r.v === 'aprender') V.aprender = window.Aprender.vista;
    if (r.v === 'senales') { V.senales = window.Aprender.vistaSenales; V.senales.montar = window.Aprender.montarSenales; }
    if (r.v === 'video') { V.video = window.Video.vista; V.video.montar = window.Video.montar; }
    document.body.classList.remove('en-sesion');
    if (r.v !== 'examenCurso') clearInterval(reloj);
    // Si el examen en curso caducó mientras la página estaba cerrada, se corrige al volver.
    if (M.S.examenActivo && Date.now() >= M.S.examenActivo.limite) { const res = M.corregirExamen(true); if (res) { location.hash = '#/resultado/' + (res.libre ? 'libre' : res.id); return; } }
    const vista = V[r.v];
    app.innerHTML = vista(r.arg);
    const clave = r.v + (r.arg || '');
    if (clave !== ultimaVista && r.v !== 'sesion' && r.v !== 'examenCurso') window.scrollTo(0, 0);
    ultimaVista = clave;
    $$('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === r.nav ? 'page' : 'false'));
    $$('[data-go]').forEach(b => b.addEventListener('click', () => iniciar(JSON.parse(b.dataset.go))));
    if (vista.montar) vista.montar(r.arg);
    if (r.v === 'aprender' && window.Aprender.montar) window.Aprender.montar(r.arg);
    const titulos = { senales: 'Señales', duelo: 'Reto', camino: 'Camino', video: 'Vídeo-lección', inicio: 'Inicio', practicar: 'Practicar', sesion: 'Practicando', examen: 'Simulacro', examenCurso: 'Simulacro en curso', resultado: 'Resultado', estadisticas: 'Estadísticas', logros: 'Logros', aprender: 'Aprender', fuentes: 'Fuentes', ajustes: 'Ajustes', mas: 'Más' };
    document.title = (titulos[r.v] || 'Inicio') + ' · Luz Verde · Teórico B';
  }

  /* Teclado en sesiones */
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey || $('.overlay, .lightbox')) return;
    const r = ruta();
    const k = e.key.toLowerCase();
    const idx = { a: 0, b: 1, c: 2, 1: 0, 2: 1, 3: 2 }[k];
    if (r.v === 'sesion' && sesion) {
      const q = sesion.i < sesion.ids.length ? M.POR_ID[sesion.ids[sesion.i]] : null;
      if (!q) return;
      if (idx !== undefined && sesion.resp[q.id] === undefined) { e.preventDefault(); contestar(idx); }
      else if ((k === 'enter' || k === 'arrowright') && sesion.resp[q.id] !== undefined) { e.preventDefault(); avanzar(); }
    } else if (r.v === 'examenCurso' && M.S.examenActivo) {
      const ex = M.S.examenActivo;
      if (idx !== undefined) { e.preventDefault(); ex.resp[ex.ids[ex.i]] = idx; M.guardar(); render(); }
      else if (k === 'arrowright' && ex.i < ex.ids.length - 1) { ex.i++; M.guardar(); render(); }
      else if (k === 'arrowleft' && ex.i > 0) { ex.i--; M.guardar(); render(); }
    }
  });

  window.addEventListener('hashchange', render);
  // Otra pestaña guardó progreso: se sincronizan los datos sin interrumpir una sesión en curso.
  window.addEventListener('storage', e => { if (!e.key || !e.key.startsWith('luzverde')) return; M.recargar(); const v = ruta().v; if (v !== 'sesion' && v !== 'examenCurso') render(); });
  window.UI = { render, iniciar, toast, modal, esc, temaIco, barra, pct, pie, lightbox, premiar };
  /* Actualizaciones: el núcleo se pide siempre a la red (con respaldo sin conexión), así que cada vez que se abre
     con internet se carga la última versión. Además se busca una versión nueva al volver a la app y cada 30 minutos;
     si llega mientras está abierta, se ofrece recargar (o se recarga sola si no hay una sesión en curso). */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    let habiaControl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      const buscar = () => reg.update().catch(() => { });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) buscar(); });
      setInterval(buscar, 30 * 60000);
    }).catch(() => { });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!habiaControl) { habiaControl = true; return; }
      const v = ruta().v;
      if (!['sesion', 'examenCurso', 'video'].includes(v) && !document.querySelector('.overlay')) { location.reload(); return; }
      if (document.querySelector('.aviso-version')) return;
      const b = document.createElement('div');
      b.className = 'aviso-version';
      b.innerHTML = `${ico('estrella')}<span><b>Hay una versión nueva de Luz Verde.</b> Se aplicará al terminar, o ahora mismo.</span><button class="btn btn-sm btn-primary">Actualizar</button>`;
      b.querySelector('button').addEventListener('click', () => location.reload());
      document.body.appendChild(b);
      window.addEventListener('hashchange', () => { if (!['sesion', 'examenCurso', 'video'].includes(ruta().v)) location.reload(); });
    });
  }
  render();
  setTimeout(anunciarLogros, 800);
})();
