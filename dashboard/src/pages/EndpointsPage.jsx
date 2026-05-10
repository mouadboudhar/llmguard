import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Switch  from '../components/Switch';
import { ENDPOINTS, formatNum } from '../data';

const PROVIDERS = {
  OpenAI:    { url: 'https://api.openai.com/v1',    model: 'gpt-4o' },
  Anthropic: { url: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet' },
  Ollama:    { url: 'http://localhost:11434/v1',     model: 'llama3.2' },
  Mistral:   { url: 'https://api.mistral.ai/v1',    model: 'mistral-large' },
};

const STATUS_COLOR = {
  healthy:  'var(--v-green)',
  degraded: 'var(--v-yellow)',
  paused:   'var(--text-3)',
};

/* ── Shared field row ──────────────────────────────── */
function Field({ label, children, last }) {
  return (
    <div
      className="grid items-center gap-3"
      style={{
        gridTemplateColumns: '140px 1fr',
        padding: '10px 0',
        borderBottom: last ? 'none' : '1px solid var(--border)',
      }}
    >
      <span className="text-sm" style={{ color: 'var(--text-3)' }}>{label}</span>
      {children}
    </div>
  );
}

/* ── Guard toggle row ──────────────────────────────── */
const GUARD_COLOR = {
  healthy:  'var(--v-green)',
  degraded: 'var(--v-yellow)',
  idle:     'var(--text-4)',
  disabled: 'var(--text-4)',
};

function GuardToggle({ name, desc, guard, onToggle }) {
  const col = guard.on ? (GUARD_COLOR[guard.status] ?? 'var(--text-4)') : 'var(--text-4)';
  return (
    <div className="lg-toggle-row">
      <div className="info flex items-start gap-3">
        <span
          className="rounded-full flex-shrink-0"
          style={{
            width: '8px', height: '8px', marginTop: '5px',
            background: col,
            boxShadow: guard.on && guard.status === 'healthy'
              ? '0 0 0 3px color-mix(in oklab, var(--v-green) 18%, transparent)'
              : 'none',
          }}
        />
        <div>
          <div className="name flex items-center gap-2">
            {name}
            <span
              className="text-[9.5px] font-bold tracking-[0.14em] uppercase"
              style={{ color: guard.on ? col : 'var(--text-3)' }}
            >
              {guard.on ? guard.status : 'off'}
            </span>
          </div>
          <div className="desc">{desc}</div>
        </div>
      </div>
      <Switch on={guard.on} onToggle={onToggle} />
    </div>
  );
}

/* ── Endpoint detail panel ─────────────────────────── */
function EndpointDetail({ ep, onUpdate }) {
  const [name,     setName]     = useState(ep.name);
  const [provider, setProvider] = useState(ep.provider);
  const [url,      setUrl]      = useState(ep.url);
  const [model,    setModel]    = useState(ep.model);
  const [dirty,    setDirty]    = useState(false);
  const [guards,   setGuards]   = useState({
    input:  { on: true,  status: 'healthy' },
    output: { on: true,  status: 'healthy' },
    authz:  { on: false, status: 'idle'    },
  });

  useEffect(() => {
    setName(ep.name); setProvider(ep.provider);
    setUrl(ep.url);   setModel(ep.model);
    setDirty(false);
  }, [ep.id]);

  const mark = setter => val => { setter(val); setDirty(true); };

  function save() { onUpdate({ name, provider, url, model }); setDirty(false); }
  function reset() {
    setName(ep.name); setProvider(ep.provider);
    setUrl(ep.url);   setModel(ep.model);
    setDirty(false);
  }
  function toggleGuard(key) {
    setGuards(g => {
      const next = !g[key].on;
      const status = next
        ? (key === 'authz' ? 'healthy' : 'healthy')
        : (key === 'authz' ? 'idle' : 'disabled');
      return { ...g, [key]: { on: next, status } };
    });
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '24px 28px 36px' }}>
      {/* Heading */}
      <div className="flex items-center gap-3 mb-[6px] flex-wrap">
        <span className={`ep-dot ${ep.status}`} style={{ width: '10px', height: '10px' }} />
        <h2
          className="m-0 font-semibold"
          style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}
        >
          {ep.name}
        </h2>
        <span
          className="text-[9.5px] font-bold tracking-[0.14em] uppercase px-[7px] py-[2px]"
          style={{
            border: '1px solid var(--border-2)',
            color: STATUS_COLOR[ep.status] ?? 'var(--text-3)',
          }}
        >
          {ep.status}
        </span>
        <span
          className="ml-auto font-mono text-[11px]"
          style={{ color: 'var(--text-3)' }}
        >
          {ep.id} · {formatNum(ep.reqsToday)} requests today
        </span>
      </div>

      {/* Configuration card */}
      <div className="lg-card mt-[18px]">
        <h3 style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
          Configuration
        </h3>
        <div style={{ padding: '0 18px 4px' }}>
          <Field label="Name">
            <input
              className="lg-input"
              value={name}
              onChange={e => mark(setName)(e.target.value)}
            />
          </Field>
          <Field label="Provider">
            <select
              className="lg-select"
              value={provider}
              onChange={e => mark(setProvider)(e.target.value)}
            >
              {Object.keys(PROVIDERS).map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Upstream URL">
            <input
              className="lg-input font-mono text-[12px]"
              value={url}
              onChange={e => mark(setUrl)(e.target.value)}
            />
          </Field>
          <Field label="Model">
            <input
              className="lg-input font-mono text-[12px]"
              value={model}
              onChange={e => mark(setModel)(e.target.value)}
            />
          </Field>
          <Field label="Endpoint URL" last>
            <span
              className="font-mono text-[12px] truncate"
              style={{ color: 'var(--accent)' }}
            >
              https://api.llmguard.dev/{ep.id}/proxy
            </span>
          </Field>
        </div>
        <div
          className="flex items-center gap-2 px-[18px] py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            className="lg-btn primary"
            disabled={!dirty}
            onClick={save}
          >
            Save changes
          </button>
          <button
            className="lg-btn"
            disabled={!dirty}
            onClick={reset}
          >
            Reset
          </button>
          <span className="flex-1" />
          <button className="lg-btn danger">Delete endpoint</button>
        </div>
      </div>

      {/* Guards card */}
      <div className="lg-card mt-[18px]">
        <h3 style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
          Guards
        </h3>
        <GuardToggle
          name="Input Guard"
          desc="Classifier blocks prompt injection, jailbreaks, and policy violations on incoming prompts."
          guard={guards.input}
          onToggle={() => toggleGuard('input')}
        />
        <GuardToggle
          name="Output Guard"
          desc="Redacts PII, secrets, and disallowed content from model responses before they reach the caller."
          guard={guards.output}
          onToggle={() => toggleGuard('output')}
        />
        <GuardToggle
          name="Retrieval AuthZ"
          desc="Enforces per-caller ACLs on retrieved documents. Required for RAG endpoints."
          guard={guards.authz}
          onToggle={() => toggleGuard('authz')}
        />
      </div>
    </div>
  );
}

