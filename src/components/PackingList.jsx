import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../hooks/useLang'
import Icon from './Icon'

const STRINGS = {
  he: {
    suggestions: ['דרכון', 'ביטוח נסיעות', 'מטען טלפון', 'מתאם חשמל', 'קרם הגנה', 'נעליים נוחות', 'מצלמה', 'אוזניות', 'בקבוק מים', 'כרית נסיעה', 'תרופות', 'מזומן'],
    addPh: 'הוסיפו פריט לציוד…',
    quickAdd: 'הוספה מהירה',
    packing: 'כמה ארזתם כבר',
    emptyTitle: 'עדיין לא נארז כלום',
    emptySub: 'הוסיפו פריטים למעלה או הקישו על הצעה',
    packed: 'נארזו',
    deleteQ: 'למחוק?',
    delete: 'מחיקה',
    tapAgain: 'הקישו שוב למחיקה',
  },
  en: {
    suggestions: ['Passport', 'Travel insurance', 'Phone charger', 'Power adapter', 'Sunscreen', 'Comfortable shoes', 'Camera', 'Headphones', 'Reusable water bottle', 'Travel pillow', 'Medications', 'Cash'],
    addPh: 'Add packing item…',
    quickAdd: 'Quick add',
    packing: 'Packing progress',
    emptyTitle: 'Nothing packed yet',
    emptySub: 'Add items above or tap quick-add suggestions',
    packed: 'Packed',
    deleteQ: 'Delete?',
    delete: 'Delete',
    tapAgain: 'Tap again to delete',
  }
}

