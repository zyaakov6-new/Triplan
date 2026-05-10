import { useState, useRef } from 'react'

/**
 * Shared location-search hook backed by Photon / Komoot.
 * Returns the same interface that NewStopModal and EditStopModal used inline.
 */
export function useLocationSearch() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const timer = useRef(null)

  const search = async (q) => {
    if (!q.trim() || q.trim().length < 3) { setResults([]); setSearchError(''); return }
    setSearching(true); setSearchError('')
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`
      )
      if (!res.ok) throw new Error('non-2xx')
      const data = await res.json()
      setResults(data.features || [])
      if ((data.features || []).length === 0) setSearchError('No results found')
    } catch {
      setResults([])
      setSearchError('Location search unavailable — try entering coordinates manually')
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
