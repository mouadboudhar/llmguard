import { useState } from 'react';
import TopBar  from '../components/TopBar';
import Switch  from '../components/Switch';
import { useApp } from '../context/AppContext';

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

const ACTION_LABELS = { redact: 'Redact', block: 'Block', log_only: 'Log only' };

export default function GuardConfigPage() {
  const { guardConfig, serverInfo, updateGuardConfig } = useApp();

  // Cosmetic-only detector toggles (no backend yet — stored as Stage 13b intent).
  const [inputDetectors, setInputDetectors] = useState({ pattern: true, unicode: true, entropy: true });
  const [outputDetectors, setOutputDetectors] = useState({
    cc: true, email: true, ssn: true, phone: true, apikeys: true, entropy: true, threshold: 4.5,
  });
  const [busy, setBusy] = useState(false);

  const input = guardConfig?.input_guard ?? { enabled: true };
  const output = guardConfig?.output_guard ?? { enabled: true, action: 'redact' };
  const translation = guardConfig?.translation ?? { enabled: true, timeout_seconds: 1.0, supported_languages: [] };

  async function patch(body) {
    setBusy(true);
    try { await updateGuardConfig(body); } finally { setBusy(false); }
  }

  return (
    <>
      <TopBar title="Guard Config" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px 32px' }}>
        <h2 className="m-0 font-semibold" style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}>
          Guard Configuration
        </h2>
        <p className="mt-1.5 mb-4 text-sm" style={{ color: 'var(--text-3)', maxWidth: '640px' }}>
          Global defaults applied to all endpoints. The main enable switches, output action, and
          translation settings are persisted server-side; per-detector toggles are display-only for now.
        </p>

        {/* ── Input Guard ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${input.enabled ? ' g-on' : ' g-off'}`} />
                Input Guard
                <span className="g-state" style={{ color: input.enabled ? 'var(--v-green)' : 'var(--text-3)' }}>
                  {input.enabled ? 'Enabled globally' : 'Disabled'}
                </span>
              </div>
              <p className="g-desc">
                Validates all incoming prompts before forwarding. Blocks injection attempts,
                encoded payloads, and high-density instruction patterns.
              </p>
            </div>
            <Switch big on={input.enabled} onToggle={() => !busy && patch({ input_guard: { enabled: !input.enabled } })} />
          </div>

          <StatsBar items={[
            { label: 'Requests today', value: serverInfo?.requests_today ?? '—' },
            { label: 'Blocked', value: serverInfo?.blocked_today ?? '—', variant: 'danger' },
          ]} />

          <ToggleRow name="Pattern matching" desc="Regex-based injection detection"
            on={inputDetectors.pattern} onToggle={() => setInputDetectors(s => ({ ...s, pattern: !s.pattern }))} />
          <ToggleRow name="Unicode filtering" desc="Normalises homoglyph characters"
            on={inputDetectors.unicode} onToggle={() => setInputDetectors(s => ({ ...s, unicode: !s.unicode }))} />
          <ToggleRow name="Entropy heuristic" desc="Flags unusual instruction density"
            on={inputDetectors.entropy} onToggle={() => setInputDetectors(s => ({ ...s, entropy: !s.entropy }))} />
        </div>

        {/* ── Output Guard ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${output.enabled ? ' g-on' : ' g-off'}`} />
                Output Guard
                <span className="g-state" style={{ color: output.enabled ? 'var(--v-green)' : 'var(--text-3)' }}>
                  {output.enabled ? 'Enabled globally' : 'Disabled'}
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
                  value={output.action}
                  disabled={busy}
                  onChange={e => patch({ output_guard: { action: e.target.value } })}
                >
                  {Object.entries(ACTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <Switch big on={output.enabled} onToggle={() => !busy && patch({ output_guard: { enabled: !output.enabled } })} />
          </div>

          {[
            ['cc',      'Credit card numbers',   'Detects PAN sequences (Luhn-checked)'],
            ['email',   'Email addresses',        'RFC 5322 compliant matcher'],
            ['ssn',     'Social security nos.',   'US SSN format detection'],
            ['phone',   'Phone numbers',          'International + national formats'],
            ['apikeys', 'API keys / tokens',      'Provider-specific token signatures'],
          ].map(([key, name, desc]) => (
            <ToggleRow key={key} name={name} desc={desc}
              on={outputDetectors[key]} onToggle={() => setOutputDetectors(s => ({ ...s, [key]: !s[key] }))} />
          ))}

          <ToggleRow
            name="High-entropy strings"
            desc="Flags long base64/hex sequences likely to be secrets"
            on={outputDetectors.entropy}
            onToggle={() => setOutputDetectors(s => ({ ...s, entropy: !s.entropy }))}
            extra={
              <div className="slider-row">
                <span className="lbl">Threshold</span>
                <input type="range" min={3} max={6} step={0.1}
                  value={outputDetectors.threshold}
                  onChange={e => setOutputDetectors(s => ({ ...s, threshold: parseFloat(e.target.value) }))} />
                <span className="num">{outputDetectors.threshold.toFixed(1)}</span>
              </div>
            }
          />
        </div>

        {/* ── Translation ── */}
        <div className="lg-card guard-card" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="guard-card-head">
            <div>
              <div className="g-title">
                <span className={`g-status${translation.enabled ? ' g-on' : ' g-off'}`} />
                Translation
                <span className="g-state" style={{ color: translation.enabled ? 'var(--v-green)' : 'var(--text-3)' }}>
                  {translation.enabled ? 'Enabled globally' : 'Disabled'}
                </span>
              </div>
              <p className="g-desc">
                Detects non-English prompts and translates them before the Input Guard scans, so
                multilingual injections can't bypass detection.
              </p>
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>Timeout (s)</span>
                <input
                  className="lg-input" type="number" min={0.1} max={10} step={0.1}
                  style={{ width: 90 }}
                  defaultValue={translation.timeout_seconds}
                  disabled={busy}
                  onBlur={e => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v) && v !== translation.timeout_seconds) patch({ translation: { timeout_seconds: v } });
                  }}
                />
              </div>
            </div>
            <Switch big on={translation.enabled} onToggle={() => !busy && patch({ translation: { enabled: !translation.enabled } })} />
          </div>

          <div className="info-banner">
            <span>i</span>
            <span>
              Supported languages:{' '}
              <code>{(translation.supported_languages || []).join(', ') || '—'}</code>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
