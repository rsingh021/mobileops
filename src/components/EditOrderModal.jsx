import { useState } from 'react'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'
import { useToast } from '../context/ToastContext'
import { EXAM_TYPES } from '../data/exams'
import IndicationInput from './IndicationInput'

const statusOptions        = ['Scheduled', 'Completed', 'Report Sent', 'Billed']
const billingStatusOptions = ['Not Started', 'Pending', 'Ready']

export default function EditOrderModal({ order, onClose }) {
  const { updateOrder } = useOrders()
  const { facilities }  = useFacilities()
  const { toast }       = useToast()

  const [formData, setFormData] = useState({
    facility:           order.facility,
    examType:           order.examType,
    patientInitials:    order.patientInitials,
    status:             order.status,
    billingStatus:      order.billingStatus,
    clinicalIndication: order.clinicalIndication ?? '',
    date:               order.date,
    time:               order.time              ?? '',
    authNumber:         order.authNumber         ?? '',
    insuranceVerified:  order.insuranceVerified  ?? false,
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
        patientInitials:    formData.patientInitials.trim().toUpperCase(),
        clinicalIndication: formData.clinicalIndication.trim() || null,
        authNumber:         formData.authNumber.trim() || null,
      })
      toast('Order updated')
      onClose()
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Edit Order</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {saveError && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {order.patient && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Patient</p>
              <p className="text-sm font-medium text-slate-800">
                {order.patient.firstName} {order.patient.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.patient.dob ? `DOB: ${order.patient.dob}` : 'No DOB on file'}
                {order.patient.phone ? `  ·  ${order.patient.phone}` : ''}
              </p>
            </div>
          )}

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Exam Type</label>
            <select
              name="examType"
              value={formData.examType}
              onChange={e => {
                handleChange(e)
                setFormData(cur => ({ ...cur, clinicalIndication: '' }))
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {EXAM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Clinical Indication</label>
            <IndicationInput
              examType={formData.examType}
              value={formData.clinicalIndication}
              onChange={val => setFormData(cur => ({ ...cur, clinicalIndication: val }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient Initials</label>
            <input
              name="patientInitials"
              value={formData.patientInitials}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Time <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {order.patient?.insuranceType === 'Insurance' && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Authorization</p>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Auth Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    name="authNumber"
                    value={formData.authNumber}
                    onChange={handleChange}
                    placeholder="Authorization #"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={formData.insuranceVerified}
                    onChange={e => setFormData(cur => ({ ...cur, insuranceVerified: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Insurance Verified</span>
                </label>
              </div>
            </div>
          )}

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
