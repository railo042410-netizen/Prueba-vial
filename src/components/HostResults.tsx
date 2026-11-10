import React, { useEffect, useState } from 'react';
import { Player, Question, ShapeType } from '../types/game';
import { Check, ArrowRight, Award, Flame, BookOpen, LogOut, AlertTriangle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  players: Player[];
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  onCancelGame: () => void;
}

export const HostResults: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  players,
  onNextQuestion,
  isLastQuestion,
  onCancelGame,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  useEffect(() => {
    soundManager.playCorrect();
  }, []);

  // Compute stats per shape
  const shapeCounts: Record<ShapeType, number> = {
    triangle: 0,
    square: 0,
    circle: 0,
    diamond: 0,
  };

  players.forEach((p) => {
    if (p.lastAnswer?.shape) {
      shapeCounts[p.lastAnswer.shape]++;
    }
  });

  const totalAnswered = Object.values(shapeCounts).reduce((a, b) => a + b, 0) || 1;

  // Sorted players for top leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const top5 = sortedPlayers.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Resultados de la Pregunta {questionIndex + 1} de {totalQuestions}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white">{question.topic}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Cancelar prueba y regresar al lobby"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Cancelar Prueba</span>
          </button>

          <button
            onClick={onNextQuestion}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition transform hover:scale-[1.02]"
          >
            <span>{isLastQuestion ? 'Ver Podio Final' : 'Siguiente Pregunta'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal to Cancel Test */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">¿Cancelar evaluación vial?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se detendrá la prueba en curso para todos los alumnos y regresarán a la sala de espera (Lobby) conservando la conexión.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Continuar Prueba
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  onCancelGame();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-950/50 transition cursor-pointer"
              >
                Sí, Cancelar Prueba
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Correct Answer & Chart, Right = Leaderboard */}
      <div className="max-w-7xl mx-auto w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Correct Answer Highlight */}
          <div className="bg-emerald-950/40 border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                Respuesta Correcta
              </span>
            </div>

            <p className="text-2xl md:text-3xl font-extrabold text-white">
              {question.options.find((o) => o.shape === question.correctShape)?.text}
            </p>

            {/* Legal / Technical Explanation for CEA */}
            <div className="mt-4 pt-4 border-t border-emerald-500/30 flex items-start gap-3 bg-emerald-950/60 p-3.5 rounded-2xl">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Fundamento Jurídico - {question.article}
                </p>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Answer Distribution Bar Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Distribución de Respuestas del Grupo
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              {/* Motocicleta (Rojo) */}
              {renderBar('🏍️', 'Moto', '#EF4444', shapeCounts.triangle, totalAnswered, question.correctShape === 'triangle')}
              {/* Automóvil (Azul) */}
              {renderBar('🚗', 'Carro', '#3B82F6', shapeCounts.square, totalAnswered, question.correctShape === 'square')}
              {/* Bus (Amarillo) */}
              {renderBar('🚌', 'Bus', '#F59E0B', shapeCounts.circle, totalAnswered, question.correctShape === 'circle')}
              {/* Camión (Verde) */}
              {renderBar('🚛', 'Camión', '#10B981', shapeCounts.diamond, totalAnswered, question.correctShape === 'diamond')}
            </div>
          </div>
        </div>

        {/* Right Side: 5 columns - Leaderboard */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">Tabla de Posiciones</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Top 5 Alumnos</span>
          </div>

          <div className="space-y-2.5">
            {top5.map((player, rank) => {
              const answeredCorrect = player.lastAnswer?.isCorrect;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    rank === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : rank === 1
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : rank === 2
                      ? 'bg-orange-950/30 border-orange-700/40 text-orange-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                        rank === 0
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : rank === 1
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{rank + 1}
                    </span>
                    <span className="text-2xl shrink-0">{player.avatar}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold truncate text-white">{player.name}</p>
                        {player.streak >= 2 && (
                          <span className="flex items-center text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded-full font-bold">
                            <Flame className="w-3 h-3 fill-current text-red-500" />
                            {player.streak}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cat. {player.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-white font-mono">{player.score} pts</p>
                    {player.lastAnswer && (
                      <span
                        className={`text-[10px] font-bold ${
                          answeredCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {answeredCorrect ? `+${player.lastAnswer.pointsEarned}` : '+0'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-3">
        Evaluación Formativa CEA - Ley 769 de 2002
      </footer>
    </div>
  );
};

function renderBar(
  symbol: string,
  label: string,
  color: string,
  count: number,
  total: number,
  isCorrect: boolean
) {
  const percentage = Math.round((count / Math.max(1, total)) * 100);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold text-slate-300 mb-1">{count}</span>
      <div className="w-full bg-slate-950 h-32 rounded-xl p-1 flex items-end justify-center border border-slate-800">
        <div
          className="w-full rounded-lg transition-all duration-700 flex items-center justify-center font-bold text-xs"
          style={{
            height: `${Math.max(12, percentage)}%`,
            backgroundColor: color,
          }}
        >
          {percentage > 20 && `${percentage}%`}
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1 font-bold text-lg">
          <span>{symbol}</span>
          {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
    </div>
  );
}
