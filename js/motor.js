/* ==========================================================================
   Motor: persistencia, registro de respuestas, selección de preguntas,
   repetición espaciada, estadísticas, estimación de preparación y logros.
   ========================================================================== */
(function () {
  const CLAVE = 'luzverde.teoricoB.v1';
  const DIA = 86400000;
  const CAJAS = [0, 1, 3, 7, 16, 35]; // días hasta el próximo repaso según la caja (Leitner)
  const EXAMEN = { preguntas: 30, minutos: 30, maxFallos: 3 }; // Permiso B, comprobado en dgt.es (nov. 2026)

  const PREGUNTAS = window.DGT_PREGUNTAS || [];
  const POR_ID = Object.fromEntries(PREGUNTAS.map(q => [q.id, q]));

  /* ---------- Fechas ---------- */
  const hoyStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const diaMas = (s, n) => { const [y, m, d] = s.split('-').map(Number); return hoyStr(new Date(y, m - 1, d + n)); };

  /* ---------- Estado ---------- */
  const nuevo = () => ({
    v: 1, creado: Date.now(), nombre: '', metaDiaria: 20, xp: 0,
    q: {}, dias: {}, examenes: [], logros: {}, marcadas: {}, retos: {},
    camino: {}, misiones: {}, videos: {}, fechaExamen: '', records: {},
    examenActivo: null,
    ajustes: { incluirPuntos: true, soloOficiales: false, tema: 'auto', sonido: true, voz: '', vozVel: 1, accesorio: '' }
  });
  let S;
  let almacenOk = true;
  function cargar() {
    try {
      const raw = localStorage.getItem(CLAVE);
      S = raw ? Object.assign(nuevo(), JSON.parse(raw)) : nuevo();
      S.ajustes = Object.assign(nuevo().ajustes, S.ajustes || {});
    } catch (e) { S = nuevo(); almacenOk = false; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(S)); almacenOk = true; }
    catch (e) { almacenOk = false; }
  }
  cargar();

  /* ---------- Banco filtrado según ajustes ---------- */
  function banco(opts = {}) {
    return PREGUNTAS.filter(q => {
      if (q.rev) return false;
      if (S.ajustes.soloOficiales && q.src !== 'oficial') return false;
      if (opts.examen && !S.ajustes.incluirPuntos && q.src === 'oficial' && !q.bat.includes('B') && !q.bat.includes('AM')) return false;
      return true;
    });
  }

  /* ---------- XP y niveles ---------- */
  // Nivel n requiere 60·n·(n+1) XP acumulados (curva suave).
  const xpNivel = n => 60 * n * (n + 1);
  function nivel(xp = S.xp) {
    let n = 0; while (xp >= xpNivel(n + 1)) n++;
    const base = xpNivel(n), sig = xpNivel(n + 1);
    return { n: n + 1, xp, desde: base, hasta: sig, pct: (xp - base) / (sig - base) };
  }

  /* ---------- Días y rachas ---------- */
  function dia(s = hoyStr()) { return S.dias[s] || (S.dias[s] = { n: 0, ok: 0, xp: 0, meta: false }); }
  // Contadores del día que alimentan las misiones (se crean al usarse para no inflar los datos guardados).
  function contar(k, n = 1) { const d = dia(); d[k] = (d[k] || 0) + n; }
  function racha() {
    let n = 0, d = hoyStr();
    if (!(S.dias[d] && S.dias[d].n > 0)) d = diaMas(d, -1); // la racha sigue viva si hoy aún no se ha estudiado
    while (S.dias[d] && S.dias[d].n > 0) { n++; d = diaMas(d, -1); }
    return n;
  }
  function mejorRacha() {
    const ds = Object.keys(S.dias).filter(k => S.dias[k].n > 0).sort();
    let best = 0, cur = 0, prev = null;
    for (const d of ds) { cur = prev && diaMas(prev, 1) === d ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }
    return best;
  }

  /* ---------- Registrar una respuesta ---------- */
  function responder(id, correcta, contexto = 'practica') {
    const r = S.q[id] || (S.q[id] = { n: 0, ok: 0, f: 0, ult: 0, ultOk: null, caja: 0, prox: 0, seguidas: 0 });
    if (correcta && r.ultOk === false) contar('rec');
    r.n++; r.ult = Date.now(); r.ultOk = correcta;
    if (correcta) { r.ok++; r.seguidas++; r.caja = Math.min(r.caja + 1, CAJAS.length - 1); }
    else { r.f++; r.seguidas = 0; r.caja = 0; }
    r.prox = Date.now() + CAJAS[r.caja] * DIA;
    const d = dia();
    d.n++; if (correcta) d.ok++;
    const xp = correcta ? 10 : 2;
    sumarXP(xp);
    let metaCumplida = false;
    if (!d.meta && d.n >= S.metaDiaria) { d.meta = true; sumarXP(30); metaCumplida = true; }
    guardar();
    return { xp, metaCumplida };
  }
  function sumarXP(n) { S.xp += n; dia().xp += n; }

  /* ---------- Utilidades de selección ---------- */
  function barajar(a, rnd = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function semilla(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  // Muestreo ponderado sin reemplazo (Efraimidis–Spirakis).
  function muestreo(lista, n, peso, rnd = Math.random) {
    return lista.map(x => ({ x, k: Math.pow(rnd(), 1 / Math.max(peso(x), 1e-6)) })).sort((a, b) => b.k - a.k).slice(0, n).map(o => o.x);
  }
  // Peso de estudio: prioriza preguntas no vistas, falladas y de temas débiles.
  // Las preguntas del test del permiso B y las de práctica pesan más que las de recuperación de puntos.
  const pesoOrigen = q => q.bat.includes('B') ? 1.8 : q.src === 'practica' ? 1.5 : q.bat.includes('AM') ? 1.2 : .8;
  function pesoEstudio(q) {
    const r = S.q[q.id];
    const debil = (1 + (1 - precisionTema(q.t).suave) * 1.5) * pesoOrigen(q);
    if (!r) return 3 * debil;
    let w = 1 + r.f * 1.5 - r.seguidas * .4;
    if (r.ultOk === false) w += 3;
    if (Date.now() - r.ult < 10 * 60000) w *= .15; // evita repetir lo que se acaba de ver
    return Math.max(w, .15) * debil;
  }

  /* ---------- Modos ---------- */
  const MODOS = {
    rapido: { nombre: 'Test rápido', n: 10 },
    tema: { nombre: 'Por temas', n: 15 },
    dificiles: { nombre: 'Preguntas difíciles', n: 15 },
    falladas: { nombre: 'Preguntas falladas', n: 20 },
    repaso: { nombre: 'Repaso inteligente', n: 20 },
    reto: { nombre: 'Reto del día', n: 10 },
    marcadas: { nombre: 'Marcadas', n: 30 },
    nuevas: { nombre: 'Preguntas nuevas', n: 15 },
    libre: { nombre: 'Práctica libre', n: 20 },
    contrarreloj: { nombre: 'Contrarreloj', n: 80 },
    duelo: { nombre: 'Reto entre amigos', n: 10 },
    experto: { nombre: 'Nivel experto', n: 20 },
    camino: { nombre: 'Camino', n: 8 }
  };
  function falladasIds() { return Object.keys(S.q).filter(id => POR_ID[id] && S.q[id].ultOk === false); }
  function pendientesRepaso() { const ahora = Date.now(); return Object.keys(S.q).filter(id => POR_ID[id] && S.q[id].prox <= ahora); }
  function dificultad(q) {
    const r = S.q[q.id];
    const propia = r && r.n ? (r.f + 1) / (r.n + 2) : null;
    return (propia !== null ? propia * 2 : 0) + (q.d ? .6 : 0) + (1 - precisionTema(q.t).suave) * .5;
  }
  function dificiles() {
    const b = banco();
    const conHistorial = b.filter(q => S.q[q.id] && S.q[q.id].f > 0);
    const marcadasDificiles = b.filter(q => q.d);
    return [...new Set([...conHistorial.sort((a, z) => dificultad(z) - dificultad(a)), ...marcadasDificiles])];
  }
  function crearSesion(modo, opts = {}) {
    let lista = [];
    const b = banco();
    const n = opts.n || MODOS[modo].n;
    if (modo === 'rapido') lista = muestreo(b, n, pesoEstudio);
    else if (modo === 'tema') lista = muestreo(b.filter(q => q.t === opts.tema), n, pesoEstudio);
    else if (modo === 'dificiles') lista = barajar(dificiles().slice(0, Math.max(n * 2, 30))).slice(0, n);
    else if (modo === 'falladas') lista = barajar(falladasIds().map(id => POR_ID[id])).slice(0, n);
    else if (modo === 'repaso') lista = pendientesRepaso().map(id => POR_ID[id]).sort((a, z) => S.q[a.id].caja - S.q[z.id].caja || S.q[a.id].prox - S.q[z.id].prox).slice(0, n);
    else if (modo === 'marcadas') lista = barajar(Object.keys(S.marcadas).filter(id => POR_ID[id]).map(id => POR_ID[id])).slice(0, n);
    else if (modo === 'nuevas') lista = barajar(b.filter(q => !S.q[q.id])).slice(0, n);
    else if (modo === 'reto') { const rnd = semilla('reto-' + hoyStr()); lista = muestreo(b, n, q => (q.d ? 2 : 1), rnd); }
    // Práctica libre: selección al azar, sin tener en cuenta el historial (y nada se guarda).
    else if (modo === 'libre') lista = barajar(opts.tema ? b.filter(q => q.t === opts.tema) : b).slice(0, n);
    // Nivel experto: solo preguntas marcadas como difíciles (redacción traicionera o detalle fino).
    else if (modo === 'experto') lista = muestreo(b.filter(q => q.d), n, pesoEstudio);
    else if (modo === 'contrarreloj') lista = muestreo(b, n, pesoEstudio);
    // Reto entre amigos: la semilla del enlace decide las preguntas, así todos responden las mismas.
    else if (modo === 'duelo') lista = barajar(PREGUNTAS.filter(q => !q.rev).sort((a, z) => a.id < z.id ? -1 : 1), semilla('duelo-' + opts.semilla)).slice(0, n);
    else if (modo === 'camino') {
      const nv = opts.nivel || 0;
      const peso = q => pesoEstudio(q) * (nv === 0 ? (q.d ? .25 : 1) : nv === 2 ? (q.d ? 3 : 1) : 1);
      lista = muestreo(b.filter(q => q.t === opts.tema), n, peso);
    }
    return { modo, tema: opts.tema || null, nivel: opts.nivel ?? null, libre: modo === 'libre', semilla: opts.semilla || null, rival: opts.rival || null,
      limite: modo === 'contrarreloj' ? Date.now() + 60000 : null, ids: lista.map(q => q.id), i: 0, resp: {}, aciertos: 0, inicio: Date.now(), xp: 0, combo: 0, maxCombo: 0 };
  }

  /* ---------- Examen ---------- */
  // Reparto por temas inspirado en el temario del permiso B (la DGT no publica cuotas oficiales).
  const CUOTAS = { senales: 4, prioridad: 2, velocidad: 3, adelantamiento: 2, maniobras: 2, estacionamiento: 1, circulacion: 2, alumbrado: 1, alcohol: 2, factor: 2, seguridad: 2, documentacion: 2, mantenimiento: 2, eficiente: 1, accidentes: 2 };
  function crearExamen(opts = {}) {
    const b = banco({ examen: true });
    const recientes = new Set(S.examenes.slice(-3).flatMap(e => e.preguntas.map(p => p.id)));
    const peso = q => {
      let w = q.bat.includes('B') ? 3 : q.src === 'practica' ? 1.4 : q.bat.includes('AM') ? 1.5 : 1;
      if (recientes.has(q.id)) w *= .08;
      const r = S.q[q.id]; if (r && Date.now() - r.ult < DIA) w *= .5;
      return w;
    };
    const elegidas = new Set();
    for (const [t, c] of Object.entries(CUOTAS)) muestreo(b.filter(q => q.t === t), c, peso).forEach(q => elegidas.add(q.id));
    if (elegidas.size < EXAMEN.preguntas) muestreo(b.filter(q => !elegidas.has(q.id)), EXAMEN.preguntas - elegidas.size, peso).forEach(q => elegidas.add(q.id));
    const ids = barajar([...elegidas]).slice(0, EXAMEN.preguntas);
    S.examenActivo = { id: 'e' + Date.now(), ids, resp: {}, flags: {}, i: 0, inicio: Date.now(), limite: Date.now() + EXAMEN.minutos * 60000, libre: !!opts.libre };
    guardar();
    return S.examenActivo;
  }
  function corregirExamen(porTiempo = false) {
    const e = S.examenActivo; if (!e) return null;
    const preguntas = e.ids.map(id => ({ id, r: e.resp[id] ?? null, ok: e.resp[id] === POR_ID[id].c }));
    const errores = preguntas.filter(p => !p.ok).length;
    const aprobado = errores <= EXAMEN.maxFallos;
    const dur = Math.min(Date.now(), e.limite) - e.inicio;
    if (e.libre) {
      // Simulacro libre: se corrige igual, pero no se guarda nada en el progreso.
      ultimoLibre = { id: e.id, fecha: Date.now(), dur, errores, total: preguntas.length, aprobado, porTiempo, sinResponder: preguntas.filter(p => p.r === null).length, preguntas, libre: true };
      S.examenActivo = null; guardar();
      return ultimoLibre;
    }
    contar('sim');
    preguntas.forEach(p => { if (p.r !== null) responder(p.id, p.ok, 'examen'); else { const r = S.q[p.id] || (S.q[p.id] = { n: 0, ok: 0, f: 0, ult: 0, ultOk: null, caja: 0, prox: 0, seguidas: 0 }); r.n++; r.f++; r.ultOk = false; r.caja = 0; r.prox = Date.now(); r.ult = Date.now(); dia().n++; } });
    sumarXP(50 + (aprobado ? 100 : 0) + (errores === 0 ? 100 : 0));
    const res = { id: e.id, fecha: Date.now(), dur, errores, total: preguntas.length, aprobado, porTiempo, sinResponder: preguntas.filter(p => p.r === null).length, preguntas };
    S.examenes.push(res);
    S.examenActivo = null;
    guardar();
    return res;
  }

  let ultimoLibre = null;

  /* ---------- Camino (unidades por temas, 3 niveles cada una) ---------- */
  const ORDEN_CAMINO = ['senales', 'prioridad', 'velocidad', 'circulacion', 'adelantamiento', 'maniobras', 'estacionamiento', 'alumbrado', 'seguridad', 'alcohol', 'factor', 'documentacion', 'mantenimiento', 'eficiente', 'accidentes'];
  const NIVELES = ['Básico', 'Avanzado', 'Maestro'];
  const CAMINO_APROBADO = 6; // aciertos de 8 para superar un nivel
  function camino() {
    let abierta = true;
    return ORDEN_CAMINO.map((t, i) => {
      const hechos = Math.min(NIVELES.length, (S.camino[t] && S.camino[t].nivel) || 0);
      const u = { t, i, hechos, completa: hechos >= NIVELES.length, abierta, mejor: (S.camino[t] && S.camino[t].mejor) || [] };
      // La siguiente unidad se abre al superar el primer nivel de esta.
      abierta = abierta && hechos >= 1;
      return u;
    });
  }
  function completarNivel(t, nivel, ok, n) {
    const c = S.camino[t] || (S.camino[t] = { nivel: 0, mejor: [] });
    c.mejor[nivel] = Math.max(c.mejor[nivel] || 0, ok);
    const superado = ok >= Math.ceil(n * CAMINO_APROBADO / 8);
    let nuevo = false;
    if (superado && c.nivel === nivel) { c.nivel = nivel + 1; nuevo = true; contar('camino'); sumarXP(25); }
    guardar();
    return { superado, nuevo, unidadCompleta: nuevo && c.nivel === NIVELES.length };
  }

  /* ---------- Misiones del día ---------- */
  const MISIONES = {
    resp: { txt: n => `Responde ${n} preguntas`, meta: () => S.metaDiaria, k: 'n', ico: 'capas' },
    ok: { txt: n => `Acierta ${n} preguntas`, meta: () => Math.round(S.metaDiaria * .75), k: 'ok', ico: 'check' },
    combo: { txt: n => `Encadena ${n} aciertos seguidos`, meta: () => 6, k: 'combo', ico: 'llama' },
    camino: { txt: () => 'Supera un nivel del camino', meta: () => 1, k: 'camino', ico: 'mapa' },
    sim: { txt: () => 'Termina un simulacro', meta: () => 1, k: 'sim', ico: 'examen' },
    video: { txt: () => 'Mira una vídeo-lección', meta: () => 1, k: 'video', ico: 'play' },
    rec: { txt: n => `Recupera ${n} preguntas falladas`, meta: () => 3, k: 'rec', ico: 'repaso' }
  };
  function misionesHoy() {
    const hoy = hoyStr(), d = dia(hoy), m = S.misiones[hoy] || {};
    // Las misiones del día se fijan la primera vez que se consultan.
    if (!m.ids) {
      let extra = ['ok', 'combo', 'camino', 'video', 'sim', 'rec'];
      if (falladasIds().length < 3) extra = extra.filter(x => x !== 'rec');
      m.ids = ['resp', ...barajar(extra, semilla('mis-' + hoy)).slice(0, 2)];
      S.misiones[hoy] = m; guardar();
    }
    return m.ids.map(id => { const x = MISIONES[id], meta = x.meta(), prog = Math.min(meta, d[x.k] || 0); return { id, txt: x.txt(meta), ico: x.ico, meta, prog, hecha: prog >= meta, cobrada: !!m[id] }; });
  }
  // Paga las misiones recién completadas (+20 XP cada una y +50 por completar las tres).
  function revisarMisiones() {
    const ms = misionesHoy(), m = S.misiones[hoyStr()];
    const nuevas = ms.filter(x => x.hecha && !m[x.id]);
    nuevas.forEach(x => { m[x.id] = 1; sumarXP(20); });
    let cofre = false;
    if (nuevas.length && ms.every(x => m[x.id]) && !m.cofre) { m.cofre = 1; sumarXP(50); cofre = true; }
    if (nuevas.length) guardar();
    return { nuevas, cofre };
  }
  function registrarCombo(c) { const d = dia(); if (c > (d.combo || 0)) { d.combo = c; guardar(); } }
  function videoVisto(id) {
    const primera = !S.videos[id];
    S.videos[id] = Date.now(); contar('video');
    if (primera) sumarXP(15);
    guardar();
    return primera;
  }

  /* ---------- Fecha del examen ---------- */
  function diasExamen() {
    if (!S.fechaExamen) return null;
    const [y, m, d] = S.fechaExamen.split('-').map(Number), h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - h) / DIA);
  }
  // Preguntas al día recomendadas para ver todo el banco antes del examen y dejar 2 días de repaso (mínimo 20).
  function ritmo() {
    const dd = diasExamen();
    if (dd === null || dd <= 0) return null;
    const sinVer = banco().filter(q => !S.q[q.id]).length;
    return Math.max(20, Math.ceil(sinVer / Math.max(1, dd - 2)) + 10);
  }

  /* ---------- Estadísticas ---------- */
  function totales() {
    let n = 0, ok = 0, vistas = 0;
    for (const id in S.q) { if (!POR_ID[id]) continue; n += S.q[id].n; ok += S.q[id].ok; vistas++; }
    return { n, ok, pct: n ? ok / n : 0, vistas, banco: banco().length };
  }
  const cacheTema = {};
  function precisionTema(t) {
    if (cacheTema[t] && cacheTema[t].ts === S.xp) return cacheTema[t];
    const qs = PREGUNTAS.filter(q => q.t === t);
    let n = 0, ok = 0, vistas = 0, falladas = 0;
    for (const q of qs) { const r = S.q[q.id]; if (!r) continue; n += r.n; ok += r.ok; vistas++; if (r.ultOk === false) falladas++; }
    // Precisión suavizada (prior 2/3) para no sobrerreaccionar con pocas respuestas.
    const suave = (ok + 2) / (n + 3);
    const objetivo = Math.min(20, Math.ceil(qs.length * .6));
    const dominio = n === 0 ? 0 : Math.min(1, vistas / objetivo) * suave;
    let estado = 'nuevo';
    if (n > 0) estado = vistas >= objetivo && suave >= .9 ? 'dominado' : suave < .75 ? 'reforzar' : 'progreso';
    return (cacheTema[t] = { ts: S.xp, total: qs.length, n, ok, vistas, falladas, pct: n ? ok / n : 0, suave, dominio, estado, objetivo });
  }
  function temasDebiles(k = 3) {
    return window.TEMAS.map(t => ({ t, s: precisionTema(t.id) }))
      .sort((a, b) => (a.s.n === 0) - (b.s.n === 0) || a.s.suave - b.s.suave)
      .filter(x => x.s.estado !== 'dominado').slice(0, k);
  }

  // Últimas N respuestas registradas (aprox.: usamos el último resultado de cada pregunta, por fecha).
  function recientes(N = 150) {
    return Object.entries(S.q).filter(([id]) => POR_ID[id]).map(([id, r]) => r).sort((a, b) => b.ult - a.ult).slice(0, N);
  }
  function combinacion(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  // Probabilidad estimada de aprobar: P(errores ≤ 3) con errores ~ Binomial(30, p_error).
  function preparacion() {
    const rs = recientes(150);
    const respondidas = rs.length;
    const pocas = respondidas < 40;
    const okRec = rs.filter(r => r.ultOk).length;
    const pErr = (respondidas - okRec + 1) / (respondidas + 2);
    let pModelo = 0;
    for (let k = 0; k <= EXAMEN.maxFallos; k++) pModelo += combinacion(EXAMEN.preguntas, k) * Math.pow(pErr, k) * Math.pow(1 - pErr, EXAMEN.preguntas - k);
    // Cobertura del temario: penaliza si quedan temas sin practicar.
    const tocados = window.TEMAS.filter(t => precisionTema(t.id).n > 0).length;
    const cobertura = tocados / window.TEMAS.length;
    let p = pModelo * (.55 + .45 * cobertura);
    const ex = S.examenes.slice(-5);
    if (ex.length >= 3) { const real = ex.filter(e => e.aprobado).length / ex.length; p = .6 * p + .4 * real; }
    return { p: Math.max(0, Math.min(1, p)), pocas, respondidas, acierto: respondidas ? okRec / respondidas : 0, cobertura, simulacros: ex.length, pModelo };
  }

  /* ---------- Logros ---------- */
  const LOGROS = [
    { id: 'primera', nombre: 'Primer paso', desc: 'Responde tu primera pregunta.', ico: 'rayo', ok: () => totales().n >= 1 },
    { id: 'r50', nombre: 'Rodaje', desc: 'Responde 50 preguntas.', ico: 'capas', ok: () => totales().n >= 50 },
    { id: 'r250', nombre: 'Kilómetros', desc: 'Responde 250 preguntas.', ico: 'capas', ok: () => totales().n >= 250 },
    { id: 'r1000', nombre: 'Gran fondo', desc: 'Responde 1.000 preguntas.', ico: 'capas', ok: () => totales().n >= 1000 },
    { id: 'meta', nombre: 'Objetivo cumplido', desc: 'Completa tu objetivo diario.', ico: 'diana', ok: () => Object.values(S.dias).some(d => d.meta) },
    { id: 'racha3', nombre: 'Constancia', desc: 'Estudia 3 días seguidos.', ico: 'llama', ok: () => mejorRacha() >= 3 },
    { id: 'racha7', nombre: 'Semana completa', desc: 'Estudia 7 días seguidos.', ico: 'llama', ok: () => mejorRacha() >= 7 },
    { id: 'racha21', nombre: 'Hábito', desc: 'Estudia 21 días seguidos.', ico: 'llama', ok: () => mejorRacha() >= 21 },
    { id: 'sim1', nombre: 'Primera prueba', desc: 'Termina un simulacro de examen.', ico: 'examen', ok: () => S.examenes.length >= 1 },
    { id: 'apto1', nombre: 'Apto', desc: 'Aprueba un simulacro.', ico: 'medalla', ok: () => S.examenes.some(e => e.aprobado) },
    { id: 'apto5', nombre: 'En racha', desc: 'Aprueba 5 simulacros seguidos.', ico: 'medalla', ok: () => { let c = 0, m = 0; for (const e of S.examenes) { c = e.aprobado ? c + 1 : 0; m = Math.max(m, c); } return m >= 5; } },
    { id: 'perfecto', nombre: 'Sin fallos', desc: 'Termina un simulacro con 0 errores.', ico: 'estrella', ok: () => S.examenes.some(e => e.errores === 0) },
    { id: 'todos', nombre: 'Temario completo', desc: 'Practica los 15 temas.', ico: 'libro', ok: () => window.TEMAS.every(t => precisionTema(t.id).n > 0) },
    { id: 'dominio5', nombre: 'Dominio', desc: 'Domina 5 temas.', ico: 'escudo', ok: () => window.TEMAS.filter(t => precisionTema(t.id).estado === 'dominado').length >= 5 },
    { id: 'limpio', nombre: 'Borrón y cuenta nueva', desc: 'Deja a cero las falladas después de haber acumulado 10.', ico: 'repaso', ok: () => S.limpioLogrado === true },
    { id: 'reto7', nombre: 'Retador', desc: 'Completa 7 retos del día.', ico: 'trofeo', ok: () => Object.keys(S.retos).length >= 7 },
    { id: 'unidad', nombre: 'Unidad completa', desc: 'Supera los 3 niveles de una unidad del camino.', ico: 'mapa', ok: () => Object.values(S.camino).some(c => c.nivel >= 3) },
    { id: 'camino', nombre: 'Fin del camino', desc: 'Completa las 15 unidades del camino.', ico: 'mapa', ok: () => ORDEN_CAMINO.every(t => S.camino[t] && S.camino[t].nivel >= 3) },
    { id: 'combo10', nombre: 'Imparable', desc: 'Encadena 10 aciertos seguidos.', ico: 'rayo', ok: () => Object.values(S.dias).some(d => (d.combo || 0) >= 10) },
    { id: 'misiones', nombre: 'Misión cumplida', desc: 'Completa las 3 misiones de un día.', ico: 'diana', ok: () => Object.values(S.misiones).some(m => m.cofre) },
    { id: 'reloj15', nombre: 'Rayo', desc: 'Acierta 15 preguntas en una contrarreloj.', ico: 'reloj', ok: () => ((S.records || {}).contrarreloj || 0) >= 15 },
    { id: 'duelo', nombre: 'Reto lanzado', desc: 'Completa un reto entre amigos.', ico: 'usuario', ok: () => !!(S.records || {}).duelos },
    { id: 'cine', nombre: 'Cinéfilo vial', desc: 'Mira 5 vídeo-lecciones.', ico: 'play', ok: () => Object.keys(S.videos).length >= 5 },
    { id: 'oficiales', nombre: 'Banco oficial', desc: 'Responde todas las preguntas oficiales al menos una vez.', ico: 'escudo', ok: () => { const o = PREGUNTAS.filter(q => q.src === 'oficial'); return o.length > 0 && o.every(q => S.q[q.id]); } }
  ];
  function revisarLogros() {
    const f = falladasIds().length;
    if (f >= 10) S.maxFalladas = Math.max(S.maxFalladas || 0, f);
    if ((S.maxFalladas || 0) >= 10 && f === 0) S.limpioLogrado = true;
    const nuevos = [];
    for (const l of LOGROS) if (!S.logros[l.id] && l.ok()) { S.logros[l.id] = Date.now(); nuevos.push(l); }
    if (nuevos.length) guardar();
    return nuevos;
  }

  /* ---------- Copia de seguridad ---------- */
  function exportar() { return JSON.stringify({ app: 'luzverde-teoricoB', exportado: new Date().toISOString(), datos: S }, null, 1); }
  function importar(texto) {
    const j = JSON.parse(texto);
    const d = j && j.app === 'luzverde-teoricoB' ? j.datos : null;
    if (!d || typeof d.q !== 'object' || !Array.isArray(d.examenes)) throw new Error('El archivo no es una copia válida de esta plataforma.');
    S = Object.assign(nuevo(), d); S.ajustes = Object.assign(nuevo().ajustes, d.ajustes || {}); guardar();
  }
  function reiniciar() { S = nuevo(); guardar(); }

  window.M = {
    get S() { return S; }, guardar, recargar: cargar, almacenOk: () => almacenOk,
    PREGUNTAS, POR_ID, EXAMEN, MODOS, CUOTAS, LOGROS: PREGUNTAS.some(q => q.src === 'oficial') ? LOGROS : LOGROS.filter(l => l.id !== 'oficiales'),
    hoyStr, diaMas, dia, racha, mejorRacha, nivel, sumarXP,
    responder, crearSesion, crearExamen, corregirExamen, barajar, get ultimoLibre() { return ultimoLibre; },
    camino, completarNivel, NIVELES, ORDEN_CAMINO, CAMINO_APROBADO, misionesHoy, revisarMisiones, registrarCombo, videoVisto, diasExamen, ritmo,
    totales, precisionTema, temasDebiles, preparacion, falladasIds, pendientesRepaso, dificiles, banco,
    revisarLogros, exportar, importar, reiniciar
  };
})();
