import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '../context/PatientsContext'
import { useOrders } from '../context/OrdersContext'

export default function Patients() {
  const { patients, loading, error } = usePatients()
  const { orders } = useOrders()
  const navigate   = useNavigate()
  const [search, setSearch] = useState('')

  const orderCountByPatient = useMemo(() => {
    const map = {}
    for (const o of orders) {
      if (!o.patientId) continue
      map[o.patientId] = (map[o.patientId] ?? 0) + 1
    }
    return map
  }, [orders])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q)
    )
  }, [patients, search])

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading patients...
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Failed to load patients: {error}
    </div>
  )

  return (
    <div className="space-y-4">

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Patient table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Patients</h3>
          <span className="text-xs text-slate-400">
            {visible.length} {visible.length !== patients.length ? `of ${patients.length}` : 'total'}
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            {search ? 'No patients match your search.' : 'No patients yet.'}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => {
                const count = orderCountByPatient[p.id] ?? 0
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                      {p.lastName}, {p.firstName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.dob ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.phone ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count} order{count !== 1 ? 's' : ''}
                      </span>
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
