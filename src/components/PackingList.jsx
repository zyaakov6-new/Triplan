import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Icon from './Icon'

const SUGGESTIONS = [
  'Passport', 'Travel insurance', 'Phone charger', 'Power adapter',
  'Sunscreen', 'Comfortable shoes', 'Camera', 'Headphones',
  'Reusable water bottle', 'Travel pillow', 'Medications', 'Cash',
]

export default function PackingList({ tripId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { fetchItems() }, [tripId])

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
    const t = text || newText.trim()
    if (!t) return
    setAdding(true)
    const { data } = await supabase
      .from('packing_items')
      .insert({ trip_id: tripId, text: t })
      .select().single()
    if (data) setItems(prev => [...prev, data])
    setNewText('')
    setAdding(false)
    setShowSuggestions(false)
  }

  const toggleItem = async (item) => {
    const next = !item.checked
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: next } : i))
    await supabase.from('packing_items').update({ checked: next }).eq('id', item.id)
  }

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('packing_items').delete().eq('id', id)
  }

  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)

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
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Add input */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            className="input"
            placeholder="Add packing item…"
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
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.filter(s => !items.find(i => i.text.toLowerCase() === s.toLowerCase())).map(s => (
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
            <span style={{ fontSize: 13, fontWeight: 500 }}>Packing progress</span>
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
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎒</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Nothing packed yet</p>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Add items above or tap quick-add suggestions</p>
        </div>
      )}

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div style={{ marginBottom: checked.length > 0 ? 20 : 0 }}>
          {unchecked.map((item, i) => (
            <PackItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} delay={i * 0.04} />
          ))}
        </div>
      )}

      {/* Packed section */}
      {checked.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: 10 }}>
            ✅ Packed ({checked.length})
          </p>
          {checked.map((item, i) => (
            <PackItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  )
}

function PackItem({ item, onToggle, onDelete, delay }) {
  return (
    <div
      className="anim-up"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', marginBottom: 6, background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', animationDelay: `${delay}s`, transition: 'opacity 0.2s' }}
    >
      <button
        onClick={() => onToggle(item)}
        style={{ width: 24, height: 24, borderRadius: 8, border: `1.5px solid ${item.checked ? 'var(--teal)' : 'var(--border-strong)'}`, background: item.checked ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s' }}
      >
        {item.checked && <Icon name="check" size={13} color="white" />}
      </button>
      <span style={{ flex: 1, fontSize: 14, color: item.checked ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: item.checked ? 'line-through' : 'none' }}>
        {item.text}
      </span>
      <button onClick={() => onDelete(item.id)} style={{ padding: 4, color: 'var(--sand-dark)', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.15s' }}>
        <Icon name="close" size={13} color="var(--sand-dark)" />
      </button>
    </div>
  )
}
