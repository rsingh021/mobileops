// Dashboard.jsx — The home page ("/").
// Shows a summary of the operation at a glance:
//   - 4 stat cards with key counts derived from the live orders list
//   - A full orders table below
//
// Uses useOrders() instead of importing from the data file directly,
// so newly created orders (from NewOrder.jsx) show up here immediately.

import { useOrders } from '../context/OrdersContext'
// useOrders gives us the live orders array from shared context.
// Any order added via the New Order form will appear here automatically.

import StatusBadge from '../components/StatusBadge' // Colored pill for order status

// StatCard — a small info card that shows one metric.
// Props:
//   label — the description shown above the number (e.g. "Pending Orders")
//   value — the number to display big
//   note  — optional small text below the number (e.g. "Awaiting scheduling")
function StatCard({ label, value, note }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {/* Only render the note paragraph if a note was passed in */}
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

export default function Dashboard() {
  // Pull the live orders list from context
  const { orders } = useOrders()

  // Derive counts from the orders array using .filter() + .length.
  // These automatically update whenever a new order is added.
  const pending        = orders.filter(o => o.status === 'Requested').length
  const scheduled      = orders.filter(o => o.status === 'Scheduled').length
  const reportsSent    = orders.filter(o => o.status === 'Report Sent').length
  // billingPending counts any order that is NOT in a "Ready" billing state
  const billingPending = orders.filter(o => o.billingStatus !== 'Ready').length

  return (
    // space-y-6 = vertical gap between the stat card row and the table below
    <div className="space-y-6">

      {/* ── Stat cards row ──────────────────────────────────── */}
      {/* grid-cols-4 = 4 equal-width columns side by side */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pending Orders"  value={pending}        note="Awaiting scheduling" />
        <StatCard label="Scheduled Today" value={scheduled}      note="On the board" />
        <StatCard label="Reports Sent"    value={reportsSent}    note="Ready for review" />
        <StatCard label="Billing Pending" value={billingPending} note="Needs attention" />
      </div>

      {/* ── Orders table ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        {/* Table header bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Orders</h3>
          <span className="text-xs text-slate-400">{orders.length} total</span>
        </div>

        <table className="w-full">
          {/* Column headers */}
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

          {/* Data rows — .map() loops over every order and renders one <tr> per order */}
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                {/* StatusBadge renders a colored pill instead of plain text */}
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
