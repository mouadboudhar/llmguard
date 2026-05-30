import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Pause-aware view over the live event stream provided by AppContext (backed by
 * the /ws/events WebSocket). When paused, the displayed list freezes while new
 * events continue to accumulate in the context.
 */
export function useEventStream() {
  const { events } = useApp();
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(events);

  useEffect(() => {
    if (!paused) setFrozen(events);
  }, [events, paused]);

  return { events: paused ? frozen : events, paused, setPaused };
}
