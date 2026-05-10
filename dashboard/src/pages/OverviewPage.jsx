import { useNavigate } from 'react-router-dom';
import TopBar      from '../components/TopBar';
import SevBadge    from '../components/SevBadge';
import Sparkline   from '../components/Sparkline';
import GuardBarChart from '../components/GuardBarChart';
import { useEventStream } from '../hooks/useEventStream';
import { ENDPOINTS, SPARKLINE, GUARD_ACTIVITY, AUDIT_ROWS, formatNum } from '../data';

/* ── Derived stats ───────────────────────────────────── */
function computeStats() {
  const total     = ENDPOINTS.reduce((s, e) => s + e.reqsToday,     0);
  const blocked   = ENDPOINTS.reduce((s, e) => s + e.blockedToday,  0);
  const activeEps = ENDPOINTS.filter(e => e.status !== 'paused').length;
  return { total, blocked, avgMs: 84, activeEps, totalEps: ENDPOINTS.length };
}

/* ── Stat card ───────────────────────────────────────── */
function StatCard({ label, value, sub, subClass, spark, danger }) {
  return (
    <div
      className="flex flex-col gap-1.5"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        padding: '14px 16px',
      }}
    >
      <div
        className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-3)' }}
      >
        {label}
      </div>
      <div
        className="font-mono font-semibold leading-none"
        style={{
          fontSize: '26px',
          letterSpacing: '-0.01em',
          color: danger ? 'var(--v-red)' : 'var(--text)',
        }}
      >
        {value}
      </div>
      {spark}
      <div
        className={['text-[11px] flex items-center gap-1.5 mt-auto', subClass || ''].join(' ')}
        style={{ color: 'var(--text-3)' }}
      >
        {sub}
      </div>
    </div>
  );
}

/* ── Live feed ───────────────────────────────────────── */
function LiveFeed({ events, paused, onPause }) {
  return (
    <div
      className="flex flex-col"
      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Live Event Feed
        </span>
        <div className="flex items-center gap-[10px]">
          <button
            onClick={onPause}
            className="font-mono text-[11px] transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            {paused ? '▶ resume' : '∥ pause'}
          </button>
          <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em]" style={{ color: 'var(--text-3)' }}>
            <span className="cdot animate" />
            LIVE
          </span>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8" style={{ color: 'var(--text-3)', fontSize: '12px' }}>
            <span className="flex items-center gap-2.5">
              <span className="cdot animate" />
              Listening for events…
            </span>
          </div>
        ) : (
          events.map((e, i) => (
            <div key={e.id ?? i} className={`feed-row${e.isNew ? ' new' : ''}`}>
              <span className="feed-ts">{e.ts}</span>
              <SevBadge sev={e.sev} />
              <div className="feed-detail">
                <span className="type">{e.type}</span>
                {e.endpoint && e.endpoint !== '—' && (
                  <span className="ep">· {e.endpoint}</span>
                )}
                <span className="desc">{e.detail}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Guard activity panel ────────────────────────────── */
function GuardActivity() {
  return (
    <div
      className="flex flex-col"
      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Guard Activity
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>last 6h</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '6px 0' }}>
        <GuardBarChart label="Input Guard"     data={GUARD_ACTIVITY.input}  />
        <GuardBarChart label="Output Guard"    data={GUARD_ACTIVITY.output} />
        <GuardBarChart label="Retrieval AuthZ" data={GUARD_ACTIVITY.authz}  />
      </div>
    </div>
  );
}

/* ── Recent audit table ──────────────────────────────── */
function RecentAudit({ onViewAll }) {
  return (
    <div
      className="flex flex-col"
      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Recent Audit Events
        </span>
        <button
          onClick={onViewAll}
          className="text-[11.5px] transition-colors"
          style={{ color: 'var(--accent)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}
        >
          View all →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="ov-audit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Endpoint</th>
              <th>Event Type</th>
              <th>Severity</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_ROWS.slice(0, 5).map(r => (
              <tr key={r.id}>
                <td className="col-ts">{r.ts}</td>
                <td className="col-ep">{r.endpoint}</td>
                <td className="col-type">{r.type}</td>
                <td className="col-sev"><SevBadge sev={r.sev} /></td>
                <td className="col-action">{r.action ?? r.detail?.split(' — ')[0] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function OverviewPage() {
  const navigate = useNavigate();
  const { events, paused, setPaused } = useEventStream();
  const stats = computeStats();

  return (
    <>
      {/* Top bar with live metrics */}
      <TopBar title="Overview">
        <div className="top-metric">
          Requests <strong>{formatNum(stats.total)}</strong>
        </div>
        <div className="top-metric">
          Blocked <strong className="danger">{formatNum(stats.blocked)}</strong>
        </div>
        <div className="top-metric">
          Avg <strong>{stats.avgMs}ms</strong>
        </div>
      </TopBar>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '22px 24px 36px' }}
      >
        {/* Stat cards */}
        <div
          className="grid gap-3 mb-[18px]"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
        >
          <StatCard
            label="Requests Today"
            value={formatNum(stats.total)}
            spark={<Sparkline data={SPARKLINE} />}
            sub={<><span style={{ fontSize: '9px' }}>▲</span> 12% vs yesterday</>}
            subClass="!text-danger"
          />
          <StatCard
            label="Blocked"
            danger
            value={formatNum(stats.blocked)}
            sub={`${((stats.blocked / stats.total) * 100).toFixed(2)}% of requests`}
          />
          <StatCard
            label="Avg Latency"
            value={
              <>
                {stats.avgMs}
                <span className="font-mono" style={{ fontSize: '14px', color: 'var(--text-3)', marginLeft: '4px' }}>ms</span>
              </>
            }
            sub={<><span style={{ fontSize: '9px', color: 'var(--v-green)' }}>▼</span><span style={{ color: 'var(--v-green)' }}> 8ms vs 24h avg</span></>}
          />
          <StatCard
            label="Active Endpoints"
            value={
              <>
                {stats.activeEps}
                <span className="font-mono" style={{ fontSize: '14px', color: 'var(--text-3)', marginLeft: '4px' }}>/ {stats.totalEps}</span>
              </>
            }
            sub={
              <div className="flex items-center gap-1 mt-1">
                {ENDPOINTS.map(ep => (
                  <span
                    key={ep.id}
                    title={ep.name}
                    className="rounded-full"
                    style={{
                      width: '7px', height: '7px',
                      background: ep.status === 'healthy'  ? 'var(--v-green)'
                                : ep.status === 'degraded' ? 'var(--v-yellow)'
                                : 'var(--text-4)',
                    }}
                  />
                ))}
              </div>
            }
          />
        </div>

        {/* Two-column: feed + guard activity */}
        <div
          className="grid gap-3 mb-[18px]"
          style={{ gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', minHeight: '360px' }}
        >
          <LiveFeed
            events={events}
            paused={paused}
            onPause={() => setPaused(p => !p)}
          />
          <GuardActivity />
        </div>

        {/* Recent audit events */}
        <RecentAudit onViewAll={() => navigate('/audit')} />
      </div>
    </>
  );
}
