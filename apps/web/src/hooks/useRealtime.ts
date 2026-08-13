import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeClient } from '../lib/realtimeClient';

export interface RealtimeOptions {
  onEvent?: (event: any) => void;
  queryKeysToInvalidate?: string[][];
  enabled?: boolean;
}

export function useRealtime(channel: string | null | undefined, options: RealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const { onEvent, queryKeysToInvalidate, enabled = true } = options;

  useEffect(() => {
    if (!channel || !enabled) return;

    const handler = (data: any) => {
      if (onEvent) {
        onEvent(data);
      }

      if (queryKeysToInvalidate && queryKeysToInvalidate.length > 0) {
        for (const queryKey of queryKeysToInvalidate) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    };

    realtimeClient.subscribe(channel, handler);

    return () => {
      realtimeClient.unsubscribe(channel, handler);
    };
  }, [channel, enabled, onEvent, queryKeysToInvalidate, queryClient]);
}
