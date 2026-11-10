import React, { useEffect, useState } from 'react';
import { Question } from '../types/game';
import { FastForward, Volume2, VolumeX, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalAnswers: number;
  totalPlayers: number;
  onSkipTime: () => void;
  onCancelGame: () => void;
  onAddTime?: (seconds: number) => void;
}

export const HostQuestion: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  totalAnswers,
  totalPlayers,
  onSkipTime,
  onCancelGame,
  onAddTime,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const timeLimit = question.timeLimit || 20;
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / timeLimit) * 100));

  // Audio ticks
  useEffect(() => {
    if (timeRemaining > 0 && timeRemaining <= 5) {
      soundManager.playTick(true);
    } else if (timeRemaining > 0) {
      soundManager.playTick(false);
    }
  }, [timeRemaining]);

  const isUrgent = timeRemaining <= 5;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base font-extrabold px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-md">
            Pregunta {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs md:text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl truncate max-w-xs md:max-w-md">
            {question.topic}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Answers counter */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Respuestas:</span>
            <span className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {totalAnswers}
            </span>
            <span className="text-xs text-slate-500">/ {totalPlayers}</span>
          </div>

          {/* Add 10 seconds button for Teacher */}
          {onAddTime && (
            <button
              onClick={() => onAddTime(10)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 rounded-xl text-xs font-bold border border-sky-500/40 transition shadow-sm cursor-pointer hover:border-sky-400"
              title="Añadir 10 segundos extra a esta pregunta"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>+10s</span>
            </button>
          )}

          {/* Skip Button for Teacher */}
          <button
            onClick={onSkipTime}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            title="Finalizar tiempo de esta pregunta"
          >
            <FastForward className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Saltar</span>
          </button>

          {/* Cancel Test Button for Teacher */}
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Cancelar prueba y regresar al lobby"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Cancelar Prueba</span>
          </button>

          <button
            onClick={() => soundManager.toggleMute()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {soundManager.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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

      {/* Center Section: Countdown + Giant Question Text */}
      <div className="max-w-6xl mx-auto w-full my-auto py-4 flex flex-col items-center">
        {/* Progress Bar & Circular Timer */}
        <div className="w-full flex items-center gap-4 mb-4">
          <div className="flex-1 bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isUrgent ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-yellow-300'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl font-mono shrink-0 shadow-lg border transition-all ${
              isUrgent
                ? 'bg-red-600 text-white border-red-400 animate-bounce'
                : 'bg-slate-900 text-amber-400 border-amber-500/40'
            }`}
          >
            {timeRemaining}
          </div>
        </div>

        {/* Article Badge */}
        <div className="mb-2">
          <span className="text-xs md:text-sm font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
            ⚖️ {question.article}
          </span>
        </div>

        {/* Giant Question Card for Projector Visibility */}
        <div className="w-full bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-2xl text-center backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-tight text-white drop-shadow">
            {question.question}
          </h2>
        </div>
      </div>

      {/* Bottom Section: 4 Kahoot-style Answer Tiles with Vehicles and Colors */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        {/* Option 1: Red - Motocicleta */}
        {renderOptionTile(question.options.find((o) => o.shape === 'triangle'), 'triangle', '🏍️', 'Motocicleta', 'from-red-600 to-rose-700')}

        {/* Option 2: Blue - Automóvil */}
        {renderOptionTile(question.options.find((o) => o.shape === 'square'), 'square', '🚗', 'Automóvil', 'from-blue-600 to-indigo-700')}

        {/* Option 3: Yellow - Bus */}
        {renderOptionTile(question.options.find((o) => o.shape === 'circle'), 'circle', '🚌', 'Bus', 'from-amber-500 to-yellow-600')}

        {/* Option 4: Green - Camión */}
        {renderOptionTile(question.options.find((o) => o.shape === 'diamond'), 'diamond', '🚛', 'Camión', 'from-emerald-600 to-teal-700')}
      </div>
    </div>
  );
};

function renderOptionTile(
  option: { text: string } | undefined,
  shape: 'triangle' | 'square' | 'circle' | 'diamond',
  vehicleEmoji: string,
  vehicleLabel: string,
  gradientClass: string
) {
  if (!option) return null;

  return (
    <div
      className={`relative p-5 md:p-6 rounded-2xl bg-gradient-to-r ${gradientClass} text-white shadow-xl flex items-center gap-4 transition hover:brightness-110 min-h-[90px] border border-white/10`}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black/30 flex flex-col items-center justify-center shrink-0 shadow-inner p-1">
        <span className="text-2xl sm:text-3xl leading-none">{vehicleEmoji}</span>
        <span className="text-[9px] font-black uppercase tracking-tight opacity-90 mt-0.5">{vehicleLabel}</span>
      </div>
      <p className="text-base sm:text-lg md:text-xl font-bold leading-snug select-none">
        {option.text}
      </p>
    </div>
  );
}
