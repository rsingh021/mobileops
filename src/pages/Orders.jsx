import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'
import StatusSelect from '../components/StatusSelect'
import EditOrderModal from '../components/EditOrderModal'

const examTypes = [
  'Venous Doppler',
  'Echocardiogram',
  'Abdominal Ultrasound',
  'Carotid Doppler',
  'Arterial Doppler',
  'Renal Ultrasound',
]

const statusOptions  = ['All', 'Requested', 'Scheduled', 'Completed', 'Report Sent', 'Billed']
const billingOptions = ['All', 'Not Started', 'Pending', 'Ready']

export default function Orders() {
  const { orders, loading, error } = useOrders()
  const { facilities }             = useFacilities()
  const navigate                   = useNavigate()

  const [editingOrder, setEditingOrder] = useState(null)

  // ── Filter / search state (all reset on page refresh) ─────────────────────
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('All')
  const [billingFilter,  setBillingFilter]  = useState('All')
  const [facilityFilter, setFacilityFilter] = useState('All')
  const [examFilter,     setExamFilter]     = useState('All')
  const [sort,           setSort]           = useState('newest')

  const hasActiveFilters =
    search !== '' ||
    statusFilter  !== 'All' ||
    billingFilter !== 'All' ||
    facilityFilter !== 'All' ||
    examFilter    !== 'All' ||
    sort          !== 'newest'

  function clearAll() {
    setSearch('')
    setStatusFilter('All')
    setBillingFilter('All')
    setFacilityFilter('All')
    setExamFilter('All')
    setSort('newest')
  }

  // ── Derived visible list ───────────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()

    return orders
      .filter(o => {
        if (statusFilter  !== 'All' && o.status        !== statusFilter)  return false
        if (billingFilter !== 'All' && o.billingStatus !== billingFilter) return false
        if (facilityFilter !== 'All' && o.facility     !== facilityFilter) return false
        if (examFilter    !== 'All' && o.examType      !== examFilter)    return false

        if (q) {
          const patientName = o.patient
            ? `${o.patient.firstName} ${o.patient.lastName}`.toLowerCase()
            : (o.patientInitials ?? '').toLowerCase()
          const facilityName = (o.facility ?? '').toLowerCase()
          if (!patientName.includes(q) && !facilityName.includes(q)) return false
        }

        return true
      })
      .sort((a, b) => {
        const da = new Date(a.date ?? 0)
        const db = new Date(b.date ?? 0)
        return sort === 'newest' ? db - da : da - db
      })
  }, [orders, search, statusFilter, billingFilter, facilityFilter, examFilter, sort])

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

  return (
    <div className="space-y-4">

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {/* ── Search + controls bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 space-y-3">

        {/* Row 1: search + sort + clear */}
        <div className="flex gap-3 items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or facility..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-slate-500 hover:text-slate-800 whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Row 2: dropdown filters */}
        <div className="flex gap-2 flex-wrap">

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <FilterSelect
            label="Billing"
            value={billingFilter}
            onChange={setBillingFilter}
            options={billingOptions}
          />
          <FilterSelect
            label="Facility"
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={['All', ...facilities.map(f => f.name)]}
          />
          <FilterSelect
            label="Exam Type"
            value={examFilter}
            onChange={setExamFilter}
            options={['All', ...examTypes]}
          />

        </div>
      </div>

      {/* ── Orders table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Imaging Orders</h3>
          <span className="text-xs text-slate-400">
            {visible.length} result{visible.length !== 1 ? 's' : ''}
            {hasActiveFilters && ` of ${orders.length}`}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                  No orders match your search or filters.
                </td>
              </tr>
            ) : (
              visible.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : order.patientInitials}
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <StatusSelect orderId={order.id} status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  const active = value !== 'All'
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
          : 'border-slate-300 text-slate-600'
      }`}
    >
      {options.map(o => (
        <option key={o} value={o}>
          {o === 'All' ? `${label}: All` : o}
        </option>
      ))}
    </select>
  )
}
