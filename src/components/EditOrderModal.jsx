// EditOrderModal.jsx — A modal form that lets the admin edit any field on an existing order.
// Used when someone needs to reschedule, fix an exam type, correct initials, etc.
//
// Props:
//   order    — the full order object being edited
//   onClose  — function called to close the modal (cancel or after successful save)

import { useState } from 'react'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'

const examTypes = [
  'Venous Doppler',
  'Echocardiogram',
  'Abdominal Ultrasound',
  'Carotid Doppler',
  'Arterial Doppler',
  'Renal Ultrasound',
]

const statusOptions      = ['Requested', 'Scheduled', 'Completed', 'Report Sent', 'Billed']
const billingStatusOptions = ['Not Started', 'Pending', 'Ready']

export default function EditOrderModal({ order, onClose }) {
  const { updateOrder } = useOrders()
  const { facilities }  = useFacilities()

  // Pre-fill the form with the existing order's values
  const [formData, setFormData] = useState({
    facility:        order.facility,
    examType:        order.examType,
    patientInitials: order.patientInitials,
    status:          order.status,
    billingStatus:   order.billingStatus,
    date:            order.date,
  })

  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(current => ({ ...current, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.patientInitials.trim()) {
      alert('Patient initials are required.')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      await updateOrder(order.id, {
        ...formData,
        patientInitials: formData.patientInitials.trim().toUpperCase(),
      })
      onClose() // Close the modal only after a successful save
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  return (
    // Backdrop — clicking outside the modal closes it
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal panel — stopPropagation prevents clicks inside from closing the modal */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Edit Order</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Error message from Supabase if save fails */}
        {saveError && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* ── Facility ──────────────────────────────────── */}
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

          {/* ── Exam Type ─────────────────────────────────── */}
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

          {/* ── Patient Initials ──────────────────────────── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient Initials</label>
            <input
              name="patientInitials"
              value={formData.patientInitials}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ── Status / Billing Status / Date ────────────── */}
          <div className="grid grid-cols-3 gap-3">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Billing</label>
              <select
                name="billingStatus"
                value={formData.billingStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {billingStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
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

          {/* ── Actions ───────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
