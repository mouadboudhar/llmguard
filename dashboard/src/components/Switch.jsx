export default function Switch({ on, onToggle, big = false }) {
  return (
    <div
      className={['lg-switch', on ? 'on' : '', big ? 'big' : ''].filter(Boolean).join(' ')}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
    />
  );
}
