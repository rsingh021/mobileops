import { useState } from 'react'
import { usePatients } from '../context/PatientsContext'
import { useToast } from '../context/ToastContext'
import { PAYERS } from '../data/payers'

export default function AddPatientModal({ onClose }) {
  const { addPatient } = usePatients()
  const { toast }      = useToast()

  const [formData, setFormData] = useState({
    firstName:     '',
    lastName:      '',
    dob:           '',
    phone:         '',
    insuranceType: 'Self-Pay',
    payerName:     '',
    memberId:      '',
    groupNumber:   '',
    policyHolder:  '',
  })
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState(null)

  const isInsurance = formData.insuranceType === 'Insurance'

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(cur => ({ ...cur, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      await addPatient({
        firstName:    formData.firstName.trim(),
        lastName:     formData.lastName.trim(),
        dob:          formData.dob   || null,
        phone:        formData.phone || null,
        insuranceType: formData.insuranceType,
        payerName:    isInsurance ? formData.payerName.trim()    || null : null,
        memberId:     isInsurance ? formData.memberId.trim()     || null : null,
        groupNumber:  isInsurance ? formData.groupNumber.trim()  || null : null,
        policyHolder: isInsurance ? formData.policyHolder.trim() || null : null,
      })
      toast('Patient added')
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-slate-800">Add Patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {saveError && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* ── Insurance ─────────────────────────────────────────────────── */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Insurance</p>

              <div className="flex gap-4">
                {['Self-Pay', 'Insurance'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insuranceType"
                      value={type}
                      checked={formData.insuranceType === type}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-slate-700">{type}</span>
                  </label>
                ))}
              </div>

              {isInsurance && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Payer / Insurance Company <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      list="add-payers-list"
                      name="payerName"
                      value={formData.payerName}
                      onChange={handleChange}
                      placeholder="Select or type..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <datalist id="add-payers-list">
                      {PAYERS.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Member ID <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        name="memberId"
                        value={formData.memberId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Group Number <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        name="groupNumber"
                        value={formData.groupNumber}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Policy Holder Name <span className="text-slate-400 font-normal">(if different from patient)</span>
                    </label>
                    <input
                      name="policyHolder"
                      value={formData.policyHolder}
                      onChange={handleChange}
                      placeholder="Leave blank if patient is the policy holder"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}
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
                {saving ? 'Adding...' : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
