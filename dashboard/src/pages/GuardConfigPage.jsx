import { useState } from 'react';
import TopBar  from '../components/TopBar';
import Switch  from '../components/Switch';

/* ── Guard stats bar ───────────────────────────────── */
function StatsBar({ items }) {
  return (
    <div className="g-stats-bar">
      {items.map(({ label, value, variant }) => (
        <div key={label}>
          <span className="lbl">{label}</span>
          <span className={`num${variant ? ` ${variant}` : ''}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Toggle row (reuses lg-toggle-row class) ───────── */
function ToggleRow({ name, desc, on, onToggle, extra }) {
  return (
    <div className="lg-toggle-row">
      <div className="info flex-1">
        <div className="name">{name}</div>
        <div className="desc">{desc}</div>
        {extra}
      </div>
      <Switch on={on} onToggle={onToggle} />
    </div>
  );
}

/* ── Page ──────────────────────────────────────────── */
export default function GuardConfigPage() {
  const [input, setInput] = useState({
    on: true, pattern: true, unicode: true, entropy: true,
  });
  const [output, setOutput] = useState({
    on: true, defaultAction: 'Redact',
    cc: true, email: true, ssn: true, phone: true, apikeys: true,
    entropy: true, threshold: 4.5,
  });
  const [authz, setAuthz] = useState({ on: false });

  return (
    <>
      <TopBar title="Guard Config" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px 32px' }}>
        <h2
          className="m-0 font-semibold"
          style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}
        >
          Guard Configuration
        </h2>
        <p className="mt-1.5 mb-4 text-sm" style={{ color: 'var(--text-3)', maxWidth: '640px' }}>
          Configure global defaults for all endpoints. Per-endpoint overrides are set in the Endpoints page.
        </p>

        {/* ── Input Guard ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${input.on ? ' g-on' : ' g-off'}`} />
                Input Guard
                <span className="g-state" style={{ color: input.on ? 'var(--v-green)' : 'var(--text-3)' }}>
                  {input.on ? 'Enabled globally' : 'Disabled'}
                </span>
              </div>
              <p className="g-desc">
                Validates all incoming prompts before forwarding. Blocks injection attempts,
                encoded payloads, and high-density instruction patterns.
              </p>
            </div>
            <Switch big on={input.on} onToggle={() => setInput(s => ({ ...s, on: !s.on }))} />
          </div>

          <StatsBar items={[
            { label: 'Scanned this week', value: '35.2k' },
            { label: 'Blocked',           value: '187', variant: 'danger' },
            { label: 'Block rate',        value: '0.5%' },
          ]} />

          <ToggleRow
            name="Pattern matching"
            desc="Regex-based injection detection"
            on={input.pattern}
            onToggle={() => setInput(s => ({ ...s, pattern: !s.pattern }))}
          />
          <ToggleRow
            name="Unicode filtering"
            desc="Normalises homoglyph characters"
            on={input.unicode}
            onToggle={() => setInput(s => ({ ...s, unicode: !s.unicode }))}
          />
          <ToggleRow
            name="Entropy heuristic"
            desc="Flags unusual instruction density"
            on={input.entropy}
            onToggle={() => setInput(s => ({ ...s, entropy: !s.entropy }))}
          />

          <div className="custom-pat">
            <div className="lbl">Custom patterns</div>
            <div className="pat-area">
              <div className="pat-line">/ignore\s+(all\s+)?previous\s+instructions/i</div>
              <div className="pat-line">/(system|developer)\s+prompt/i</div>
            </div>
            <button
              className="text-[11.5px] font-medium"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            >
              + Add custom pattern
            </button>
          </div>
        </div>

        {/* ── Output Guard ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${output.on ? ' g-on' : ' g-off'}`} />
                Output Guard
                <span className="g-state" style={{ color: output.on ? 'var(--v-green)' : 'var(--text-3)' }}>
                  {output.on ? 'Enabled globally' : 'Disabled'}
                </span>
              </div>
              <p className="g-desc">
                Scans LLM responses before delivery. Detects and redacts PII and exposed secrets.
              </p>
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>Default action</span>
                <select
                  className="lg-select"
                  style={{ width: 140 }}
                  value={output.defaultAction}
                  onChange={e => setOutput(s => ({ ...s, defaultAction: e.target.value }))}
                >
                  <option>Redact</option>
                  <option>Block</option>
                  <option>Annotate</option>
                </select>
              </div>
            </div>
            <Switch big on={output.on} onToggle={() => setOutput(s => ({ ...s, on: !s.on }))} />
          </div>

          <StatsBar items={[
            { label: 'Scanned this week', value: '34.9k' },
            { label: 'Redacted',          value: '67', variant: 'warn' },
            { label: 'Rate',              value: '0.2%' },
          ]} />

          {[
            ['cc',      'Credit card numbers',   'Detects PAN sequences (Luhn-checked)'],
            ['email',   'Email addresses',        'RFC 5322 compliant matcher'],
            ['ssn',     'Social security nos.',   'US SSN format detection'],
            ['phone',   'Phone numbers',          'International + national formats'],
            ['apikeys', 'API keys / tokens',      'Provider-specific token signatures'],
          ].map(([key, name, desc]) => (
            <ToggleRow
              key={key}
              name={name}
              desc={desc}
              on={output[key]}
              onToggle={() => setOutput(s => ({ ...s, [key]: !s[key] }))}
            />
          ))}

          <ToggleRow
            name="High-entropy strings"
            desc="Flags long base64/hex sequences likely to be secrets"
            on={output.entropy}
            onToggle={() => setOutput(s => ({ ...s, entropy: !s.entropy }))}
            extra={
              <div className="slider-row">
                <span className="lbl">Threshold</span>
                <input
                  type="range"
                  min={3} max={6} step={0.1}
                  value={output.threshold}
                  onChange={e => setOutput(s => ({ ...s, threshold: parseFloat(e.target.value) }))}
                />
                <span className="num">{output.threshold.toFixed(1)}</span>
              </div>
            }
          />
        </div>

        {/* ── Retrieval AuthZ ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${authz.on ? ' g-on' : ' g-off'}`} />
                Retrieval AuthZ
                <span className="g-state" style={{ color: 'var(--text-3)' }}>
                  {authz.on ? 'Enabled globally' : 'Disabled globally'}
                </span>
              </div>
              <p className="g-desc">
                Filters retrieved context documents by user clearance level.
                Only relevant for RAG-based endpoints.
              </p>
            </div>
            <Switch big on={authz.on} onToggle={() => setAuthz(s => ({ ...s, on: !s.on }))} />
          </div>

          <div className="info-banner">
            <span>i</span>
            <span>
              This guard is only effective when your application sends{' '}
              <code>X-User-Clearance</code> headers and your documents are
              tagged with <code>clearance_level</code> metadata at ingestion.
            </span>
          </div>

          <div className="clearance-grid">
            {[
              ['PUBLIC',       'Available to all callers'],
              ['INTERNAL',     'Authenticated employees only'],
              ['CONFIDENTIAL', 'Restricted teams + above'],
              ['RESTRICTED',   'Named individuals only'],
            ].map(([tier, desc], i) => (
              <div key={tier} className="clearance-tier">
                <div className="t-head">
                  <span className="num">{i + 1}</span>
                  <span className="tier">{tier}</span>
                </div>
                <div className="t-desc">{desc}</div>
              </div>
            ))}
          </div>

          <div className="card-foot">
            <button
              className="text-[11.5px] font-medium"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            >
              View integration guide →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
