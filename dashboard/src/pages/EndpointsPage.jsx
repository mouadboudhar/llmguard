import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Switch from '../components/Switch';
import { useApp } from '../context/AppContext';
import { formatNum } from '../data';

/* Backend provider enum -> display label + sensible defaults. */
const PROVIDERS = {
  openai:    { label: 'OpenAI',    url: 'https://api.openai.com',            model: 'gpt-4o-mini' },
  anthropic: { label: 'Anthropic', url: 'https://api.anthropic.com',         model: 'claude-3-5-sonnet' },
  ollama:    { label: 'Ollama',    url: 'http://localhost:11434',            model: 'llama3.2' },
  mistral:   { label: 'Mistral',   url: 'https://api.mistral.ai',            model: 'mistral-large' },
  grok:      { label: 'Grok',      url: 'https://api.x.ai',                  model: 'grok-2' },
  nvidia:    { label: 'NVIDIA',    url: 'https://integrate.api.nvidia.com',  model: 'meta/llama-3.1-70b' },
};

/* Fallback Input Guard rule list if GET /api/guards/config hasn't loaded. */
const INPUT_GUARD_RULES = [
  'OVERRIDE_ATTEMPT', 'PERSONA_SWITCH', 'SYSTEM_PROBE',
  'ENCODED_PAYLOAD', 'HIGH_DENSITY', 'MULTILINGUAL',
];
const PROMPT_GUARD_MODELS = ['gpt-4o-mini', 'gpt-4o', 'claude-haiku'];
const PROMPT_GUARD_ACTIONS = ['block', 'warn', 'log_only'];

const statusOf = (ep) => (ep.is_active ? 'healthy' : 'paused');

/* ── Shared field row ──────────────────────────────── */
function Field({ label, children, last }) {
  return (
    <div
      className="grid items-center gap-3"
      style={{ gridTemplateColumns: '140px 1fr', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--text-3)' }}>{label}</span>
      {children}
    </div>
  );
}

/* ── Shared bits for the guard cards ───────────────── */
function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
      <h3 className="m-0 font-semibold" style={{ fontSize: '13px', color: 'var(--text)' }}>{title}</h3>
      {subtitle && <p className="m-0 mt-1 text-[11.5px]" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
    </div>
  );
}

function SaveBar({ dirty, busy, err, onSave }) {
  return (
    <>
      {err && (
        <div className="text-[11.5px] mx-[18px] mt-3 px-3 py-2" style={{ border: '1px solid var(--v-red)', color: 'var(--v-red)' }}>
          {err}
        </div>
      )}
      <div className="flex items-center gap-2 px-[18px] py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button className="lg-btn primary" disabled={!dirty || busy} onClick={onSave}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
    </>
  );
}

function RuleRow({ name, on, onToggle }) {
  return (
    <div className="flex items-center justify-between py-[7px]" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="font-mono text-[11.5px]" style={{ color: on ? 'var(--text-2)' : 'var(--text-4)' }}>{name}</span>
      <Switch on={on} onToggle={onToggle} />
    </div>
  );
}

