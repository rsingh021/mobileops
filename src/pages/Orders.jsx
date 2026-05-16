// Orders.jsx — The full orders page ("/orders").
// Each row has an inline status dropdown and an Edit button that opens a full edit modal.

import { useState } from 'react'
import { useOrders } from '../context/OrdersContext'
import StatusSelect from '../components/StatusSelect'
import EditOrderModal from '../components/EditOrderModal'

const statuses = ['All', 'Requested', 'Scheduled', 'Completed', 'Report Sent', 'Billed']

export default function Orders() {
  const { orders, loading, error } = useOrders()
  const [filter, setFilter]         = useState('All')
  // editingOrder holds the order currently open in the edit modal, or null if none
  const [editingOrder, setEditingOrder] = useState(null)

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

  const visible = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-4">

      {/* Edit modal — only rendered when an order is selected for editing */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)} // Clear editingOrder to close the modal
        />
      )}

      {/* ── Filter buttons ──────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Orders table ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Imaging Orders</h3>
          <span className="text-xs text-slate-400">
            {visible.length} result{visible.length !== 1 ? 's' : ''}
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
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              visible.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                  <td className="px-5 py-3.5">
                    {/* Inline status dropdown — saves to Supabase on change */}
                    <StatusSelect orderId={order.id} status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>
                  <td className="px-5 py-3.5">
                    {/* Opens the full edit modal for this row */}
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
