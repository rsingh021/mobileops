import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'
import StatusSelect from '../components/StatusSelect'
import EditOrderModal from '../components/EditOrderModal'
import { EXAM_TYPES } from '../data/exams'

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

  // ── Pagination ─────────────────────────────────────────────────────────────
  const PAGE_SIZE = 25
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [search, statusFilter, billingFilter, facilityFilter, examFilter, sort])

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
        if (statusFilter   !== 'All' && o.status        !== statusFilter)   return false
        if (billingFilter  !== 'All' && o.billingStatus !== billingFilter)  return false
        if (facilityFilter !== 'All' && o.facility      !== facilityFilter) return false
        if (examFilter     !== 'All' && o.examType      !== examFilter)     return false

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

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = visible.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd   = Math.min(safePage * PAGE_SIZE, visible.length)

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
            options={['All', ...EXAM_TYPES]}
          />

        </div>
      </div>

      {/* ── Orders table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Imaging Orders</h3>
          <span className="text-xs text-slate-400">
            {visible.length === 0
              ? 'No results'
              : `${rangeStart}–${rangeEnd} of ${visible.length}${hasActiveFilters ? ` (filtered from ${orders.length})` : ''}`}
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  {orders.length === 0 ? (
                    <>
                      <p className="text-sm font-medium text-slate-600">No orders yet</p>
                      <p className="text-sm text-slate-400 mt-1">Create your first order to get started.</p>
                      <Link
                        to="/orders/new"
                        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        + Create First Order
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">No orders match your search or filters.</p>
                  )}
                </td>
              </tr>
            ) : (
              paginated.map(order => (
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

        {/* ── Pagination controls ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default"
            >
              ← Prev
            </button>
            <span className="text-sm text-slate-500">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default"
            >
              Next →
            </button>
          </div>
        )}

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
