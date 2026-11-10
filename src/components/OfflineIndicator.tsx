import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 border border-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-2xl backdrop-blur animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>Modo Sin Conexión — La app funciona con datos en caché.</span>
    </div>
  );
};
