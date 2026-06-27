import { useState, useEffect, useCallback } from 'react'

export interface AppSettings {
  // Appearance
  theme:          'dark' | 'light'
  accentColor:    string
  fontSize:       'compact' | 'comfortable' | 'large'
  animations:     boolean

  // Profile
  displayName:    string
  email:          string
  title:          string

  // Language & Region
  language:       string
  dateFormat:     string
  timeFormat:     '12h' | '24h'
  firstDayOfWeek: 'sunday' | 'monday'
  numberFormat:   string

  // Units
  units:          'metric' | 'imperial'

  // Notifications
  notifyEmail:    boolean
  notifyInApp:    boolean
  notifyPush:     boolean
  quietHoursFrom: string
  quietHoursTo:   string

  // Dashboard
  defaultLandingPage: string

  // Data & Sync
  offlineMode:    boolean
  autoSync:       boolean
  syncFrequency:  string

  // Security
  sessionTimeout: string
  twoFactorAuth:  boolean

  // AI Assistant
  aiStyle:        'concise' | 'detailed' | 'balanced'
  aiDetailLevel:  'low' | 'medium' | 'high'
  aiSuggestions:  boolean

  // Workspace Defaults
  defaultObjectView:     'list' | 'grid'
  defaultRepoView:       'list' | 'grid'
  defaultKnowledgeView:  'list' | 'grid'
}

const DEFAULTS: AppSettings = {
  theme:              'dark',
  accentColor:        '#3b82f6',
  fontSize:           'comfortable',
  animations:         true,
  displayName:        'David',
  email:              'david.m.huitt@gmail.com',
  title:              'Chief Engineer',
  language:           'English (US)',
  dateFormat:         'MM/DD/YYYY',
  timeFormat:         '12h',
  firstDayOfWeek:     'sunday',
  numberFormat:       'US (1,234.56)',
  units:              'metric',
  notifyEmail:        true,
  notifyInApp:        true,
  notifyPush:         false,
  quietHoursFrom:     '22:00',
  quietHoursTo:       '08:00',
  defaultLandingPage: 'home',
  offlineMode:        false,
  autoSync:           true,
  syncFrequency:      '5min',
  sessionTimeout:     '30min',
  twoFactorAuth:      false,
  aiStyle:            'balanced',
  aiDetailLevel:      'medium',
  aiSuggestions:      true,
  defaultObjectView:  'list',
  defaultRepoView:    'list',
  defaultKnowledgeView: 'list',
}

const KEY = 'divad-os-settings'

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch { return DEFAULTS }
  })
  const [dirty,    setDirty]    = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  const save = useCallback((s?: AppSettings) => {
    const toSave = s ?? settings
    localStorage.setItem(KEY, JSON.stringify(toSave))
    setLastSaved(new Date())
    setDirty(false)
  }, [settings])

  const reset = useCallback(() => {
    setSettingsState(DEFAULTS)
    localStorage.setItem(KEY, JSON.stringify(DEFAULTS))
    setLastSaved(new Date())
    setDirty(false)
  }, [])

  // Auto-save on change
  useEffect(() => {
    if (dirty) {
      const t = setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(settings))
        setLastSaved(new Date())
        setDirty(false)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [settings, dirty])

  return { settings, update, save, reset, dirty, lastSaved }
}
