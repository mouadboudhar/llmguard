export const ENDPOINTS = [
  { id: 'ep1', name: 'Production Chatbot',  provider: 'OpenAI',    url: 'https://api.openai.com/v1',     model: 'gpt-4o',              status: 'healthy',  reqsToday: 18420, blockedToday: 142 },
  { id: 'ep2', name: 'Support Agent',       provider: 'Anthropic', url: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet',   status: 'healthy',  reqsToday: 9214,  blockedToday: 87  },
  { id: 'ep3', name: 'Internal Knowledge',  provider: 'OpenAI',    url: 'https://api.openai.com/v1',     model: 'gpt-4o-mini',         status: 'degraded', reqsToday: 2104,  blockedToday: 12  },
  { id: 'ep4', name: 'Code Assistant',      provider: 'Anthropic', url: 'https://api.anthropic.com/v1', model: 'claude-3-5-haiku',    status: 'healthy',  reqsToday: 5482,  blockedToday: 19  },
  { id: 'ep5', name: 'Email Triage',        provider: 'OpenAI',    url: 'https://api.openai.com/v1',     model: 'gpt-4o-mini',         status: 'paused',   reqsToday: 0,     blockedToday: 0   },
];

export const API_KEYS = [
  { id: 'k1', name: 'production-app-prod',    prefix: 'lg_prod_••••a92f', lastUsed: '2 min ago',  created: '14 days ago', endpoint: 'Production Chatbot',  endpointColor: '#22c55e', status: 'active',  preview: 'llmg_a7f3k9x2' },
  { id: 'k2', name: 'support-agent-prod',     prefix: 'lg_prod_••••71c4', lastUsed: '14 min ago', created: '32 days ago', endpoint: 'Support Agent',       endpointColor: '#3b82f6', status: 'active',  preview: 'llmg_b2e8m4q7' },
  { id: 'k3', name: 'knowledge-internal-stg', prefix: 'lg_stag_••••03e2', lastUsed: '3h ago',     created: '8 days ago',  endpoint: 'Internal Knowledge',  endpointColor: '#eab308', status: 'active',  preview: 'llmg_c5d1n8w3' },
  { id: 'k4', name: 'code-assistant-prod',    prefix: 'lg_prod_••••8d10', lastUsed: '6h ago',     created: '94 days ago', endpoint: 'Code Assistant',      endpointColor: '#a855f7', status: 'revoked', preview: 'llmg_x9p2v4r6' },
  { id: 'k5', name: 'email-triage-dev',       prefix: 'lg_dev_••••44ba',  lastUsed: '2d ago',     created: '21 days ago', endpoint: 'Email Triage',        endpointColor: '#6b7280', status: 'active',  preview: 'llmg_d8r2s6t4' },
  { id: 'k6', name: 'ci-test-runner',         prefix: 'lg_dev_••••e7f1',  lastUsed: '5d ago',     created: '60 days ago', endpoint: '—',                   endpointColor: '#6b7280', status: 'active',  preview: 'llmg_e1f7g3h9' },
];

export const SPARKLINE = [
  0.32, 0.28, 0.30, 0.26, 0.22, 0.20, 0.24, 0.31, 0.42, 0.55,
  0.68, 0.74, 0.82, 0.78, 0.86, 0.91, 0.88, 0.84, 0.79, 0.71,
  0.62, 0.54, 0.46, 0.41,
];

export const EVENTS_SEED = [
  { id: 1,  ts: '14:02:11.094', sev: 'critical', type: 'prompt_injection', endpoint: 'Production Chatbot', detail: 'Detected jailbreak attempt — input rejected (classifier v3.1, score 0.97)' },
  { id: 2,  ts: '14:02:09.812', sev: 'high',     type: 'pii_leak',         endpoint: 'Production Chatbot', detail: 'Output filter redacted credit card number from response (PAN_DETECTED)' },
  { id: 3,  ts: '14:01:58.330', sev: 'medium',   type: 'rate_limit',       endpoint: 'Support Agent',      detail: 'Key support-agent-prod approached 80% of 60k/min quota' },
  { id: 4,  ts: '14:01:54.611', sev: 'low',      type: 'auth.success',     endpoint: 'Internal Knowledge', detail: 'Operator session refreshed for uid=ops-714' },
  { id: 5,  ts: '14:01:42.218', sev: 'high',     type: 'authz_denied',     endpoint: 'Internal Knowledge', detail: 'Retrieval blocked — document doc_8842 outside caller ACL (hr-confidential)' },
  { id: 6,  ts: '14:01:21.005', sev: 'info',     type: 'config.change',    endpoint: '—',                  detail: 'Guard policy hr_strict applied to Internal Knowledge endpoint' },
  { id: 7,  ts: '14:01:08.992', sev: 'medium',   type: 'output_filter',    endpoint: 'Code Assistant',     detail: 'Secret detector matched private_key pattern — content stripped' },
  { id: 8,  ts: '14:00:51.450', sev: 'low',      type: 'request.ok',       endpoint: 'Production Chatbot', detail: '142 requests passed all guards in last 30s' },
  { id: 9,  ts: '14:00:34.118', sev: 'critical', type: 'tool_policy',      endpoint: 'Code Assistant',     detail: 'Agent attempted shell.exec(rm -rf) — DENIED by allowlist' },
  { id: 10, ts: '14:00:14.701', sev: 'medium',   type: 'rag.access',       endpoint: 'Internal Knowledge', detail: 'Confidential document doc_4471 served to caller within ACL' },
  { id: 11, ts: '13:59:58.220', sev: 'info',     type: 'health.check',     endpoint: '—',                  detail: 'All endpoints reporting healthy · policy-engine v3.1' },
];

export const STREAM_TEMPLATES = [
  { sev: 'low',      type: 'request.ok',       detailFn: () => `${30 + Math.floor(Math.random() * 200)} requests passed all guards in last 30s` },
  { sev: 'medium',   type: 'output_filter',    detailFn: () => `Secret detector matched ${['api_key','password','token','private_key'][Math.floor(Math.random()*4)]} pattern — content stripped` },
  { sev: 'high',     type: 'pii_leak',         detailFn: () => `Output filter redacted ${['SSN','credit card','phone','email'][Math.floor(Math.random()*4)]} from response` },
  { sev: 'critical', type: 'prompt_injection', detailFn: () => `Detected jailbreak attempt — input rejected (score ${(0.85 + Math.random() * 0.14).toFixed(2)})` },
  { sev: 'high',     type: 'authz_denied',     detailFn: () => `Retrieval blocked — document doc_${1000 + Math.floor(Math.random() * 9000)} outside caller ACL` },
  { sev: 'info',     type: 'health.check',     detailFn: () => `Heartbeat OK · policy-engine v3.1` },
  { sev: 'low',      type: 'auth.success',     detailFn: () => `Token refreshed for key lg_prod_••••${Math.random().toString(36).slice(2, 6)}` },
];

export const GUARD_ACTIVITY = {
  input: {
    passed:  [82, 91, 88, 76, 95, 102, 88, 71, 64, 79, 93, 110, 124, 119, 108, 96, 88, 102, 117, 128, 134, 141, 128, 119],
    blocked: [3, 2, 4, 1, 5, 6, 4, 2, 3, 5, 7, 9, 11, 8, 6, 4, 7, 9, 12, 14, 11, 8, 6, 5],
  },
  output: {
    passed:  [78, 88, 84, 72, 91, 99, 84, 68, 60, 76, 89, 106, 120, 116, 104, 93, 84, 98, 113, 124, 130, 137, 124, 116],
    blocked: [1, 0, 2, 0, 3, 4, 2, 1, 1, 2, 3, 5, 4, 6, 3, 2, 4, 5, 7, 9, 6, 4, 3, 2],
  },
  authz: {
    passed:  [42, 48, 45, 39, 51, 56, 47, 38, 33, 41, 49, 60, 68, 65, 58, 52, 47, 55, 64, 71, 75, 79, 71, 65],
    blocked: [0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 2, 1, 1, 0],
  },
};

export const AUDIT_ROWS = [
  { id: 1,  ts: '14:32:01', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'prompt_injection', sev: 'critical', detail: 'Jailbreak attempt blocked at input · classifier v3.1 score 0.97',               latency: 24  },
  { id: 2,  ts: '14:31:58', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'request.ok',       sev: 'info',     detail: 'Response delivered to caller · 1,124 tokens',                                    latency: 312 },
  { id: 3,  ts: '14:31:54', endpoint: 'Code Assistant',     endpointColor: '#a855f7', type: 'tool_policy',      sev: 'critical', detail: 'Agent attempted shell.exec(rm -rf /var/log/*) — DENIED by allowlist',            latency: 18  },
  { id: 4,  ts: '14:31:42', endpoint: 'Internal Knowledge', endpointColor: '#eab308', type: 'authz_denied',     sev: 'high',     detail: 'Retrieval blocked — doc_8842 outside caller ACL (hr-confidential)',              latency: 31  },
  { id: 5,  ts: '14:31:38', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'pii_leak',         sev: 'high',     detail: 'Output filter redacted credit-card PAN from response',                           latency: 287 },
  { id: 6,  ts: '14:31:30', endpoint: 'Support Agent',      endpointColor: '#3b82f6', type: 'request.ok',       sev: 'info',     detail: 'Response delivered to caller · 412 tokens',                                      latency: 198 },
  { id: 7,  ts: '14:31:22', endpoint: 'Code Assistant',     endpointColor: '#a855f7', type: 'output_filter',    sev: 'medium',   detail: 'Secret detector matched private_key — content stripped',                         latency: 244 },
  { id: 8,  ts: '14:31:18', endpoint: 'Internal Knowledge', endpointColor: '#eab308', type: 'request.ok',       sev: 'info',     detail: 'RAG response delivered · 3 documents cited',                                     latency: 412 },
  { id: 9,  ts: '14:31:11', endpoint: 'Support Agent',      endpointColor: '#3b82f6', type: 'rate_limit',       sev: 'medium',   detail: 'Key support-agent-prod throttled — 60k/min quota reached',                      latency: 4   },
  { id: 10, ts: '14:31:04', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'request.ok',       sev: 'info',     detail: 'Response delivered to caller · 822 tokens',                                      latency: 271 },
  { id: 11, ts: '14:30:58', endpoint: 'Internal Knowledge', endpointColor: '#eab308', type: 'output_filter',    sev: 'medium',   detail: 'Output filter redacted email address from response',                             latency: 304 },
  { id: 12, ts: '14:30:51', endpoint: 'Code Assistant',     endpointColor: '#a855f7', type: 'request.ok',       sev: 'low',      detail: 'Code completion delivered · 218 tokens',                                         latency: 142 },
  { id: 13, ts: '14:30:42', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'request.ok',       sev: 'info',     detail: 'Response delivered to caller · 1,801 tokens',                                    latency: 488 },
  { id: 14, ts: '14:30:34', endpoint: 'Support Agent',      endpointColor: '#3b82f6', type: 'auth.success',     sev: 'low',      detail: 'Token refreshed for key support-agent-prod',                                     latency: 12  },
  { id: 15, ts: '14:30:27', endpoint: 'Production Chatbot', endpointColor: '#22c55e', type: 'request.ok',       sev: 'info',     detail: 'Response delivered to caller · 644 tokens',                                      latency: 218 },
];

export function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
