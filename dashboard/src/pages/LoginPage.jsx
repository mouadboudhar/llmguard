import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    // Hardcoded demo credential — no backend yet
    if (email === 'admin@acme.com' && password === 'demo') {
      navigate('/overview');
    } else {
      setError('Invalid credentials. Try admin@acme.com / demo');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Card */}
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: '360px',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex flex-col items-center gap-3 px-8 pt-8 pb-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="logo-mark" style={{ width: '28px', height: '28px' }} />
          <div className="text-center">
            <div
              className="font-semibold"
              style={{ fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--text)' }}
            >
              LLM Guard
            </div>
            <div className="mt-1 text-[11.5px]" style={{ color: 'var(--text-3)' }}>
              Enterprise Security Gateway
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6" noValidate>
          {error && (
            <div
              className="text-[11.5px] px-3 py-2"
              style={{
                border: '1px solid color-mix(in oklab, var(--v-red) 40%, var(--border))',
                background: 'color-mix(in oklab, var(--v-red) 8%, transparent)',
                color: 'var(--v-red)',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: 'var(--text-3)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="lg-input"
              placeholder="admin@acme.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: 'var(--text-3)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="lg-input"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button
            type="submit"
            className="lg-btn primary w-full justify-center mt-1"
            style={{ paddingTop: '9px', paddingBottom: '9px', fontSize: '13px' }}
          >
            Sign in
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-[11.5px] transition-colors"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-[11px]" style={{ color: 'var(--text-4)' }}>
        Self-hosted · v0.5.0 · acme-prod
      </div>
    </div>
  );
}
