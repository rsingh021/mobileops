// StatusSelect.jsx — An inline dropdown that lets the user change an order's status directly
// from the table row, without opening a modal. Styled to look like the StatusBadge pill.

import { useState } from 'react'
import { useOrders } from '../context/OrdersContext'

const statusOptions = ['Requested', 'Scheduled', 'Completed', 'Report Sent', 'Billed']

// Same color map as StatusBadge — keeps the pill color consistent with the selected status
const colors = {
  Requested:    'bg-amber-100 text-amber-800',
  Scheduled:    'bg-blue-100 text-blue-800',
  Completed:    'bg-violet-100 text-violet-800',
  'Report Sent':'bg-green-100 text-green-800',
  Billed:       'bg-slate-100 text-slate-700',
}

// Props:
//   orderId — the id of the order row to update
//   status  — the current status value
export default function StatusSelect({ orderId, status }) {
  const { updateOrder } = useOrders()
  const [saving, setSaving] = useState(false) // disables the dropdown while the DB call is in flight

  async function handleChange(e) {
    setSaving(true)
    try {
      await updateOrder(orderId, { status: e.target.value })
    } catch (err) {
      console.error('Failed to update status:', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    // The select inherits the pill style of the current status color.
    // cursor-pointer makes it obvious it's interactive.
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer border-none outline-none appearance-none ${
        colors[status] ?? 'bg-slate-100 text-slate-700'
      } ${saving ? 'opacity-50 cursor-wait' : ''}`}
    >
      {statusOptions.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
