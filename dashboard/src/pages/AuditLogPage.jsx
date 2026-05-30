import { useState } from 'react';
import TopBar    from '../components/TopBar';
import { useApp } from '../context/AppContext';

const SEV_COLOR = {
  critical: 'var(--v-red)',
  high:     'var(--v-orange)',
  medium:   'var(--v-yellow)',
  low:      'var(--v-blue)',
  info:     'var(--text-3)',
};

function Filter({ label }) {
  return (
    <button className="filter-btn">
      <span>{label}</span>
      <span className="chev">▾</span>
    </button>
  );
}

export default function AuditLogPage() {
  const { events, endpointName } = useApp();
  const [selectedId, setSelectedId] = useState(null);

  const sel = events.find(r => r.id === selectedId) ?? events[0];
  const blocked = events.filter(e => e.type?.includes('BLOCKED')).length;
  const critical = events.filter(e => e.sev === 'critical' || e.sev === 'high').length;

  return (
    <>
      <TopBar title="Audit Log" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px 32px' }}>
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <h2 className="m-0 font-semibold" style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}>Audit Log</h2>
          <span className="flex-1" />
          <Filter label="Last 24 hours" />
          <Filter label="All severities" />
          <Filter label="All event types" />
          <Filter label="All endpoints" />
        </div>

        <div className="audit-summary">
          Showing <strong>{events.length}</strong> events ·{' '}
          <strong style={{ color: 'var(--v-red)' }}>{blocked} blocked</strong> ·{' '}
          <strong style={{ color: 'var(--v-red)' }}>{critical} high+</strong>
        </div>

        <div className="lg-card">
          <div className="overflow-x-auto">
            <table className="data-table audit-dense">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Time</th>
                  <th style={{ width: 200 }}>Endpoint</th>
                  <th style={{ width: 200 }}>Event Type</th>
                  <th style={{ width: 110 }}>Severity</th>
                  <th>Detail</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {events.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className={(sel && sel.id === r.id) ? 'is-selected' : ''}
                    onClick={() => setSelectedId(r.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="mono-cell">{r.ts}</td>
                    <td>
                      <span className="ep-pill">
                        <span className="ep-dot-sm" style={{ background: r.endpoint_id != null ? 'var(--accent)' : 'var(--text-4)' }} />
                        {r.endpoint_id != null ? endpointName(r.endpoint_id) : '—'}
                      </span>
                    </td>
                    <td><code className="type-pill">{r.type}</code></td>
                    <td><span className="sev-badge" style={{ '--scol': SEV_COLOR[r.sev] ?? 'var(--text-3)' }}>{r.sev}</span></td>
                    <td className="detail-cell">{r.detail}</td>
                    <td className="mono-cell muted-cell" style={{ textAlign: 'right' }}>
                      {r.latency != null ? `${r.latency}ms` : '—'}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr><td colSpan={6} className="muted-cell" style={{ padding: '18px' }}>No events recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {sel && (
          <div className="lg-card" style={{ marginTop: 14 }}>
            <h3>
              Event detail
              <span className="sev-badge" style={{ '--scol': SEV_COLOR[sel.sev] ?? 'var(--text-3)' }}>{sel.sev}</span>
              <span className="ml-auto font-mono font-normal text-[11px]" style={{ color: 'var(--text-3)' }}>
                {sel.request_id || sel.id}
              </span>
            </h3>
            <pre className="json-block">
              {JSON.stringify({
                id: sel.id,
                timestamp: sel.timestamp,
                event_type: sel.type,
                severity: sel.sev,
                endpoint: sel.endpoint_id != null ? endpointName(sel.endpoint_id) : null,
                endpoint_id: sel.endpoint_id,
                key_id: sel.key_id,
                latency_ms: sel.latency,
                request_id: sel.request_id,
                detail: sel.detailObj,
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
