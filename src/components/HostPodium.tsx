import React, { useEffect, useRef } from 'react';
import { Player } from '../types/game';
import { Trophy, Medal, Award, RotateCcw, Share2, Check } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Props {
  players: Player[];
  onRestart: () => void;
  onBackToLobby: () => void;
}

export const HostPodium: React.FC<Props> = ({
  players,
  onRestart,
  onBackToLobby,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedSummary, setCopiedSummary] = React.useState(false);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const rest = sorted.slice(3);

  // Play fanfare and start confetti
  useEffect(() => {
    soundManager.playFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'];
    const particles: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      color: string;
      tilt: number;
      tiltAngleIncremental: number;
      tiltAngle: number;
    }> = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 8 + 4,
        d: Math.random() * 40 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleShareSummary = () => {
    const text = `🏆 Resultados Evaluación Ley 769 de 2002 (CEA):\n` +
      `🥇 1er Lugar: ${first ? first.name : 'N/A'} (${first?.score || 0} pts)\n` +
      `🥈 2do Lugar: ${second ? second.name : 'N/A'} (${second?.score || 0} pts)\n` +
      `🥉 3er Lugar: ${third ? third.name : 'N/A'} (${third?.score || 0} pts)\n` +
      `¡Felicitaciones a todos los futuros conductores de Colombia! 🚗🇨🇴`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Confetti Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Top Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              ¡Gran Final! Podio de Honor CEA
            </h1>
            <p className="text-xs text-amber-400 font-medium">
              Conocimiento del Título III de la Ley 769 de 2002 • Tránsito Terrestre
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShareSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold transition"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
            <span>{copiedSummary ? '¡Copiado al portapapeles!' : 'Copiar Acta'}</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Juego</span>
          </button>
          <button
            onClick={onBackToLobby}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition border border-slate-700"
          >
            Nueva Sala (Lobby)
          </button>
        </div>
      </div>

      {/* Center 3D-Style Olympic Podium */}
      <div className="relative z-20 max-w-4xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
          {/* 2nd Place: Silver */}
          <div className="flex flex-col items-center">
            {second && (
              <div className="text-center mb-3 animate-fade-in">
                <span className="text-4xl md:text-5xl block animate-bounce">{second.avatar}</span>
                <p className="font-extrabold text-sm md:text-lg text-white mt-1 truncate max-w-[120px] md:max-w-none">
                  {second.name}
                </p>
                <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                  {second.score} pts
                </span>
                <p className="text-[10px] text-amber-400 font-bold mt-0.5">Cat. {second.category}</p>
              </div>
            )}
            <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-3xl h-44 md:h-56 flex flex-col items-center justify-start pt-4 shadow-2xl border-t-4 border-slate-400">
              <Medal className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mb-1" />
              <span className="text-3xl md:text-4xl font-black text-white font-mono">2°</span>
              <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase mt-1">
                Plata
              </span>
            </div>
          </div>

          {/* 1st Place: Gold (Highest) */}
          <div className="flex flex-col items-center -mt-6">
            {first && (
              <div className="text-center mb-3 animate-fade-in">
                <span className="text-5xl md:text-7xl block animate-bounce drop-shadow-xl">
                  {first.avatar}
                </span>
                <div className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black text-xs uppercase shadow-md my-1">
                  👑 Campeón Vial
                </div>
                <p className="font-black text-base md:text-2xl text-amber-300 truncate max-w-[140px] md:max-w-none">
                  {first.name}
                </p>
                <span className="text-sm md:text-base font-black text-white font-mono bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50">
                  {first.score} pts
                </span>
                <p className="text-xs text-amber-400 font-bold mt-1">Licencia Cat. {first.category}</p>
              </div>
            )}
            <div className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 rounded-t-3xl h-56 md:h-72 flex flex-col items-center justify-start pt-4 shadow-2xl border-t-4 border-yellow-200">
              <Trophy className="w-10 h-10 md:w-14 md:h-14 text-slate-950 mb-1 fill-current" />
              <span className="text-4xl md:text-6xl font-black text-slate-950 font-mono">1°</span>
              <span className="text-xs font-black text-slate-950 tracking-wider uppercase mt-1">
                Oro
              </span>
            </div>
          </div>

          {/* 3rd Place: Bronze */}
          <div className="flex flex-col items-center">
            {third && (
              <div className="text-center mb-3 animate-fade-in">
                <span className="text-4xl md:text-5xl block animate-bounce">{third.avatar}</span>
                <p className="font-extrabold text-sm md:text-lg text-white mt-1 truncate max-w-[120px] md:max-w-none">
                  {third.name}
                </p>
                <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                  {third.score} pts
                </span>
                <p className="text-[10px] text-amber-400 font-bold mt-0.5">Cat. {third.category}</p>
              </div>
            )}
            <div className="w-full bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-3xl h-36 md:h-44 flex flex-col items-center justify-start pt-4 shadow-2xl border-t-4 border-amber-600">
              <Award className="w-8 h-8 md:w-10 md:h-10 text-amber-300 mb-1" />
              <span className="text-3xl md:text-4xl font-black text-white font-mono">3°</span>
              <span className="text-[11px] font-bold text-amber-200 tracking-wider uppercase mt-1">
                Bronce
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of Players List */}
      {rest.length > 0 && (
        <div className="relative z-20 max-w-3xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
            Otros Alumnos Participantes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {rest.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500 font-mono">#{idx + 4}</span>
                  <span className="text-base">{p.avatar}</span>
                  <span className="font-medium text-slate-200 truncate">{p.name}</span>
                </div>
                <span className="font-mono text-amber-400 shrink-0 font-bold">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-20 text-center text-xs text-slate-500 border-t border-slate-900 pt-3">
        ¡Constancia de participación aprobada para formación de conductores responsables en Colombia!
      </footer>
    </div>
  );
};
