// Dashboard.jsx — The home page ("/").
// Fetches the live orders list from context (which reads from Supabase)
// and shows summary stat cards + the full orders table.

import { useOrders } from '../context/OrdersContext'
import StatusBadge from '../components/StatusBadge'

function StatCard({ label, value, note }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

export default function Dashboard() {
  // loading is true while Supabase is fetching — show a spinner until it's done
  const { orders, loading, error } = useOrders()

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading orders...
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load orders: {error}
    </div>
  )

  // Derive counts from the live orders array — updates automatically when new orders are added
  const pending        = orders.filter(o => o.status === 'Requested').length
  const scheduled      = orders.filter(o => o.status === 'Scheduled').length
  const reportsSent    = orders.filter(o => o.status === 'Report Sent').length
  const billingPending = orders.filter(o => o.billingStatus !== 'Ready').length

  return (
    <div className="space-y-6">

      {/* ── Stat cards row ──────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pending Orders"  value={pending}        note="Awaiting scheduling" />
        <StatCard label="Scheduled Today" value={scheduled}      note="On the board" />
        <StatCard label="Reports Sent"    value={reportsSent}    note="Ready for review" />
        <StatCard label="Billing Pending" value={billingPending} note="Needs attention" />
      </div>

      {/* ── Orders table ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Orders</h3>
          <span className="text-xs text-slate-400">{orders.length} total</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
