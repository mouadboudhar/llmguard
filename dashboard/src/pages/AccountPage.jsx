import { useState } from 'react';
import TopBar from '../components/TopBar';
import Switch from '../components/Switch';

const SESSIONS = [
  { dev: 'MacBook Pro · Chrome 124', loc: 'San Francisco, CA · 192.168.4.21', when: 'Active now', current: true  },
  { dev: 'iPhone 15 · Safari',       loc: 'San Francisco, CA · 10.0.1.55',   when: '2h ago',     current: false },
  { dev: 'Linux · Firefox',          loc: 'Berlin, DE · 88.214.7.12',         when: '3d ago',     current: false },
];

/* ── Shared card section heading ───────────────────── */
function CardH3({ children }) {
  return (
    <h3 style={{
      margin: 0, padding: '14px 18px',
      borderBottom: '1px solid var(--border)',
      fontSize: '13px', fontWeight: 600, color: 'var(--text)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {children}
    </h3>
  );
}

/* ── Profile + security + sessions column ──────────── */
function LeftColumn() {
  const [name,    setName]    = useState('Morgan Reyes');
  const [editing, setEditing] = useState(false);
  const [twofa,   setTwofa]   = useState(true);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Profile card */}
      <div className="lg-card">
        <CardH3>Profile</CardH3>
        <div className="profile-row">
          <div className="avatar">MR</div>
          <div>
            <div className="profile-name">{name}</div>
            <div className="profile-mail">morgan.reyes@acme.com</div>
            <span className="profile-role">Admin · acme-prod</span>
          </div>
        </div>

        <div className="card-body">
          <div className="acct-field">
            <span className="lbl">Full name</span>
            {editing
              ? <input className="lg-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
              : <span className="val">{name}</span>}
          </div>
          <div className="acct-field">
            <span className="lbl">Email</span>
            <span className="val">morgan.reyes@acme.com</span>
          </div>
          <div className="acct-field">
            <span className="lbl">User ID</span>
            <span className="val">usr_4f8a2c1b9e</span>
          </div>
          <div className="acct-field" style={{ borderBottom: 0 }}>
            <span className="lbl">Member since</span>
            <span className="val">Mar 14, 2025</span>
          </div>
        </div>

        <div className="btn-row" style={{ justifyContent: 'space-between' }}>
          {editing ? (
            <div className="flex gap-2">
              <button className="lg-btn primary" onClick={() => setEditing(false)}>Save changes</button>
              <button className="lg-btn"         onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button className="lg-btn" onClick={() => setEditing(true)}>Edit profile</button>
          )}
          <button className="lg-btn danger" onClick={() => alert('Signed out (demo)')}>↪ Sign out</button>
        </div>
      </div>

      {/* Security card */}
      <div className="lg-card">
        <CardH3>Security</CardH3>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Two-factor authentication</div>
            <div className="desc">Authenticator app — enrolled Apr 2025</div>
          </div>
          <Switch on={twofa} onToggle={() => setTwofa(v => !v)} />
        </div>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Password</div>
            <div className="desc">Last changed 47 days ago</div>
          </div>
          <button className="lg-btn">Change</button>
        </div>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Recovery codes</div>
            <div className="desc">8 of 10 codes remaining</div>
          </div>
          <button className="lg-btn">Regenerate</button>
        </div>
      </div>

      {/* Active sessions card */}
      <div className="lg-card">
        <CardH3>Active sessions</CardH3>
        {SESSIONS.map((s, i) => (
          <div key={i} className={`session-row${s.current ? ' current' : ''}`}>
            <div>
              <div className="dev">
                {s.dev}
                {s.current && <span className="cur-badge">CURRENT</span>}
              </div>
              <div className="meta">{s.loc}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="when">{s.when}</span>
              {!s.current && <button className="lg-btn">Revoke</button>}
            </div>
          </div>
        ))}
        <div className="btn-row">
          <button className="lg-btn danger">Sign out of all other sessions</button>
        </div>
      </div>
    </div>
  );
}

/* ── Plan + notifications column ───────────────────── */
function RightColumn() {
  const [notif, setNotif] = useState({ critical: true, weekly: true, marketing: false });

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Plan & usage */}
      <div className="lg-card">
        <CardH3>Plan &amp; usage</CardH3>
        <div style={{ padding: '14px 18px 4px' }}>
          <div className="font-semibold text-md" style={{ color: 'var(--text)' }}>Business</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-3)' }}>Renews May 14, 2026</div>
        </div>

        <div className="usage-row"><span className="label">Requests this month</span><span className="val">412k / 2M</span></div>
        <div className="usage-bar"><div className="usage-bar-fill" style={{ width: '20%' }} /></div>

        <div className="usage-row"><span className="label">Endpoints</span><span className="val">5 / 25</span></div>
        <div className="usage-bar"><div className="usage-bar-fill" style={{ width: '20%' }} /></div>

        <div className="usage-row"><span className="label">Team seats</span><span className="val">7 / 10</span></div>
        <div className="usage-bar"><div className="usage-bar-fill warn" style={{ width: '70%' }} /></div>

        <div className="btn-row">
          <button className="lg-btn primary">Manage billing</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="lg-card">
        <CardH3>Notifications</CardH3>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Critical alerts</div>
            <div className="desc">Email when any endpoint blocks a critical event</div>
          </div>
          <Switch on={notif.critical} onToggle={() => setNotif(n => ({ ...n, critical: !n.critical }))} />
        </div>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Weekly digest</div>
            <div className="desc">Mondays at 09:00 in your timezone</div>
          </div>
          <Switch on={notif.weekly} onToggle={() => setNotif(n => ({ ...n, weekly: !n.weekly }))} />
        </div>
        <div className="lg-toggle-row">
          <div className="info">
            <div className="name">Product updates</div>
            <div className="desc">New features and changelog</div>
          </div>
          <Switch on={notif.marketing} onToggle={() => setNotif(n => ({ ...n, marketing: !n.marketing }))} />
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <>
      <TopBar title="Account" />
      <div className="account-page">
        <LeftColumn />
        <RightColumn />
      </div>
    </>
  );
}
