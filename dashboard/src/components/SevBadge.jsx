const SEV_COLORS = {
  critical: 'var(--sev-critical)',
  high:     'var(--sev-high)',
  medium:   'var(--sev-medium)',
  low:      'var(--sev-low)',
  info:     'var(--sev-info)',
};

export default function SevBadge({ sev }) {
  const color = SEV_COLORS[sev] ?? 'var(--text-3)';
  return (
    <span className="sev-badge" style={{ '--scol': color }}>
      {sev}
    </span>
  );
}
