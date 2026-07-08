import { create } from 'zustand';

interface VotingEvent {
  id: string;
  title: string;
  status: 'DRAFT' | 'READY' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startTime: string;
  endTime: string;
}

interface EventState {
  currentEvent: VotingEvent | null;
  setCurrentEvent: (event: VotingEvent | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),
}));
