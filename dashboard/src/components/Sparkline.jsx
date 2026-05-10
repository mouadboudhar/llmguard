export default function Sparkline({ data }) {
  const W = 240, H = 28;
  const max = Math.max(...data) || 1;
  const step = W / (data.length - 1);

  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(H - (v / max) * (H - 4) - 2).toFixed(1)}`)
    .join(' ');

  const lastX = (data.length - 1) * step;
  const lastY = H - (data[data.length - 1] / max) * (H - 4) - 2;
  const area  = `0,${H} ${pts} ${lastX},${H}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', height: '28px', width: '100%', marginTop: '4px' }}
    >
      <polygon points={area}  fill="color-mix(in oklab, var(--accent) 18%, transparent)" />
      <polyline points={pts}  stroke="var(--accent)" strokeWidth="1.4" fill="none" />
      <circle cx={lastX} cy={lastY} r="2.4" fill="var(--accent)" />
    </svg>
  );
}
