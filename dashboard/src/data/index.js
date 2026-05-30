// Real data now comes from the proxy API (see context/AppContext + hooks/useApi).
// These exports remain as empty defaults plus shared presentation helpers.

export const ENDPOINTS = [];
export const API_KEYS = [];
export const AUDIT_ROWS = [];
export const EVENTS_SEED = [];

export function formatNum(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(v);
}

// Backend severities are uppercase (HIGH/MEDIUM/INFO); SevBadge keys are lowercase.
export function sevOf(severity) {
  return String(severity || 'info').toLowerCase();
}

export function formatTs(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour12: false }) +
    '.' + String(d.getMilliseconds()).padStart(3, '0');
}

// Compact, human-ish rendering of an event's detail dict.
export function detailText(detail) {
  if (!detail || typeof detail !== 'object') return '';
  if (detail.reason_code) {
    const extra = detail.detail ? ` — ${typeof detail.detail === 'string' ? detail.detail : JSON.stringify(detail.detail)}` : '';
    return `${detail.reason_code}${extra}`;
  }
  if (detail.redacted_types) return `redacted: ${[].concat(detail.redacted_types).join(', ')}`;
  if (detail.signals) return `abuse: ${[].concat(detail.signals).join(', ')}`;
  if (detail.provider) return `${detail.provider}${detail.model ? ` · ${detail.model}` : ''}`;
  if (detail.reason) return String(detail.reason);
  return JSON.stringify(detail);
}

// Map a backend event_to_dict() payload to the shape the UI components expect.
export function normalizeEvent(e) {
  return {
    id: e.id ?? `${e.timestamp}-${e.event_type}`,
    ts: formatTs(e.timestamp),
    timestamp: e.timestamp,
    sev: sevOf(e.severity),
    type: e.event_type,
    endpoint_id: e.endpoint_id ?? null,
    key_id: e.key_id ?? null,
    detail: detailText(e.detail),
    detailObj: e.detail ?? {},
    latency: e.latency_ms ?? null,
    request_id: e.request_id ?? null,
  };
}
