// NewOrder.jsx — The new order form page ("/orders/new").
// Submits a new order to Supabase via the addOrder function in context.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { facilities } from '../data/orders'
import { useOrders } from '../context/OrdersContext'

const examTypes = [
  'Venous Doppler',
  'Echocardiogram',
  'Abdominal Ultrasound',
  'Carotid Doppler',
  'Arterial Doppler',
  'Renal Ultrasound',
]

const statuses = ['Requested', 'Scheduled', 'Completed', 'Report Sent']

const billingStatuses = ['Not Started', 'Pending', 'Ready']

export default function NewOrder() {
  const navigate = useNavigate()
  const { addOrder } = useOrders()

  // submitting = true while waiting for Supabase to respond — disables the button to prevent double-submit
  // submitError = holds an error message if the Supabase insert fails
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [formData, setFormData] = useState({
    facility:        facilities[0]?.name ?? '',
    examType:        'Venous Doppler',
    patientInitials: '',
    status:          'Requested',
    billingStatus:   'Not Started',
    date:            new Date().toISOString().slice(0, 10), // Today in "YYYY-MM-DD" format
  })

  // Single handler for every input/select — reads `name` attribute to know which field changed
  function handleChange(event) {
    const { name, value } = event.target
    setFormData(current => ({ ...current, [name]: value }))
  }

  // handleSubmit is async because addOrder now makes a network call to Supabase
  async function handleSubmit(event) {
    event.preventDefault() // Prevent browser from reloading the page on form submit

    if (!formData.patientInitials.trim()) {
      alert('Please enter patient initials.')
      return
    }

    setSubmitting(true)  // Disable the submit button
    setSubmitError(null) // Clear any previous error

    try {
      // addOrder sends the data to Supabase and updates the shared context state
      await addOrder({
        ...formData,
        patientInitials: formData.patientInitials.trim().toUpperCase(),
      })

      // Only navigate away if the insert succeeded
      navigate('/orders')
    } catch (err) {
      // If Supabase returns an error, show it on the form instead of crashing
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create New Order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new imaging order to the MobileOps workflow.
        </p>
      </div>

      {/* Show a Supabase error below the heading if the insert failed */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error saving order: {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >

        {/* ── Facility ────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Facility</label>
          <select
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {facilities.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* ── Exam Type ───────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Exam Type</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {examTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ── Patient Initials ────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient Initials</label>
          <input
            name="patientInitials"
            value={formData.patientInitials}
            onChange={handleChange}
            placeholder="Example: J.D."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-slate-400">Use fake initials only. Do not enter real patient information.</p>
        </div>

        {/* ── Status / Billing Status / Date ──────────────── */}
        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Billing Status</label>
            <select
              name="billingStatus"
              value={formData.billingStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {billingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* ── Form actions ────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          {/* disabled while the Supabase insert is in flight to prevent double-submit */}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Create Order'}
          </button>
        </div>

      </form>
    </div>
  )
}
