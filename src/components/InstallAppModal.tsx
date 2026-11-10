import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, CheckCircle2, X, Share2, PlusSquare, QrCode, FileCode2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
  appUrl: string;
}

export const InstallAppModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDownloadHtml,
  appUrl,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(appUrl)}`;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl text-slate-100 p-6 md:p-8 space-y-6 relative my-auto animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Download className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">
            Descargar e Instalar <span className="text-amber-400">Vial interactivo</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Elige la forma que prefieras para tener la aplicación en tu celular, tablet o computador para tus clases de conducción.
          </p>
        </div>

        {/* Options Stack */}
        <div className="space-y-4">
          {/* Option 1: PWA Native App Install */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">1. Instalar como App en este Dispositivo</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Acceso directo con icono en tu pantalla de inicio, pantalla completa y soporte sin conexión.
                </p>
              </div>
            </div>

            {isInstalled ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡La app ya está instalada en este dispositivo!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicación Ahora</span>
              </button>
            ) : isIOS ? (
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Pasos para iPhone / iPad en Safari:
                </p>
                <div className="space-y-1.5 pl-2 text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[11px] text-amber-400">1</span>
                    Presiona el botón <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 text-sky-400 inline" /> en la barra de Safari.
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[11px] text-amber-400">2</span>
                    Desliza hacia abajo y presiona <strong>"Agregar a pantalla de inicio"</strong> <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>En Chrome/Edge: Presiona el icono de instalar ⊕ en la barra de direcciones.</span>
              </div>
            )}
          </div>

          {/* Option 2: Download Single Standalone HTML */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">2. Descargar Archivo HTML Autónomo (.html)</h3>
                <p className="text-xs text-slate-400">
                  Un solo archivo de código para llevar en una memoria USB. Se abre con doble clic en cualquier computador o proyector sin necesidad de internet.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onDownloadHtml();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar Vial_interactivo_Ley769.html</span>
            </button>
          </div>

          {/* Option 3: QR Code to Install on Phone */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
              <img src={qrUrl} alt="QR para descargar en móvil" className="w-20 h-20 object-contain rounded" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> ¿Quieres tenerla en tu celular?
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apunta con la cámara de tu teléfono móvil a este código para abrirla al instante en tu celular y guardarla en tu pantalla de inicio.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800">
          Centro de Enseñanza Automovilística (CEA) • Normas de Comportamiento Ley 769 de 2002
        </div>
      </div>
    </div>
  );
};