/* ── Section 1: per-rule guard config ──────────────── */
function GuardRulesCard({ ep, onUpdate }) {
  const { guardConfig } = useApp();
  const inputRules     = guardConfig?.input_guard?.available_rules  ?? INPUT_GUARD_RULES;
  const outputRules    = guardConfig?.output_guard?.available_rules ?? [];
  const supportedLangs = guardConfig?.translation?.supported_languages ?? [];

  // Input + Output share one disabled-rules field on the backend.
  const [disabled, setDisabled] = useState(() => new Set(ep.disabled_input_rules || []));
  const [phrases, setPhrases]   = useState(ep.custom_blocked_phrases || []);
  const [phraseInput, setPhraseInput] = useState('');
  const [langs, setLangs]       = useState(() => new Set(ep.active_languages || []));
  const [dirty, setDirty]       = useState(false);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');

  useEffect(() => {
    setDisabled(new Set(ep.disabled_input_rules || []));
    setPhrases(ep.custom_blocked_phrases || []);
    setLangs(new Set(ep.active_languages || []));
    setPhraseInput(''); setDirty(false); setErr('');
  }, [ep.id]);

  const toggleRule = (name) => {
    setDisabled(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
    setDirty(true);
  };

  const setAllRules = (rules, enabled) => {
    setDisabled(prev => {
      const next = new Set(prev);
      rules.forEach(r => { if (enabled) next.delete(r); else next.add(r); });
      return next;
    });
    setDirty(true);
  };

  const addPhrase = () => {
    const p = phraseInput.trim();
    if (p && !phrases.includes(p)) { setPhrases([...phrases, p]); setDirty(true); }
    setPhraseInput('');
  };
  const removePhrase = (p) => { setPhrases(phrases.filter(x => x !== p)); setDirty(true); };

  // active_languages: [] means "all supported". A language reads as active when
  // the set is empty (all) or it is explicitly included.
  const langActive = (code) => langs.size === 0 || langs.has(code);
  const toggleLang = (code) => {
    setLangs(prev => {
      const base = prev.size === 0 ? new Set(supportedLangs) : new Set(prev);
      if (base.has(code)) base.delete(code); else base.add(code);
      return base;
    });
    setDirty(true);
  };

  async function save() {
    setBusy(true); setErr('');
    // Selecting every language is equivalent to the "all" default -> store [].
    const langArr = (langs.size === 0 || langs.size === supportedLangs.length) ? [] : Array.from(langs);
    try {
      await onUpdate(ep.id, {
        disabled_input_rules: Array.from(disabled),
        custom_blocked_phrases: phrases,
        active_languages: langArr,
      });
      setDirty(false);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const subHead = (t, mt) => (
    <div className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${mt} mb-1.5`} style={{ color: 'var(--text-3)' }}>{t}</div>
  );

  return (
    <div className="lg-card mt-[18px]">
      <SectionTitle title="Guard Rules" subtitle="Toggle individual detection rules. ON = rule active, OFF = disabled for this endpoint." />
      <div style={{ padding: '4px 18px 0' }}>
        {subHead('Input Guard', 'mt-3')}
        {inputRules.map(r => <RuleRow key={r} name={r} on={!disabled.has(r)} onToggle={() => toggleRule(r)} />)}

        <div className="flex items-center justify-between mt-4 mb-1.5">
          <span className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>Output Guard</span>
          {outputRules.length > 0 && (
            <span className="flex items-center gap-3 text-[11px]">
              <button type="button" onClick={() => setAllRules(outputRules, true)}  style={{ color: 'var(--accent)' }}>Enable all</button>
              <span style={{ color: 'var(--border-2)' }}>·</span>
              <button type="button" onClick={() => setAllRules(outputRules, false)} style={{ color: 'var(--text-3)' }}>Disable all</button>
            </span>
          )}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', columnGap: 18 }}>
          {outputRules.map(r => <RuleRow key={r} name={r} on={!disabled.has(r)} onToggle={() => toggleRule(r)} />)}
          {outputRules.length === 0 && <div className="text-[11.5px] py-2" style={{ color: 'var(--text-4)' }}>No output rules available.</div>}
        </div>

        {subHead('Custom Blocked Phrases', 'mt-4')}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {phrases.map(p => (
            <span key={p} className="inline-flex items-center gap-1.5 px-2 py-1 text-[11.5px]"
                  style={{ border: '1px solid var(--border-2)', background: 'var(--bg-2)', color: 'var(--text-2)' }}>
              {p}
              <button onClick={() => removePhrase(p)} style={{ color: 'var(--text-3)' }} title="Remove">✕</button>
            </span>
          ))}
          {phrases.length === 0 && <span className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>None</span>}
        </div>
        <input
          className="lg-input"
          placeholder="Type a phrase, press Enter to add"
          value={phraseInput}
          onChange={e => setPhraseInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhrase(); } }}
        />

        {subHead('Active Languages', 'mt-4')}
        <p className="m-0 mb-2 text-[11px]" style={{ color: 'var(--text-4)' }}>
          Languages translated &amp; scanned by the Input Guard. All selected = all languages.
        </p>
        <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {supportedLangs.map(code => (
            <label key={code} className="flex items-center gap-1.5 text-[12px] cursor-pointer" style={{ color: 'var(--text-2)' }}>
              <input type="checkbox" checked={langActive(code)} onChange={() => toggleLang(code)} />
              <span className="font-mono uppercase">{code}</span>
            </label>
          ))}
          {supportedLangs.length === 0 && <span className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>—</span>}
        </div>
      </div>
      <SaveBar dirty={dirty} busy={busy} err={err} onSave={save} />
    </div>
  );
}

/* ── Section 2: prompt guard (LLM-as-judge policy) ─── */
function PromptGuardCard({ ep, onUpdate }) {
  const [enabled, setEnabled] = useState(!!ep.prompt_guard_enabled);
  const [prompt, setPrompt]   = useState(ep.prompt_guard_prompt || '');
  const [model, setModel]     = useState(ep.prompt_guard_model || 'gpt-4o-mini');
  const [action, setAction]   = useState(ep.prompt_guard_action || 'block');
  const [dirty, setDirty]     = useState(false);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');

  useEffect(() => {
    setEnabled(!!ep.prompt_guard_enabled);
    setPrompt(ep.prompt_guard_prompt || '');
    setModel(ep.prompt_guard_model || 'gpt-4o-mini');
    setAction(ep.prompt_guard_action || 'block');
    setDirty(false); setErr('');
  }, [ep.id]);

  const mark = setter => val => { setter(val); setDirty(true); };

  async function save() {
    setBusy(true); setErr('');
    try {
      await onUpdate(ep.id, {
        prompt_guard_enabled: enabled,
        prompt_guard_prompt: prompt.trim() || null,
        prompt_guard_model: model,
        prompt_guard_action: action,
      });
      setDirty(false);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="lg-card mt-[18px]">
      <SectionTitle
        title="Prompt Guard"
        subtitle="LLM-as-judge policy layer. Non-deterministic. Adds latency and API cost per request."
      />
      <div style={{ padding: '4px 18px 0' }}>
        <div className="flex items-center justify-between py-[10px]" style={{ borderBottom: enabled ? '1px solid var(--border)' : 'none' }}>
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>Enable prompt guard</span>
          <Switch on={enabled} onToggle={() => mark(setEnabled)(!enabled)} />
        </div>

        {enabled && (
          <>
            <div className="flex flex-col gap-1.5 mt-3">
              <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>Policy prompt</label>
              <textarea
                className="lg-input"
                rows={5}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="You are a policy evaluator. Respond with only ALLOW or BLOCK followed by a brief reason..."
                value={prompt}
                onChange={e => mark(setPrompt)(e.target.value)}
              />
            </div>
            <Field label="Model">
              <select className="lg-select" value={model} onChange={e => mark(setModel)(e.target.value)}>
                {PROMPT_GUARD_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Action" last>
              <select className="lg-select" value={action} onChange={e => mark(setAction)(e.target.value)}>
                {PROMPT_GUARD_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </>
        )}
      </div>
      <SaveBar dirty={dirty} busy={busy} err={err} onSave={save} />
    </div>
  );
}

/* ── Endpoint detail panel ─────────────────────────── */
function EndpointDetail({ ep, onUpdate, onDelete }) {
  const [name,     setName]     = useState(ep.name);
  const [provider, setProvider] = useState(ep.provider);
  const [url,      setUrl]      = useState(ep.upstream_url);
  const [model,    setModel]    = useState(ep.default_model || '');
  const [dirty,    setDirty]    = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState('');

  useEffect(() => {
    setName(ep.name); setProvider(ep.provider);
    setUrl(ep.upstream_url); setModel(ep.default_model || '');
    setDirty(false); setErr('');
  }, [ep.id]);

  const mark = setter => val => { setter(val); setDirty(true); };

  async function save() {
    setBusy(true); setErr('');
    try {
      await onUpdate(ep.id, { name, provider, upstream_url: url, default_model: model || null });
      setDirty(false);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }
  function reset() {
    setName(ep.name); setProvider(ep.provider);
    setUrl(ep.upstream_url); setModel(ep.default_model || '');
    setDirty(false);
  }
  async function remove() {
    if (!window.confirm(`Delete "${ep.name}"? This deactivates it and revokes any keys bound to it.`)) return;
    setBusy(true); setErr('');
    try { await onDelete(ep.id); } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '24px 28px 36px' }}>
      <div className="flex items-center gap-3 mb-[6px] flex-wrap">
        <span className={`ep-dot ${statusOf(ep)}`} style={{ width: '10px', height: '10px' }} />
        <h2 className="m-0 font-semibold" style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}>
          {ep.name}
        </h2>
        <span
          className="text-[9.5px] font-bold tracking-[0.14em] uppercase px-[7px] py-[2px]"
          style={{ border: '1px solid var(--border-2)', color: ep.is_active ? 'var(--v-green)' : 'var(--text-3)' }}
        >
          {ep.is_active ? 'active' : 'paused'}
        </span>
        <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
          #{ep.id} · {formatNum(ep.stats?.requests_today ?? 0)} requests today
        </span>
      </div>

      {err && (
        <div className="text-[11.5px] px-3 py-2 mt-2" style={{ border: '1px solid var(--v-red)', color: 'var(--v-red)' }}>
          {err}
        </div>
      )}

      {/* Configuration card */}
      <div className="lg-card mt-[18px]">
        <h3 style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
          Configuration
        </h3>
        <div style={{ padding: '0 18px 4px' }}>
          <Field label="Name">
            <input className="lg-input" value={name} onChange={e => mark(setName)(e.target.value)} />
          </Field>
          <Field label="Provider">
            <select className="lg-select" value={provider} onChange={e => mark(setProvider)(e.target.value)}>
              {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Upstream URL">
            <input className="lg-input font-mono text-[12px]" value={url} onChange={e => mark(setUrl)(e.target.value)} />
          </Field>
          <Field label="Model">
            <input className="lg-input font-mono text-[12px]" value={model} onChange={e => mark(setModel)(e.target.value)} />
          </Field>
          <Field label="Proxy path" last>
            <span className="font-mono text-[12px] truncate" style={{ color: 'var(--accent)' }}>
              /v1/chat/completions/{ep.id}
            </span>
          </Field>
        </div>
        <div className="flex items-center gap-2 px-[18px] py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="lg-btn primary" disabled={!dirty || busy} onClick={save}>Save changes</button>
          <button className="lg-btn" disabled={!dirty || busy} onClick={reset}>Reset</button>
          <span className="flex-1" />
          <button className="lg-btn danger" disabled={busy} onClick={remove}>Delete endpoint</button>
        </div>
      </div>

      {/* Knowledge base card */}
      <div className="lg-card mt-[18px]">
        <h3 style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
          Knowledge Base
        </h3>
        <div style={{ padding: '0 18px 4px' }}>
          <Field label="Type"><span className="text-sm" style={{ color: 'var(--text-2)' }}>{ep.kb_type || '—'}</span></Field>
          <Field label="Collection"><span className="text-sm font-mono" style={{ color: 'var(--text-2)' }}>{ep.kb_collection || '—'}</span></Field>
          <Field label="Top K" last><span className="text-sm font-mono" style={{ color: 'var(--text-2)' }}>{ep.kb_top_k ?? 4}</span></Field>
        </div>
      </div>

      <GuardRulesCard ep={ep} onUpdate={onUpdate} />
      <PromptGuardCard ep={ep} onUpdate={onUpdate} />
    </div>
  );
}

/* ── Add endpoint modal ────────────────────────────── */
function AddModal({ onClose, onCreate }) {
  const [name, setName]   = useState('');
  const [provider, setProv] = useState('openai');
  const [url, setUrl]     = useState(PROVIDERS.openai.url);
  const [model, setModel] = useState(PROVIDERS.openai.model);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');

  function selectProvider(p) {
    setProv(p); setUrl(PROVIDERS[p].url); setModel(PROVIDERS[p].model);
  }
  const valid = name.trim() && url.trim();

  async function create() {
    if (!valid || busy) return;
    setBusy(true); setErr('');
    try {
      await onCreate({ name: name.trim(), provider, upstream_url: url.trim(), default_model: model.trim() || null });
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="lg-modal-backdrop" onClick={onClose}>
      <div className="lg-modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="m-0 font-semibold" style={{ fontSize: '15px', color: 'var(--text)' }}>Add Endpoint</h3>
            <p className="m-0 mt-0.5 text-sm" style={{ color: 'var(--text-3)' }}>
              Proxy a new LLM provider through Cerberus Proxy. You can change everything later.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-6 h-6 grid place-items-center text-[13px] transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
          >✕</button>
        </div>

        <div className="overflow-y-auto" style={{ padding: '6px 20px 16px' }}>
          {err && (
            <div className="text-[11.5px] px-3 py-2 mt-3" style={{ border: '1px solid var(--v-red)', color: 'var(--v-red)' }}>{err}</div>
          )}
          <div className="flex flex-col gap-1.5 mt-3">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Name <span style={{ color: 'var(--v-red)' }}>*</span>
            </label>
            <input className="lg-input" placeholder="e.g. Marketing Assistant" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>Provider</label>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {Object.entries(PROVIDERS).map(([k, v]) => (
                <button key={k} type="button" className={`provider-pill${provider === k ? ' on' : ''}`} onClick={() => selectProvider(k)}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>Upstream URL</label>
            <input className="lg-input font-mono text-[12px]" value={url} onChange={e => setUrl(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>Model</label>
            <input className="lg-input font-mono text-[12px]" value={model} onChange={e => setModel(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-[14px]" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="lg-btn" onClick={onClose}>Cancel</button>
          <button className="lg-btn primary" disabled={!valid || busy} onClick={create}>
            {busy ? 'Creating…' : 'Create endpoint'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────── */
export default function EndpointsPage() {
  const { endpoints, createEndpoint, updateEndpoint, deleteEndpoint } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const selected = endpoints.find(e => e.id === selectedId) ?? endpoints[0];

  async function handleCreate(body) {
    const created = await createEndpoint(body);
    if (created?.id != null) setSelectedId(created.id);
    setShowAdd(false);
  }
  async function handleDelete(id) {
    await deleteEndpoint(id);
    setSelectedId(null);
  }

  return (
    <>
      <TopBar title="Endpoints" />

      <div className="flex-1 grid min-h-0 overflow-hidden" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Left: list */}
        <div className="flex flex-col min-h-0" style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-1)' }}>
          <div className="flex items-center justify-between px-4 py-[10px] flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{endpoints.length} endpoints</span>
            <button className="lg-btn primary" onClick={() => setShowAdd(true)}>+ Add</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {endpoints.map(ep => {
              const active = ep.id === (selected?.id);
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
                  <span className={`ep-dot ${statusOf(ep)}`} />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm" style={{ color: 'var(--text)' }}>{ep.name}</div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <span className="uppercase tracking-[0.1em] font-semibold mr-1" style={{ fontSize: '9.5px' }}>
                        {PROVIDERS[ep.provider]?.label || ep.provider}
                      </span>
                      {ep.default_model ? `· ${ep.default_model}` : ''}
                    </div>
                  </div>
                  <div className="font-mono text-[10.5px] text-right">
                    <div style={{ color: 'var(--text-2)' }}>{formatNum(ep.stats?.requests_today ?? 0)}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>today</div>
                  </div>
                </button>
              );
            })}
            {endpoints.length === 0 && (
              <div className="p-6 text-sm" style={{ color: 'var(--text-3)' }}>No endpoints yet. Click “+ Add”.</div>
            )}
          </div>
        </div>

        {/* Right: detail */}
        {selected ? (
          <EndpointDetail key={selected.id} ep={selected} onUpdate={updateEndpoint} onDelete={handleDelete} />
        ) : (
          <div className="flex-1 grid place-items-center" style={{ color: 'var(--text-3)' }}>
            Select or create an endpoint.
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onCreate={handleCreate} />}
    </>
  );
}
