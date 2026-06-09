import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { useToast } from '../context/ToastContext'

function formatTime(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 42-cell grid (6 weeks) for a given year/month
function buildCalendarGrid(year, month) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()
  const cells       = []

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, prevDays - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true })
  let next = 1
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, next++), current: false })

  return cells
}

const STATUS_COLORS = {
  Scheduled:    'bg-blue-100 text-blue-800',
  Completed:    'bg-violet-100 text-violet-800',
  'Report Sent':'bg-green-100 text-green-800',
  Billed:       'bg-slate-100 text-slate-600',
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export default function Schedule() {
  const { orders, loading, error, updateOrder } = useOrders()
  const navigate = useNavigate()
  const { toast } = useToast()

  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(toYMD(today))

  const [rescheduling,    setRescheduling]    = useState(null)
  const [newDate,         setNewDate]         = useState('')
  const [newTime,         setNewTime]         = useState('')
  const [saving,          setSaving]          = useState(false)
  const [rescheduleError, setRescheduleError] = useState(null)

  function buildDateMap(orderList) {
    const map = {}
    for (const o of orderList) {
      if (!o.date) continue
      if (!map[o.date]) map[o.date] = []
      map[o.date].push(o)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        if (!a.time && !b.time) return 0
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time.localeCompare(b.time)
      })
    }
    return map
  }

  const ordersByDate = useMemo(() => buildDateMap(orders), [orders])

  const calendarByDate = useMemo(() => buildDateMap(orders), [orders])

  const cells          = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth])
  const todayStr       = toYMD(today)
  const selectedOrders = ordersByDate[selectedDay] ?? []

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function openReschedule(order) {
    setRescheduling(order)
    setNewDate(order.date ?? '')
    setNewTime(order.time ?? '')
    setRescheduleError(null)
  }

  async function handleReschedule(e) {
    e.preventDefault()
    if (!newDate) return
    setSaving(true)
    setRescheduleError(null)
    try {
      await updateOrder(rescheduling.id, { date: newDate, time: newTime || null })
      toast('Order rescheduled')
      setRescheduling(null)
    } catch (err) {
      setRescheduleError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading schedule...</div>
  )
  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load orders: {error}
    </div>
  )

  return (
    <div className="space-y-4">

      {rescheduling && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setRescheduling(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Reschedule</h2>
              <button onClick={() => setRescheduling(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <div className="px-6 pt-4">
              <p className="text-sm font-medium text-slate-800">
                {rescheduling.patient
                  ? `${rescheduling.patient.firstName} ${rescheduling.patient.lastName}`
                  : rescheduling.patientInitials ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {rescheduling.examType} · {rescheduling.facility}
              </p>
            </div>

            {rescheduleError && (
              <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleReschedule} className="px-6 py-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Time <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduling(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            ← Prev
          </button>
          <h3 className="font-semibold text-slate-800">{MONTHS[viewMonth]} {viewYear}</h3>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const ymd        = toYMD(cell.date)
            const isToday    = ymd === todayStr
            const isSelected = ymd === selectedDay
            const dayOrders  = calendarByDate[ymd] ?? []
            const shown      = dayOrders.slice(0, 3)
            const overflow   = dayOrders.length - 3

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(ymd)}
                className={`min-h-24 p-1.5 border-b border-r border-slate-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                } ${!cell.current ? 'opacity-40' : ''}`}
              >
                <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}>
                  {cell.date.getDate()}
                </p>

                <div className="space-y-0.5">
                  {shown.map(o => (
                    <div
                      key={o.id}
                      className={`rounded px-1 py-0.5 text-xs truncate leading-tight ${STATUS_COLORS[o.status] ?? 'bg-slate-100 text-slate-600'}`}
                    >
                      {o.time ? `${formatTime(o.time)} · ` : ''}
                      {o.patient
                        ? `${o.patient.firstName} ${o.patient.lastName[0]}.`
                        : o.patientInitials ?? '—'}
                    </div>
                  ))}
                  {overflow > 0 && (
                    <p className="text-xs text-slate-400 pl-0.5">+{overflow} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </h3>
          <span className="text-xs text-slate-400">
            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {selectedOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No orders on this day.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {selectedOrders.map(order => (
              <div key={order.id} className="px-5 py-4 flex items-center gap-4">

                <div className="w-18 shrink-0 text-sm font-medium text-blue-600 tabular-nums">
                  {order.time ? formatTime(order.time) : <span className="text-slate-300 font-normal">No time</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : order.patientInitials ?? '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {order.examType} · {order.facility}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'
                }`}>
                  {order.status}
                </span>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openReschedule(order)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50"
                  >
                    View
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
