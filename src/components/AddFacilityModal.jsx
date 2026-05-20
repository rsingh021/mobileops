import { useState } from 'react'
import { useFacilities } from '../context/FacilitiesContext'
import { useToast } from '../context/ToastContext'

export default function AddFacilityModal({ onClose }) {
  const { addFacility } = useFacilities()
  const { toast }       = useToast()

  const [formData, setFormData] = useState({
    name:    '',
    city:    '',
    address: '',
    contact: '',
    phone:   '',
  })
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(cur => ({ ...cur, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Facility name is required.')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      await addFacility({
        name:    formData.name.trim(),
        city:    formData.city.trim()    || null,
        address: formData.address.trim() || null,
        contact: formData.contact.trim() || null,
        phone:   formData.phone.trim()   || null,
      })
      toast('Facility added')
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Add Facility</h2>
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Northside Medical Center"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Atlanta"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 000-0000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, Suite 400"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact Person</label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              {saving ? 'Saving...' : 'Add Facility'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
