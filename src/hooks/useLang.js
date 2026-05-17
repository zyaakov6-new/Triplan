import { useState } from 'react'

/**
 * Hebrew is the default for new visitors because the target audience is
 * Israeli hikers / trip organisers. Many Israelis have their browser set to
 * English but still want Hebrew apps, so we don't gate on navigator.language.
 *
 * Order of precedence:
 *   1. Stored choice from a previous visit (whatever they last picked)
 *   2. Hebrew default
 *
 * They can always flip via the EN/עב toggle, and that choice is persisted.
 */
export function useLang() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('triplan_lang') || 'he' } catch { return 'he' }
  })

  const toggleLang = () => {
    const next = lang === 'he' ? 'en' : 'he'
    try {
      localStorage.setItem('triplan_lang', next)
      localStorage.setItem('triplan_lang_ts', String(Date.now()))
    } catch {}
    setLang(next)
  }

  return { lang, toggleLang }
}
