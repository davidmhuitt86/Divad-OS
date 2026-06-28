import { useState, useEffect } from 'react'
import { Save, RotateCcw, Shield, Database, Cpu, Globe, Ruler, Bell, Layout, Bot, HardDrive, Info, Puzzle, User, Palette, CheckCircle, Github, Loader2, Link2, Trash2, Plus } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { useStore, isSyncCurrent } from '../store'

const SECTION_ICONS: Record<string, React.ReactNode> = {
  profile:     <User size={18} color="#3b82f6" />,
  appearance:  <Palette size={18} color="#a855f7" />,
  dashboard:   <Layout size={18} color="#22c55e" />,
  notifications:<Bell size={18} color="#f59e0b" />,
  language:    <Globe size={18} color="#06b6d4" />,
  units:       <Ruler size={18} color="#f97316" />,
  datasync:    <Database size={18} color="#22c55e" />,
  security:    <Shield size={18} color="#ef4444" />,
  integrations:<Puzzle size={18} color="#a855f7" />,
  workspace:   <Layout size={18} color="#3b82f6" />,
  ai:          <Bot size={18} color="#06b6d4" />,
  backup:      <HardDrive size={18} color="#22c55e" />,
  about:       <Info size={18} color="#475569" />,
}

export default function Settings() {
  const { settings, update, save, reset, dirty, lastSaved } = useSettings()
  const { setActivePage } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => setExpanded(prev => prev === key ? null : key)

  const handleSave = () => {
    save()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#0d0f14' }}>
      {/* Left sidebar */}
      <div style={{ width: 196, borderRight: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', padding: '14px 0', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '0 14px 8px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Access</div>
        {['My Tasks','My Documents','My Objects','My APs','Team Activity'].map(l => (
          <button key={l} onClick={() => setActivePage('workspace')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', width: '100%', textAlign: 'left' }}>{l}</button>
        ))}

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <div style={{ padding: '0 14px 8px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</div>
        <div style={{ padding: '4px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>All Systems Operational</span>
          </div>
          <div style={{ fontSize: 9, color: '#475569' }}>
            Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ padding: '10px 14px 0' }}>
          <button onClick={() => setExpanded('about')} style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid #1a1e28', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#3b82f6' }}>View System Health</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Settings</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Customize your experience. Control how Divad OS works for you.</p>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Settings Sections</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* 1 — Profile & Account */}
          <SettingRow
            id="profile" icon={SECTION_ICONS.profile} title="Profile & Account"
            desc="Manage your personal information, profile, and account preferences."
            expanded={expanded === 'profile'} onToggle={() => toggle('profile')}
            action={<Btn label="Edit Profile" onClick={() => toggle('profile')} />}>
            <Grid>
              <Field label="Display Name">
                <Input value={settings.displayName} onChange={v => update({ displayName: v })} />
              </Field>
              <Field label="Email">
                <Input value={settings.email} onChange={v => update({ email: v })} type="email" />
              </Field>
              <Field label="Title / Role">
                <Input value={settings.title} onChange={v => update({ title: v })} />
              </Field>
              <Field label="Account Type">
                <Input value="Chief Engineer" disabled />
              </Field>
            </Grid>
          </SettingRow>

          {/* 2 — Appearance */}
          <SettingRow
            id="appearance" icon={SECTION_ICONS.appearance} title="Appearance"
            desc="Customize the look and feel of Divad OS interface."
            expanded={expanded === 'appearance'} onToggle={() => toggle('appearance')}
            action={
              <select value={settings.theme} onChange={e => update({ theme: e.target.value as any })}
                style={selectStyle}>
                <option value="dark">Dark (Default)</option>
                <option value="light">Light (Coming Soon)</option>
              </select>
            }>
            <Grid>
              <Field label="Theme">
                <select value={settings.theme} onChange={e => update({ theme: e.target.value as any })} style={selectStyle}>
                  <option value="dark">Dark</option>
                  <option value="light">Light (Coming Soon)</option>
                </select>
              </Field>
              <Field label="Accent Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={settings.accentColor} onChange={e => update({ accentColor: e.target.value })}
                    style={{ width: 36, height: 30, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                  <Input value={settings.accentColor} onChange={v => update({ accentColor: v })} style={{ flex: 1 }} />
                </div>
              </Field>
              <Field label="Font Size / Density">
                <select value={settings.fontSize} onChange={e => update({ fontSize: e.target.value as any })} style={selectStyle}>
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="large">Large</option>
                </select>
              </Field>
              <Field label="UI Animations">
                <Toggle checked={settings.animations} onChange={v => update({ animations: v })} label={settings.animations ? 'Enabled' : 'Disabled'} />
              </Field>
            </Grid>
          </SettingRow>

          {/* 3 — Dashboard */}
          <SettingRow
            id="dashboard" icon={SECTION_ICONS.dashboard} title="Dashboard"
            desc="Choose what appears on your dashboard and in what order."
            expanded={expanded === 'dashboard'} onToggle={() => toggle('dashboard')}
            action={<Btn label="Customize" onClick={() => toggle('dashboard')} />}>
            <Grid>
              <Field label="Default Landing Page">
                <select value={settings.defaultLandingPage} onChange={e => update({ defaultLandingPage: e.target.value })} style={selectStyle}>
                  {['home','operations','architecture','repository','knowledge','objects','workspace','reports','calendar'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </Grid>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#1a1e28', borderRadius: 6, fontSize: 10, color: '#475569', fontStyle: 'italic' }}>
              Dashboard widget reordering coming in a future update.
            </div>
          </SettingRow>

          {/* 4 — Notifications */}
          <SettingRow
            id="notifications" icon={SECTION_ICONS.notifications} title="Notifications"
            desc="Control how and when you receive alerts and updates."
            expanded={expanded === 'notifications'} onToggle={() => toggle('notifications')}
            action={<Btn label="Configure" onClick={() => toggle('notifications')} />}>
            <Grid>
              <Field label="In-App Notifications">
                <Toggle checked={settings.notifyInApp} onChange={v => update({ notifyInApp: v })} label={settings.notifyInApp ? 'On' : 'Off'} />
              </Field>
              <Field label="Email Notifications">
                <Toggle checked={settings.notifyEmail} onChange={v => update({ notifyEmail: v })} label={settings.notifyEmail ? 'On' : 'Off'} />
              </Field>
              <Field label="Push Notifications">
                <Toggle checked={settings.notifyPush} onChange={v => update({ notifyPush: v })} label={settings.notifyPush ? 'On' : 'Off'} />
              </Field>
              <Field label="Quiet Hours From">
                <Input type="time" value={settings.quietHoursFrom} onChange={v => update({ quietHoursFrom: v })} />
              </Field>
              <Field label="Quiet Hours To">
                <Input type="time" value={settings.quietHoursTo} onChange={v => update({ quietHoursTo: v })} />
              </Field>
            </Grid>
          </SettingRow>

          {/* 5 — Language & Region */}
          <SettingRow
            id="language" icon={SECTION_ICONS.language} title="Language & Region"
            desc="Set your preferred language, date, time, and regional formats."
            expanded={expanded === 'language'} onToggle={() => toggle('language')}
            action={
              <select value={settings.language} onChange={e => update({ language: e.target.value })} style={selectStyle}>
                <option>English (US)</option>
                <option>English (UK)</option>
              </select>
            }>
            <Grid>
              <Field label="Language">
                <select value={settings.language} onChange={e => update({ language: e.target.value })} style={selectStyle}>
                  <option>English (US)</option>
                  <option>English (UK)</option>
                </select>
              </Field>
              <Field label="Date Format">
                <select value={settings.dateFormat} onChange={e => update({ dateFormat: e.target.value })} style={selectStyle}>
                  {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Time Format">
                <select value={settings.timeFormat} onChange={e => update({ timeFormat: e.target.value as any })} style={selectStyle}>
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
              </Field>
              <Field label="First Day of Week">
                <select value={settings.firstDayOfWeek} onChange={e => update({ firstDayOfWeek: e.target.value as any })} style={selectStyle}>
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </Field>
              <Field label="Number Format">
                <select value={settings.numberFormat} onChange={e => update({ numberFormat: e.target.value })} style={selectStyle}>
                  <option value="US (1,234.56)">US (1,234.56)</option>
                  <option value="EU (1.234,56)">EU (1.234,56)</option>
                </select>
              </Field>
            </Grid>
          </SettingRow>

          {/* 6 — Units & Measurement */}
          <SettingRow
            id="units" icon={SECTION_ICONS.units} title="Units & Measurement"
            desc="Define default units for engineering calculations and data display."
            expanded={expanded === 'units'} onToggle={() => toggle('units')}
            action={
              <select value={settings.units} onChange={e => update({ units: e.target.value as any })} style={selectStyle}>
                <option value="metric">Metric (SI)</option>
                <option value="imperial">Imperial (US)</option>
              </select>
            }>
            <Grid>
              <Field label="Unit System">
                <select value={settings.units} onChange={e => update({ units: e.target.value as any })} style={selectStyle}>
                  <option value="metric">Metric (SI)</option>
                  <option value="imperial">Imperial (US)</option>
                </select>
              </Field>
            </Grid>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#1a1e28', borderRadius: 6, fontSize: 10, color: '#475569' }}>
              {settings.units === 'metric'
                ? 'Using SI: meters, kilograms, Celsius, Newtons, Joules, Pascals'
                : 'Using Imperial: feet, pounds, Fahrenheit, lbf, BTU, PSI'}
            </div>
          </SettingRow>

          {/* 7 — Data & Sync */}
          <SettingRow
            id="datasync" icon={SECTION_ICONS.datasync} title="Data & Sync"
            desc="Manage data synchronization, offline access, and local storage."
            expanded={expanded === 'datasync'} onToggle={() => toggle('datasync')}
            action={<Btn label="Manage" onClick={() => toggle('datasync')} />}>
            <Grid>
              <Field label="Offline Mode">
                <Toggle checked={settings.offlineMode} onChange={v => update({ offlineMode: v })} label={settings.offlineMode ? 'Enabled' : 'Disabled'} />
              </Field>
              <Field label="Auto-Sync">
                <Toggle checked={settings.autoSync} onChange={v => update({ autoSync: v })} label={settings.autoSync ? 'On' : 'Off'} />
              </Field>
              <Field label="Sync Frequency">
                <select value={settings.syncFrequency} onChange={e => update({ syncFrequency: e.target.value })} style={selectStyle} disabled={!settings.autoSync}>
                  {['1min','5min','15min','30min','1hour'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
            </Grid>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#1a1e28', borderRadius: 6, fontSize: 10, color: '#475569' }}>
              Database: <span style={{ color: '#22c55e' }}>Connected</span> · Local cache: enabled · Storage: Electron AppData
            </div>
          </SettingRow>

          {/* 8 — Security */}
          <SettingRow
            id="security" icon={SECTION_ICONS.security} title="Security"
            desc="Manage password, two-factor auth, sessions, and security policies."
            expanded={expanded === 'security'} onToggle={() => toggle('security')}
            action={<Btn label="Configure" onClick={() => toggle('security')} />}>
            <Grid>
              <Field label="Two-Factor Authentication">
                <Toggle checked={settings.twoFactorAuth} onChange={v => update({ twoFactorAuth: v })} label={settings.twoFactorAuth ? 'Enabled' : 'Disabled'} />
              </Field>
              <Field label="Session Timeout">
                <select value={settings.sessionTimeout} onChange={e => update({ sessionTimeout: e.target.value })} style={selectStyle}>
                  {['15min','30min','1hour','4hours','never'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </Grid>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#1a1e28', borderRadius: 6, fontSize: 10, color: '#475569' }}>
              Active sessions: 1 (this device) · Last login: {new Date().toLocaleDateString()}
            </div>
          </SettingRow>

          {/* 9 — Integrations */}
          <SettingRow
            id="integrations" icon={SECTION_ICONS.integrations} title="Integrations"
            desc="Connect Divad OS with external tools, APIs, and third-party services."
            expanded={expanded === 'integrations'} onToggle={() => toggle('integrations')}
            action={<Btn label="Manage" onClick={() => toggle('integrations')} />}>
            <IntegrationsPanel />
          </SettingRow>

          {/* 10 — Workspace Defaults */}
          <SettingRow
            id="workspace" icon={SECTION_ICONS.workspace} title="Workspace Defaults"
            desc="Set default views, filters, and behaviors for your workspace."
            expanded={expanded === 'workspace'} onToggle={() => toggle('workspace')}
            action={<Btn label="Configure" onClick={() => toggle('workspace')} />}>
            <Grid>
              <Field label="Default Objects View">
                <select value={settings.defaultObjectView} onChange={e => update({ defaultObjectView: e.target.value as any })} style={selectStyle}>
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                </select>
              </Field>
              <Field label="Default Repository View">
                <select value={settings.defaultRepoView} onChange={e => update({ defaultRepoView: e.target.value as any })} style={selectStyle}>
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                </select>
              </Field>
              <Field label="Default Knowledge View">
                <select value={settings.defaultKnowledgeView} onChange={e => update({ defaultKnowledgeView: e.target.value as any })} style={selectStyle}>
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                </select>
              </Field>
            </Grid>
          </SettingRow>

          {/* 11 — AI Assistant */}
          <SettingRow
            id="ai" icon={SECTION_ICONS.ai} title="AI Assistant"
            desc="Configure AI behavior, suggestions, and response preferences."
            expanded={expanded === 'ai'} onToggle={() => toggle('ai')}
            action={<Btn label="Configure" onClick={() => toggle('ai')} />}>
            <Grid>
              <Field label="Response Style">
                <select value={settings.aiStyle} onChange={e => update({ aiStyle: e.target.value as any })} style={selectStyle}>
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </Field>
              <Field label="Detail Level">
                <select value={settings.aiDetailLevel} onChange={e => update({ aiDetailLevel: e.target.value as any })} style={selectStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="AI Suggestions">
                <Toggle checked={settings.aiSuggestions} onChange={v => update({ aiSuggestions: v })} label={settings.aiSuggestions ? 'Enabled' : 'Disabled'} />
              </Field>
            </Grid>
          </SettingRow>

          {/* 12 — Backup & Restore */}
          <SettingRow
            id="backup" icon={SECTION_ICONS.backup} title="Backup & Restore"
            desc="Backup your data or restore from previous exports."
            expanded={expanded === 'backup'} onToggle={() => toggle('backup')}
            action={<Btn label="Backup Now" primary onClick={async () => {
              try { await (window as any).divadOS?.backupDatabase?.() } catch {}
            }} />}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '4px 0' }}>
              <button onClick={async () => {
                try { await (window as any).divadOS?.backupDatabase?.() } catch {}
              }} style={btnStyle('#22c55e')}>Backup Now</button>
              <button style={btnStyle('#3b82f6')}>Restore from File</button>
              <button style={btnStyle('#475569')}>Export All Data</button>
              <button style={btnStyle('#f59e0b')}>Import Data</button>
            </div>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#1a1e28', borderRadius: 6, fontSize: 10, color: '#475569' }}>
              Database location: <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>AppData/Roaming/divad-os/divad-os.db</span>
            </div>
          </SettingRow>

          {/* 13 — System & About */}
          <SettingRow
            id="about" icon={SECTION_ICONS.about} title="System & About"
            desc="View system information, version history, and terms."
            expanded={expanded === 'about'} onToggle={() => toggle('about')}
            action={<Btn label="View Details" onClick={() => toggle('about')} />}
            noBorder>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Application',  'Divad OS'],
                ['Version',      '1.0.0'],
                ['Build',        'Electron + Vite + React'],
                ['Database',     'sql.js (SQLite WASM)'],
                ['AI Engine',    'OpenAI Assistants API'],
                ['Platform',     'Windows 11'],
                ['Node Version', (typeof process !== 'undefined' ? process?.versions?.node : undefined) ?? '—'],
                ['Chrome',       (typeof process !== 'undefined' ? process?.versions?.chrome : undefined) ?? '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: k === 'Version' || k === 'Build' || k === 'Node Version' ? 'monospace' : undefined }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={btnStyle('#475569')}>View Release Notes</button>
              <button style={btnStyle('#475569')}>License Agreement</button>
              <button style={btnStyle('#475569')}>Terms of Service</button>
              <button style={btnStyle('#ef4444')}>Run Diagnostics</button>
            </div>
          </SettingRow>
        </div>

        {/* Additional highlights */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Additional Settings Highlights</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'View and customize keyboard shortcuts to work faster.', action: () => toggle('workspace') },
              { icon: '↕️', title: 'Import / Export Settings', desc: 'Export your settings to reuse on other devices or team members.', action: () => toggle('datasync') },
              { icon: '↺',  title: 'Reset Preferences', desc: 'Reset all settings to default without deleting your data.', action: () => { if (confirm('Reset all settings to defaults?')) reset() } },
              { icon: '💬', title: 'Feedback & Support', desc: 'Send feedback, report issues, or request new features.', action: () => toggle('about') },
            ].map(c => (
              <div key={c.title} onClick={c.action} style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '12px 14px', cursor: c.action ? 'pointer' : 'default' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3b82f644'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1a1e28'}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings status */}
        <div style={{ marginTop: 16, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#22c55e" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{dirty ? 'Unsaved changes' : 'All preferences saved'}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>
                Last saved: {lastSaved ? lastSaved.toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
              <RotateCcw size={12} /> Reset to Defaults
            </button>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 20px', background: dirty ? '#3b82f6' : '#22c55e', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              <Save size={12} /> {saved ? 'Saved!' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SettingRow({ id, icon, title, desc, expanded, onToggle, action, children, noBorder }: {
  id: string; icon: React.ReactNode; title: string; desc: string;
  expanded: boolean; onToggle: () => void; action?: React.ReactNode;
  children?: React.ReactNode; noBorder?: boolean
}) {
  return (
    <div style={{ borderBottom: noBorder ? 'none' : '1px solid #1a1e28' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#13161e', border: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{desc}</div>
        </div>
        <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
          {action}
        </div>
      </div>
      {expanded && children && (
        <div style={{ paddingBottom: 16, paddingLeft: 48 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', disabled, style: extraStyle }: {
  value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean; style?: React.CSSProperties
}) {
  return (
    <input type={type} value={value} disabled={disabled}
      onChange={e => onChange?.(e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: disabled ? '#0d0f14' : '#1a1e28', border: '1px solid #222736', borderRadius: 5, color: disabled ? '#475569' : '#e2e8f0', fontSize: 11, outline: 'none', ...extraStyle }} />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div onClick={() => onChange(!checked)}
        style={{ width: 36, height: 20, borderRadius: 10, background: checked ? '#3b82f6' : '#1a1e28', border: '1px solid ' + (checked ? '#3b82f6' : '#222736'), position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </div>
      <span style={{ fontSize: 11, color: checked ? '#e2e8f0' : '#475569' }}>{label}</span>
    </div>
  )
}

function Btn({ label, onClick, primary }: { label: string; onClick?: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick}
      style={{ padding: '6px 14px', background: primary ? '#3b82f6' : '#1a1e28', border: '1px solid ' + (primary ? '#3b82f6' : '#222736'), borderRadius: 5, cursor: 'pointer', fontSize: 11, color: primary ? '#fff' : '#94a3b8', fontWeight: primary ? 600 : 400, whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#1a1e28', border: '1px solid #222736', borderRadius: 5,
  color: '#e2e8f0', fontSize: 11, padding: '6px 10px', cursor: 'pointer', outline: 'none',
}

function btnStyle(color: string): React.CSSProperties {
  return { padding: '6px 14px', background: color + '22', border: `1px solid ${color}44`, borderRadius: 5, cursor: 'pointer', fontSize: 11, color, fontWeight: 600 }
}

// ─── Integrations Panel ───────────────────────────────────────────────────────
interface RepoEntry { url: string; branch: string; label: string }

function IntegrationsPanel() {
  const { githubConfig, loadGitHubConfig, saveGitHubConfig, lastSyncAt, isOffline } = useStore()

  const [repos, setRepos] = useState<RepoEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('divad-os-github-repos') ?? '[]') } catch { return [] }
  })
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ url: '', branch: 'main', label: '' })
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  const syncOk = isSyncCurrent(lastSyncAt)
  const connected = !!(githubConfig?.url)
  const repoLabel = githubConfig?.url?.replace('https://github.com/', '') ?? githubConfig?.url ?? ''

  useEffect(() => { loadGitHubConfig() }, [])

  const persistRepos = (next: RepoEntry[]) => {
    setRepos(next); localStorage.setItem('divad-os-github-repos', JSON.stringify(next))
  }

  const resetForm = () => { setForm({ url: '', branch: 'main', label: '' }); setTestResult(null); setSaveStatus(null) }

  const openAdd = () => { resetForm(); setEditIdx(null); setShowAdd(true) }

  const openEdit = (idx: number) => {
    const r = repos[idx]
    setForm({ url: r.url, branch: r.branch, label: r.label })
    setTestResult(null); setSaveStatus(null)
    setEditIdx(idx); setShowAdd(true)
  }

  const testConn = async () => {
    if (!form.url.trim() || !window.divadOS?.github) return
    setTesting(true); setTestResult(null)
    try {
      const r = await window.divadOS.github.connectTest({ url: form.url.trim(), branch: form.branch || 'main' })
      setTestResult(r)
    } catch (e) {
      setTestResult({ ok: false, error: String(e) })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!form.url.trim()) { setSaveStatus({ ok: false, msg: 'Enter a repository URL.' }); return }
    setSaving(true); setSaveStatus({ ok: true, msg: 'Testing connection...' })
    try {
      const r = await window.divadOS.github.connectTest({ url: form.url.trim(), branch: form.branch || 'main' })
      if (!r.ok) { setSaveStatus({ ok: false, msg: `Cannot reach repository: ${r.error}` }); setSaving(false); return }
      const entry: RepoEntry = { url: form.url.trim(), branch: form.branch || 'main', label: form.label || form.url.trim().replace('https://github.com/', '') }
      if (editIdx !== null) {
        const next = [...repos]; next[editIdx] = entry; persistRepos(next)
      } else {
        persistRepos([...repos, entry])
      }
      if (repos.length === 0 || editIdx === null) {
        await saveGitHubConfig({ url: entry.url, branch: entry.branch })
      }
      setSaveStatus({ ok: true, msg: `✓ Saved — ${entry.label}` })
      setShowAdd(false); resetForm()
    } catch (e) {
      setSaveStatus({ ok: false, msg: `Error: ${String(e)}` })
    } finally {
      setSaving(false)
    }
  }

  const setActive = async (r: RepoEntry) => {
    await saveGitHubConfig({ url: r.url, branch: r.branch })
  }

  const disconnect = async () => {
    await saveGitHubConfig({ url: '', branch: 'main' })
    await loadGitHubConfig()
  }

  const removeRepo = (idx: number) => {
    persistRepos(repos.filter((_, i) => i !== idx))
  }

  const isActive = (r: RepoEntry) => githubConfig?.url === r.url

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>

      {/* Primary connection status */}
      <div style={{ padding: '14px 16px', background: '#0d0f14', border: `1px solid ${connected ? (isOffline ? '#f97316' : '#22c55e') : '#1a1e28'}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Github size={18} color={connected ? (isOffline ? '#f97316' : '#22c55e') : '#475569'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{connected ? repoLabel : 'No Repository Connected'}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
              {connected
                ? isOffline ? '⚠️ Offline — read-only mode' : syncOk ? `✓ In sync · Branch: ${githubConfig!.branch}` : `⚠️ Sync overdue · Branch: ${githubConfig!.branch}`
                : 'Uses Git Credential Manager — no PAT needed'}
            </div>
          </div>
          {connected && (
            <button onClick={disconnect}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#ef444411', border: '1px solid #ef444433', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#fca5a5' }}>
              <Trash2 size={11} /> Disconnect
            </button>
          )}
        </div>
        {connected && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              ['Last Sync', lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never', syncOk ? '#22c55e' : '#f59e0b'],
              ['Status',    syncOk ? 'Current' : 'Stale', syncOk ? '#22c55e' : '#f59e0b'],
              ['Mode',      isOffline ? 'Offline' : 'Online', isOffline ? '#f97316' : '#22c55e'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ padding: '7px 10px', background: (color as string) + '11', border: `1px solid ${color}33`, borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: color as string, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved repositories */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Repositories</div>
          <button onClick={openAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#94a3b8' }}>
            <Plus size={10} /> Add Repository
          </button>
        </div>
        {repos.length === 0 && !showAdd && (
          <div style={{ padding: '14px', background: '#0d0f14', border: '1px dashed #1a1e28', borderRadius: 8, textAlign: 'center', fontSize: 11, color: '#2a3042' }}>
            No repositories saved. Click "Add Repository" to connect one.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {repos.map((r, i) => {
            const active = isActive(r)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: active ? 'rgba(59,130,246,0.07)' : '#0d0f14', border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : '#1a1e28'}`, borderRadius: 8 }}>
                <Github size={14} color={active ? '#3b82f6' : '#475569'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{r.label || r.url.replace('https://github.com/', '')}</div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{r.url} · {r.branch}{active ? ' · Active' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!active && <button onClick={() => setActive(r)} style={{ padding: '4px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#94a3b8' }}>Set Active</button>}
                  <button onClick={() => openEdit(i)} style={{ padding: '4px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#94a3b8' }}>Edit</button>
                  <button onClick={() => removeRepo(i)} style={{ padding: '4px 8px', background: '#ef444411', border: '1px solid #ef444433', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#fca5a5', display: 'flex', alignItems: 'center' }}><Trash2 size={10} /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add / edit form */}
      {showAdd && (
        <div style={{ padding: '16px', background: '#0d0f14', border: '1px solid #3b82f633', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{editIdx !== null ? 'Edit Repository' : 'Add Repository'}</div>
          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.6 }}>Uses your system Git Credential Manager — no PAT required.</div>

          <IField label="Repository URL">
            <IInput value={form.url} onChange={v => { setForm(f => ({ ...f, url: v })); setTestResult(null) }} placeholder="https://github.com/davidmhuitt86/Divad-OS" />
          </IField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <IField label="Branch">
              <IInput value={form.branch} onChange={v => setForm(f => ({ ...f, branch: v }))} placeholder="main" />
            </IField>
            <IField label="Label (optional)">
              <IInput value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} placeholder="e.g. Main Repo" />
            </IField>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={testConn} disabled={!form.url.trim() || testing || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: (!form.url.trim() || testing || saving) ? 'not-allowed' : 'pointer', fontSize: 11, color: '#94a3b8', opacity: !form.url.trim() ? 0.4 : 1 }}>
              {testing ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={11} />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            {testResult && !testing && (
              <span style={{ fontSize: 10, color: testResult.ok ? '#22c55e' : '#fca5a5', flex: 1 }}>
                {testResult.ok ? '✓ Reachable' : `✗ ${testResult.error}`}
              </span>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={() => { setShowAdd(false); resetForm() }}
              style={{ padding: '6px 14px', background: 'none', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#475569' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!form.url.trim() || saving || testing}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: (!form.url.trim() || saving || testing) ? 'not-allowed' : 'pointer', fontSize: 11, color: '#fff', fontWeight: 600, opacity: !form.url.trim() ? 0.4 : 1 }}>
              {saving ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={11} />}
              {saving ? 'Saving...' : editIdx !== null ? 'Update' : 'Save & Add'}
            </button>
          </div>
          {saveStatus && (
            <div style={{ padding: '8px 12px', background: saveStatus.ok ? '#22c55e11' : '#ef444411', border: `1px solid ${saveStatus.ok ? '#22c55e33' : '#ef444433'}`, borderRadius: 6, fontSize: 11, color: saveStatus.ok ? '#22c55e' : '#fca5a5' }}>
              {saveStatus.msg}
            </div>
          )}
        </div>
      )}

      {/* Other integrations stubs */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Other Integrations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[['CAD Tools', 'SolidWorks, Fusion 360, AutoCAD'], ['PLM System', 'Windchill, Arena, OpenBOM'], ['Cloud Storage', 'OneDrive, Google Drive, Dropbox'], ['Issue Tracker', 'Jira, Linear, GitHub Issues']].map(([name, desc]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1e2844' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{name}</div>
                <div style={{ fontSize: 10, color: '#2a3042', marginTop: 2 }}>{desc}</div>
              </div>
              <span style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '3px 10px', border: '1px solid #1a1e28', borderRadius: 10 }}>Coming soon</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function IField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

function IInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iInputStyle} />
}

const iInputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '6px 10px',
  background: '#080a0f', border: '1px solid #222736', borderRadius: 5,
  color: '#e2e8f0', fontSize: 11, outline: 'none',
}
