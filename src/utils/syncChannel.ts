// Multi-tier real-time synchronization layer:
// 1. Server SSE (/api/game/events) & HTTP API (/api/game/join, /api/game/answer, /api/game/stage)
// 2. BroadcastChannel (for instant same-browser cross-tab)
// 3. LocalStorage storage events (fallback cross-tab)
// 4. ntfy.sh public pub/sub relay (fallback for standalone HTML on mobile devices)

export type SyncMessage =
  | { type: 'HOST_HELLO'; pin: string; stage: string; currentQuestionIndex: number }
  | { type: 'STUDENT_JOIN'; pin: string; player: { id: string; name: string; category: string; avatar: string } }
  | { type: 'STUDENT_LEAVE'; pin: string; playerId: string }
  | { type: 'STUDENT_ANSWER'; pin: string; playerId: string; shape: string; timeMs: number }
  | { type: 'GAME_STAGE_CHANGE'; pin: string; stage: string; currentQuestionIndex: number; timeRemaining?: number; totalQuestions?: number }
  | { type: 'QUESTION_START'; pin: string; questionIndex: number; timeLimit: number }
  | { type: 'QUESTION_TIME_UP'; pin: string; questionIndex: number; correctShape: string }
  | { type: 'GAME_OVER'; pin: string; podium: Array<{ id: string; name: string; score: number; rank: number }> };

type MessageCallback = (msg: SyncMessage) => void;

class MultiTierSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<MessageCallback> = new Set();
  private channelName = 'vialkahoot_channel_sync';
  private sseSource: EventSource | null = null;
  private currentPin: string = '';
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 1. BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          this.notify(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not available:', e);
      }
    }

    // 2. Storage event listener (cross-tab fallback)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'vialkahoot_last_msg' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notify(data);
          } catch {
            // Ignore
          }
        }
      });
    }
  }

  // Connect to SSE stream for a specific PIN
  public connectToPin(pin: string, isHost: boolean = false) {
    const cleanPin = pin.trim().replace(/\s+/g, '');
    if (!cleanPin || cleanPin === this.currentPin) return;
    this.currentPin = cleanPin;

    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }

    // Connect to backend Server-Sent Events if running in web environment
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        const sseUrl = `/api/game/events?pin=${encodeURIComponent(cleanPin)}`;
        const sse = new EventSource(sseUrl);
        this.sseSource = sse;

        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type && data.type !== 'CONNECTED') {
              this.notify(data);
            }
          } catch {
            // Ignore
          }
        };

        sse.onerror = () => {
          // If SSE drops, fallback to light polling
          if (!this.pollingTimer && isHost) {
            this.startPolling(cleanPin);
          }
        };
      } catch (e) {
        console.warn('Could not connect to SSE, fallback to polling:', e);
        if (isHost) this.startPolling(cleanPin);
      }
    }

    // Optional ntfy.sh relay for cross-device standalone usage
    try {
      const ntfySource = new EventSource(`https://ntfy.sh/vialkahoot_${cleanPin}/sse`);
      ntfySource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.message) {
            const parsed = JSON.parse(payload.message);
            if (parsed && parsed.type) {
              this.notify(parsed);
            }
          }
        } catch {
          // Ignore
        }
      };
    } catch {
      // Ignore
    }
  }

  private startPolling(pin: string) {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/session?pin=${encodeURIComponent(pin)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.players && Array.isArray(data.players)) {
            data.players.forEach((p: any) => {
              this.notify({
                type: 'STUDENT_JOIN',
                pin,
                player: p,
              });
            });
          }
        }
      } catch {
        // Ignore network errors
      }
    }, 2500);
  }

  public subscribe(cb: MessageCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(msg: SyncMessage) {
    this.listeners.forEach((cb) => {
      try {
        cb(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public async send(msg: SyncMessage) {
    // 1. Send via local BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Send via LocalStorage trigger for other tabs
    try {
      localStorage.setItem('vialkahoot_last_msg', JSON.stringify({ ...msg, _t: Date.now() }));
    } catch {
      // Storage unavailable
    }

    // 3. Dispatch to Server Backend API (Express)
    const pin = msg.pin;
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        if (msg.type === 'STUDENT_JOIN') {
          await fetch('/api/game/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin, player: msg.player }),
          });
        } else if (msg.type === 'STUDENT_ANSWER') {
          await fetch('/api/game/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin, playerId: msg.playerId, shape: msg.shape, timeMs: msg.timeMs }),
          });
        } else if (
          msg.type === 'QUESTION_START' ||
          msg.type === 'QUESTION_TIME_UP' ||
          msg.type === 'GAME_OVER' ||
          msg.type === 'GAME_STAGE_CHANGE'
        ) {
          await fetch('/api/game/stage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pin,
              stage:
                msg.type === 'QUESTION_START'
                  ? 'question'
                  : msg.type === 'QUESTION_TIME_UP'
                  ? 'question-result'
                  : msg.type === 'GAME_OVER'
                  ? 'podium'
                  : msg.stage,
              currentQuestionIndex: (msg as any).questionIndex ?? (msg as any).currentQuestionIndex,
              timeLimit: (msg as any).timeLimit,
              correctShape: (msg as any).correctShape,
              podium: (msg as any).podium,
            }),
          });
        }
      } catch (err) {
        console.warn('Server API push failed, relying on pub/sub:', err);
      }
    }

    // 4. Send to ntfy.sh public pub/sub for standalone cross-device fallback
    try {
      fetch(`https://ntfy.sh/vialkahoot_${pin}`, {
        method: 'POST',
        body: JSON.stringify(msg),
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }
}

export const syncBus = new MultiTierSyncChannel();
