import { useSessionStore } from '../stores/sessionStore';
import { useRealtimeStore } from '../stores/realtimeStore';

type MessageHandler = (data: any) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingIntervalId: any = null;
  private pingStartTime: number = 0;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private pendingSubscriptions: Set<string> = new Set();
  private activeSubscriptions: Set<string> = new Set();

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    useRealtimeStore.getState().setStatus('connecting');

    // Retrieve JWT token or Visitor Token
    const jwtToken = useSessionStore.getState().accessToken;
    let visitorToken: string | null = null;

    // Check localStorage / cookie for visitor_token
    try {
      visitorToken = localStorage.getItem('visitor_token');
    } catch {
      // Ignore fallback
    }

    if (!jwtToken && !visitorToken) {
      // Search cookie fallback
      const match = document.cookie.match(/(?:^|; )visitor_token=([^;]*)/);
      if (match) {
        visitorToken = decodeURIComponent(match[1]);
      }
    }

    if (!jwtToken && !visitorToken) {
      console.warn('[RealtimeClient] Connection deferred: Mandatory authentication requires JWT or Visitor Token');
      useRealtimeStore.getState().setStatus('offline');
      return;
    }

    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${protocol}//${host}/api/v1/realtime/ws`;

    const params = new URLSearchParams();
    if (jwtToken) {
      params.append('token', jwtToken);
    } else if (visitorToken) {
      params.append('visitor_token', visitorToken);
    }

    url += `?${params.toString()}`;

    try {
      this.ws = new WebSocket(url);
      this.setupHandlers();
    } catch (e) {
      console.error('[RealtimeClient] WebSocket creation error:', e);
      this.handleReconnect();
    }
  }

  private setupHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[RealtimeClient] Connected to OmniVote Realtime Gateway');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      useRealtimeStore.getState().setStatus('connected');

      this.startHeartbeat();
      this.resubscribeAll();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'pong') {
          if (this.pingStartTime) {
            const latency = Date.now() - this.pingStartTime;
            useRealtimeStore.getState().setLatency(latency);
          }
          return;
        }

        if (msg.type === 'connection_ack') {
          console.log('[RealtimeClient] Connection acknowledged:', msg);
          return;
        }

        if (msg.type === 'subscribed') {
          this.activeSubscriptions.add(msg.channel);
          useRealtimeStore.getState().addChannel(msg.channel);
          return;
        }

        // Standard RealtimeEvent payload
        if (msg.channel && msg.payload) {
          this.emit(msg.channel, msg);
          this.emit('*', msg);
        }
      } catch (err) {
        console.error('[RealtimeClient] Message parse error:', err);
      }
    };

    this.ws.onclose = (event) => {
      console.warn(`[RealtimeClient] Socket closed (code ${event.code}):`, event.reason);
      this.stopHeartbeat();

      if (event.code === 4001) {
        useRealtimeStore.getState().setStatus('failed');
        console.error('[RealtimeClient] Connection rejected due to authentication failure.');
        return;
      }

      this.handleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[RealtimeClient] Socket error:', err);
    };
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalId = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pingStartTime = Date.now();
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      useRealtimeStore.getState().setStatus('offline');
      console.error('[RealtimeClient] Max reconnect attempts reached.');
      return;
    }

    useRealtimeStore.getState().setStatus('reconnecting');
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`[RealtimeClient] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
  }

  public subscribe(channel: string, callback: MessageHandler) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
      this.activeSubscriptions.add(channel);
      useRealtimeStore.getState().addChannel(channel);
    } else {
      this.pendingSubscriptions.add(channel);
      this.connect();
    }
  }

  public unsubscribe(channel: string, callback: MessageHandler) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel)!.delete(callback);
      if (this.listeners.get(channel)!.size === 0) {
        this.listeners.delete(channel);
        this.activeSubscriptions.delete(channel);
        useRealtimeStore.getState().removeChannel(channel);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
        }
      }
    }
  }

  private resubscribeAll() {
    const allChannels = new Set([...this.listeners.keys(), ...this.pendingSubscriptions]);
    allChannels.delete('*');

    for (const channel of allChannels) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
      }
    }
    this.pendingSubscriptions.clear();
  }

  private emit(channel: string, message: any) {
    if (this.listeners.has(channel)) {
      for (const callback of this.listeners.get(channel)!) {
        try {
          callback(message);
        } catch (e) {
          console.error(`[RealtimeClient] Listener callback error on channel ${channel}:`, e);
        }
      }
    }
  }
}

export const realtimeClient = new RealtimeClient();
