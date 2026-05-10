import { useState } from 'react';
import TopBar    from '../components/TopBar';
import SevBadge  from '../components/SevBadge';
import { AUDIT_ROWS } from '../data';

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

function buildDetail(row) {
  return {
    id:         `evt_2026_05_08_${String(row.id).padStart(4, '0')}`,
    timestamp:  `2026-05-08T${row.ts}.142Z`,
    endpoint:   row.endpoint,
    key_id:     `k_${row.endpoint.toLowerCase().replace(/\s+/g, '_').slice(0, 12)}`,
    event_type: row.type,
    severity:   row.sev,
    detail: {
      detector:
        row.type === 'tool_policy'   ? 'allowlist:shell.exec'
        : row.type === 'pii_leak'   ? 'output-filter:PAN'
        : 'classifier:v3.1',
      score:
        row.sev === 'critical' ? 0.97
        : row.sev === 'high'  ? 0.84
        : 0.62,
      note: row.detail,
    },
    latency_ms:   row.latency,
    action_taken:
      row.sev === 'critical' || row.sev === 'high' ? 'BLOCKED'
      : row.sev === 'medium'                       ? 'REDACTED'
      : 'ALLOWED',
  };
}

export default function AuditLogPage() {
  const [selected, setSelected] = useState(3);

  const sel = AUDIT_ROWS.find(r => r.id === selected);

  return (
    <>
      <TopBar title="Audit Log" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px 32px' }}>
        {/* Header row */}
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <h2
            className="m-0 font-semibold"
            style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}
          >
            Audit Log
          </h2>
          <span className="flex-1" />
          <Filter label="Last 24 hours" />
          <Filter label="All severities" />
          <Filter label="All event types" />
          <Filter label="All endpoints" />
          <button className="lg-btn">⤓ Export CSV</button>
        </div>

        <div className="audit-summary">
          Showing <strong>142</strong> events ·{' '}
          <strong style={{ color: 'var(--v-red)' }}>14 blocked</strong> ·{' '}
          <strong style={{ color: 'var(--v-red)' }}>2 critical</strong>
        </div>

        {/* Events table */}
        <div className="lg-card">
          <div className="overflow-x-auto">
            <table className="data-table audit-dense">
              <thead>
                <tr>
                  <th style={{ width: 90  }}>Time</th>
                  <th style={{ width: 200 }}>Endpoint</th>
                  <th style={{ width: 170 }}>Event Type</th>
                  <th style={{ width: 110 }}>Severity</th>
                  <th>Detail</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_ROWS.map(r => (
                  <tr
                    key={r.id}
                    className={selected === r.id ? 'is-selected' : ''}
                    onClick={() => setSelected(r.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="mono-cell">{r.ts}</td>
                    <td>
                      <span className="ep-pill">
                        <span className="ep-dot-sm" style={{ background: r.endpointColor }} />
                        {r.endpoint}
                      </span>
                    </td>
                    <td><code className="type-pill">{r.type}</code></td>
                    <td>
                      <span
                        className="sev-badge"
                        style={{ '--scol': SEV_COLOR[r.sev] ?? 'var(--text-3)' }}
                      >
                        {r.sev}
                      </span>
                    </td>
                    <td className="detail-cell">{r.detail}</td>
                    <td className="mono-cell muted-cell" style={{ textAlign: 'right' }}>
                      {r.latency}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event detail */}
        {sel && (
          <div className="lg-card" style={{ marginTop: 14 }}>
            <h3>
              Event detail
              <span
                className="sev-badge"
                style={{ '--scol': SEV_COLOR[sel.sev] ?? 'var(--text-3)' }}
              >
                {sel.sev}
              </span>
              <span
                className="ml-auto font-mono font-normal text-[11px]"
                style={{ color: 'var(--text-3)' }}
              >
                evt_2026_05_08_{String(sel.id).padStart(4, '0')}
              </span>
            </h3>
            <pre className="json-block">
              {JSON.stringify(buildDetail(sel), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