export default function PackingList({ tripId }) {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const [items, setItems]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [newText, setNewText]           = useState('')
  const [adding, setAdding]             = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [togglingId, setTogglingId]     = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { fetchItems() }, [tripId])

  // Realtime sync - keep collaborators' changes in view without reload
  useEffect(() => {
    const channel = supabase
      .channel(`packing:${tripId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'packing_items',
        filter: `trip_id=eq.${tripId}`,
      }, ({ eventType, new: row, old }) => {
        if (eventType === 'INSERT') {
          setItems(prev => prev.some(i => i.id === row.id) ? prev : [...prev, row])
        } else if (eventType === 'UPDATE') {
          setItems(prev => prev.map(i => i.id === row.id ? row : i))
        } else if (eventType === 'DELETE') {
          setItems(prev => prev.filter(i => i.id !== old.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tripId])

  // Reset delete-confirm if user taps elsewhere
  useEffect(() => {
    if (!confirmDeleteId) return
    const tt = setTimeout(() => setConfirmDeleteId(null), 3000)
    return () => clearTimeout(tt)
  }, [confirmDeleteId])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at')
    setItems(data || [])
    setLoading(false)
  }

  const addItem = async (text) => {
    const txt = text || newText.trim()
    if (!txt) return
    // Prevent case-insensitive duplicates
    if (items.some(i => i.text.toLowerCase() === txt.toLowerCase())) {
      setNewText('')
      return
    }
    setAdding(true)
    const { data } = await supabase
      .from('packing_items')
      .insert({ trip_id: tripId, text: txt })
      .select().single()
    if (data) setItems(prev => [...prev, data])
    setNewText('')
    setAdding(false)
    setShowSuggestions(false)
  }

  const toggleItem = async (item) => {
    if (togglingId === item.id) return
    const next = !item.checked
    setTogglingId(item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: next } : i))
    const { error } = await supabase.from('packing_items').update({ checked: next }).eq('id', item.id)
    if (error) {
      // rollback on failure
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: item.checked } : i))
    }
    setTogglingId(null)
  }

  const deleteItem = async (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setDeletingId(id)
    setConfirmDeleteId(null)
    await supabase.from('packing_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDeletingId(null)
  }

  const unchecked = items.filter(i => !i.checked)
  const checked   = items.filter(i => i.checked)

  if (loading) return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="skeleton-circle" style={{ width: 22, height: 22, flexShrink: 0 }} />
          <div className="skeleton-text" style={{ flex: 1, animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
    </div>
  )

  return (
    <div dir={isHe ? 'rtl' : 'ltr'} style={{ padding: '16px 16px 100px' }}>
      {/* Add input */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            className="input"
            placeholder={t.addPh}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            onFocus={() => setShowSuggestions(true)}
            style={{ fontSize: 15 }}
          />
          <button
            className="btn btn-accent btn-sm"
            onClick={() => addItem()}
            disabled={adding || !newText.trim()}
            style={{ flexShrink: 0 }}
          >
            <Icon name="plus" size={16} color="white" />
          </button>
        </div>

        {/* Quick suggestions */}
        {showSuggestions && !newText && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.quickAdd}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {t.suggestions.filter(s => !items.find(i => i.text.toLowerCase() === s.toLowerCase())).map(s => (
                <button key={s} onClick={() => addItem(s)}
                  style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--ink-light)', cursor: 'pointer', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.target.style.background = 'var(--accent-pale)'; e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.target.style.background = 'var(--cream)'; e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--ink-light)' }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{t.packing}</span>
            <span style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>{checked.length}/{items.length}</span>
          </div>
          <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${items.length ? (checked.length / items.length) * 100 : 0}%`, background: 'var(--teal)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ marginBottom: 12 }}><Icon name="package" size={44} color="var(--sand-dark)" /></div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>{t.emptyTitle}</p>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>{t.emptySub}</p>
        </div>
      )}

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div style={{ marginBottom: checked.length > 0 ? 20 : 0 }}>
          {unchecked.map((item, i) => (
            <PackItem key={item.id} item={item}
              toggling={togglingId === item.id}
              deleting={deletingId === item.id}
              confirmingDelete={confirmDeleteId === item.id}
              onToggle={toggleItem} onDelete={deleteItem} delay={i * 0.04}
              labels={t} />
          ))}
        </div>
      )}

      {/* Packed section */}
      {checked.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: 10 }}>
            {t.packed} ({checked.length})
          </p>
          {checked.map((item, i) => (
            <PackItem key={item.id} item={item}
              toggling={togglingId === item.id}
              deleting={deletingId === item.id}
              confirmingDelete={confirmDeleteId === item.id}
              onToggle={toggleItem} onDelete={deleteItem} delay={i * 0.04}
              labels={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function PackItem({ item, toggling, deleting, confirmingDelete, onToggle, onDelete, delay, labels }) {
  return (
    <div
      className="anim-up"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', marginBottom: 6, background: 'var(--white)', borderRadius: 12, border: `1px solid ${confirmingDelete ? 'var(--danger-border, #fca5a5)' : 'var(--border)'}`, animationDelay: `${delay}s`, transition: 'all 0.2s', opacity: deleting ? 0.4 : 1 }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item)}
        disabled={toggling || deleting}
        style={{ width: 24, height: 24, borderRadius: 8, border: `1.5px solid ${item.checked ? 'var(--teal)' : 'var(--border-strong)'}`, background: item.checked ? 'var(--teal)' : toggling ? 'var(--cream-dark)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: toggling ? 'wait' : 'pointer', transition: 'all 0.15s' }}
      >
        {item.checked && !toggling && <Icon name="check" size={13} color="white" />}
        {toggling && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sand-dark)', animation: 'pulse 0.8s ease infinite' }} />}
      </button>

      {/* Label */}
      <span style={{ flex: 1, fontSize: 14, color: item.checked ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: item.checked ? 'line-through' : 'none' }}>
        {item.text}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        title={confirmingDelete ? labels.tapAgain : labels.delete}
        style={{ padding: '4px 6px', borderRadius: 6, cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.4 : 1, transition: 'all 0.15s', background: confirmingDelete ? 'var(--danger-bg, #fee2e2)' : 'transparent', border: confirmingDelete ? '1px solid var(--danger-border, #fca5a5)' : 'none' }}
      >
        {confirmingDelete
          ? <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger, #b91c1c)', whiteSpace: 'nowrap' }}>{labels.deleteQ}</span>
          : <Icon name="close" size={13} color="var(--sand-dark)" />
        }
      </button>
    </div>
  )
}
