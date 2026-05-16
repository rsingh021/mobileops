// Facilities.jsx — The facilities page ("/facilities").
// Lists all partner facilities fetched live from Supabase.
// activeOrders count is computed from the live orders list.

import { useFacilities } from '../context/FacilitiesContext'
import { useOrders } from '../context/OrdersContext'

export default function Facilities() {
  const { facilities, loading, error } = useFacilities()
  // Pull orders so we can compute activeOrders per facility dynamically
  const { orders } = useOrders()

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading facilities...
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load facilities: {error}
    </div>
  )

  // Count how many open orders exist for a given facility name
  // "open" = anything that isn't fully billed/closed
  function activeOrderCount(facilityName) {
    return orders.filter(
      o => o.facility === facilityName && o.status !== 'Billed'
    ).length
  }

  return (
    <div className="space-y-4">

      {/* ── Facilities table ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Partner Facilities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Facility
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">City</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Orders</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(f => {
              const count = activeOrderCount(f.name)
              return (
                <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{f.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{f.city}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{f.contact}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count} order{count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-slate-400 hover:text-slate-700 font-medium">Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming next</p>
        <p className="text-sm text-amber-700 mt-0.5">Facility detail view, order history per facility, and contact management.</p>
      </div>

    </div>
  )
}
