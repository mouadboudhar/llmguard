import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiRequest, getToken } from '../hooks/useApi';
import { normalizeEvent } from '../data';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

const EVENT_CAP = 100;

export function AppProvider({ children }) {
  const [endpoints, setEndpoints] = useState([]);
  const [keys, setKeys] = useState([]);
  const [serverInfo, setServerInfo] = useState(null);
  const [guardConfig, setGuardConfig] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const refetchEndpoints = useCallback(async () => {
    setEndpoints(await apiRequest('/api/endpoints'));
  }, []);
  const refetchKeys = useCallback(async () => {
    setKeys(await apiRequest('/api/keys'));
  }, []);
  const refetchServerInfo = useCallback(async () => {
    setServerInfo(await apiRequest('/api/server/info'));
  }, []);
  const refetchGuardConfig = useCallback(async () => {
    setGuardConfig(await apiRequest('/api/guards/config'));
  }, []);

  // Initial load of all collections in parallel.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [eps, ks, info, gc, audit] = await Promise.all([
          apiRequest('/api/endpoints'),
          apiRequest('/api/keys'),
          apiRequest('/api/server/info'),
          apiRequest('/api/guards/config'),
          apiRequest('/api/audit/events?limit=100'),
        ]);
        if (!alive) return;
        setEndpoints(eps);
        setKeys(ks);
        setServerInfo(info);
        setGuardConfig(gc);
        setEvents((audit.events || []).map(normalizeEvent));
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Live event stream over the dashboard WebSocket.
  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${window.location.host}/ws/events?token=${encodeURIComponent(token)}`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return undefined;
    }
    wsRef.current = ws;
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data && data.type === 'ping') return;
        setEvents((prev) => [{ ...normalizeEvent(data), isNew: true }, ...prev].slice(0, EVENT_CAP));
      } catch {
        /* ignore malformed frames */
      }
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  // Mutators — each refreshes the affected collection so the UI stays in sync.
  const createEndpoint = useCallback(async (body) => {
    const created = await apiRequest('/api/endpoints', { method: 'POST', body });
    await refetchEndpoints();
    return created;
  }, [refetchEndpoints]);

  const updateEndpoint = useCallback(async (id, body) => {
    const updated = await apiRequest(`/api/endpoints/${id}`, { method: 'PATCH', body });
    await refetchEndpoints();
    return updated;
  }, [refetchEndpoints]);

  const deleteEndpoint = useCallback(async (id) => {
    await apiRequest(`/api/endpoints/${id}`, { method: 'DELETE' });
    await Promise.all([refetchEndpoints(), refetchKeys()]);
  }, [refetchEndpoints, refetchKeys]);

  const createKey = useCallback(async (body) => {
    const created = await apiRequest('/api/keys', { method: 'POST', body });
    await refetchKeys();
    return created; // includes one-time plaintext `key`
  }, [refetchKeys]);

  const revokeKey = useCallback(async (id) => {
    await apiRequest(`/api/keys/${id}`, { method: 'DELETE' });
    await refetchKeys();
  }, [refetchKeys]);

  const updateKeyLimits = useCallback(async (id, body) => {
    const updated = await apiRequest(`/api/keys/${id}/limits`, { method: 'PATCH', body });
    await refetchKeys();
    return updated;
  }, [refetchKeys]);

  const updateGuardConfig = useCallback(async (body) => {
    const updated = await apiRequest('/api/guards/config', { method: 'PATCH', body });
    setGuardConfig(updated);
    return updated;
  }, []);

  const value = {
    endpoints,
    keys,
    serverInfo,
    guardConfig,
    events,
    loading,
    error,
    refetchEndpoints,
    refetchKeys,
    refetchServerInfo,
    refetchGuardConfig,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    createKey,
    revokeKey,
    updateKeyLimits,
    updateGuardConfig,
    endpointName: (id) => endpoints.find((e) => e.id === id)?.name ?? (id == null ? '—' : `#${id}`),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
