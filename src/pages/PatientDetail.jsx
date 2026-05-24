import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePatients } from '../context/PatientsContext'
import { useOrders } from '../context/OrdersContext'
import { useToast } from '../context/ToastContext'
import StatusBadge        from '../components/StatusBadge'
import ConfirmModal       from '../components/ConfirmModal'
import EditPatientModal   from '../components/EditPatientModal'

function formatTime(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { patients, loading: pLoading, archivePatient } = usePatients()
  const { orders,   loading: oLoading }                  = useOrders()

  const { toast } = useToast()
  const [editing,        setEditing]        = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)

  const patient = patients.find(p => String(p.id) === String(id))

  if (pLoading || oLoading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading...</div>
  )

  if (!patient) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Patient not found.{' '}
      <button onClick={() => navigate('/patients')} className="underline">Back to patients</button>
    </div>
  )

  const patientOrders = orders
    .filter(o => String(o.patientId) === String(id))
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date) - new Date(a.date)
    })

  const activeCount    = patientOrders.filter(o => o.status !== 'Billed' && o.status !== 'Completed').length
  const completedCount = patientOrders.filter(o => o.status === 'Completed' || o.status === 'Billed').length
  const facilities     = [...new Set(patientOrders.map(o => o.facility).filter(Boolean))]

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {editing && <EditPatientModal patient={patient} onClose={() => setEditing(false)} />}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Patients
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/orders/new', { state: { patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName, dob: patient.dob, phone: patient.phone, insuranceType: patient.insuranceType, payerName: patient.payerName } } })}
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            + New Order
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Patient
          </button>
        </div>
      </div>

      {/* ── Patient info card ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Patient</p>
        <h1 className="text-xl font-bold text-slate-800">
          {patient.firstName} {patient.lastName}
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          <Field label="Date of Birth" value={patient.dob   ?? '—'} />
          <Field label="Phone"         value={patient.phone ?? '—'} />
          <Field
            label="Facilities seen at"
            value={facilities.length > 0 ? facilities.join(', ') : '—'}
          />
        </div>

        {/* ── Insurance ─────────────────────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Insurance</p>
          {patient.insuranceType === 'Self-Pay' ? (
            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Self-Pay
            </span>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              <Field label="Payer"         value={patient.payerName    ?? '—'} />
              <Field label="Member ID"     value={patient.memberId     ?? '—'} />
              <Field label="Group Number"  value={patient.groupNumber  ?? '—'} />
              {patient.policyHolder && (
                <Field label="Policy Holder" value={patient.policyHolder} />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Orders"  value={patientOrders.length} />
        <StatCard label="Active"        value={activeCount}    accent="blue" />
        <StatCard label="Completed"     value={completedCount} accent="green" />
      </div>

      {/* ── Order history ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Order History</h3>
          <span className="text-xs text-slate-400">{patientOrders.length} total</span>
        </div>

        {patientOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No orders for this patient yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing</th>
              </tr>
            </thead>
            <tbody>
              {patientOrders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.date ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {order.time ? formatTime(order.time) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{order.facility}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.billingStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-red-700">Archive Patient</p>
          <p className="text-xs text-red-500 mt-0.5">
            {patientOrders.length > 0
              ? `This patient has ${patientOrders.length} order${patientOrders.length !== 1 ? 's' : ''} on record — they will remain intact.`
              : 'Removes from active list. Can be restored from the Archive page.'}
          </p>
        </div>
        <button
          onClick={() => setConfirmArchive(true)}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Archive
        </button>
      </section>

      {confirmArchive && (
        <ConfirmModal
          title="Archive this patient?"
          message={
            patientOrders.length > 0
              ? `${patient.firstName} ${patient.lastName} has ${patientOrders.length} linked order${patientOrders.length !== 1 ? 's' : ''}. Their orders will remain in the system — only the patient record will be archived.`
              : `${patient.firstName} ${patient.lastName} will be removed from the active patients list. You can restore them any time from the Archive page.`
          }
          confirmLabel="Archive Patient"
          danger
          onConfirm={async () => {
            await archivePatient(patient.id)
            toast('Patient archived')
            navigate('/patients')
          }}
          onClose={() => setConfirmArchive(false)}
        />
      )}

    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

const accentMap = { blue: 'text-blue-700', green: 'text-green-700' }

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accentMap[accent] ?? 'text-slate-800'}`}>{value}</p>
    </div>
  )
}
