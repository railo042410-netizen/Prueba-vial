import React, { useState, useEffect } from 'react';
import { ShapeType, LicenseCategory } from '../types/game';
import { syncBus, SyncMessage } from '../utils/syncChannel';
import { soundManager } from '../utils/sound';
import { Car, CheckCircle2, XCircle, Trophy, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  initialPin?: string;
  onSwitchToHost?: () => void;
  onOpenInstallModal?: () => void;
}

// Colombian Driver's License Categories (Resolución 1500 de 2005 / Ley 769 de 2002)
interface CategoryOption {
  code: LicenseCategory;
  name: string;
  description: string;
  badge: string;
  icon: string;
}

const COLOMBIAN_LICENSE_CATEGORIES: CategoryOption[] = [
  { code: 'A1', name: 'Motocicletas hasta 125 c.c.', description: 'Motos de baja cilindrada', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🛵' },
  { code: 'A2', name: 'Motocicletas más de 125 c.c.', description: 'Motos de alto cilindraje y mototaxis', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🏍️' },
  { code: 'B1', name: 'Automóviles Particulares', description: 'Carros, camperos, camionetas y microbuses', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: '🚗' },
  { code: 'B2', name: 'Camiones y Busetas Particulares', description: 'Camiones rígidos y busetas particulares', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: '🚙' },
  { code: 'B3', name: 'Vehículos Articulados Particulares', description: 'Tractocamiones y articulados particulares', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: '🚛' },
  { code: 'C1', name: 'Servicio Público Liviano', description: 'Taxis, automóviles y camperos de servicio público', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🚕' },
  { code: 'C2', name: 'Servicio Público Pesado', description: 'Camiones rígidos, buses y busetas de servicio público', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🚌' },
  { code: 'C3', name: 'Articulados Servicio Público', description: 'Tractocamiones y articulados de servicio público', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🚚' },
];

export const StudentView: React.FC<Props> = ({ initialPin = '', onSwitchToHost }) => {
  const [pin, setPin] = useState(initialPin);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LicenseCategory>('B1');
  const [isJoined, setIsJoined] = useState(false);
  const [playerId, setPlayerId] = useState('');

  // Game state from host
  const [gameStage, setGameStage] = useState<'lobby' | 'question' | 'result' | 'podium'>('lobby');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState<number | null>(null);

  const selectedCategoryObj = COLOMBIAN_LICENSE_CATEGORIES.find((c) => c.code === category) || COLOMBIAN_LICENSE_CATEGORIES[2];
  const avatar = selectedCategoryObj.icon;

  // Connect to sync channel when PIN is available
  useEffect(() => {
    if (initialPin && initialPin !== pin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  useEffect(() => {
    if (pin) {
      const clean = pin.trim().replace(/\s+/g, '');
      syncBus.connectToPin(clean, false);
    }
  }, [pin]);

  // Listen to sync events from Host
  useEffect(() => {
    const cleanPin = (pin || '').trim().replace(/\s+/g, '');

    const unsubscribe = syncBus.subscribe((msg: SyncMessage) => {
      const cleanMsgPin = (msg.pin || '').trim().replace(/\s+/g, '');
      if (cleanPin && cleanMsgPin && cleanMsgPin !== cleanPin) return;

      if (msg.type === 'QUESTION_START') {
        setGameStage('question');
        setQuestionIndex(msg.questionIndex);
        setSelectedShape(null);
        setHasAnswered(false);
        setAnswerResult(null);
      } else if (msg.type === 'QUESTION_TIME_UP') {
        setGameStage('result');
        if (selectedShape) {
          const isCorrect = selectedShape === msg.correctShape;
          const pointsEarned = isCorrect ? 900 : 0;
          setAnswerResult({ isCorrect, points: pointsEarned });
          if (isCorrect) {
            setScore((prev) => prev + pointsEarned);
            soundManager.playCorrect();
          } else {
            soundManager.playWrong();
          }
        } else {
          setAnswerResult({ isCorrect: false, points: 0 });
          soundManager.playWrong();
        }
      } else if (msg.type === 'GAME_STAGE_CHANGE') {
        if (msg.stage === 'lobby') {
          setGameStage('lobby');
          setSelectedShape(null);
          setHasAnswered(false);
          setAnswerResult(null);
        }
        if (msg.stage === 'question') setGameStage('question');
        if (msg.stage === 'question-result') setGameStage('result');
        if (msg.stage === 'podium') setGameStage('podium');
      } else if (msg.type === 'GAME_OVER') {
        setGameStage('podium');
        const found = msg.podium.find((p) => p.id === playerId);
        if (found) {
          setRank(found.rank);
          setScore(found.score);
        }
      }
    });

    return () => unsubscribe();
  }, [pin, playerId, selectedShape]);

  // Join action
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().replace(/\s+/g, '');
    if (!cleanPin) {
      alert('Por favor introduce el código PIN de 6 dígitos.');
      return;
    }
    if (!name.trim()) {
      alert('Por favor ingresa tu nombre.');
      return;
    }

    const newPlayerId = 'stu_' + Math.random().toString(36).substring(2, 9);
    setPlayerId(newPlayerId);
    setIsJoined(true);
    soundManager.playChime();

    // Ensure connection to PIN
    syncBus.connectToPin(cleanPin, false);

    // Broadcast join to Host with the selected license category
    syncBus.send({
      type: 'STUDENT_JOIN',
      pin: cleanPin,
      player: {
        id: newPlayerId,
        name: name.trim(),
        category,
        avatar,
      },
    });
  };

  // Submit Answer
  const handleAnswer = (shape: ShapeType) => {
    if (hasAnswered) return;
    setSelectedShape(shape);
    setHasAnswered(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(60);
      } catch {
        // Ignore
      }
    }
    soundManager.playTick(true);

    // Send answer to Host
    syncBus.send({
      type: 'STUDENT_ANSWER',
      pin: pin.trim().replace(/\s+/g, ''),
      playerId,
      shape,
      timeMs: Date.now(),
    });
  };

  // If not joined yet: Login Screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-3 sm:p-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          {/* Logo / Title */}
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">
              Vial <span className="text-amber-400">interactivo</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Evaluación Ley 769 de 2002 • Normas de Tránsito
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                PIN de la Clase
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-3xl font-black tracking-widest font-mono bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl p-2.5 text-amber-300 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Tu Nombre y Apellido
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl p-3 text-sm text-white outline-none transition"
                required
              />
            </div>

            {/* Selector de Categorías de Licencia de Conducción en Colombia */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Categoría de Licencia (Colombia)
                </label>
                <span className="text-[11px] text-amber-400 font-bold font-mono">
                  Cat. {category}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOMBIAN_LICENSE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.code;
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => setCategory(cat.code)}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{cat.icon}</span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {cat.code}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                          {cat.name.split(' ')[0]} {cat.name.split(' ')[1] || ''}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner de resumen de la categoría seleccionada */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <span className="text-2xl shrink-0">{selectedCategoryObj.icon}</span>
              <div className="text-xs truncate">
                <span className="font-bold text-amber-400">Licencia {selectedCategoryObj.code}: </span>
                <span className="text-slate-300">{selectedCategoryObj.name}</span>
                <p className="text-[10px] text-slate-400 truncate">{selectedCategoryObj.description}</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition cursor-pointer mt-1"
            >
              ¡Entrar a la Clase!
            </button>
          </form>

          {onSwitchToHost && (
            <div className="pt-2 text-center border-t border-slate-800/80">
              <button
                type="button"
                onClick={onSwitchToHost}
                className="text-xs text-slate-500 hover:text-amber-400 underline underline-offset-4"
              >
                ¿Eres el profesor? Ir a la pantalla de Host / Proyector
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Stage 1: Waiting in Lobby
  if (gameStage === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 font-sans text-center">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{avatar}</span>
            <div className="text-left">
              <p className="font-bold text-white text-sm">{name}</p>
              <span className="text-xs text-amber-400 font-mono">Licencia Cat. {category}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
            ● Conectado
          </span>
        </div>

        <div className="my-auto space-y-4 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white">¡Estás dentro de la clase!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Mira la pantalla del proyector en el aula. El instructor iniciará las preguntas en breve.
          </p>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
            PIN de sesión: <span className="font-mono text-amber-400 font-bold">{pin}</span>
          </div>
        </div>

        <footer className="text-xs text-slate-500">
          Centro de Enseñanza Automovilística • Ley 769 de 2002
        </footer>
      </div>
    );
  }

  // Stage 2: Question in Progress (4 Big Touch Buttons)
  if (gameStage === 'question') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 font-sans select-none">
        {/* Top Mini Header */}
        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{avatar}</span>
            <span className="font-bold text-xs truncate max-w-[120px]">{name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Pregunta #{questionIndex + 1}</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              {score} pts
            </span>
          </div>
        </div>

        {/* If already pressed: Answer confirmation */}
        {hasAnswered ? (
          <div className="my-auto text-center space-y-4 p-6 bg-slate-900/90 rounded-3xl border border-slate-800 max-w-sm mx-auto shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white">¡Respuesta Registrada!</h3>
            <p className="text-sm text-slate-400">
              Has seleccionado:{' '}
              <span className="font-bold text-amber-400 uppercase">
                {selectedShape === 'triangle' && '🏍️ Motocicleta (Rojo)'}
                {selectedShape === 'square' && '🚗 Automóvil (Azul)'}
                {selectedShape === 'circle' && '🚌 Bus (Amarillo)'}
                {selectedShape === 'diamond' && '🚛 Camión (Verde)'}
              </span>
            </p>
            <p className="text-xs text-slate-500 animate-pulse">
              Esperando a que termine el tiempo en el proyector...
            </p>
          </div>
        ) : (
          /* 4 Giant Tactile Vehicle Buttons (Motocicleta, Automóvil, Bus, Camión) */
          <div className="my-auto grid grid-cols-2 gap-3 w-full max-w-md mx-auto aspect-square p-1">
            {/* 1. Motocicleta (Rojo) */}
            <button
              onClick={() => handleAnswer('triangle')}
              className="rounded-3xl bg-gradient-to-br from-red-500 to-rose-700 active:scale-95 transition-all flex flex-col items-center justify-center shadow-xl shadow-red-950/40 border-2 border-red-400/40 hover:brightness-110 cursor-pointer p-4 group"
            >
              <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform drop-shadow">
                🏍️
              </span>
              <span className="mt-2 text-sm sm:text-base font-black text-white uppercase tracking-wider drop-shadow-md">
                Motocicleta
              </span>
            </button>

            {/* 2. Automóvil (Azul) */}
            <button
              onClick={() => handleAnswer('square')}
              className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 active:scale-95 transition-all flex flex-col items-center justify-center shadow-xl shadow-blue-950/40 border-2 border-blue-400/40 hover:brightness-110 cursor-pointer p-4 group"
            >
              <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform drop-shadow">
                🚗
              </span>
              <span className="mt-2 text-sm sm:text-base font-black text-white uppercase tracking-wider drop-shadow-md">
                Automóvil
              </span>
            </button>

            {/* 3. Bus (Amarillo) */}
            <button
              onClick={() => handleAnswer('circle')}
              className="rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 active:scale-95 transition-all flex flex-col items-center justify-center shadow-xl shadow-amber-950/40 border-2 border-yellow-300/40 hover:brightness-110 cursor-pointer p-4 group"
            >
              <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform drop-shadow">
                🚌
              </span>
              <span className="mt-2 text-sm sm:text-base font-black text-slate-950 uppercase tracking-wider drop-shadow-sm font-black">
                Bus
              </span>
            </button>

            {/* 4. Camión (Verde) */}
            <button
              onClick={() => handleAnswer('diamond')}
              className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 active:scale-95 transition-all flex flex-col items-center justify-center shadow-xl shadow-emerald-950/40 border-2 border-emerald-400/40 hover:brightness-110 cursor-pointer p-4 group"
            >
              <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform drop-shadow">
                🚛
              </span>
              <span className="mt-2 text-sm sm:text-base font-black text-white uppercase tracking-wider drop-shadow-md">
                Camión
              </span>
            </button>
          </div>
        )}

        <footer className="text-center text-[11px] text-slate-500 py-2">
          Mira el texto de la pregunta en la pantalla grande
        </footer>
      </div>
    );
  }

  // Stage 3: Question Result Feedback
  if (gameStage === 'result') {
    const isCorrect = answerResult?.isCorrect;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 font-sans text-center">
        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white truncate">{name}</span>
          <span className="text-sm font-mono font-bold text-amber-400">{score} pts</span>
        </div>

        <div className="my-auto space-y-4 max-w-sm mx-auto">
          {isCorrect ? (
            <div className="p-8 rounded-3xl bg-emerald-950/60 border-2 border-emerald-500 space-y-4 animate-scale-up">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400" />
              <h2 className="text-3xl font-black text-emerald-300">¡Correcto!</h2>
              <p className="text-2xl font-black text-white font-mono">
                +{answerResult?.points || 900} pts
              </p>
              <p className="text-xs text-slate-300">
                ¡Excelente conocimiento del Código de Tránsito!
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-red-950/60 border-2 border-red-500 space-y-4 animate-scale-up">
              <XCircle className="w-16 h-16 mx-auto text-red-400" />
              <h2 className="text-3xl font-black text-red-300">¡Incorrecto!</h2>
              <p className="text-xl font-bold text-slate-300">+0 pts</p>
              <p className="text-xs text-slate-400">
                Atento a la explicación jurídica del docente en el proyector.
              </p>
            </div>
          )}
        </div>

        <footer className="text-xs text-slate-500">
          Esperando a la siguiente pregunta del instructor...
        </footer>
      </div>
    );
  }

  // Stage 4: Final Podium Screen
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 font-sans text-center">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <span className="font-bold text-white">{name}</span>
        <span className="font-mono text-amber-400 font-bold">{score} pts</span>
      </div>

      <div className="my-auto space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white">¡Evaluación Finalizada!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Has completado la evaluación del Título III de la Ley 769 de 2002
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          {rank !== null && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm mb-2">
              Puesto #{rank} en la clase
            </div>
          )}
          <p className="text-4xl font-black text-amber-400 font-mono">{score} pts</p>
          <p className="text-xs text-slate-300 flex items-center justify-center gap-1 pt-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ¡Felicidades por formarte como conductor responsable!
          </p>
        </div>
      </div>

      <footer className="text-xs text-slate-500">
        Centro de Enseñanza Automovilística (CEA)
      </footer>
    </div>
  );
};
