import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilities } from '../context/FacilitiesContext'
import { useOrders } from '../context/OrdersContext'
import AddFacilityModal  from '../components/AddFacilityModal'
import EditFacilityModal from '../components/EditFacilityModal'

export default function Facilities() {
  const { facilities, loading, error } = useFacilities()
  const { orders }  = useOrders()
  const navigate    = useNavigate()
  const [showAdd,     setShowAdd]     = useState(false)
  const [editingFacility, setEditingFacility] = useState(null)

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

  function activeOrderCount(facilityName) {
    return orders.filter(
      o => o.facility === facilityName && o.status !== 'Billed'
    ).length
  }

  return (
    <div className="space-y-4">

      {showAdd         && <AddFacilityModal  onClose={() => setShowAdd(false)} />}
      {editingFacility && <EditFacilityModal facility={editingFacility} onClose={() => setEditingFacility(null)} />}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Partner Facilities</h3>
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Facility
          </button>
        </div>

        {facilities.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No facilities added yet</p>
            <p className="text-sm text-slate-400 mt-1">Add the facilities you partner with to start creating orders.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add First Facility
            </button>
          </div>
        ) : (
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
                <tr
                  key={f.id}
                  onClick={() => navigate(`/facilities/${f.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
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
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingFacility(f)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>

    </div>
  )
}
