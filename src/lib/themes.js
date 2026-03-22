export const THEMES = {
  terracotta: { id: 'terracotta', label: 'Terracotta', swatch: '#C4622D', accent: '#C4622D', accentHover: '#A8521F', accentLight: '#E8956A', accentPale: '#F5E8DF', teal: '#2D6B6B', tealLight: '#E0EEEE' },
  ocean:      { id: 'ocean',      label: 'Ocean',      swatch: '#1565C0', accent: '#1565C0', accentHover: '#0D47A1', accentLight: '#5B9DD6', accentPale: '#E3F0FB', teal: '#00796B', tealLight: '#E0F2F1' },
  forest:     { id: 'forest',     label: 'Forest',     swatch: '#2E7D32', accent: '#2E7D32', accentHover: '#1B5E20', accentLight: '#66BB6A', accentPale: '#E8F5E9', teal: '#558B2F', tealLight: '#F1F8E9' },
  lavender:   { id: 'lavender',   label: 'Lavender',   swatch: '#6A1B9A', accent: '#6A1B9A', accentHover: '#4A148C', accentLight: '#AB47BC', accentPale: '#F3E5F5', teal: '#4527A0', tealLight: '#EDE7F6' },
  rose:       { id: 'rose',       label: 'Rose',       swatch: '#C2185B', accent: '#C2185B', accentHover: '#AD1457', accentLight: '#E91E63', accentPale: '#FCE4EC', teal: '#880E4F', tealLight: '#F8BBD9' },
  sunset:     { id: 'sunset',     label: 'Sunset',     swatch: '#E64A19', accent: '#E64A19', accentHover: '#BF360C', accentLight: '#FF7043', accentPale: '#FBE9E7', teal: '#F57C00', tealLight: '#FFF3E0' },
  midnight:   { id: 'midnight',   label: 'Midnight',   swatch: '#283593', accent: '#283593', accentHover: '#1A237E', accentLight: '#5C6BC0', accentPale: '#E8EAF6', teal: '#0277BD', tealLight: '#E1F5FE' },
}

export const getThemeVars = (themeId) => {
  const t = THEMES[themeId] || THEMES.terracotta
  return {
    '--accent': t.accent,
    '--accent-hover': t.accentHover,
    '--accent-light': t.accentLight,
    '--accent-pale': t.accentPale,
    '--teal': t.teal,
    '--teal-light': t.tealLight,
  }
}
