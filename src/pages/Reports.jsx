// Reports.jsx — The reports page ("/reports").
// Shows orders that are "Completed" or "Report Sent" so the admin can track
// which reports still need to be delivered.

import { useOrders } from '../context/OrdersContext'
import StatusBadge from '../components/StatusBadge'

export default function Reports() {
  // Get the live orders list from context (backed by Supabase)
  const { orders, loading, error } = useOrders()

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading reports...
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load data: {error}
    </div>
  )

  // Filter inside the component (not at module level) so it uses the live orders array
  // "Completed" = exam done, report not sent yet
  // "Report Sent" = report delivered to the facility
  const reportOrders   = orders.filter(o => o.status === 'Completed' || o.status === 'Report Sent')
  const awaitingReport = orders.filter(o => o.status === 'Completed').length
  const reportsSent    = orders.filter(o => o.status === 'Report Sent').length

  return (
    <div className="space-y-4">

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Awaiting Report</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{awaitingReport}</p>
          <p className="text-xs text-amber-600 mt-1">Exam done, report not sent</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Reports Sent</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{reportsSent}</p>
          <p className="text-xs text-green-600 mt-1">Delivered to facility</p>
        </div>

        {/* Hardcoded for now — will calculate from real timestamps when that field is added */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Avg Turnaround</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">18h</p>
          <p className="text-xs text-slate-400 mt-1">Target: 24h</p>
        </div>

      </div>

      {/* ── Report queue table ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Report Queue</h3>
        </div>

        {reportOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No reports pending.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Upload Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming next</p>
        <p className="text-sm text-amber-700 mt-0.5">PDF report upload, 24-hour turnaround alerts, and radiologist assignment.</p>
      </div>

    </div>
  )
}
