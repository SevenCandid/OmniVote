import React from 'react';
import { useRealtimeStore } from '../../stores/realtimeStore';
import { WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { status, latencyMs } = useRealtimeStore();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium" title={`Realtime Connection: ${status}`}>
        {status === 'connected' && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">{latencyMs ? `${latencyMs}ms` : 'Live'}</span>
          </>
        )}
        {status === 'connecting' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span className="text-amber-400">Connecting...</span>
          </>
        )}
        {status === 'reconnecting' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span className="text-amber-400">Reconnecting...</span>
          </>
        )}
        {(status === 'offline' || status === 'failed') && (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span className="text-rose-400">Offline</span>
          </>
        )}
      </div>
    );
  }

  if (status === 'connected') return null;

  return (
    <div className={`px-4 py-2 text-sm flex items-center justify-between border-b ${
      status === 'reconnecting' || status === 'connecting' 
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
    }`}>
      <div className="flex items-center gap-2">
        {status === 'reconnecting' || status === 'connecting' ? (
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-rose-400" />
        )}
        <span>
          {status === 'connecting' && 'Connecting to OmniVote Real-Time Gateway...'}
          {status === 'reconnecting' && 'Connection lost. Reconnecting to live updates...'}
          {status === 'offline' && 'Offline. Real-time updates are currently disconnected.'}
          {status === 'failed' && 'Real-time connection failed authentication. Please re-login.'}
        </span>
      </div>
      {status === 'offline' && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};
