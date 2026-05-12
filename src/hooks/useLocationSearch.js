import { useState, useRef } from 'react'

/**
 * Shared location-search hook backed by Photon / Komoot.
 * Returns the same interface that NewStopModal and EditStopModal used inline.
 *
 * Reads the lang preference from localStorage so error messages match the UI.
 * Place names come back from OSM in their native script regardless of lang.
 */
function getLang() {
  try {
    const stored = localStorage.getItem('triplan_lang')
    if (stored) return stored
    return navigator.language?.startsWith('he') ? 'he' : 'en'
  } catch {
    return 'en'
  }
}

const ERRORS = {
  he: {
    noResults: 'לא נמצאו תוצאות',
    unavailable: 'חיפוש המיקום אינו זמין. אפשר להזין קואורדינטות ידנית.',
  },
  en: {
    noResults: 'No results found',
    unavailable: 'Location search unavailable. Try entering coordinates manually.',
  }
}

export function useLocationSearch() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const timer = useRef(null)

  const search = async (q) => {
    if (!q.trim() || q.trim().length < 3) { setResults([]); setSearchError(''); return }
    setSearching(true); setSearchError('')
    const e = ERRORS[getLang() === 'he' ? 'he' : 'en']
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`
      )
      if (!res.ok) throw new Error('non-2xx')
      const data = await res.json()
      setResults(data.features || [])
      if ((data.features || []).length === 0) setSearchError(e.noResults)
    } catch {
      setResults([])
      setSearchError(e.unavailable)
    }
    setSearching(false)
  }

  const handleInput = (val) => {
    setQuery(val)
    setSearchError('')
    clearTimeout(timer.current)
    if (!val.trim()) { setResults([]); return }
    timer.current = setTimeout(() => search(val), 400)
  }

  const clearResults = () => { setResults([]); setSearchError('') }

  return { query, setQuery, results, searching, searchError, handleInput, clearResults }
}
