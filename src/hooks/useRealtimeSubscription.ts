import { useEffect, useRef } from 'react';
import supabase from '../lib/supabase';

export function useRealtimeSubscription(
  table: string,
  filter?: { column: string; value: string | number },
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void,
) {
  const callbackRef = useRef({ onInsert, onUpdate, onDelete });
  callbackRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    const channelName = `realtime-${table}-${Date.now()}`;
    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table,
    };
    if (filter) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`;
    }
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        channelConfig,
        (payload) => {
          const cb = callbackRef.current;
          if (payload.eventType === 'INSERT') cb.onInsert?.(payload.new);
          if (payload.eventType === 'UPDATE') cb.onUpdate?.(payload.new);
          if (payload.eventType === 'DELETE') cb.onDelete?.(payload.old);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);
}
