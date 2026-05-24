// NewOrder.jsx — Two-step order creation flow.
// Step 1: Find or create the patient.
// Step 2: Fill in order details, then submit linked to the patient.

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import { EXAM_TYPES } from '../data/exams'
import IndicationInput from '../components/IndicationInput'

const statusOptions  = ['Requested', 'Scheduled', 'Completed', 'Report Sent', 'Billed']
const billingOptions = ['Not Started', 'Pending', 'Ready']

export default function NewOrder() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const prefill    = location.state ?? {}

  const { addOrder }   = useOrders()
  const { facilities } = useFacilities()
  const { toast }      = useToast()

  // ── Step tracking ─────────────────────────────────────────────────────────
  // If a patient was passed in via navigation state, skip straight to step 2
  const [step, setStep] = useState(prefill.patient ? 2 : 1)

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [searchFirst, setSearchFirst] = useState('')
  const [searchLast,  setSearchLast]  = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searched, setSearched]           = useState(false)
  const [searching, setSearching]         = useState(false)

  const [newPatientDob,   setNewPatientDob]   = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [creatingPatient, setCreatingPatient] = useState(false)
  const [patientError,    setPatientError]    = useState(null)

  // Pre-filled from PatientDetail navigation, or null until selected in step 1
  const [selectedPatient, setSelectedPatient] = useState(prefill.patient ?? null)

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const today = new Date()
  const todayYMD = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const [orderData, setOrderData] = useState({
    facility:           prefill.facilityName ?? '',
    examType:           EXAM_TYPES[0],
    status:             'Requested',
    billingStatus:      'Not Started',
    clinicalIndication: '',
    date:               todayYMD,
    time:               '',
    authNumber:         '',
    insuranceVerified:  false,
  })
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Default facility once loaded — only if not pre-filled
  useEffect(() => {
    if (facilities.length > 0 && !orderData.facility) {
      setOrderData(cur => ({ ...cur, facility: facilities[0].name }))
    }
  }, [facilities])

  // ── Step 1 helpers ────────────────────────────────────────────────────────

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchFirst.trim() || !searchLast.trim()) return

    setSearching(true)
    setPatientError(null)

    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth, phone, insurance_type, payer_name')
      .ilike('first_name', `%${searchFirst.trim()}%`)
      .ilike('last_name',  `%${searchLast.trim()}%`)
      .order('last_name', { ascending: true })

    setSearching(false)
    setSearched(true)

    if (error) {
      setPatientError(error.message)
      setSearchResults([])
    } else {
      setSearchResults(data)
    }
  }

  function selectPatient(row) {
    setSelectedPatient({
      id:            row.id,
      firstName:     row.first_name,
      lastName:      row.last_name,
      dob:           row.date_of_birth,
      phone:         row.phone,
      insuranceType: row.insurance_type ?? 'Self-Pay',
      payerName:     row.payer_name     ?? null,
    })
    setStep(2)
  }

  async function handleCreatePatient() {
    setCreatingPatient(true)
    setPatientError(null)

    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name:    searchFirst.trim(),
        last_name:     searchLast.trim(),
        date_of_birth: newPatientDob  || null,
        phone:         newPatientPhone || null,
      })
      .select()
      .single()

    if (error) {
      // 23505 = unique violation — patient already exists (race condition / duplicate)
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('patients')
          .select('id, first_name, last_name, date_of_birth, phone')
          .ilike('first_name', searchFirst.trim())
          .ilike('last_name',  searchLast.trim())
          .limit(1)
          .single()

        if (existing) {
          setCreatingPatient(false)
          selectPatient(existing)
          return
        }
      }
      setPatientError(error.message)
      setCreatingPatient(false)
      return
    }

    setCreatingPatient(false)
    selectPatient(data)
  }

  // ── Step 2 helpers ────────────────────────────────────────────────────────

  function handleOrderChange(e) {
    const { name, value } = e.target
    setOrderData(cur => ({ ...cur, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const initials =
      `${selectedPatient.firstName[0].toUpperCase()}.${selectedPatient.lastName[0].toUpperCase()}.`

    try {
      await addOrder({
        ...orderData,
        patientId:       selectedPatient.id,
        patientInitials: initials,
      })
      toast('Order created')
      navigate('/orders')
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create New Order</h1>
        <p className="mt-1 text-sm text-slate-500">Add a new imaging order to the workflow.</p>
      </div>

      {/* ── Step indicator ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {[1, 2].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === n
                ? 'bg-blue-600 text-white'
                : step > n
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-500'
            }`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm font-medium ${step >= n ? 'text-slate-700' : 'text-slate-400'}`}>
              {n === 1 ? 'Patient' : 'Order Details'}
            </span>
            {n < 2 && <div className="w-10 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Patient search / create ──────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">

          <h2 className="font-semibold text-slate-800">Find or Create Patient</h2>

          {/* Search form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                <input
                  value={searchFirst}
                  onChange={e => { setSearchFirst(e.target.value); setSearched(false) }}
                  placeholder="First"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  value={searchLast}
                  onChange={e => { setSearchLast(e.target.value); setSearched(false) }}
                  placeholder="Last"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={searching || !searchFirst.trim() || !searchLast.trim()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {patientError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {patientError}
            </div>
          )}

          {/* Search results */}
          {searched && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">
                {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found — select one to continue:
              </p>
              {searchResults.map(row => (
                <button
                  key={row.id}
                  onClick={() => selectPatient(row)}
                  className="w-full text-left rounded-lg border border-slate-200 px-4 py-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {row.first_name} {row.last_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {row.date_of_birth ? `DOB: ${row.date_of_birth}` : 'No DOB on file'}
                    {row.phone ? `  ·  ${row.phone}` : ''}
                  </p>
                </button>
              ))}

              <p className="text-xs text-slate-400 pt-1">Not the right patient? Fill in the details below to create a new one.</p>
            </div>
          )}

          {/* No results — offer to create */}
          {searched && searchResults.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No patients found for "{searchFirst} {searchLast}". Fill in the details below to create a new patient record.
            </div>
          )}

          {/* Create new patient — shown after a search is run */}
          {searched && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700">Create new patient: <span className="text-blue-700">{searchFirst} {searchLast}</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of Birth <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="date"
                    value={newPatientDob}
                    onChange={e => setNewPatientDob(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="tel"
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <button
                onClick={handleCreatePatient}
                disabled={creatingPatient}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPatient ? 'Creating...' : 'Create Patient & Continue'}
              </button>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={() => navigate('/orders')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Order Details ─────────────────────────────────────────── */}
      {step === 2 && selectedPatient && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">

          {/* Selected patient banner */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {selectedPatient.dob ? `DOB: ${selectedPatient.dob}` : 'No DOB'}
                {selectedPatient.phone ? `  ·  ${selectedPatient.phone}` : ''}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {selectedPatient.insuranceType === 'Insurance'
                  ? `Insurance${selectedPatient.payerName ? `: ${selectedPatient.payerName}` : ''}`
                  : 'Self-Pay'}
              </p>
            </div>
            <button
              onClick={() => { setStep(1); setSelectedPatient(null) }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0"
            >
              Change patient
            </button>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Facility</label>
              <select
                name="facility"
                value={orderData.facility}
                onChange={handleOrderChange}
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
                value={orderData.examType}
                onChange={e => {
                  handleOrderChange(e)
                  setOrderData(cur => ({ ...cur, clinicalIndication: '' }))
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
                examType={orderData.examType}
                value={orderData.clinicalIndication}
                onChange={val => setOrderData(cur => ({ ...cur, clinicalIndication: val }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select
                  name="status"
                  value={orderData.status}
                  onChange={handleOrderChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Billing</label>
                <select
                  name="billingStatus"
                  value={orderData.billingStatus}
                  onChange={handleOrderChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {billingOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={orderData.date}
                  onChange={handleOrderChange}
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
                  value={orderData.time}
                  onChange={handleOrderChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {selectedPatient?.insuranceType === 'Insurance' && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Authorization</p>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Auth Number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      name="authNumber"
                      value={orderData.authNumber}
                      onChange={handleOrderChange}
                      placeholder="Authorization #"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={orderData.insuranceVerified}
                      onChange={e => setOrderData(cur => ({ ...cur, insuranceVerified: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Insurance Verified</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
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
      )}

    </div>
  )
}
