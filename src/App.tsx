import { useState, useEffect, useRef } from 'react';
import { GameStage, Player, Question, ShapeType } from './types/game';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';
import { HostLobby } from './components/HostLobby';
import { HostQuestion } from './components/HostQuestion';
import { HostResults } from './components/HostResults';
import { HostPodium } from './components/HostPodium';
import { StudentView } from './components/StudentView';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { syncBus, SyncMessage } from './utils/syncChannel';
import { soundManager } from './utils/sound';
import { getSingleHtmlContent } from './utils/generateSingleHtml';
import { InstallAppModal } from './components/InstallAppModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Smartphone, Monitor, Columns, Download } from 'lucide-react';

function computePublicBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const saved = localStorage.getItem('vialkahoot_custom_base_url');
  if (saved && saved.trim()) return saved.trim();

  return window.location.origin + window.location.pathname;
}

export default function App() {
  // Detect role from URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const paramPin = urlParams.get('pin');
  const paramRole = urlParams.get('role');

  const [role, setRole] = useState<'host' | 'student'>(
    paramRole === 'student' || Boolean(paramPin) ? 'student' : 'host'
  );
  const [dualView, setDualView] = useState(false);

  // --- HOST STATE ---
  const [pin, setPin] = useState(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('vialkahoot_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_QUESTIONS;
  });

  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stage, setStage] = useState<GameStage>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [baseUrl, setBaseUrl] = useState<string>(computePublicBaseUrl);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.appUrl) {
          const publicUrl = data.appUrl;
          if (!localStorage.getItem('vialkahoot_custom_base_url')) {
            // Only auto-adopt if publicUrl is a production domain (not the internal private ais-dev sandbox)
            if (!publicUrl.includes('ais-dev-')) {
              setBaseUrl(publicUrl);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateBaseUrl = (newUrl: string) => {
    let clean = newUrl.trim();
    if (!clean) {
      localStorage.removeItem('vialkahoot_custom_base_url');
      setBaseUrl(computePublicBaseUrl());
    } else {
      if (!/^https?:\/\//i.test(clean)) {
        clean = 'https://' + clean;
      }
      localStorage.setItem('vialkahoot_custom_base_url', clean);
      setBaseUrl(clean);
    }
  };

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const joinUrl = `${cleanBase}?pin=${pin}&role=student`;

  // Save questions to localStorage
  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    try {
      localStorage.setItem('vialkahoot_questions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Update time limit globally for all questions in this session
  const handleUpdateGlobalTime = (newSeconds: number) => {
    const updated = questions.map((q) => ({
      ...q,
      timeLimit: newSeconds,
    }));
    setQuestions(updated);
    try {
      localStorage.setItem('vialkahoot_questions', JSON.stringify(updated));
      localStorage.setItem('vialkahoot_default_time_limit', newSeconds.toString());
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Add extra seconds on-the-fly during an active question
  const handleAddTime = (seconds: number) => {
    setTimeRemaining((prev) => Math.max(1, prev + seconds));
  };

  const handleRegeneratePin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
  };

  // Add demo players for CEA simulation
  const handleAddDemoPlayers = () => {
    const demoCandidates: Array<{ name: string; category: Player['category']; avatar: string }> = [
      { name: 'Carlos Mario (Medellín)', category: 'A2', avatar: '🏍️' },
      { name: 'Valentina Gómez (Bogotá)', category: 'B1', avatar: '🚗' },
      { name: 'Andrés Felipe (Cali)', category: 'C1', avatar: '🚕' },
      { name: 'Camila Ospina (B/manga)', category: 'B1', avatar: '🚙' },
      { name: 'Javier Restrepo (Pereira)', category: 'C2', avatar: '🚛' },
    ];

    const currentNames = new Set(players.map((p) => p.name));
    const available = demoCandidates.filter((c) => !currentNames.has(c.name));
    const toAdd = available.slice(0, 3);

    if (toAdd.length === 0) {
      alert('Ya se han añadido los alumnos de demostración.');
      return;
    }

    const newPlayers: Player[] = toAdd.map((c, i) => ({
      id: `bot-${Date.now()}-${i}`,
      name: c.name,
      category: c.category,
      avatar: c.avatar,
      score: 0,
      streak: 0,
      connectedAt: Date.now(),
    }));

    setPlayers((prev) => [...prev, ...newPlayers]);
    soundManager.playChime();
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Export standalone single HTML
  const handleExportHtml = () => {
    const html = getSingleHtmlContent();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Vial_interactivo_Ley769.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Connect syncBus to Host PIN and listen for student events
  useEffect(() => {
    if (role === 'host') {
      syncBus.connectToPin(pin, true);
    }
  }, [role, pin]);

  // Listen to incoming student messages in Host mode
  useEffect(() => {
    const cleanHostPin = pin.trim().replace(/\s+/g, '');

    const unsubscribe = syncBus.subscribe((msg: SyncMessage) => {
      if (role !== 'host') return;
      const cleanMsgPin = (msg.pin || '').trim().replace(/\s+/g, '');
      if (cleanMsgPin !== cleanHostPin) return;

      if (msg.type === 'STUDENT_JOIN') {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === msg.player.id)) return prev;
          return [
            ...prev,
            {
              id: msg.player.id,
              name: msg.player.name,
              category: (msg.player.category as Player['category']) || 'B1',
              avatar: msg.player.avatar || '🚗',
              score: 0,
              streak: 0,
              connectedAt: Date.now(),
            },
          ];
        });
        soundManager.playChime();
      } else if (msg.type === 'STUDENT_ANSWER') {
        const currentQ = questions[currentQuestionIndex];
        if (!currentQ) return;

        const isCorrect = msg.shape === currentQ.correctShape;
        // Points calculation: max 1000 pts with speed bonus
        const timeLimit = currentQ.timeLimit || 20;
        const timeRatio = Math.max(0, Math.min(1, timeRemaining / timeLimit));
        const pointsEarned = isCorrect ? Math.round(500 + 500 * timeRatio) : 0;

        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id !== msg.playerId) return p;
            const newStreak = isCorrect ? p.streak + 1 : 0;
            const streakBonus = isCorrect && newStreak > 1 ? (newStreak - 1) * 50 : 0;
            return {
              ...p,
              score: p.score + pointsEarned + streakBonus,
              streak: newStreak,
              lastAnswer: {
                shape: msg.shape as ShapeType,
                isCorrect,
                timeMs: msg.timeMs,
                pointsEarned: pointsEarned + streakBonus,
              },
            };
          })
        );
      }
    });

    // Session poll to catch all joined students
    const pollTimer = setInterval(async () => {
      if (role !== 'host') return;
      try {
        const res = await fetch(`/api/game/session?pin=${encodeURIComponent(cleanHostPin)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.players && Array.isArray(data.players)) {
            setPlayers((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newlyAdded = data.players.filter((p: any) => !existingIds.has(p.id));
              if (newlyAdded.length === 0) return prev;
              soundManager.playChime();
              return [
                ...prev,
                ...newlyAdded.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  category: (p.category as Player['category']) || 'B1',
                  avatar: p.avatar || '🚗',
                  score: p.score || 0,
                  streak: 0,
                  connectedAt: Date.now(),
                })),
              ];
            });
          }
        }
      } catch {
        // Ignore network errors in local dev
      }
    }, 1800);

    return () => {
      unsubscribe();
      clearInterval(pollTimer);
    };
  }, [role, pin, questions, currentQuestionIndex, timeRemaining]);

  // Handle Question Timer in Host
  useEffect(() => {
    if (stage !== 'question') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    const initialTime = currentQ?.timeLimit || 20;
    setTimeRemaining(initialTime);

    // Notify connected students
    syncBus.send({
      type: 'QUESTION_START',
      pin,
      questionIndex: currentQuestionIndex,
      timeLimit: initialTime,
    });

    // Simulate bot answers gradually during the countdown
    const botIds = players.filter((p) => p.id.startsWith('bot-')).map((p) => p.id);
    const botTimeouts: NodeJS.Timeout[] = [];

    botIds.forEach((botId) => {
      const delay = Math.random() * (initialTime - 4) * 1000 + 2000;
      const t = setTimeout(() => {
        const shapes: ShapeType[] = ['triangle', 'square', 'circle', 'diamond'];
        // 75% chance the bot picks the correct answer
        const chosenShape: ShapeType =
          Math.random() < 0.75
            ? currentQ.correctShape
            : shapes[Math.floor(Math.random() * shapes.length)];

        syncBus.send({
          type: 'STUDENT_ANSWER',
          pin,
          playerId: botId,
          shape: chosenShape,
          timeMs: Date.now(),
        });
      }, delay);
      botTimeouts.push(t);
    });

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      botTimeouts.forEach(clearTimeout);
    };
  }, [stage, currentQuestionIndex]);

  // When question time runs out
  const handleTimeUp = () => {
    const currentQ = questions[currentQuestionIndex];
    syncBus.send({
      type: 'QUESTION_TIME_UP',
      pin,
      questionIndex: currentQuestionIndex,
      correctShape: currentQ.correctShape,
    });
    setStage('question-result');
  };

  const handleStartGame = () => {
    if (players.length === 0) return;
    setCurrentQuestionIndex(0);
    // Reset answers
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, score: 0, streak: 0, lastAnswer: undefined }))
    );
    setStage('question');
    soundManager.playChime();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      setStage('podium');
      const sorted = [...players].sort((a, b) => b.score - a.score);
      syncBus.send({
        type: 'GAME_OVER',
        pin,
        podium: sorted.map((p, idx) => ({
          id: p.id,
          name: p.name,
          score: p.score,
          rank: idx + 1,
        })),
      });
    } else {
      // Clear last answers
      setPlayers((prev) => prev.map((p) => ({ ...p, lastAnswer: undefined })));
      setCurrentQuestionIndex((prev) => prev + 1);
      setStage('question');
    }
  };

  const handleRestartGame = () => {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, score: 0, streak: 0, lastAnswer: undefined }))
    );
    setCurrentQuestionIndex(0);
    setStage('question');
  };

  const handleBackToLobby = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setPlayers((prev) => prev.map((p) => ({ ...p, lastAnswer: undefined })));
    setStage('lobby');
    syncBus.send({
      type: 'GAME_STAGE_CHANGE',
      pin,
      stage: 'lobby',
      currentQuestionIndex: 0,
      timeRemaining: 20,
      totalQuestions: questions.length,
    });
  };

  const totalAnswers = players.filter((p) => p.lastAnswer !== undefined).length;

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Top Floating Control Bar for Demo / Role Switching (Only shown on Host or DualView screen) */}
      {(role === 'host' || dualView) && (
        <div className="fixed top-2 right-2 z-50 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl text-xs">
          <button
            onClick={() => {
              setRole('host');
              setDualView(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition ${
              role === 'host' && !dualView
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Pantalla Proyector del Profesor"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Proyector Host</span>
          </button>

          <button
            onClick={() => {
              setRole('student');
              setDualView(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition ${
              role === 'student' && !dualView
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Pantalla Celular del Estudiante"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Celular Alumno</span>
          </button>

          <button
            onClick={() => {
              setRole('host');
              setDualView(!dualView);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition ${
              dualView
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Ver Proyector y Celular Lado a Lado"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vista Dual</span>
          </button>

          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl font-bold transition shadow-sm"
            title="Descargar o Instalar App en mi dispositivo"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Descargar App</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      {dualView ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 min-h-screen">
          {/* Host Screen (Left / 8 cols) */}
          <div className="xl:col-span-8 border-r border-slate-800">
            {stage === 'lobby' && (
              <HostLobby
                pin={pin}
                onRegeneratePin={handleRegeneratePin}
                players={players}
                questions={questions}
                onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
                onStartGame={handleStartGame}
                onAddDemoPlayers={handleAddDemoPlayers}
                onRemovePlayer={handleRemovePlayer}
                onExportHtml={handleExportHtml}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
                joinUrl={joinUrl}
                onUpdateBaseUrl={handleUpdateBaseUrl}
                onOpenDualView={() => setDualView(true)}
                onUpdateGlobalTime={handleUpdateGlobalTime}
              />
            )}
            {stage === 'question' && (
              <HostQuestion
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                timeRemaining={timeRemaining}
                totalAnswers={totalAnswers}
                totalPlayers={players.length}
                onSkipTime={handleTimeUp}
                onCancelGame={handleBackToLobby}
                onAddTime={handleAddTime}
              />
            )}
            {stage === 'question-result' && (
              <HostResults
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                players={players}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={currentQuestionIndex + 1 >= questions.length}
                onCancelGame={handleBackToLobby}
              />
            )}
            {stage === 'podium' && (
              <HostPodium
                players={players}
                onRestart={handleRestartGame}
                onBackToLobby={handleBackToLobby}
              />
            )}
          </div>

          {/* Student Mobile Phone Mockup (Right / 4 cols) */}
          <div className="xl:col-span-4 bg-slate-950 p-4 flex flex-col items-center justify-center border-t xl:border-t-0 border-slate-800">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                📱 Simulador Móvil de Alumno
              </span>
            </div>
            <div className="w-full max-w-sm rounded-[40px] border-4 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl p-1 min-h-[640px] flex flex-col">
              <StudentView
                initialPin={pin}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
              />
            </div>
          </div>
        </div>
      ) : role === 'student' ? (
        <StudentView
          initialPin={paramPin || pin}
          onSwitchToHost={() => setRole('host')}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />
      ) : (
        <>
          {stage === 'lobby' && (
            <HostLobby
              pin={pin}
              onRegeneratePin={handleRegeneratePin}
              players={players}
              questions={questions}
              onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
              onStartGame={handleStartGame}
              onAddDemoPlayers={handleAddDemoPlayers}
              onRemovePlayer={handleRemovePlayer}
              onExportHtml={handleExportHtml}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              joinUrl={joinUrl}
              onUpdateBaseUrl={handleUpdateBaseUrl}
              onOpenDualView={() => setDualView(true)}
              onUpdateGlobalTime={handleUpdateGlobalTime}
            />
          )}
          {stage === 'question' && (
            <HostQuestion
              question={questions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              timeRemaining={timeRemaining}
              totalAnswers={totalAnswers}
              totalPlayers={players.length}
              onSkipTime={handleTimeUp}
              onCancelGame={handleBackToLobby}
              onAddTime={handleAddTime}
            />
          )}
          {stage === 'question-result' && (
            <HostResults
              question={questions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              players={players}
              onNextQuestion={handleNextQuestion}
              isLastQuestion={currentQuestionIndex + 1 >= questions.length}
              onCancelGame={handleBackToLobby}
            />
          )}
          {stage === 'podium' && (
            <HostPodium
              players={players}
              onRestart={handleRestartGame}
              onBackToLobby={handleBackToLobby}
            />
          )}
        </>
      )}

      {/* Question Bank Manager Modal */}
      <QuestionManagerModal
        isOpen={isQuestionManagerOpen}
        onClose={() => setIsQuestionManagerOpen(false)}
        questions={questions}
        onSaveQuestions={handleSaveQuestions}
      />

      {/* Download and Install PWA Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onDownloadHtml={handleExportHtml}
        appUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
