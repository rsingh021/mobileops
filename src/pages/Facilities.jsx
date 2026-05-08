// Facilities.jsx — The facilities page ("/facilities").
// Lists all partner facilities the mobile imaging team visits.

import { facilities } from '../data/orders' // Facility data from the shared mock data file

export default function Facilities() {
  return (
    <div className="space-y-4">

      {/* ── Facilities table ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        {/* Table header bar with an "Add Facility" action */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Partner Facilities</h3>
          {/* Placeholder button — will open a form when facility creation is built */}
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Facility</button>
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
            {/* .map() loops over each facility and renders one row */}
            {facilities.map(f => (
              <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{f.name}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{f.city}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{f.contact}</td>

                {/* Active orders pill — blue if there are open orders, gray if none */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    f.activeOrders > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {f.activeOrders} order{f.activeOrders !== 1 ? 's' : ''}
                  </span>
                </td>

                {/* Placeholder edit button — will open an edit form later */}
                <td className="px-5 py-3.5">
                  <button className="text-xs text-slate-400 hover:text-slate-700 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coming soon notice — marks features planned but not yet built */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming next</p>
        <p className="text-sm text-amber-700 mt-0.5">Facility detail view, order history per facility, and contact management.</p>
      </div>

    </div>
  )
}
