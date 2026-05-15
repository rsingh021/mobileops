// Orders.jsx — The full orders page ("/orders").
// Shows all imaging orders with a filter bar so the user can narrow by status.

import { useState } from 'react'
// useState is a React hook that lets a component remember a value between renders.
// Here we use it to track which filter button is currently selected.

import { useOrders } from '../context/OrdersContext'
import StatusBadge from '../components/StatusBadge'

// The list of filter options shown as buttons above the table.
// 'All' shows every order; the other values match the status field on each order.
const statuses = ['All', 'Requested', 'Scheduled', 'Completed', 'Report Sent']

export default function Orders() {
  const { orders, loading, error } = useOrders()
  // filter = the currently selected status button (starts on 'All')
  // setFilter = the function that updates filter when a button is clicked
  const [filter, setFilter] = useState('All')

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

  // Compute which orders to display based on the selected filter.
  // If 'All' is selected, show every order.
  // Otherwise, use .filter() to keep only orders whose status matches the button.
  const visible = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-4">

      {/* ── Filter buttons ──────────────────────────────────── */}
      <div className="flex gap-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)} // Clicking a button updates the filter state
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              // Active button = filled blue; inactive = white with border
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

        {/* Table header bar — result count updates as the filter changes */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Imaging Orders</h3>
          {/* Ternary handles singular vs plural: "1 result" vs "3 results" */}
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
            </tr>
          </thead>

          <tbody>
            {/* If no orders match the filter, show a message instead of an empty table */}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              // Otherwise, render one row per visible order
              visible.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.patientInitials}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{order.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  )
}
