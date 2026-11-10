import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Player, Question } from '../types/game';
import {
  Users,
  Play,
  Settings,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bot,
  UserPlus,
  Car,
  ShieldCheck,
  ExternalLink,
  Download,
  AlertTriangle,
  Globe,
  Wifi,
  Smartphone,
  HelpCircle,
  X,
  Sparkles,
  Clock,
  Timer,
  Plus,
  Minus,
  Edit3,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Props {
  pin: string;
  onRegeneratePin: () => void;
  players: Player[];
  questions: Question[];
  onOpenQuestionManager: () => void;
  onStartGame: () => void;
  onAddDemoPlayers: () => void;
  onRemovePlayer: (id: string) => void;
  onExportHtml: () => void;
  onOpenInstallModal: () => void;
  joinUrl: string;
  onUpdateBaseUrl?: (newUrl: string) => void;
  onOpenDualView?: () => void;
  onUpdateGlobalTime?: (newSeconds: number) => void;
}

export const HostLobby: React.FC<Props> = ({
  pin,
  onRegeneratePin,
  players,
  questions,
  onOpenQuestionManager,
  onStartGame,
  onAddDemoPlayers,
  onRemovePlayer,
  onExportHtml,
  onOpenInstallModal,
  joinUrl,
  onUpdateBaseUrl,
  onOpenDualView,
  onUpdateGlobalTime,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(!soundManager.enabled);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState(joinUrl.split('?')[0]);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>('');
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [activeNetworkTab, setActiveNetworkTab] = useState<'vercel' | 'wifi' | 'info'>('vercel');

  // Time programming state
  const commonTimeLimit = questions.length > 0 ? (questions[0].timeLimit || 20) : 20;
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(commonTimeLimit);

  useEffect(() => {
    setSelectedTime(commonTimeLimit);
  }, [commonTimeLimit]);

  // Check if current URL is the private AI Studio development sandbox or local container
  const isSandboxUrl =
    joinUrl.includes('ais-dev-') ||
    joinUrl.includes('.run.app') ||
    joinUrl.includes('localhost') ||
    joinUrl.includes('127.0.0.1');

  // Fallback 1: Online public QR server API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${encodeURIComponent(
    joinUrl
  )}`;

  // Fallback 2: Generate direct in-browser canvas/dataURL completely offline without internet or external APIs
  useEffect(() => {
    let isCancelled = false;
    setQrLoadFailed(false);

    QRCode.toDataURL(joinUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!isCancelled) {
          setLocalQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.warn('Local QRCode generation error:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [joinUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const active = soundManager.toggleMute();
    setIsMuted(!active);
  };

  const formattedPin = pin.slice(0, 3) + ' ' + pin.slice(3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar for Teacher / CEA */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Vial <span className="text-amber-400">interactivo</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Colombia
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Título III - Ley 769 de 2002: Normas de Comportamiento y Seguridad Vial
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
            title="Descargar o Instalar App en este Dispositivo"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar / Instalar App</span>
          </button>

          <button
            onClick={onOpenQuestionManager}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition shadow-sm cursor-pointer hover:scale-[1.02]"
            title="Editar preguntas y respuestas, agregar nuevas o cambiar orden"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Editar Preguntas ({questions.length})</span>
          </button>

          {/* Programar Tiempo de Respuestas Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedTime(commonTimeLimit);
              setShowTimeModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition shadow-sm cursor-pointer hover:scale-[1.02]"
            title="Programar el tiempo de respuesta para las preguntas"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Tiempo: {commonTimeLimit}s</span>
          </button>

          <button
            onClick={onExportHtml}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            title="Descargar versión HTML autónoma de 1 solo archivo"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar HTML Único</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Projector Central Area */}
      <main className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        {/* Left Side: PIN, Instructions, and Native QR Code */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Direct Native QR Code with Zero-Failure Dual Engine */}
            <div className="flex flex-col items-center shrink-0">
              <div className="p-3 bg-white rounded-2xl shadow-2xl ring-4 ring-amber-400/20 group hover:ring-amber-400 transition min-w-[190px] min-h-[190px] flex items-center justify-center">
                <img
                  src={!qrLoadFailed && localQrDataUrl ? localQrDataUrl : qrApiUrl}
                  onError={() => {
                    // If local fails or external fails, toggle to the alternative source
                    if (!qrLoadFailed && localQrDataUrl) {
                      setQrLoadFailed(true);
                    }
                  }}
                  alt="Código QR para unirse a Vial interactivo"
                  className="w-44 h-44 md:w-48 md:h-48 object-contain rounded-lg"
                  loading="eager"
                />
              </div>
              
              {/* Status & Assistant badge under QR */}
              {isSandboxUrl ? (
                <div className="mt-2.5 max-w-[210px] text-center p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 space-y-1 shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Sandbox Privado AI Studio</span>
                  </div>
                  <p className="text-slate-300 text-[9px] leading-tight">
                    Google bloquea a otros celulares en esta URL de prueba.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomInputUrl(joinUrl.split('?')[0]);
                      setShowNetworkModal(true);
                    }}
                    className="mt-1 w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-[10px] transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Habilitar para Celulares</span>
                  </button>
                </div>
              ) : (
                <div className="mt-2.5 max-w-[210px] text-center p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
                  <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Acceso Celular Activo
                  </span>
                  <p className="text-slate-300 text-[9px] mt-0.5 truncate max-w-[190px]">
                    {joinUrl.split('?')[0]}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomInputUrl(joinUrl.split('?')[0]);
                      setShowNetworkModal(true);
                    }}
                    className="block text-[10px] text-sky-400 hover:text-sky-300 mt-1 underline mx-auto cursor-pointer"
                  >
                    Cambiar URL o Red
                  </button>
                </div>
              )}
            </div>

            {/* PIN and Join URL Display */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  Código PIN de la Clase
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                  <span className="text-5xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-mono drop-shadow-sm select-all">
                    {formattedPin}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300 font-medium">
                    Enlace directo para estudiantes:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomInputUrl(joinUrl.split('?')[0]);
                      setShowNetworkModal(true);
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Configurar para Celulares</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={joinUrl}
                    className="w-full bg-slate-900 text-xs font-mono px-3 py-2 rounded-lg border border-slate-700 text-slate-300 select-all truncate outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shrink-0 cursor-pointer"
                    title="Copiar enlace"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
                    title="Abrir como alumno en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    ✓ El QR abre la pantalla de estudiante con el PIN ya digitado.
                  </span>
                  {onOpenDualView && (
                    <button
                      type="button"
                      onClick={onOpenDualView}
                      className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      title="Simular celular de estudiante en esta misma pantalla"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Probar en Vista Dual</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={onRegeneratePin}
                  className="text-xs text-slate-400 hover:text-amber-400 transition underline underline-offset-4 cursor-pointer"
                >
                  Generar otro PIN aleatorio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Connected Students & Start Game */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col justify-between h-full min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Alumnos en la Sala
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {players.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Listos para responder en tiempo real</p>
                </div>
              </div>

              {/* Bot Simulation Button */}
              <button
                onClick={onAddDemoPlayers}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition"
                title="Añadir estudiantes simulados para demostración instantánea"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>+ Alumnos Demo</span>
              </button>
            </div>

            {/* Student Grid / List */}
            <div className="mt-4 max-h-[260px] overflow-y-auto space-y-2 pr-1">
              {players.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <UserPlus className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-sm font-medium text-slate-400">
                    Esperando a que los estudiantes se conecten...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Pide a los alumnos que escaneen el código QR del proyector o ingresen al enlace con el PIN.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xl shrink-0">{p.avatar}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono">
                            Cat. {p.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemovePlayer(p.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs p-1 transition"
                        title="Expulsar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Game Action */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <button
              onClick={onStartGame}
              disabled={players.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                players.length > 0
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25 cursor-pointer transform hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{players.length > 0 ? '¡INICIAR EVALUACIÓN VIAL!' : 'Conecta al menos 1 alumno'}</span>
            </button>
            <div className="flex justify-between items-center text-[11px] text-slate-400 gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenQuestionManager}
                className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer transition hover:scale-[1.02]"
                title="Haz clic para ver y editar las preguntas y respuestas"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{questions.length} preguntas (Editar Preguntas)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTime(commonTimeLimit);
                  setShowTimeModal(true);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline underline-offset-2 cursor-pointer transition hover:scale-[1.02]"
                title="Haz clic para cambiar el tiempo de respuesta"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tiempo: {commonTimeLimit}s (Programar)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Configuración de Red para Celulares Externos */}
      {showNetworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Conectar Celulares Externos</h3>
                  <p className="text-xs text-slate-400">
                    Asegura que cualquier celular escanee el código QR y entre directo sin pedir cuenta.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNetworkModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs gap-1">
              <button
                type="button"
                onClick={() => setActiveNetworkTab('vercel')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeNetworkTab === 'vercel'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. En la Nube (Vercel)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNetworkTab('wifi')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeNetworkTab === 'wifi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>2. Wi-Fi Local Aula</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNetworkTab('info')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeNetworkTab === 'info'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Por qué ocurre?</span>
              </button>
            </div>

            {/* Tab 1: Vercel / Nube */}
            {activeNetworkTab === 'vercel' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <strong className="text-amber-400 block font-bold">✨ Método Definitivo (Acceso Mundial Gratuito):</strong>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Al desplegar en <strong>Vercel</strong> (100% gratuito), obtienes una dirección web pública (ej. <code className="text-amber-300 font-mono">https://vial-interactivo.vercel.app</code>). Cualquier estudiante en el salón puede escanear con su cámara usando datos móviles (4G/5G) o Wi-Fi sin pedir usuario ni cuenta.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Pega tu URL de Vercel o dominio público:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      placeholder="https://tu-proyecto.vercel.app"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateBaseUrl) {
                          onUpdateBaseUrl(customInputUrl);
                          setShowNetworkModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer shrink-0"
                    >
                      Guardar y Actualizar QR
                    </button>
                  </div>
                </div>

                {/* Paso a paso desplegable */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-white text-[11px] block">Guía rápida de despliegue en Vercel (2 minutos):</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10px] leading-relaxed">
                    <li>Entra a <strong className="text-slate-200">vercel.com</strong> e inicia sesión gratis con GitHub.</li>
                    <li>Haz clic en <strong className="text-slate-200">"Add New... &gt; Project"</strong> e importa este repositorio.</li>
                    <li>Vercel detecta Vite automáticamente: haz clic en <strong className="text-slate-200">Deploy</strong>.</li>
                    <li>Copia el enlace generado (ej. <code className="text-amber-400">https://vial-interactivo.vercel.app</code>), pégalo en la casilla de arriba y tu código QR funcionará en cualquier celular para siempre.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: Wi-Fi Local */}
            {activeNetworkTab === 'wifi' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1">
                  <strong className="text-sky-400 block font-bold">📶 Conexión por Red Wi-Fi Local del Aula:</strong>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Si tu computador y los celulares de los alumnos están conectados a la <strong>misma red Wi-Fi del salón de clases</strong>, puedes usar la IP local de tu computador para que escaneen directo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Dirección IP local de este computador con puerto :3000:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      placeholder="Ej. http://192.168.1.50:3000"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateBaseUrl) {
                          onUpdateBaseUrl(customInputUrl);
                          setShowNetworkModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                    >
                      Guardar IP Wi-Fi
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    💡 Cómo saber tu IP: En Windows abre CMD y escribe <code>ipconfig</code> (busca Dirección IPv4). En Mac/Linux ve a Configuración de Red &gt; Wi-Fi.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Explicación de por qué ocurre */}
            {activeNetworkTab === 'info' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                  <strong className="text-amber-400 block font-bold">¿Por qué el QR de vista previa no abre en otros celulares?</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Google AI Studio ejecuta las aplicaciones de desarrollo en un contenedor privado (<code className="text-amber-300 font-mono">ais-dev-*.run.app</code>). Por políticas de privacidad y seguridad de Google Cloud, cualquier celular externo que intente entrar a esa URL privada es bloqueado por una pantalla de inicio de sesión de Google pidiendo tu cuenta de desarrollador.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                  <strong className="text-emerald-400 block font-bold">¿Cómo solucionarlo para una clase real?</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Basta con configurar tu URL de Vercel (o IP de red local Wi-Fi) en la pestaña 1 o 2. El código QR se regenera de inmediato y cualquier celular podrá escanear y competir en vivo sin ninguna cuenta requerida.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (onUpdateBaseUrl) {
                    onUpdateBaseUrl('');
                    setShowNetworkModal(false);
                  }
                }}
                className="text-slate-500 hover:text-slate-300 underline cursor-pointer"
              >
                Restaurar dirección original
              </button>

              <button
                type="button"
                onClick={() => setShowNetworkModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Programar Tiempo de Respuestas */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Programar Tiempo de Respuestas</h3>
                  <p className="text-xs text-slate-400">
                    Define cuántos segundos tendrán los alumnos para responder cada pregunta.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Visual Time Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                Tiempo configurado por pregunta
              </span>
              <div className="flex items-center justify-center gap-4 py-1">
                <button
                  type="button"
                  onClick={() => setSelectedTime((prev) => Math.max(5, prev - 5))}
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center text-lg cursor-pointer transition active:scale-95"
                  title="Restar 5 segundos"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex items-baseline gap-1.5 px-4">
                  <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                    {selectedTime}
                  </span>
                  <span className="text-xl font-bold text-amber-400">seg</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTime((prev) => Math.min(180, prev + 5))}
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center text-lg cursor-pointer transition active:scale-95"
                  title="Sumar 5 segundos"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tag descriptor */}
              <div className="pt-1">
                {selectedTime <= 10 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
                    ⚡ Modo Express (Rápido y exigente)
                  </span>
                ) : selectedTime <= 15 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    🚀 Modo Ágil (Dinámico)
                  </span>
                ) : selectedTime <= 25 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    🎯 Estándar Recomendado CEA (Ideal para Ley 769)
                  </span>
                ) : selectedTime <= 40 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    🧠 Análisis Detallado (Preguntas largas)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    📚 Lectura Pausada (Principiantes o casos complejos)
                  </span>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Selección rápida predeterminada:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[10, 15, 20, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedTime(sec)}
                    className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                      selectedTime === sec
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black scale-105'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Estimation */}
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Duración estimada ({questions.length} preguntas):</span>
              <span className="font-bold text-amber-300 font-mono">
                ~{Math.max(1, Math.round((questions.length * (selectedTime + 8)) / 60))} minutos
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs gap-3">
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onUpdateGlobalTime) {
                    onUpdateGlobalTime(selectedTime);
                  }
                  setShowTimeModal(false);
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar {selectedTime}s a Toda la Evaluación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
