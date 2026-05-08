// Billing.jsx — The billing page ("/billing").
// Shows the billing status of every order so the admin can see what's been cleared,
// what's in progress, and what hasn't been started.

import { orders } from '../data/orders'

// Maps each billingStatus string to Tailwind color classes for the pill badge.
// Same pattern as StatusBadge but specific to billing states.
const billingColors = {
  Ready:         'bg-green-100 text-green-800',  // Cleared — ready to invoice
  Pending:       'bg-amber-100 text-amber-800',  // In progress
  'Not Started': 'bg-slate-100 text-slate-600',  // Nothing done yet
}

export default function Billing() {
  // Derive counts for each billing state using .filter() + .length
  const ready      = orders.filter(o => o.billingStatus === 'Ready').length
  const pending    = orders.filter(o => o.billingStatus === 'Pending').length
  const notStarted = orders.filter(o => o.billingStatus === 'Not Started').length

  return (
    <div className="space-y-4">

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Ready to Bill</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{ready}</p>
          <p className="text-xs text-green-600 mt-1">Report sent, billing clear</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{pending}</p>
          <p className="text-xs text-amber-600 mt-1">In progress</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Not Started</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{notStarted}</p>
          <p className="text-xs text-slate-400 mt-1">Needs action</p>
        </div>

      </div>

      {/* ── Billing status table ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        {/* Table header with a CSV export action */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Billing Status</h3>
          {/* Placeholder — will generate and download a CSV file when built */}
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Export CSV</button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing Status</th>
            </tr>
          </thead>

          <tbody>
            {/* Show all orders (not just billable ones) so the admin has full visibility */}
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>

                {/* Colored billing status pill using the billingColors map above */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${billingColors[order.billingStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                    {order.billingStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Coming soon notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming next</p>
        <p className="text-sm text-amber-700 mt-0.5">CSV export, insurance claim tracking, and facility-level billing summaries.</p>
      </div>

    </div>
  )
}
