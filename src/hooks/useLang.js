import { useState } from 'react'

export function useLang() {
  const [lang, setLang] = useState(() =>
    localStorage.getItem('triplan_lang') ||
    (navigator.language?.startsWith('he') ? 'he' : 'en')
  )

  const toggleLang = () => {
    const next = lang === 'he' ? 'en' : 'he'
    localStorage.setItem('triplan_lang', next)
    localStorage.setItem('triplan_lang_ts', String(Date.now()))
    setLang(next)
  }

  return { lang, toggleLang }
}
