export default function TopBar({ title, children }) {
  return (
    <header
      className="flex items-center flex-shrink-0 px-6 gap-4"
      style={{
        height: 'var(--header-h)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}
    >
      <h1
        className="m-0 font-semibold"
        style={{ fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--text)' }}
      >
        {title}
      </h1>
      {children && (
        <div className="ml-auto flex items-center gap-0">
          {children}
        </div>
      )}
    </header>
  );
}
