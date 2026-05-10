import { formatNum } from '../data';

export default function GuardBarChart({ label, data }) {
  if (!data) {
    return (
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>not configured</span>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.passed.map((p, i) => p + data.blocked[i]));
  const totalPassed  = data.passed.reduce((a, b)  => a + b, 0);
  const totalBlocked = data.blocked.reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      {/* Row header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</span>
        <span className="flex gap-3 font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--v-green)' }}>{formatNum(totalPassed)} passed</span>
          <span style={{ color: 'var(--v-red)' }}>{formatNum(totalBlocked)} blocked</span>
        </span>
      </div>

      {/* Bars */}
      <div className="bar-chart">
        {data.passed.map((p, i) => {
          const b = data.blocked[i];
          /* Heights are computed JS values — inline style is necessary here */
          return (
            <div key={i} className="bar" title={`${p} passed · ${b} blocked`}>
              <div className="blocked-seg" style={{ height: `${(b / max) * 100}%` }} />
              <div className="passed-seg"  style={{ height: `${(p / max) * 100}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
