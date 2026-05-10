import { useState, useEffect, useRef } from 'react';
import { EVENTS_SEED, STREAM_TEMPLATES } from '../data';

const ENDPOINTS_LIST = [
  'Production Chatbot',
  'Support Agent',
  'Internal Knowledge',
  'Code Assistant',
];

let _counter = EVENTS_SEED.length + 1;

function nowTs() {
  const d = new Date();
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':') + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export function useEventStream() {
  const [events, setEvents] = useState(() =>
    EVENTS_SEED.map(e => ({ ...e, isNew: false }))
  );
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;

      const tpl = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
      const newEvent = {
        id: _counter++,
        ts: nowTs(),
        sev: tpl.sev,
        type: tpl.type,
        endpoint: ENDPOINTS_LIST[Math.floor(Math.random() * ENDPOINTS_LIST.length)],
        detail: tpl.detailFn(),
        isNew: true,
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);

      // Clear flash after animation completes
      setTimeout(() => {
        setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e));
      }, 600);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return { events, paused, setPaused };
}
