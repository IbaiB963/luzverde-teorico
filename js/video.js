/* ==========================================================================
   Reproductor de vídeo-lecciones: escenas animadas + narración con las voces del
   propio navegador (gratuitas; en Microsoft Edge las voces «Natural» son neuronales).
   Si no hay voz disponible o se silencia, avanza con subtítulos a ritmo de lectura.
   También abre los vídeos oficiales de la DGT dentro de la app cuando es posible.
   ========================================================================== */
(function () {
  const M = window.M;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = window.LECCIONES || [];
  const synth = window.speechSynthesis || null;

  /* ---------- Voces ---------- */
  const vocesEs = () => synth ? synth.getVoices().filter(v => /^es/i.test(v.lang)) : [];
  const puntuar = v => (/es[-_]ES/i.test(v.lang) ? 4 : 0) + (/natural|neural|online/i.test(v.name) ? 8 : 0) + (/google/i.test(v.name) ? 3 : 0);
  function mejorVoz() {
    const vs = vocesEs();
    const pref = M.S.ajustes.voz && vs.find(v => v.voiceURI === M.S.ajustes.voz);
    return pref || vs.sort((a, b) => puntuar(b) - puntuar(a))[0] || null;
  }
  const esNatural = v => !!v && /natural|neural|online|google/i.test(v.name);
  if (synth) synth.addEventListener && synth.addEventListener('voiceschanged', () => { const s = document.querySelector('[data-voz-sel]'); if (s) s.innerHTML = opcionesVoz(); });
  function opcionesVoz() {
    const vs = vocesEs().sort((a, b) => puntuar(b) - puntuar(a));
    if (!vs.length) return '<option value="">Sin voces en español en este navegador</option>';
    const sel = M.S.ajustes.voz;
    return `<option value="">Automática (la más natural)</option>` + vs.map(v => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === sel ? 'selected' : ''}>${esc(v.name.replace(/^Microsoft\s+/, ''))} · ${esc(v.lang)}</option>`).join('');
  }

  const frases = t => t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const durTexto = (t, vel = 1) => (t.split(/\s+/).length * 390 + 700) / vel; // ms a ritmo de lectura
  const durLeccion = l => Math.round(l.escenas.reduce((s, e) => s + e.voz.split(/\s+/).length, 0) / 2.6);

  /* ---------- Escenas ---------- */
  const T = l => window.TEMA[l.tema];
  const d = i => `style="animation-delay:${(i * 1.4 + .35).toFixed(2)}s"`;
  const ESC = {
    portada: (e, l) => `<div class="vs vs-portada"><div class="vs-carretera"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="vs-pop">${mascota('feliz', 120)}</div>
      <div class="vs-tit"><span class="vs-eyebrow">${esc(e.sub || T(l).nombre)}</span><h2>${esc(e.titulo)}</h2></div></div>`,
    cifras: e => `<div class="vs vs-cifras n${e.items.length}">${e.items.map(([v, t], i) => `<div class="vs-cifra vs-pop" ${d(i)}><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join('')}</div>`,
    lista: e => `<div class="vs vs-lista"><h3>${esc(e.titulo)}</h3><ul>${e.items.map((t, i) => `<li class="vs-in" ${d(i)}><span>${ico('check')}</span>${esc(t)}</li>`).join('')}</ul></div>`,
    diag: e => `<div class="vs vs-diag"><div class="vs-panel vs-pop">${window.Aprender.DIAG[e.d]}</div><div class="vs-cap vs-in" style="animation-delay:.6s">${esc(e.titulo)}</div></div>`,
    senales: e => `<div class="vs vs-senales"><h3>${esc(e.titulo)}</h3><div class="vs-sgrid">${e.items.map(([f, t], i) => `<figure class="vs-pop" ${d(i)}><img src="img/senales/${f}.svg" alt=""><figcaption>${esc(t)}</figcaption></figure>`).join('')}</div></div>`,
    barras: e => { const max = Math.max(...e.items.map(x => x[1])); return `<div class="vs vs-barras"><h3>${esc(e.titulo)}</h3>${e.items.map(([t, v], i) => `<div class="vs-barra"><span>${esc(t)}</span><div><i class="vs-grow" style="--w:${v / max * 100}%;animation-delay:${(i * 1.6 + .3).toFixed(1)}s"></i><b class="vs-in" ${`style="animation-delay:${(i * 1.6 + 1).toFixed(1)}s"`}>${v}</b></div></div>`).join('')}</div>`; },
    jerarquia: e => `<div class="vs vs-jer"><h3>${esc(e.titulo)}</h3>${e.items.map((t, i) => `<div class="vs-in" style="--k:${i};animation-delay:${(i * 1.9 + .4).toFixed(1)}s"><b>${i + 1}</b>${esc(t)}</div>`).join('')}</div>`,
    consejo: e => `<div class="vs vs-consejo"><div class="vs-pop">${mascota(e.estado || 'feliz', 130)}</div><div class="vs-bocadillo vs-in" style="animation-delay:.5s"><b>${esc(e.titulo)}</b><p>${esc(e.texto)}</p></div></div>`,
    detencion: () => `<div class="vs vs-det"><svg viewBox="0 0 640 230" aria-hidden="true">
        <rect x="0" y="120" width="640" height="70" fill="#3b4558"/><path d="M0 155h640" stroke="#f4f1e8" stroke-width="3" stroke-dasharray="22 18"/>
        <rect class="vs-zona r" x="40" y="200" width="200" height="16" rx="8"/><rect class="vs-zona f" x="240" y="200" width="330" height="16" rx="8"/>
        <text x="140" y="110" text-anchor="middle" class="vs-lbl r">Reacción</text><text x="405" y="110" text-anchor="middle" class="vs-lbl f">Frenado</text>
        <g class="vs-coche"><rect x="-58" y="-26" width="58" height="26" rx="8" fill="#2f63f0"/><rect x="-46" y="-40" width="34" height="18" rx="6" fill="#2f63f0"/><rect x="-42" y="-37" width="26" height="12" rx="3" fill="#cfe0ff"/><circle cx="-44" cy="0" r="7" fill="#111"/><circle cx="-12" cy="0" r="7" fill="#111"/></g>
        <path d="M600 118v-40" stroke="#ff5a4e" stroke-width="5"/><circle cx="600" cy="70" r="12" fill="#ff5a4e"/></svg></div>`,
    v16: () => `<div class="vs vs-v16"><svg viewBox="0 0 640 260" aria-hidden="true">
        <rect x="0" y="190" width="640" height="70" fill="#3b4558"/><path d="M0 225h640" stroke="#f4f1e8" stroke-width="3" stroke-dasharray="22 18"/>
        <g transform="translate(200 190)"><path d="M0 -10 Q0 -40 30 -45 L70 -75 Q90 -85 140 -85 L190 -85 Q215 -85 235 -60 L265 -45 Q290 -40 290 -10 Z" fill="#e2e8f0"/>
        <path d="M80 -70 L135 -78 L135 -50 L60 -50 Z M150 -78 L195 -78 L222 -50 L150 -50 Z" fill="#93a4c3"/>
        <circle cx="60" cy="-6" r="22" fill="#111"/><circle cx="230" cy="-6" r="22" fill="#111"/><circle cx="60" cy="-6" r="9" fill="#888"/><circle cx="230" cy="-6" r="9" fill="#888"/>
        <rect x="150" y="-98" width="22" height="14" rx="4" fill="#ffb547" class="vs-baliza"/>
        <circle cx="161" cy="-98" r="16" fill="none" stroke="#ffb547" stroke-width="3" class="vs-onda"/><circle cx="161" cy="-98" r="16" fill="none" stroke="#ffb547" stroke-width="3" class="vs-onda o2"/></g>
        <g transform="translate(540 50)" class="vs-pop" style="animation-delay:2.4s"><path d="M-40 10a22 22 0 0 1 8-42 28 28 0 0 1 52-6 20 20 0 0 1 22 30 14 14 0 0 1-8 18Z" fill="#fff"/><text x="0" y="0" text-anchor="middle" font-size="15" font-weight="800" fill="#1846c7">DGT 3.0</text></g>
        <path d="M372 80 Q440 30 500 50" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 7" class="vs-in" style="animation-delay:2s"/></svg></div>`,
    pas: () => `<div class="vs vs-pas">${[['P', 'Proteger', '#2f63f0'], ['A', 'Avisar', '#ffb547'], ['S', 'Socorrer', '#ff5a4e']].map(([k, t, c], i) => `<div class="vs-pop" style="animation-delay:${(i * 1.1 + 1.2).toFixed(1)}s;--c:${c}"><b>${k}</b><span>${t}</span></div>`).join('')}</div>`
  };

  /* ---------- Estado del reproductor ---------- */
  let P = null; // { l, e, f, play, mute, cc, vel, token, timer }
  function parar() {
    if (!P) return;
    P.play = false; P.token++;
    clearTimeout(P.timer); clearTimeout(P.guard);
    if (synth) synth.cancel();
  }
  window.addEventListener('hashchange', () => { if (!/^#\/video\//.test(location.hash)) { parar(); P = null; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && P && P.play) { parar(); pintarControles(); } });

  function vista(id) {
    const l = L.find(x => x.id === id);
    if (!l) return `<div class="view empty"><span class="ico">${ico('alerta')}</span><p>No existe esta lección.</p><a class="btn btn-soft" href="#/aprender">Volver</a></div>`;
    const i = L.indexOf(l), sig = L[i + 1];
    const v = mejorVoz();
    return `<div class="view stack" style="--gap:18px">
      <a href="#/aprender" class="small" style="display:inline-flex;gap:6px;align-items:center;text-decoration:none">${ico('atras', 'style="width:16px;height:16px"')}Aprender</a>
      <div class="page-head" style="margin-bottom:0"><div class="stack"><span class="eyebrow">Vídeo-lección ${i + 1} de ${L.length} · ${T(l).nombre}</span><h1 class="h-l">${esc(l.t)}</h1></div></div>
      <div class="player" id="player" style="--tc:${T(l).color}">
        <div class="vstage" id="vstage"><div id="vscene"></div>
          <button class="vbig" data-vplay aria-label="Reproducir">${ico('reproducir')}</button>
          <div class="vend" id="vend" hidden></div>
        </div>
        <div class="vsub" id="vsub" aria-live="polite"></div>
        <div class="vbar" id="vbar">${l.escenas.map((_, k) => `<button data-vir="${k}" aria-label="Escena ${k + 1}"><i></i></button>`).join('')}</div>
        <div class="vctrl">
          <button class="btn btn-ghost btn-icon" data-vprev aria-label="Escena anterior">${ico('anterior')}</button>
          <button class="btn btn-primary btn-icon" data-vtoggle aria-label="Reproducir o pausar"></button>
          <button class="btn btn-ghost btn-icon" data-vnext aria-label="Escena siguiente">${ico('siguiente')}</button>
          <span class="spacer"></span>
          <button class="btn btn-ghost btn-sm" data-vvel title="Velocidad">1×</button>
          <button class="btn btn-ghost btn-icon" data-vmute aria-label="Silenciar voz"></button>
          <button class="btn btn-ghost btn-icon" data-vcc aria-label="Subtítulos">${ico('subtitulos')}</button>
          <button class="btn btn-ghost btn-icon" data-vfull aria-label="Pantalla completa">${ico('pantalla')}</button>
        </div>
      </div>
      ${synth ? `<div class="card flat row wrap-r" style="--gap:12px;padding:14px 16px">${ico('voz', 'style="width:20px;height:20px;color:var(--brand)"')}
        <label class="small" for="vvoz" style="font-weight:700">Voz</label>
        <select id="vvoz" class="input" data-voz-sel style="flex:1;min-width:200px;max-width:420px;padding:8px 10px">${opcionesVoz()}</select>
        ${esNatural(v) ? '' : '<span class="tiny muted" style="flex-basis:100%">Consejo: en Microsoft Edge las voces «Natural» (Álvaro, Elvira…) suenan como una persona real. En Android, instala las voces de Google.</span>'}</div>` : `<div class="note">${ico('info')}<div>Este navegador no tiene voz sintetizada: la lección avanza con subtítulos.</div></div>`}
      <div class="grid g-2">
        <div class="card stack" style="--gap:10px"><h2 class="h-s">Lo que vas a aprender</h2>
          <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">${l.escenas.map(e => `<li>${esc(e.titulo || { pas: 'Proteger, Avisar, Socorrer', cifras: (e.items || []).map(x => x[0] + ' ' + x[1]).join(' · ') }[e.tipo] || '')}</li>`).join('')}</ul></div>
        <div class="card stack" style="--gap:12px"><h2 class="h-s">Y después…</h2>
          <button class="btn btn-soft" data-go='${JSON.stringify({ modo: 'tema', tema: l.tema })}'>${ico('practicar')}Practicar ${esc(T(l).nombre.toLowerCase())}</button>
          ${sig ? `<a class="btn btn-ghost" href="#/video/${sig.id}">${ico('siguiente')}Siguiente: ${esc(sig.t)}</a>` : ''}
          <p class="tiny muted">Lección de elaboración propia, revisada con la normativa vigente en noviembre de 2026. No es material oficial de la DGT.</p></div>
      </div>
      ${UI.pie()}
    </div>`;
  }

  function montar(id) {
    const l = L.find(x => x.id === id); if (!l) return;
    parar();
    P = { l, e: 0, f: 0, play: false, mute: !synth, cc: true, vel: M.S.ajustes.vozVel || 1, token: 0, fin: false };
    pintarEscena();
    const $ = s => document.querySelector(s);
    $('[data-vplay]').addEventListener('click', () => { if (P.fin) reiniciar(); else reproducir(); });
    $('[data-vtoggle]').addEventListener('click', () => P.play ? pausar() : (P.fin ? reiniciar() : reproducir()));
    $('[data-vprev]').addEventListener('click', () => irA(Math.max(0, P.f > 0 ? P.e : P.e - 1)));
    $('[data-vnext]').addEventListener('click', () => { if (P.e < l.escenas.length - 1) irA(P.e + 1); });
    document.querySelectorAll('[data-vir]').forEach(b => b.addEventListener('click', () => irA(+b.dataset.vir)));
    $('[data-vmute]').addEventListener('click', () => { const seguir = P.play; parar(); P.mute = !P.mute || !synth; if (seguir) reproducir(); else pintarControles(); });
    $('[data-vcc]').addEventListener('click', () => { P.cc = !P.cc; pintarSub(); pintarControles(); });
    $('[data-vvel]').addEventListener('click', () => {
      const vs = [1, 1.15, 1.3, .9]; P.vel = vs[(vs.indexOf(P.vel) + 1) % vs.length];
      M.S.ajustes.vozVel = P.vel; M.guardar();
      if (P.play) { parar(); reproducir(); } else pintarControles();
    });
    $('[data-vfull]').addEventListener('click', () => {
      const el = $('#player');
      if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
    });
    const sel = $('[data-voz-sel]');
    if (sel) sel.addEventListener('change', () => { M.S.ajustes.voz = sel.value; M.guardar(); if (P.play) { parar(); reproducir(); } });
    pintarControles();
  }
  function reiniciar() { P.e = 0; P.f = 0; P.fin = false; pintarEscena(); reproducir(); }
  function irA(k) { const seguir = P.play; parar(); P.e = k; P.f = 0; P.fin = false; pintarEscena(); if (seguir) reproducir(); else pintarControles(); }

  function pintarEscena() {
    const e = P.l.escenas[P.e];
    const sc = document.getElementById('vscene'); if (!sc) return;
    sc.innerHTML = ESC[e.tipo](e, P.l);
    document.getElementById('vend').hidden = true;
    document.getElementById('vstage').classList.toggle('paused', !P.play);
    pintarSub(); pintarBarra();
  }
  function pintarSub() {
    const s = document.getElementById('vsub'); if (!s) return;
    const fs = frases(P.l.escenas[P.e].voz);
    s.hidden = !P.cc;
    s.innerHTML = P.cc ? `<span>${esc(fs[Math.min(P.f, fs.length - 1)])}</span>` : '';
  }
  function pintarBarra() {
    const n = frases(P.l.escenas[P.e].voz).length;
    document.querySelectorAll('#vbar [data-vir]').forEach((b, k) => {
      b.querySelector('i').style.width = (k < P.e || P.fin ? 100 : k > P.e ? 0 : Math.round(P.f / n * 100)) + '%';
      b.classList.toggle('cur', k === P.e);
    });
  }
  function pintarControles() {
    const t = document.querySelector('[data-vtoggle]'); if (!t) return;
    t.innerHTML = ico(P.play ? 'pausa' : 'reproducir');
    t.setAttribute('aria-label', P.play ? 'Pausar' : 'Reproducir');
    document.querySelector('[data-vplay]').hidden = P.play;
    const m = document.querySelector('[data-vmute]');
    m.innerHTML = ico(P.mute ? 'mudo' : 'volumen'); m.setAttribute('aria-pressed', P.mute); m.disabled = !synth;
    m.title = P.mute ? 'Activar la voz' : 'Silenciar la voz';
    const c = document.querySelector('[data-vcc]'); c.setAttribute('aria-pressed', P.cc); c.style.color = P.cc ? 'var(--brand)' : '';
    document.querySelector('[data-vvel]').textContent = String(P.vel).replace('.', ',') + '×';
    document.getElementById('vstage').classList.toggle('paused', !P.play);
  }

  function reproducir() {
    if (!P) return;
    P.play = true; P.fin = false; P.token++;
    document.getElementById('vend').hidden = true;
    pintarControles();
    decir(P.token);
  }
  function pausar() { parar(); pintarControles(); }

  // Dice la frase actual y, al terminar, avanza a la siguiente (o a la siguiente escena).
  function decir(tok) {
    if (!P || tok !== P.token || !P.play) return;
    const fs = frases(P.l.escenas[P.e].voz);
    if (P.f >= fs.length) {
      if (P.e < P.l.escenas.length - 1) { P.e++; P.f = 0; pintarEscena(); P.timer = setTimeout(() => decir(tok), 450); }
      else terminar();
      return;
    }
    pintarSub(); pintarBarra();
    const texto = fs[P.f];
    const siguiente = () => { if (tok !== P.token) return; clearTimeout(P.guard); P.f++; P.timer = setTimeout(() => decir(tok), 160); };
    if (P.mute || !synth) { P.timer = setTimeout(siguiente, durTexto(texto, P.vel)); return; }
    const u = new SpeechSynthesisUtterance(texto);
    const v = mejorVoz();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-ES';
    u.rate = P.vel; u.pitch = 1;
    u.onend = siguiente;
    u.onerror = ev => { if (ev.error === 'interrupted' || ev.error === 'canceled') return; P.timer = setTimeout(siguiente, durTexto(texto, P.vel) * .6); };
    // Si la voz se queda colgada (pasa con algunas voces en línea), seguimos por tiempo.
    P.guard = setTimeout(() => { if (tok === P.token && synth.speaking) synth.cancel(); siguiente(); }, durTexto(texto, P.vel) * 2.2 + 4000);
    synth.speak(u);
  }
  function terminar() {
    P.play = false; P.fin = true; pintarControles(); pintarBarra();
    const primera = M.videoVisto(P.l.id);
    const i = L.indexOf(P.l), sig = L[i + 1];
    const fin = document.getElementById('vend');
    fin.innerHTML = `<div class="vs-pop">${mascota('celebra', 96)}</div><h3>¡Lección completada!</h3>${primera ? '<span class="chip chip-amber">+15 XP</span>' : ''}
      <div class="row wrap-r" style="justify-content:center"><button class="btn btn-primary" data-go='${JSON.stringify({ modo: 'tema', tema: P.l.tema })}'>${ico('practicar')}Practicar ahora</button>${sig ? `<a class="btn btn-soft" href="#/video/${sig.id}">Siguiente lección</a>` : ''}<button class="btn btn-ghost" data-vreplay>${ico('repaso')}Repetir</button></div>`;
    fin.hidden = false;
    fin.querySelector('[data-go]').addEventListener('click', ev => UI.iniciar(JSON.parse(ev.currentTarget.dataset.go)));
    fin.querySelector('[data-vreplay]').addEventListener('click', reiniciar);
    if (window.UI && UI.premiar) UI.premiar();
  }

  /* ---------- Tarjetas para la página Aprender ---------- */
  function tarjeta(l) {
    const visto = !!M.S.videos[l.id], tc = T(l).color;
    return `<a class="card vcard" href="#/video/${l.id}" style="--tc:${tc}">
      <div class="vthumb"><span class="vthumb-m">${mascota(visto ? 'celebra' : 'feliz', 58)}</span><span class="vthumb-ico">${ico('t_' + l.tema)}</span><span class="vthumb-play">${ico('reproducir')}</span><span class="vthumb-dur num">${Math.max(1, Math.round(durLeccion(l) / 60 * 10) / 10).toString().replace('.', ',')} min</span></div>
      <div class="stack" style="--gap:4px"><div class="row" style="--gap:8px"><b style="font-size:16px">${esc(l.t)}</b>${visto ? `<span class="chip chip-ok" style="margin-left:auto">${ico('check')}Vista</span>` : ''}</div><span class="small muted">${esc(l.d)}</span></div></a>`;
  }

  /* ---------- Vídeos oficiales de YouTube dentro de la app ---------- */
  function abrirYouTube(id, titulo) {
    // Desde un archivo local (file://) YouTube no permite incrustar: se abre en una pestaña nueva.
    if (location.protocol === 'file:') { window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener'); return; }
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ytmodal" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
      <div class="row" style="justify-content:space-between;margin-bottom:10px"><b>${esc(titulo)}</b><button class="btn btn-ghost btn-icon" data-cerrar aria-label="Cerrar">${ico('x')}</button></div>
      <div class="ytframe"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&hl=es" title="${esc(titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      <div class="row" style="justify-content:space-between;margin-top:10px"><span class="tiny muted">Vídeo oficial del canal de la DGT en YouTube.</span><a class="small" href="https://www.youtube.com/watch?v=${encodeURIComponent(id)}" target="_blank" rel="noopener">Abrir en YouTube</a></div></div>`;
    const cerrar = () => { ov.remove(); document.removeEventListener('keydown', tecla); };
    const tecla = e => { if (e.key === 'Escape') cerrar(); };
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-cerrar]')) cerrar(); });
    document.addEventListener('keydown', tecla);
    document.body.appendChild(ov);
  }

  window.Video = { vista, montar, tarjeta, abrirYouTube, parar, LECCIONES: L, durLeccion, opcionesVoz, mejorVoz };
})();
