import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GameSession {
  pin: string;
  stage: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  players: Record<string, { id: string; name: string; category: string; avatar: string; score: number; streak: number; lastAnswer?: any }>;
  listeners: Array<(event: string, data: any) => void>;
}

const sessions: Record<string, GameSession> = {};

function getOrCreateSession(pin: string): GameSession {
  const cleanPin = pin.trim().replace(/\s+/g, '');
  if (!sessions[cleanPin]) {
    sessions[cleanPin] = {
      pin: cleanPin,
      stage: 'lobby',
      currentQuestionIndex: 0,
      timeRemaining: 20,
      players: {},
      listeners: [],
    };
  }
  return sessions[cleanPin];
}

function broadcastToSession(pin: string, event: string, data: any) {
  const session = sessions[pin.trim().replace(/\s+/g, '')];
  if (session) {
    session.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (e) {
        // Ignore disconnected
      }
    });
  }
}

async function startServer() {
  const app = express();
  
  // Dev server must always run on port 3000 in AI Studio dev environment.
  // When running in container, process.env.PORT is 8080 (used by Nginx proxy),
  // so we must never bind to 8080 in dev mode.
  let targetPort = 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    targetPort = parseInt(process.argv[portArgIndex + 1], 10);
  } else if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    targetPort = parseInt(process.env.PORT, 10);
  }
  const PORT = targetPort;

  app.use(express.json());

  // Enable CORS for all incoming requests (local WiFi IP, custom domains, static hosting)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES FOR REAL-TIME CEAS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Public config endpoint to provide the host's actual server URL
  app.get('/api/config', (req, res) => {
    const rawUrl = process.env.APP_URL || '';
    res.json({
      appUrl: rawUrl,
      rawUrl,
    });
  });

  // Get current game session info
  app.get('/api/game/session', (req, res) => {
    const pin = (req.query.pin as string) || '';
    if (!pin) {
      return res.status(400).json({ error: 'PIN requerido' });
    }
    const session = getOrCreateSession(pin);
    res.json({
      pin: session.pin,
      stage: session.stage,
      currentQuestionIndex: session.currentQuestionIndex,
      timeRemaining: session.timeRemaining,
      players: Object.values(session.players),
    });
  });

  // Student joins a game session
  app.post('/api/game/join', (req, res) => {
    const { pin, player } = req.body;
    if (!pin || !player || !player.id || !player.name) {
      return res.status(400).json({ error: 'PIN y datos del alumno requeridos' });
    }

    const session = getOrCreateSession(pin);
    session.players[player.id] = {
      id: player.id,
      name: player.name,
      category: player.category || 'B1',
      avatar: player.avatar || '🚗',
      score: 0,
      streak: 0,
    };

    // Notify host and all other subscribers
    broadcastToSession(pin, 'STUDENT_JOIN', {
      pin,
      player: session.players[player.id],
      totalPlayers: Object.keys(session.players).length,
    });

    res.json({ success: true, player: session.players[player.id] });
  });

  // Student answers a question
  app.post('/api/game/answer', (req, res) => {
    const { pin, playerId, shape, timeMs } = req.body;
    if (!pin || !playerId || !shape) {
      return res.status(400).json({ error: 'Datos de respuesta incompletos' });
    }

    const session = getOrCreateSession(pin);
    broadcastToSession(pin, 'STUDENT_ANSWER', {
      pin,
      playerId,
      shape,
      timeMs: timeMs || Date.now(),
    });

    res.json({ success: true });
  });

  // Host updates game stage (question start, time up, next question, podium)
  app.post('/api/game/stage', (req, res) => {
    const { pin, stage, currentQuestionIndex, timeLimit, correctShape, podium } = req.body;
    if (!pin || !stage) {
      return res.status(400).json({ error: 'PIN y etapa requeridos' });
    }

    const session = getOrCreateSession(pin);
    session.stage = stage;
    if (typeof currentQuestionIndex === 'number') {
      session.currentQuestionIndex = currentQuestionIndex;
    }

    if (stage === 'question') {
      broadcastToSession(pin, 'QUESTION_START', {
        pin,
        questionIndex: currentQuestionIndex ?? session.currentQuestionIndex,
        timeLimit: timeLimit || 20,
      });
    } else if (stage === 'question-result') {
      broadcastToSession(pin, 'QUESTION_TIME_UP', {
        pin,
        questionIndex: currentQuestionIndex ?? session.currentQuestionIndex,
        correctShape,
      });
    } else if (stage === 'podium') {
      broadcastToSession(pin, 'GAME_OVER', {
        pin,
        podium: podium || [],
      });
    } else {
      broadcastToSession(pin, 'GAME_STAGE_CHANGE', {
        pin,
        stage,
        currentQuestionIndex: session.currentQuestionIndex,
      });
    }

    res.json({ success: true });
  });

  // Server-Sent Events (SSE) stream for real-time live connection across real devices
  app.get('/api/game/events', (req, res) => {
    const pin = (req.query.pin as string) || '';
    if (!pin) {
      return res.status(400).send('PIN requerido');
    }

    const session = getOrCreateSession(pin);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', pin, stage: session.stage })}\n\n`);

    const listener = (event: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type: event, ...data })}\n\n`);
    };

    session.listeners.push(listener);

    // Keep-alive heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      session.listeners = session.listeners.filter((l) => l !== listener);
    });
  });

  // --- VITE MIDDLEWARES ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Vial interactivo server running on port ${PORT}`);
  });
}

startServer();
