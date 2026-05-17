// OrderDetail.jsx — Full detail view for a single order ("/orders/:id").
// Shows patient info, order fields, inline status change, notes, and status history.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import EditOrderModal from '../components/EditOrderModal'

export default function OrderDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { orders, loading: ordersLoading } = useOrders()

  // Find this order in the already-loaded context
  const order = orders.find(o => String(o.id) === String(id))

  const [editing, setEditing] = useState(false)

  // ── Notes ──────────────────────────────────────────────────────────────────
  const [notes,        setNotes]        = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [noteText,     setNoteText]     = useState('')
  const [savingNote,   setSavingNote]   = useState(false)
  const [noteError,    setNoteError]    = useState(null)

  // ── Status history ─────────────────────────────────────────────────────────
  const [history,        setHistory]        = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function fetchNotes() {
      const { data } = await supabase
        .from('notes')
        .select('id, content, created_at')
        .eq('order_id', id)
        .order('created_at', { ascending: false })
      setNotes(data ?? [])
      setNotesLoading(false)
    }

    async function fetchHistory() {
      const { data } = await supabase
        .from('status_history')
        .select('id, old_status, new_status, changed_at')
        .eq('order_id', id)
        .order('changed_at', { ascending: false })
      setHistory(data ?? [])
      setHistoryLoading(false)
    }

    fetchNotes()
    fetchHistory()
  }, [id])

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return

    setSavingNote(true)
    setNoteError(null)

    const { data, error } = await supabase
      .from('notes')
      .insert({ order_id: id, content: noteText.trim() })
      .select('id, content, created_at')
      .single()

    if (error) {
      setNoteError(error.message)
    } else {
      setNotes(cur => [data, ...cur])
      setNoteText('')
    }
    setSavingNote(false)
  }

  // ── Loading / not found states ─────────────────────────────────────────────

  if (ordersLoading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading order...
    </div>
  )

  if (!order) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Order not found.{' '}
      <button onClick={() => navigate('/orders')} className="underline">Back to orders</button>
    </div>
  )

  const patientName = order.patient
    ? `${order.patient.firstName} ${order.patient.lastName}`
    : order.patientInitials ?? '—'

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          ← Orders
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Edit Order
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditOrderModal order={order} onClose={() => setEditing(false)} />
      )}

      {/* ── Patient card ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Patient</p>
        <p className="text-lg font-semibold text-slate-800">{patientName}</p>
        {order.patient && (
          <div className="flex gap-4 text-sm text-slate-500 mt-1">
            {order.patient.dob   && <span>DOB: {order.patient.dob}</span>}
            {order.patient.phone && <span>{order.patient.phone}</span>}
          </div>
        )}
      </section>

      {/* ── Order details ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Order Details</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">

          <Field label="Facility"    value={order.facility} />
          <Field label="Exam Type"   value={order.examType} />
          <Field label="Date"        value={order.date ?? '—'} />

          <div>
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <StatusBadge status={order.status} />
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Billing</p>
            <BillingBadge status={order.billingStatus} />
          </div>

        </div>
      </section>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes</p>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={savingNote || !noteText.trim()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingNote ? 'Saving...' : 'Add'}
          </button>
        </form>

        {noteError && (
          <p className="text-sm text-red-600">{noteError}</p>
        )}

        {notesLoading ? (
          <p className="text-sm text-slate-400">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-400">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map(note => (
              <li key={note.id} className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-800">{note.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Status history ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status History</p>

        {historyLoading ? (
          <p className="text-sm text-slate-400">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400">No status changes recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map(entry => (
              <li key={entry.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">{entry.old_status ?? 'Created'}</span>
                <span className="text-slate-300">→</span>
                <span className="font-medium text-slate-800">{entry.new_status}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(entry.changed_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

const billingColors = {
  'Not Started': 'bg-slate-100 text-slate-600',
  'Pending':     'bg-amber-100 text-amber-700',
  'Ready':       'bg-green-100 text-green-700',
}

function BillingBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      billingColors[status] ?? 'bg-slate-100 text-slate-600'
    }`}>
      {status}
    </span>
  )
}
