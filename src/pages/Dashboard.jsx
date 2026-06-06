import { useNavigate, Link } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import StatusBadge from '../components/StatusBadge'

// Returns Monday–Sunday bounds for the current week as YYYY-MM-DD strings
function getThisWeek() {
  const today = new Date()
  const day   = today.getDay() // 0 = Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = d => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { weekStart: fmt(monday), weekEnd: fmt(sunday), todayStr: fmt(today) }
}

// Days between a date string and today (positive = in the past)
function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = new Date().setHours(0,0,0,0) - new Date(dateStr).setHours(0,0,0,0)
  return Math.floor(diff / 86400000)
}

// Short weekday label from a YYYY-MM-DD string
function weekdayLabel(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Human-readable relative time (e.g. "2 hours ago", "just now")
function timeAgo(isoString) {
  if (!isoString) return '—'
  const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (seconds < 60)  return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function Dashboard() {
  const { orders, loading, error } = useOrders()
  const navigate = useNavigate()

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading...
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load orders: {error}
    </div>
  )

  const { weekStart, weekEnd, todayStr } = getThisWeek()

  // ── New account empty state ────────────────────────────────────────────────
  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-800">No orders yet</h2>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        Create your first order to start tracking imaging visits, reports, and billing.
      </p>
      <div className="flex gap-3 mt-6">
        <Link
          to="/facilities"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Add a Facility
        </Link>
        <Link
          to="/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create First Order
        </Link>
      </div>
    </div>
  )

  // ── Derived data ───────────────────────────────────────────────────────────


  // Reports overdue: exam is Completed but no report sent, and date is in the past
  const reportsOverdue = orders
    .filter(o => o.status === 'Completed' && o.date && o.date < todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // oldest first = most overdue

  // This week's scheduled visits
  const thisWeek = orders
    .filter(o => o.status === 'Scheduled' && o.date && o.date >= weekStart && o.date <= weekEnd)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Recently updated: sorted by updatedAt desc, take top 8
  const recentlyUpdated = [...orders]
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0) - new Date(a.updatedAt ?? a.createdAt ?? 0))
    .slice(0, 8)

  // Stat card values
  const activeOrders = orders.filter(o => o.status !== 'Billed').length

  return (
    <div className="space-y-6">

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Orders"
          value={activeOrders}
          note="Not yet billed"
        />
        <StatCard
          label="Reports Overdue"
          value={reportsOverdue.length}
          note="Exam done, no report sent"
          accent={reportsOverdue.length > 0 ? 'red' : null}
        />
        <StatCard
          label="This Week"
          value={thisWeek.length}
          note="Scheduled visits"
          accent={thisWeek.length > 0 ? 'blue' : null}
        />
      </div>

      {/* ── Reports overdue ───────────────────────────────────────────────── */}
      <Section
        title="Reports Overdue"
        count={reportsOverdue.length}
        emptyMessage="No overdue reports."
      >
        {reportsOverdue.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <ColHead>Patient</ColHead>
                <ColHead>Facility</ColHead>
                <ColHead>Exam Type</ColHead>
                <ColHead>Exam Date</ColHead>
                <ColHead>Days Overdue</ColHead>
              </tr>
            </thead>
            <tbody>
              {reportsOverdue.map(order => {
                const days = daysAgo(order.date)
                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="border-b border-slate-50 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                      {order.patient
                        ? `${order.patient.firstName} ${order.patient.lastName}`
                        : order.patientInitials ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{order.facility}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        days >= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {days === 1 ? '1 day' : `${days} days`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Section>

      {/* ── This week's scheduled visits ──────────────────────────────────── */}
      <Section
        title="This Week's Scheduled Visits"
        count={thisWeek.length}
        emptyMessage="No visits scheduled this week."
      >
        {thisWeek.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <ColHead>Day</ColHead>
                <ColHead>Patient</ColHead>
                <ColHead>Facility</ColHead>
                <ColHead>Exam Type</ColHead>
                <ColHead>Billing</ColHead>
              </tr>
            </thead>
            <tbody>
              {thisWeek.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="border-b border-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                    {order.date === todayStr
                      ? <span className="text-blue-600 font-semibold">Today</span>
                      : weekdayLabel(order.date)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : order.patientInitials ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* ── Recently updated orders ───────────────────────────────────────── */}
      <Section
        title="Recently Updated Orders"
        count={recentlyUpdated.length}
        emptyMessage="No orders yet."
        countLabel="shown"
      >
        {recentlyUpdated.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <ColHead>Patient</ColHead>
                <ColHead>Facility</ColHead>
                <ColHead>Exam Type</ColHead>
                <ColHead>Status</ColHead>
                <ColHead>Updated</ColHead>
              </tr>
            </thead>
            <tbody>
              {recentlyUpdated.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : order.patientInitials ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {timeAgo(order.updatedAt ?? order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

    </div>
  )
}

// ── Small reusable components ──────────────────────────────────────────────────

const accentValueColors = {
  amber: 'text-amber-600',
  red:   'text-red-600',
  blue:  'text-blue-600',
}

function StatCard({ label, value, note, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accentValueColors[accent] ?? 'text-slate-800'}`}>
        {value}
      </p>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

function Section({ title, count, emptyMessage, countLabel = 'orders', children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400">
          {count} {countLabel === 'orders' ? (count === 1 ? 'order' : 'orders') : countLabel}
        </span>
      </div>
      {count === 0
        ? <p className="px-5 py-8 text-center text-sm text-slate-400">{emptyMessage}</p>
        : children}
    </div>
  )
}

function ColHead({ children }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </th>
  )
}
