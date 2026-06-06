import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import StatusBadge from '../components/StatusBadge'

function toYMD(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

function formatTime(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateHeader(ymd) {
  const [y, mo, d] = ymd.split('-').map(Number)
  const date       = new Date(y, mo - 1, d)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const diff = Math.round((date - todayStart) / 86400000)

  const short = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff === 0) return `Today · ${short}`
  if (diff === 1) return `Tomorrow · ${short}`
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

const STATUS_FILTERS = [
  ['all',       'All statuses'],
  ['scheduled', 'Scheduled'],
]

export default function Upcoming() {
  const { orders, loading } = useOrders()
  const navigate            = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')

  const todayYMD = toYMD(new Date())

  const groups = useMemo(() => {
    const filtered = orders
      .filter(o => {
        if (!o.date || o.date < todayYMD) return false
        if (statusFilter === 'scheduled' && o.status !== 'Scheduled') return false
        return true
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        if (!a.time && !b.time) return 0
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time < b.time ? -1 : 1
      })

    const map = new Map()
    for (const order of filtered) {
      if (!map.has(order.date)) map.set(order.date, [])
      map.get(order.date).push(order)
    }
    return [...map.entries()]
  }, [orders, statusFilter, todayYMD])

  const totalCount = groups.reduce((sum, [, list]) => sum + list.length, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading...
    </div>
  )

  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upcoming Appointments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalCount === 0
              ? 'No appointments found'
              : `${totalCount} appointment${totalCount !== 1 ? 's' : ''} from today onward`}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {STATUS_FILTERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors border ${
                statusFilter === val
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">No upcoming appointments</p>
          <p className="text-slate-400 text-sm mt-1">
            {statusFilter !== 'all'
              ? 'Try switching to "All statuses" to see more.'
              : 'Orders with a future date will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([date, dayOrders]) => (
            <section key={date} className="bg-white rounded-xl border border-slate-200 overflow-hidden">

              {/* Date header */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{formatDateHeader(date)}</p>
                <p className="text-xs text-slate-400">
                  {dayOrders.length} appointment{dayOrders.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Orders for this day */}
              <ul>
                {dayOrders.map((order, i) => {
                  const patientName = order.patient
                    ? `${order.patient.firstName} ${order.patient.lastName}`
                    : order.patientInitials ?? '—'

                  return (
                    <li
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                        i < dayOrders.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      {/* Time */}
                      <div className="w-20 flex-shrink-0">
                        {order.time ? (
                          <p className="text-sm font-semibold text-slate-800">{formatTime(order.time)}</p>
                        ) : (
                          <p className="text-xs text-slate-300">No time</p>
                        )}
                      </div>

                      {/* Patient + exam */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{patientName}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{order.examType}</p>
                      </div>

                      {/* Facility */}
                      <div className="w-48 flex-shrink-0 hidden md:block">
                        <p className="text-sm text-slate-600 truncate">{order.facility}</p>
                      </div>

                      {/* Status */}
                      <StatusBadge status={order.status} />

                      {/* Arrow */}
                      <span className="text-slate-300 text-sm flex-shrink-0">→</span>
                    </li>
                  )
                })}
              </ul>

            </section>
          ))}
        </div>
      )}

    </div>
  )
}
