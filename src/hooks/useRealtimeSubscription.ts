import { useEffect, useRef } from 'react';
import supabase from '../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtimeSubscription<T = any>(
  table: string,
  filter?: { column: string; value: string | number },
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: T) => void,
) {
  const callbackRef = useRef({ onInsert, onUpdate, onDelete });
  callbackRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    const channelName = `realtime-${table}-${filter?.column ?? '*'}-${String(filter?.value ?? '*')}`;
    const channelConfig = {
      event: '*',
      schema: 'public',
      table,
      filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
    } as const;
    const channel = supabase.channel(channelName).on(
      'postgres_changes' as never,
      channelConfig,
      (payload: { eventType: string; new: T; old: T }) => {
        const cb = callbackRef.current;
        if (payload.eventType === 'INSERT') cb.onInsert?.(payload.new);
        if (payload.eventType === 'UPDATE') cb.onUpdate?.(payload.new);
        if (payload.eventType === 'DELETE') cb.onDelete?.(payload.old);
      },
    ).subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        setTimeout(() => channel.subscribe(), 3000);
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [table, filter?.column, filter?.value]);
}
