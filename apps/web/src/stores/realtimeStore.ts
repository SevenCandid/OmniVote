import { create } from 'zustand';

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline' | 'failed';

interface RealtimeStoreState {
  status: ConnectionState;
  latencyMs: number | null;
  subscribedChannels: string[];
  setStatus: (status: ConnectionState) => void;
  setLatency: (latencyMs: number | null) => void;
  addChannel: (channel: string) => void;
  removeChannel: (channel: string) => void;
}

export const useRealtimeStore = create<RealtimeStoreState>((set) => ({
  status: 'offline',
  latencyMs: null,
  subscribedChannels: [],
  setStatus: (status) => set({ status }),
  setLatency: (latencyMs) => set({ latencyMs }),
  addChannel: (channel) =>
    set((state) => ({
      subscribedChannels: state.subscribedChannels.includes(channel)
        ? state.subscribedChannels
        : [...state.subscribedChannels, channel],
    })),
  removeChannel: (channel) =>
    set((state) => ({
      subscribedChannels: state.subscribedChannels.filter((c) => c !== channel),
    })),
}));
