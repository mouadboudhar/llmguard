import { useState } from 'react';
import TopBar from '../components/TopBar';
import { API_KEYS } from '../data';

const DEMO_NEW_KEY = 'llmg_a7f3k9x2p1q8mzv6bnc4wd3';

/* ── Reveal panel ──────────────────────────────────── */
function RevealPanel({ keyValue, onDone }) {
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try { await navigator.clipboard.writeText(keyValue); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="reveal-card">
      <div className="reveal-bar" />
      <div className="reveal-body">
        <div className="reveal-head">
          <span className="warn-glyph">⚠</span>
          <div>
            <h3>Your new API key — save this now</h3>
            <p>This key will never be shown again after you close this panel.</p>
          </div>
        </div>

        <div className="reveal-key">
          <code>{keyValue}</code>
          <button
            className={`lg-btn${copied ? ' copied' : ''}`}
            onClick={copy}
            style={copied ? { color: 'var(--v-green)', borderColor: 'var(--v-green)' } : {}}
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>

        <label className="reveal-check">
          <input
            type="checkbox"
            checked={saved}
            onChange={e => setSaved(e.target.checked)}
          />
          <span className="custom-check" />
          I have saved this key somewhere safe
        </label>

        <div className="flex justify-end">
          <button
            className="lg-btn primary"
            disabled={!saved}
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────── */
export default function ApiKeysPage() {
  const [keys, setKeys]           = useState(API_KEYS);
  const [revealOpen, setRevealOpen] = useState(true);

  const activeCount  = keys.filter(k => k.status === 'active').length;
  const revokedCount = keys.filter(k => k.status === 'revoked').length;

  function revoke(id) {
    setKeys(ks => ks.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  }

  return (
    <>
      <TopBar title="API Keys" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px 32px' }}>
        {/* Page header row */}
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <h2
            className="m-0 font-semibold"
            style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}
          >
            API Keys
          </h2>
          <span className="font-mono text-[11.5px]" style={{ color: 'var(--text-3)' }}>
            {activeCount} active · {revokedCount} revoked
          </span>
          <span className="flex-1" />
          <button
            className="lg-btn primary"
            onClick={() => setRevealOpen(true)}
          >
            + Create Key
          </button>
        </div>

        {/* Keys table */}
        <div className="lg-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Endpoint</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id} className={k.status === 'revoked' ? 'is-muted' : ''}>
                    {/* Name */}
                    <td>
                      <span className="font-medium" style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {k.name}
                      </span>
                    </td>

                    {/* Masked key */}
                    <td>
                      <code className="mono-pill">
                        {k.preview}••••••••••••
                      </code>
                    </td>

                    {/* Endpoint */}
                    <td>
                      <span className="ep-pill">
                        <span
                          className="ep-dot-sm"
                          style={{ background: k.endpointColor }}
                        />
                        {k.endpoint}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="muted-cell">{k.created}</td>

                    {/* Last used */}
                    <td className="muted-cell">{k.lastUsed}</td>

                    {/* Status */}
                    <td>
                      <span className={`status-pill ${k.status}`}>
                        {k.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" title="Copy key preview">⎘</button>
                      {k.status === 'active' && (
                        <button
                          className="link-danger"
                          onClick={() => revoke(k.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* One-time key reveal */}
        {revealOpen && (
          <RevealPanel
            keyValue={DEMO_NEW_KEY}
            onDone={() => setRevealOpen(false)}
          />
        )}
      </div>
    </>
  );
}
