// NewOrder.jsx — The new order form page ("/orders/new").
// Lets the admin fill in details for a new imaging visit and submit it.
// On submit, the order is added to the shared context and the user is sent to /orders.

import { useState } from 'react'
// useState stores the form field values so React can track what the user types

import { useNavigate } from 'react-router-dom'
// useNavigate returns a function that programmatically changes the URL.
// Used here to redirect to /orders after a successful form submission.

import { facilities } from '../data/orders'
// The facility list is used to populate the Facility dropdown.

import { useOrders } from '../context/OrdersContext'
// useOrders gives us the addOrder function to add the new order to the shared list.

// Dropdown options for Exam Type
const examTypes = [
  'Venous Doppler',
  'Echocardiogram',
  'Abdominal Ultrasound',
  'Carotid Doppler',
  'Arterial Doppler',
  'Renal Ultrasound',
]

// Dropdown options for Order Status
const statuses = [
  'Requested',
  'Scheduled',
  'Completed',
  'Report Sent',
]

// Dropdown options for Billing Status
const billingStatuses = [
  'Not Started',
  'Pending',
  'Ready',
]

export default function NewOrder() {
  // navigate('/orders') will send the user to the orders page after submission
  const navigate = useNavigate()

  // Pull addOrder out of context — this is what saves the order to the shared list
  const { addOrder } = useOrders()

  // formData holds the current value of every field in the form.
  // Each key matches the `name` attribute on its input/select element.
  const [formData, setFormData] = useState({
    facility:        facilities[0]?.name ?? '',           // Default to first facility; ?? handles empty list
    examType:        'Venous Doppler',
    patientInitials: '',
    status:          'Requested',
    billingStatus:   'Not Started',
    date:            new Date().toISOString().slice(0, 10), // Today's date in "YYYY-MM-DD" format
  })

  // handleChange — single handler for every input/select in the form.
  // It reads the `name` attribute of the element that changed,
  // then updates only that field in formData (leaving the rest untouched).
  function handleChange(event) {
    const { name, value } = event.target

    setFormData(currentData => ({
      ...currentData,  // Copy all existing fields
      [name]: value,   // Overwrite only the field that changed ([name] is a computed property key)
    }))
  }

  // handleSubmit — runs when the user clicks "Create Order".
  function handleSubmit(event) {
    event.preventDefault() // Stops the browser from doing a full page reload on form submit

    // Basic validation — patient initials are required
    if (!formData.patientInitials.trim()) {
      alert('Please enter patient initials.')
      return // Stop here; don't submit
    }

    // Add the order to the shared context state.
    // .trim() removes accidental leading/trailing spaces.
    // .toUpperCase() normalizes "j.d." → "J.D."
    addOrder({
      ...formData,
      patientInitials: formData.patientInitials.trim().toUpperCase(),
    })

    // Redirect to the orders page so the user can see the new order in the list
    navigate('/orders')
  }

  return (
    // max-w-3xl keeps the form from stretching too wide on large screens
    <div className="mx-auto max-w-3xl space-y-4">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create New Order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new imaging order to the MobileOps workflow.
        </p>
      </div>

      {/* The form — onSubmit is wired to handleSubmit above */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >

        {/* ── Facility ──────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Facility
          </label>
          {/* name="facility" must match the key in formData for handleChange to work */}
          <select
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {facilities.map(facility => (
              <option key={facility.id} value={facility.name}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── Exam Type ─────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Exam Type
          </label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {examTypes.map(examType => (
              <option key={examType} value={examType}>
                {examType}
              </option>
            ))}
          </select>
        </div>

        {/* ── Patient Initials ──────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Patient Initials
          </label>
          {/* type="text" is the default so it's omitted here */}
          <input
            name="patientInitials"
            value={formData.patientInitials}
            onChange={handleChange}
            placeholder="Example: J.D."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            Use fake initials only. Do not enter real patient information.
          </p>
        </div>

        {/* ── Status / Billing Status / Date (3 columns) ───── */}
        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Billing Status
            </label>
            <select
              name="billingStatus"
              value={formData.billingStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {billingStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>
            {/* type="date" renders a native date picker in the browser */}
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* ── Form actions ──────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">

          {/* type="button" prevents this from accidentally submitting the form */}
          <button
            type="button"
            onClick={() => navigate('/orders')} // Go back to orders without saving
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          {/* type="submit" triggers onSubmit on the <form> element above */}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Order
          </button>

        </div>
      </form>
    </div>
  )
}
