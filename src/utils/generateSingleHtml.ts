// Utility to export a self-contained single HTML file with complete real-time sync across devices and tabs

export function getSingleHtmlContent(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vial interactivo - Ley 769 de 2002</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              yellow: '#F59E0B',
              red: '#EF4444',
              blue: '#3B82F6',
              green: '#10B981'
            }
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    .btn-shape { transition: transform 0.1s ease, filter 0.2s ease; }
    .btn-shape:active { transform: scale(0.95); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
  <div id="app" class="flex-1 flex flex-col"></div>

  <script>
    // --- 1. BANCO DE PREGUNTAS OFICIAL: LEY 769 DE 2002 (TÍTULO III) ---
    const DEFAULT_QUESTIONS = [
      {
        id: "ley-cap1-1",
        article: "Artículo 55 (Capítulo I - Reglas Generales)",
        topic: "I - Reglas Generales: Principio Rector",
        question: "¿Cuál es el principio rector que prima en el comportamiento de todo usuario de la vía pública?",
        timeLimit: 20,
        correctShape: "square",
        explanation: "El principio rector es el respeto a la vida y la integridad humana por encima de cualquier otra consideración en la vía.",
        options: [
          { shape: "triangle", text: "La prisa por llegar al destino", color: "bg-red-600" },
          { shape: "square", text: "El respeto a la vida y la integridad humana", color: "bg-blue-600" },
          { shape: "circle", text: "El derecho preferencial de los vehículos sobre los peatones", color: "bg-amber-500" },
          { shape: "diamond", text: "La velocidad de circulación", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-cap1-2",
        article: "Artículo 55 (Capítulo I - Reglas Generales)",
        topic: "I - Reglas Generales: Obligación de Abstención",
        question: "De acuerdo con el artículo 55, toda persona que tome parte en el tránsito debe abstenerse de:",
        timeLimit: 20,
        correctShape: "square",
        explanation: "El artículo 55 ordena abstenerse de realizar actos que puedan poner en peligro a otras personas o perjudicar u obstaculizar la circulación.",
        options: [
          { shape: "triangle", text: "Conducir a menos de 40 km/h", color: "bg-red-600" },
          { shape: "square", text: "Realizar actos que puedan poner en peligro a otras personas o obstaculizar la circulación", color: "bg-blue-600" },
          { shape: "circle", text: "Transportar acompañantes en el asiento delantero", color: "bg-amber-500" },
          { shape: "diamond", text: "Usar el pito dentro de zonas residenciales", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-1",
        article: "Artículo 106 (Modificado Ley 2251/2022 - Ley Julián Esteban)",
        topic: "Límites de Velocidad Urbana",
        question: "En zonas urbanas de Colombia, ¿cuál es el límite máximo de velocidad permitido?",
        timeLimit: 20,
        correctShape: "square",
        explanation: "La Ley 2251 de 2022 fijó el límite urbano general en 50 km/h (y 30 km/h en zonas escolares y residenciales).",
        options: [
          { shape: "triangle", text: "60 km/h en todas las vías", color: "bg-red-600" },
          { shape: "square", text: "50 km/h (y 30 km/h en zonas escolares/residenciales)", color: "bg-blue-600" },
          { shape: "circle", text: "80 km/h en vías principales", color: "bg-amber-500" },
          { shape: "diamond", text: "40 km/h de manera general", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-2",
        article: "Artículo 70 (Normas de Comportamiento)",
        topic: "Prelación en Glorietas / Rotondas",
        question: "Al aproximarse a una glorieta o rotonda, ¿quién tiene la prelación de paso?",
        timeLimit: 20,
        correctShape: "circle",
        explanation: "El Artículo 70 establece que en una glorieta tiene prelación el vehículo que ya transita dentro de ella.",
        options: [
          { shape: "triangle", text: "El vehículo que entra por la derecha", color: "bg-red-600" },
          { shape: "square", text: "El vehículo de mayor cilindraje", color: "bg-blue-600" },
          { shape: "circle", text: "El vehículo que ya circula dentro de la glorieta", color: "bg-amber-500" },
          { shape: "diamond", text: "El que circule a mayor velocidad", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-3",
        article: "Artículo 108 (Separación entre vehículos)",
        topic: "Distancia de Seguridad",
        question: "Al conducir a una velocidad de entre 60 y 80 km/h, ¿qué distancia mínima debe mantener con el vehículo de adelante?",
        timeLimit: 20,
        correctShape: "circle",
        explanation: "El Art. 108 fija: hasta 30 km/h: 10m; 30 a 60 km/h: 20m; 60 a 80 km/h: 25m; más de 80 km/h: 30 metros.",
        options: [
          { shape: "triangle", text: "10 metros", color: "bg-red-600" },
          { shape: "square", text: "15 metros", color: "bg-blue-600" },
          { shape: "circle", text: "25 metros", color: "bg-amber-500" },
          { shape: "diamond", text: "40 metros", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-4",
        article: "Artículo 82 (Cinturón de Seguridad y Pasajeros)",
        topic: "Seguridad Infantil",
        question: "¿Bajo qué condición los menores de edad NO pueden viajar en el asiento delantero?",
        timeLimit: 20,
        correctShape: "triangle",
        explanation: "Los menores de 10 años deben viajar obligatoriamente en el asiento trasero (Art. 82).",
        options: [
          { shape: "triangle", text: "Menores de 10 años SIEMPRE en asiento trasero", color: "bg-red-600" },
          { shape: "square", text: "Solo los menores de 3 años", color: "bg-blue-600" },
          { shape: "circle", text: "Cualquier menor siempre que lleve cinturón de adulto", color: "bg-amber-500" },
          { shape: "diamond", text: "Solo durante viajes nocturnos", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-5",
        article: "Artículo 86 (Uso de Luces)",
        topic: "Horario Reglamentario de Luces",
        question: "¿En qué horario es obligatorio mantener encendidas las luces exteriores de los automotores?",
        timeLimit: 20,
        correctShape: "square",
        explanation: "De las 18:00 a las 06:00 horas del día siguiente, en túneles y cuando las condiciones de visibilidad sean adversas.",
        options: [
          { shape: "triangle", text: "De 20:00 a 05:00 horas", color: "bg-red-600" },
          { shape: "square", text: "De 18:00 a 06:00 horas del día siguiente", color: "bg-blue-600" },
          { shape: "circle", text: "Solo en túneles sin importar la hora", color: "bg-amber-500" },
          { shape: "diamond", text: "Únicamente bajo lluvia torrencial", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-6",
        article: "Artículo 73 (Prohibiciones para Adelantar)",
        topic: "Maniobra de Adelantamiento",
        question: "¿En cuál de las siguientes situaciones está EXPRESAMENTE PROHIBIDO adelantar?",
        timeLimit: 20,
        correctShape: "triangle",
        explanation: "Prohibido en curvas, cimas de cuestas, pasos a nivel, túneles, puentes y cruces no señalizados.",
        options: [
          { shape: "triangle", text: "En curvas, pendientes, túneles y pasos a nivel", color: "bg-red-600" },
          { shape: "square", text: "En rectas con línea blanca discontinua", color: "bg-blue-600" },
          { shape: "circle", text: "Por el carril izquierdo en autopistas de doble calzada", color: "bg-amber-500" },
          { shape: "diamond", text: "A vehículos que circulan a menos de 40 km/h", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-7",
        article: "Artículo 96 (Normas para Motociclistas)",
        topic: "Prendas Reflectivas",
        question: "¿A partir de qué hora deben portar chaleco reflectivo los motociclistas?",
        timeLimit: 20,
        correctShape: "circle",
        explanation: "El chaleco o chaqueta reflectiva es de uso obligatorio de 18:00 a 06:00 horas del día siguiente.",
        options: [
          { shape: "triangle", text: "A partir de las 20:00 horas", color: "bg-red-600" },
          { shape: "square", text: "Solo fuera del perímetro urbano en carreteras", color: "bg-blue-600" },
          { shape: "circle", text: "De 18:00 a 06:00 horas del día siguiente", color: "bg-amber-500" },
          { shape: "diamond", text: "Solo los domingos y festivos", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-8",
        article: "Artículo 152 / Ley 1696 de 2013",
        topic: "Sanciones por Alcoholemia",
        question: "En Colombia, ¿qué define el 'Grado Cero' (0) de alcoholemia y cuál es su sanción principal?",
        timeLimit: 20,
        correctShape: "triangle",
        explanation: "Grado 0: entre 20 y 39 mg de etanol/100 ml de sangre: suspensión de 1 año y 90 SMLDV de multa.",
        options: [
          { shape: "triangle", text: "Entre 20 y 39 mg de etanol (suspensión 1 año y multa)", color: "bg-red-600" },
          { shape: "square", text: "Hasta 50 mg de etanol se permite sin sanción", color: "bg-blue-600" },
          { shape: "circle", text: "Solo se sanciona con una amonestación escrita", color: "bg-amber-500" },
          { shape: "diamond", text: "Únicamente si supera los 100 mg de etanol en sangre", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-9",
        article: "Artículo 57 y 58 (Normas para Peatones)",
        topic: "Cruce de Vías Urbanas",
        question: "¿Por qué sectores de la vía deben cruzar obligatoriamente los peatones en zonas urbanas?",
        timeLimit: 20,
        correctShape: "square",
        explanation: "Por los pasos peatonales demarcados (cebras), esquinas y puentes peatonales respetando las señales.",
        options: [
          { shape: "triangle", text: "En cualquier punto si el semáforo está lejos", color: "bg-red-600" },
          { shape: "square", text: "Por cebras peatonales, esquinas o puentes elevados", color: "bg-blue-600" },
          { shape: "circle", text: "Diagonal en mitad de cuadra para cruzar rápido", color: "bg-amber-500" },
          { shape: "diamond", text: "Por encima del separador central de la avenida", color: "bg-emerald-600" }
        ]
      },
      {
        id: "ley-10",
        article: "Artículo 70 (Intersecciones)",
        topic: "Prelación en Cruces No Señalizados",
        question: "En una intersección de dos vías de igual nivel sin semáforo ni señal de PARE, ¿quién tiene la prelación?",
        timeLimit: 20,
        correctShape: "diamond",
        explanation: "En vías de igual jerarquía a falta de señalización, tiene prelación de paso el vehículo que viene por la derecha.",
        options: [
          { shape: "triangle", text: "El vehículo que se aproxime por la izquierda", color: "bg-red-600" },
          { shape: "square", text: "El vehículo que haga sonar primero su bocina", color: "bg-blue-600" },
          { shape: "circle", text: "El vehículo que realice el giro a la izquierda", color: "bg-amber-500" },
          { shape: "diamond", text: "El vehículo que se aproxima por el lado derecho", color: "bg-emerald-600" }
        ]
      }
    ];

    // --- 2. SINTETIZADOR DE AUDIO (Web Audio API) ---
    const Sound = {
      ctx: null,
      init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      },
      tick(urgent) {
        try {
          this.init();
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(urgent ? 880 : 520, this.ctx.currentTime);
          g.gain.setValueAtTime(0.08, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        } catch(e) {}
      },
      chime() {
        try {
          this.init();
          [523.25, 659.25, 783.99].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.06);
            g.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.3);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + i * 0.06);
            osc.stop(this.ctx.currentTime + i * 0.06 + 0.32);
          });
        } catch(e) {}
      },
      correct() {
        try {
          this.init();
          [523, 659, 784, 1046].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.05);
            g.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.5);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + i * 0.05);
            osc.stop(this.ctx.currentTime + i * 0.05 + 0.55);
          });
        } catch(e) {}
      }
    };

    // --- 3. ESTADO, PARÁMETROS Y SINCRONIZACIÓN MULTI-DISPOSITIVO ---
    let questions = JSON.parse(localStorage.getItem('vialkahoot_standalone_q') || 'null') || DEFAULT_QUESTIONS;
    function saveQuestions(newQ) {
      questions = newQ;
      localStorage.setItem('vialkahoot_standalone_q', JSON.stringify(questions));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paramPin = urlParams.get('pin');
    let isStudentMode = Boolean(paramPin || urlParams.get('mode') === 'student');

    let currentPin = (paramPin || localStorage.getItem('vialkahoot_host_pin') || Math.floor(100000 + Math.random() * 900000).toString()).trim().replace(/\\s+/g, '');
    if (!isStudentMode) {
      localStorage.setItem('vialkahoot_host_pin', currentPin);
    }

    let currentStage = 'lobby'; // lobby, question, result, podium
    let currentQIdx = 0;
    let timer = 20;
    let timerInterval = null;
    let isQuestionManagerOpen = false;

    // Alumnos conectados
    let players = [
      { id: 'bot1', name: 'Carlos Mario (Medellín)', avatar: '🏍️', cat: 'A2', score: 0 },
      { id: 'bot2', name: 'Valentina Gómez (Bogotá)', avatar: '🚗', cat: 'B1', score: 0 }
    ];

    // Variables de Estudiante
    let studentJoined = false;
    let studentId = 'stu_' + Math.random().toString(36).substring(2, 9);
    let studentName = '';
    let studentCat = 'B1';
    let studentAvatar = '🚗';
    let studentScore = 0;
    let studentSelectedShape = null;

    // --- CAPA DE SINCRONIZACIÓN REAL-TIME (BroadcastChannel + LocalStorage + Cloud SSE) ---
    const SYNC_BUS = {
      channel: null,
      init() {
        if ('BroadcastChannel' in window) {
          try {
            this.channel = new BroadcastChannel('vialkahoot_sync_bus');
            this.channel.onmessage = (e) => this.handleMessage(e.data);
          } catch(err) {}
        }

        window.addEventListener('storage', (e) => {
          if (e.key === 'vialkahoot_sync_event' && e.newValue) {
            try {
              this.handleMessage(JSON.parse(e.newValue));
            } catch(err) {}
          }
        });

        // Conexión Cloud SSE pública gratuita mediante ntfy.sh para enlazar celulares con computadores
        try {
          const sse = new EventSource('https://ntfy.sh/vialkahoot_' + currentPin + '/sse');
          sse.onmessage = (e) => {
            try {
              const res = JSON.parse(e.data);
              if (res.message) {
                const payload = JSON.parse(res.message);
                this.handleMessage(payload);
              }
            } catch(err) {}
          };
        } catch(err) {}
      },

      send(msg) {
        msg.pin = currentPin;
        msg._time = Date.now();

        // 1. Mismo navegador / Pestañas
        if (this.channel) {
          try { this.channel.postMessage(msg); } catch(e) {}
        }
        try {
          localStorage.setItem('vialkahoot_sync_event', JSON.stringify(msg));
        } catch(e) {}

        // 2. Dispositivos móviles remotos vía Cloud Relay
        try {
          fetch('https://ntfy.sh/vialkahoot_' + currentPin, {
            method: 'POST',
            body: JSON.stringify(msg)
          }).catch(() => {});
        } catch(e) {}

        // 3. Si es el mismo contexto, despachar internamente
        this.handleMessage(msg);
      },

      handleMessage(msg) {
        if (!msg || !msg.type) return;
        const msgPin = (msg.pin || '').trim().replace(/\\s+/g, '');
        if (msgPin && msgPin !== currentPin) return;

        if (msg.type === 'STUDENT_JOIN') {
          // El Host registra al alumno
          if (!isStudentMode) {
            if (!players.some(p => p.id === msg.player.id || p.name === msg.player.name)) {
              players.push({
                id: msg.player.id,
                name: msg.player.name,
                avatar: msg.player.avatar || '🚗',
                cat: msg.player.cat || 'B1',
                score: 0
              });
              Sound.chime();
              render();
            }
          }
        } else if (msg.type === 'STUDENT_ANSWER') {
          if (!isStudentMode) {
            const currentQ = questions[currentQIdx];
            const isCorrect = msg.shape === currentQ.correctShape;
            const points = isCorrect ? 900 : 0;
            players = players.map(p => {
              if (p.id === msg.playerId) {
                return { ...p, score: p.score + points, lastShape: msg.shape };
              }
              return p;
            });
            render();
          }
        } else if (msg.type === 'STAGE_CHANGE') {
          if (isStudentMode) {
            currentStage = msg.stage;
            currentQIdx = msg.currentQIdx || 0;
            if (currentStage === 'question') {
              studentSelectedShape = null;
              Sound.chime();
            } else if (currentStage === 'result') {
              Sound.correct();
            }
            render();
          }
        }
      }
    };

    SYNC_BUS.init();

    // Render dispatcher
    function render() {
      const root = document.getElementById('app');
      if (isStudentMode) {
        renderStudentView(root);
      } else {
        renderHostView(root);
      }
    }

    // --- 4. VISTA DE HOST (PROYECTOR) ---
    function renderHostView(root) {
      let baseOrigin = window.location.origin;
      if (baseOrigin.includes('ais-dev-')) {
        baseOrigin = baseOrigin.replace('ais-dev-', 'ais-pre-');
      }
      const savedBase = localStorage.getItem('vialkahoot_custom_url');
      const currentUrl = (savedBase || baseOrigin + window.location.pathname).split('?')[0] + '?pin=' + currentPin;
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=' + encodeURIComponent(currentUrl);

      if (currentStage === 'lobby') {
        root.innerHTML = \`
          <header class="p-6 border-b border-slate-800 flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full gap-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black">🚗</span>
              <div>
                <h1 class="text-2xl font-black text-white">Vial <span class="text-amber-400">interactivo</span></h1>
                <p class="text-xs text-slate-400">Título III - Ley 769 de 2002 • Centro de Enseñanza Automovilística</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="toggleQuestionManager()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-sky-400">
                ⚙️ Banco Preguntas (\${questions.length})
              </button>
              <button onclick="programTimeModal()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-xs font-bold rounded-xl text-amber-300">
                ⏱ Tiempo (\${questions[0]?.timeLimit || 20}s)
              </button>
              <button onclick="addBotPlayer()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-amber-300">
                + Alumno Demo
              </button>
              <button onclick="toggleRole()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-slate-300">
                📱 Probar como Alumno
              </button>
            </div>
          </header>

          <main class="max-w-6xl mx-auto w-full my-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <!-- QR y PIN -->
            <div class="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
              <div class="p-3 bg-white rounded-2xl shadow-xl shrink-0 text-center">
                <img src="\${qrUrl}" alt="QR" class="w-44 h-44 object-contain rounded" />
                <p class="text-[11px] text-slate-800 font-bold mt-1">📱 Escanea con tu cámara</p>
                <span class="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-1">
                  ✓ Acceso libre (sin cuenta)
                </span>
              </div>
              <div class="space-y-3 text-center sm:text-left flex-1">
                <p class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">PIN de la Clase</p>
                <p class="text-6xl font-black text-amber-400 font-mono tracking-widest">\${currentPin}</p>
                <p class="text-xs text-slate-400">Pide a los alumnos escanear el QR o abrir el enlace:</p>
                <input type="text" readonly value="\${currentUrl}" class="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono select-all outline-none" />
                <p class="text-[10px] text-slate-500">⚡ Sin inicio de sesión ni registro de Google.</p>
              </div>
            </div>

            <!-- Lista de Alumnos -->
            <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex justify-between">
                  <span>Alumnos Registrados en Tiempo Real</span>
                  <span class="text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">\${players.length}</span>
                </h3>
                <div class="grid grid-cols-2 gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
                  \${players.map(p => \`
                    <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div class="flex items-center gap-2 truncate">
                        <span class="text-xl">\${p.avatar}</span>
                        <div class="truncate">
                          <p class="font-bold truncate text-white">\${p.name}</p>
                          <span class="text-[10px] text-amber-400 font-mono">Cat. \${p.cat || 'B1'}</span>
                        </div>
                      </div>
                    </div>
                  \`).join('')}
                </div>
              </div>

              <button onclick="startGame()" class="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-lg shadow-xl hover:brightness-110 cursor-pointer">
                ¡INICIAR EVALUACIÓN!
              </button>
            </div>
          </main>
          \${renderQuestionManagerModalHtml()}
        \`;
      } else if (currentStage === 'question') {
        const q = questions[currentQIdx];
        root.innerHTML = \`
          <header class="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
            <span class="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-sm">
              Pregunta \${currentQIdx + 1} de \${questions.length}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-3xl font-black font-mono \${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'} bg-slate-900 px-5 py-2 rounded-2xl border border-slate-800">\${timer}s</span>
              <button onclick="skipQuestion()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold">Saltar</button>
              <button onclick="cancelGameToLobby()" class="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-bold">Cancelar Prueba</button>
            </div>
          </header>

          <main class="max-w-6xl mx-auto w-full my-auto p-4 space-y-6">
            <div class="text-center">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30">
                ⚖️ \${q.article}
              </span>
            </div>
            <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl">
              <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">\${q.question}</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-xl flex items-center gap-4 shadow-xl border border-white/10">
                <span class="text-3xl font-black bg-black/20 w-12 h-12 flex items-center justify-center rounded-xl">▲</span> <span>\${q.options[0].text}</span>
              </div>
              <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center gap-4 shadow-xl border border-white/10">
                <span class="text-3xl font-black bg-black/20 w-12 h-12 flex items-center justify-center rounded-xl">■</span> <span>\${q.options[1].text}</span>
              </div>
              <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-xl flex items-center gap-4 shadow-xl border border-white/10">
                <span class="text-3xl font-black bg-black/20 w-12 h-12 flex items-center justify-center rounded-xl">●</span> <span>\${q.options[2].text}</span>
              </div>
              <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xl flex items-center gap-4 shadow-xl border border-white/10">
                <span class="text-3xl font-black bg-black/20 w-12 h-12 flex items-center justify-center rounded-xl">◆</span> <span>\${q.options[3].text}</span>
              </div>
            </div>
          </main>
        \`;
      } else if (currentStage === 'result') {
        const q = questions[currentQIdx];
        const correctOpt = q.options.find(o => o.shape === q.correctShape);
        root.innerHTML = \`
          <header class="p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-slate-800">
            <h2 class="text-xl font-black text-amber-400">Resultados - Pregunta \${currentQIdx + 1} de \${questions.length}</h2>
            <div class="flex items-center gap-2">
              <button onclick="cancelGameToLobby()" class="px-4 py-3 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs rounded-2xl">
                Cancelar Prueba
              </button>
              <button onclick="nextQuestion()" class="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm hover:brightness-110">
                \${currentQIdx + 1 >= questions.length ? 'Ver Podio Final 🏆' : 'Siguiente Pregunta →'}
              </button>
            </div>
          </header>

          <main class="max-w-5xl mx-auto w-full my-auto p-6 space-y-6">
            <div class="bg-emerald-950/60 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl">
              <span class="text-xs font-bold uppercase text-emerald-400">✓ Respuesta Correcta:</span>
              <p class="text-2xl md:text-3xl font-black text-white mt-1">\${correctOpt ? correctOpt.text : ''}</p>
              <div class="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 text-xs text-slate-300">
                <strong class="text-amber-400 font-bold block mb-1">Fundamento Jurídico: \${q.article}</strong>
                \${q.explanation}
              </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 class="text-sm font-bold text-slate-400 mb-4 uppercase">Top Alumnos</h3>
              <div class="space-y-2">
                \${players.slice(0, 5).sort((a,b) => b.score - a.score).map((p, idx) => \`
                  <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-sm font-bold">
                    <div class="flex items-center gap-2">
                      <span class="text-amber-400 font-mono">#\${idx + 1}</span>
                      <span>\${p.avatar}</span>
                      <span>\${p.name}</span>
                    </div>
                    <span class="text-amber-400 font-mono">\${p.score} pts</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          </main>
        \`;
      } else if (currentStage === 'podium') {
        const sorted = [...players].sort((a, b) => b.score - a.score);
        root.innerHTML = \`
          <main class="max-w-4xl mx-auto w-full my-auto p-6 text-center space-y-8">
            <span class="text-7xl block animate-bounce">🏆</span>
            <h1 class="text-4xl font-black text-white">¡Gran Final Vial interactivo!</h1>
            <p class="text-sm text-amber-400">Evaluación del Título III de la Ley 769 de 2002 aprobada</p>

            <div class="grid grid-cols-3 gap-4 items-end max-w-lg mx-auto pt-8">
              <div class="bg-slate-700 h-44 rounded-t-2xl p-4 flex flex-col justify-end items-center">
                <span class="text-4xl">\${sorted[1]?.avatar || '🚗'}</span>
                <p class="text-xs font-bold truncate w-full mt-1">\${sorted[1]?.name || 'Plata'}</p>
                <span class="text-3xl font-black font-mono">2°</span>
                <span class="text-xs text-slate-300 font-mono">\${sorted[1]?.score || 0} pts</span>
              </div>
              <div class="bg-gradient-to-t from-amber-600 to-yellow-400 text-slate-950 h-64 rounded-t-2xl p-4 flex flex-col justify-end items-center shadow-2xl">
                <span class="text-5xl">\${sorted[0]?.avatar || '👑'}</span>
                <p class="text-sm font-black truncate w-full mt-1">\${sorted[0]?.name || 'Oro'}</p>
                <span class="text-4xl font-black font-mono">1°</span>
                <span class="text-xs font-black font-mono">\${sorted[0]?.score || 0} pts</span>
              </div>
              <div class="bg-amber-900 h-36 rounded-t-2xl p-4 flex flex-col justify-end items-center">
                <span class="text-4xl">\${sorted[2]?.avatar || '🚙'}</span>
                <p class="text-xs font-bold truncate w-full mt-1">\${sorted[2]?.name || 'Bronce'}</p>
                <span class="text-3xl font-black font-mono">3°</span>
                <span class="text-xs text-slate-300 font-mono">\${sorted[2]?.score || 0} pts</span>
              </div>
            </div>

            <div class="pt-6 flex justify-center gap-3">
              <button onclick="resetGame()" class="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-base shadow-xl">
                Reiniciar Evaluación
              </button>
            </div>
          </main>
        \`;
      }
    }

    // --- 5. VISTA DE ESTUDIANTE (MÓVIL) ---
    function renderStudentView(root) {
      if (!studentJoined) {
        root.innerHTML = \`
          <main class="max-w-sm mx-auto w-full my-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div class="text-center space-y-1">
              <span class="text-5xl block">🚗</span>
              <h1 class="text-2xl font-black text-white">Vial <span class="text-amber-400">interactivo</span></h1>
              <p class="text-xs text-slate-400">Ingreso a la clase de Normas de Tránsito</p>
            </div>
            <div>
              <label class="text-xs font-bold uppercase text-slate-400 block mb-1">PIN de la Clase</label>
              <input id="stuPin" type="text" value="\${currentPin}" class="w-full text-center text-3xl font-black font-mono p-3 bg-slate-950 border border-slate-700 rounded-2xl text-amber-300 outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold uppercase text-slate-400 block mb-1">Nombre y Apellido</label>
              <input id="stuName" type="text" placeholder="Ej. Camila Morales" class="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold uppercase text-slate-400 block mb-1">Categoría de Licencia (Colombia)</label>
              <select id="stuCat" class="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white font-medium">
                <option value="A1">A1 - Motocicletas hasta 125 c.c. 🛵</option>
                <option value="A2">A2 - Motocicletas más de 125 c.c. 🏍️</option>
                <option value="B1" selected>B1 - Automóviles particulares 🚗</option>
                <option value="B2">B2 - Camiones y busetas particulares 🚙</option>
                <option value="B3">B3 - Tractocamiones particulares 🚛</option>
                <option value="C1">C1 - Servicio público liviano (Taxis) 🚕</option>
                <option value="C2">C2 - Buses y camiones públicos 🚌</option>
                <option value="C3">C3 - Articulados servicio público 🚚</option>
              </select>
            </div>
            <button onclick="studentJoin()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base shadow-lg cursor-pointer">
              ¡Entrar a la Clase!
            </button>
            <div class="text-center pt-2">
              <button onclick="toggleRole()" class="text-xs text-slate-500 hover:text-amber-400 underline">
                ¿Eres el profesor? Ir a Proyector
              </button>
            </div>
          </main>
        \`;
      } else {
        root.innerHTML = \`
          <header class="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <span class="font-bold text-sm text-white">\${studentName}</span>
            <span class="text-amber-400 font-mono font-bold text-sm">\${studentScore} pts</span>
          </header>

          <main class="max-w-md mx-auto w-full my-auto p-4 flex flex-col justify-center">
            \${studentSelectedShape ? \`
              <div class="text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <span class="text-6xl block">✅</span>
                <h3 class="text-2xl font-black text-white">¡Respuesta Enviada!</h3>
                <p class="text-xs text-slate-400">Atento a la explicación jurídica en la pantalla del proyector.</p>
              </div>
            \` : \`
              <div class="grid grid-cols-2 gap-3 aspect-square">
                <button onclick="studentAnswer('triangle')" class="btn-shape rounded-3xl bg-red-600 text-white flex flex-col items-center justify-center shadow-xl p-3">
                  <span class="text-6xl">🏍️</span>
                  <span class="text-xs font-black uppercase tracking-wider mt-1 text-white">Motocicleta</span>
                </button>
                <button onclick="studentAnswer('square')" class="btn-shape rounded-3xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-xl p-3">
                  <span class="text-6xl">🚗</span>
                  <span class="text-xs font-black uppercase tracking-wider mt-1 text-white">Automóvil</span>
                </button>
                <button onclick="studentAnswer('circle')" class="btn-shape rounded-3xl bg-amber-500 text-slate-950 flex flex-col items-center justify-center shadow-xl p-3">
                  <span class="text-6xl">🚌</span>
                  <span class="text-xs font-black uppercase tracking-wider mt-1 text-slate-950">Bus</span>
                </button>
                <button onclick="studentAnswer('diamond')" class="btn-shape rounded-3xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-xl p-3">
                  <span class="text-6xl">🚛</span>
                  <span class="text-xs font-black uppercase tracking-wider mt-1 text-white">Camión</span>
                </button>
              </div>
            \`}
          </main>
          <footer class="text-center text-xs text-slate-500 p-2">
            Mira la pantalla del proyector para ver el enunciado
          </footer>
        \`;
      }
    }

    // --- 6. ACCIONES DEL JUEGO ---
    window.startGame = function() {
      currentStage = 'question';
      currentQIdx = 0;
      SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'question', currentQIdx: 0 });
      startQuestionTimer();
      render();
    };

    function startQuestionTimer() {
      clearInterval(timerInterval);
      timer = questions[currentQIdx]?.timeLimit || 20;
      studentSelectedShape = null;
      Sound.chime();
      timerInterval = setInterval(() => {
        timer--;
        Sound.tick(timer <= 5);
        if (timer <= 0) {
          clearInterval(timerInterval);
          finishQuestion();
        }
        render();
      }, 1000);
    }

    window.skipQuestion = function() {
      clearInterval(timerInterval);
      finishQuestion();
    };

    function finishQuestion() {
      currentStage = 'result';
      SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'result', currentQIdx });
      // Simular respuestas de bots
      players.forEach(p => {
        if (p.id.startsWith('bot') && Math.random() > 0.3) p.score += 850;
      });
      Sound.correct();
      render();
    }

    window.nextQuestion = function() {
      if (currentQIdx + 1 >= questions.length) {
        currentStage = 'podium';
        SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'podium', currentQIdx });
      } else {
        currentQIdx++;
        currentStage = 'question';
        SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'question', currentQIdx });
        startQuestionTimer();
      }
      render();
    };

    window.cancelGameToLobby = function() {
      if (confirm('¿Deseas cancelar la prueba en curso y regresar al lobby con todos los estudiantes conectados?')) {
        clearInterval(timerInterval);
        currentStage = 'lobby';
        SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'lobby', currentQIdx: 0 });
        render();
      }
    };

    window.programTimeModal = function() {
      const current = questions[0]?.timeLimit || 20;
      const input = prompt('Ingresa los segundos de respuesta para las preguntas (ej. 10, 15, 20, 30, 45, 60):', current.toString());
      if (input !== null) {
        const sec = parseInt(input.trim(), 10);
        if (!isNaN(sec) && sec >= 5 && sec <= 180) {
          questions.forEach(q => q.timeLimit = sec);
          render();
        } else {
          alert('Por favor ingresa un número válido entre 5 y 180 segundos.');
        }
      }
    };

    window.resetGame = function() {
      currentStage = 'lobby';
      players.forEach(p => p.score = 0);
      SYNC_BUS.send({ type: 'STAGE_CHANGE', stage: 'lobby', currentQIdx: 0 });
      render();
    };

    window.addBotPlayer = function() {
      const demoList = [
        { name: 'Camila Ospina (B/manga)', cat: 'B1', av: '🚙' },
        { name: 'Javier Restrepo (Pereira)', cat: 'C2', av: '🚛' },
        { name: 'Mateo Cardona (Manizales)', cat: 'A2', av: '🏍️' }
      ];
      const chosen = demoList[Math.floor(Math.random() * demoList.length)];
      players.push({ id: 'bot_' + Date.now(), name: chosen.name, avatar: chosen.av, cat: chosen.cat, score: 0 });
      Sound.chime();
      render();
    };

    window.toggleRole = function() {
      isStudentMode = !isStudentMode;
      render();
    };

    window.studentJoin = function() {
      const nameInput = document.getElementById('stuName');
      const catInput = document.getElementById('stuCat');
      const pinInput = document.getElementById('stuPin');
      if (!nameInput.value.trim()) return alert('Por favor ingresa tu nombre');

      studentName = nameInput.value.trim();
      studentCat = catInput ? catInput.value : 'B1';
      if (pinInput && pinInput.value.trim()) {
        currentPin = pinInput.value.trim().replace(/\\s+/g, '');
      }
      studentJoined = true;
      Sound.chime();

      // Transmitir evento a la pantalla del Host a través de todos los canales
      SYNC_BUS.send({
        type: 'STUDENT_JOIN',
        player: {
          id: studentId,
          name: studentName,
          cat: studentCat,
          avatar: studentAvatar
        }
      });

      render();
    };

    window.studentAnswer = function(shape) {
      studentSelectedShape = shape;
      if (navigator.vibrate) navigator.vibrate(60);

      // Notificar al Host
      SYNC_BUS.send({
        type: 'STUDENT_ANSWER',
        playerId: studentId,
        shape: shape
      });

      const isCorrect = shape === questions[currentQIdx].correctShape;
      if (isCorrect) {
        studentScore += 900;
        Sound.correct();
      }
      render();
    };

    // Modal del Banco de Preguntas
    function renderQuestionManagerModalHtml() {
      if (!isQuestionManagerOpen) return '';
      return \`
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-left">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 class="text-lg font-bold text-white">Banco de Preguntas CEA (\${questions.length})</h3>
              <button onclick="toggleQuestionManager()" class="text-slate-400 hover:text-white font-bold p-1">✕</button>
            </div>
            <div class="space-y-3">
              \${questions.map((q, idx) => \`
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-amber-400">#\${idx + 1} - \${q.topic}</span>
                    <div class="space-x-3">
                      <button onclick="editQuestion('\${q.id}')" class="text-sky-400 hover:underline font-bold">✏️ Editar</button>
                      <button onclick="deleteQuestion('\${q.id}')" class="text-red-400 hover:underline">Eliminar</button>
                    </div>
                  </div>
                  <p class="text-white font-semibold">\${q.question}</p>
                  <p class="text-slate-400 italic">Norma: \${q.article}</p>
                  <div class="grid grid-cols-2 gap-1 text-[11px] text-slate-300 pt-1">
                    \${q.options.map(o => \`
                      <div class="p-1 rounded \${o.shape === q.correctShape ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold' : 'bg-slate-900 text-slate-400'}">
                        \${o.shape === 'triangle' ? '🏍️' : o.shape === 'square' ? '🚗' : o.shape === 'circle' ? '🚌' : '🚛'} \${o.text} \${o.shape === q.correctShape ? '✓' : ''}
                      </div>
                    \`).join('')}
                  </div>
                </div>
              \`).join('')}
            </div>
            <div class="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button onclick="restoreDefaults()" class="text-xs text-slate-400 hover:text-amber-400">Restaurar Oficiales</button>
              <button onclick="toggleQuestionManager()" class="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl">Cerrar</button>
            </div>
          </div>
        </div>
      \`;
    }

    window.toggleQuestionManager = function() {
      isQuestionManagerOpen = !isQuestionManagerOpen;
      render();
    };

    window.editQuestion = function(id) {
      const q = questions.find(item => item.id === id);
      if (!q) return;
      const newText = prompt('Editar enunciado de la pregunta:', q.question);
      if (newText === null || !newText.trim()) return;
      q.question = newText.trim();
      
      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        const optLabel = opt.shape === 'triangle' ? '🏍️ ▲ Motocicleta (Rojo)' :
                         opt.shape === 'square' ? '🚗 ■ Automóvil (Azul)' :
                         opt.shape === 'circle' ? '🚌 ● Bus (Amarillo)' : '🚛 ◆ Camión (Verde)';
        const newOpt = prompt('Editar texto de ' + optLabel + ':', opt.text);
        if (newOpt !== null && newOpt.trim()) {
          opt.text = newOpt.trim();
        }
      }

      const shapes = ['triangle', 'square', 'circle', 'diamond'];
      const currentNum = shapes.indexOf(q.correctShape) + 1;
      const correctNum = prompt('¿Cuál es la respuesta correcta? (1=Motocicleta, 2=Automóvil, 3=Bus, 4=Camión):', String(currentNum));
      const parsedNum = parseInt(correctNum, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 4) {
        q.correctShape = shapes[parsedNum - 1];
      }
      
      saveQuestions(questions);
      render();
    };

    window.deleteQuestion = function(id) {
      if (questions.length <= 1) return alert('Debe haber al menos 1 pregunta en el banco.');
      saveQuestions(questions.filter(q => q.id !== id));
      render();
    };

    window.restoreDefaults = function() {
      saveQuestions(DEFAULT_QUESTIONS);
      render();
    };

    // Render inicial
    render();
  </script>
</body>
</html>`;
}