/* ── Add endpoint modal ────────────────────────────── */
function AddModal({ onClose, onCreate }) {
  const [name,    setName]    = useState('');
  const [provider, setProv]   = useState('OpenAI');
  const [url,     setUrl]     = useState(PROVIDERS.OpenAI.url);
  const [model,   setModel]   = useState(PROVIDERS.OpenAI.model);
  const [guards,  setGuards]  = useState({ input: true, output: true, authz: false });

  function selectProvider(p) {
    setProv(p); setUrl(PROVIDERS[p].url); setModel(PROVIDERS[p].model);
  }

  const valid = name.trim() && url.trim() && model.trim();

  function create() {
    if (!valid) return;
    onCreate({
      id: 'ep' + Math.random().toString(36).slice(2, 8),
      name: name.trim(), provider, url, model,
      status: 'healthy', reqsToday: 0, blockedToday: 0,
    });
  }

  return (
    <div className="lg-modal-backdrop" onClick={onClose}>
      <div className="lg-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          className="flex items-start gap-4 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h3 className="m-0 font-semibold" style={{ fontSize: '15px', color: 'var(--text)' }}>
              Add Endpoint
            </h3>
            <p className="m-0 mt-0.5 text-sm" style={{ color: 'var(--text-3)' }}>
              Proxy a new LLM provider through LLM Guard. You can change everything later.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-6 h-6 grid place-items-center text-[13px] transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ padding: '6px 20px 16px' }}>
          {/* Name */}
          <div className="flex flex-col gap-1.5 mt-3">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Name <span style={{ color: 'var(--v-red)' }}>*</span>
            </label>
            <input
              className="lg-input"
              placeholder="e.g. Marketing Assistant"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Provider pills */}
          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Provider
            </label>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {Object.keys(PROVIDERS).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`provider-pill${provider === p ? ' on' : ''}`}
                  onClick={() => selectProvider(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Upstream URL
            </label>
            <input
              className="lg-input font-mono text-[12px]"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Model
            </label>
            <input
              className="lg-input font-mono text-[12px]"
              value={model}
              onChange={e => setModel(e.target.value)}
            />
          </div>

          {/* Guard defaults */}
          <div
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div
              className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1"
              style={{ color: 'var(--text-3)' }}
            >
              Guard Defaults
            </div>
          </div>

          {[
            ['input',  'Input Guard',      'Block prompt injection and jailbreak attempts'],
            ['output', 'Output Guard',     'Redact PII and secrets from responses'],
            ['authz',  'Retrieval AuthZ',  'Enforce per-caller ACLs (RAG only)'],
          ].map(([key, label, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-3)' }}>{desc}</div>
              </div>
              <Switch
                on={guards[key]}
                onToggle={() => setGuards(g => ({ ...g, [key]: !g[key] }))}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-[14px]"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button className="lg-btn" onClick={onClose}>Cancel</button>
          <button
            className="lg-btn primary"
            disabled={!valid}
            onClick={create}
          >
            Create endpoint
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────── */
export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState(ENDPOINTS);
  const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id);
  const [showAdd, setShowAdd] = useState(false);

  const selected = endpoints.find(e => e.id === selectedId) ?? endpoints[0];

  function handleUpdate(patch) {
    setEndpoints(eps => eps.map(e => e.id === selected.id ? { ...e, ...patch } : e));
  }

  function handleCreate(ep) {
    setEndpoints(eps => [...eps, ep]);
    setSelectedId(ep.id);
    setShowAdd(false);
  }

  return (
    <>
      <TopBar title="Endpoints" />

      {/* Two-pane layout — fills remaining height */}
      <div
        className="flex-1 grid min-h-0 overflow-hidden"
        style={{ gridTemplateColumns: '320px 1fr' }}
      >
        {/* ── Left: list ── */}
        <div
          className="flex flex-col min-h-0"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-1)' }}
        >
          {/* List header */}
          <div
            className="flex items-center justify-between px-4 py-[10px] flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {endpoints.length} endpoints
            </span>
            <button className="lg-btn primary" onClick={() => setShowAdd(true)}>
              + Add
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {endpoints.map(ep => {
              const active = ep.id === selectedId;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedId(ep.id)}
                  className="grid w-full text-left items-center gap-3 px-4 py-3 transition-colors"
                  style={{
                    gridTemplateColumns: '8px 1fr auto',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    background: active ? 'var(--bg-2)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className={`ep-dot ${ep.status}`} />
                  <div className="min-w-0">
                    <div
                      className="truncate font-medium text-sm"
                      style={{ color: 'var(--text)' }}
                    >
                      {ep.name}
                    </div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <span className="uppercase tracking-[0.1em] font-semibold mr-1" style={{ fontSize: '9.5px' }}>
                        {ep.provider}
                      </span>
                      · {ep.model}
                    </div>
                  </div>
                  <div className="font-mono text-[10.5px] text-right">
                    <div style={{ color: 'var(--text-2)' }}>{formatNum(ep.reqsToday)}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>today</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: detail ── */}
        <EndpointDetail
          key={selected.id}
          ep={selected}
          onUpdate={handleUpdate}
        />
      </div>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
