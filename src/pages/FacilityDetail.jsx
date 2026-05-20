import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilities } from '../context/FacilitiesContext'
import { useOrders } from '../context/OrdersContext'
import { useToast } from '../context/ToastContext'
import StatusBadge       from '../components/StatusBadge'
import EditFacilityModal from '../components/EditFacilityModal'
import ConfirmModal      from '../components/ConfirmModal'

export default function FacilityDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { facilities, loading: facilitiesLoading, archiveFacility } = useFacilities()
  const { orders,     loading: ordersLoading }                       = useOrders()

  const { toast } = useToast()
  const [editing,        setEditing]        = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)

  const facility = facilities.find(f => String(f.id) === String(id))

  if (facilitiesLoading || ordersLoading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      Loading...
    </div>
  )

  if (!facility) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      Facility not found.{' '}
      <button onClick={() => navigate('/facilities')} className="underline">Back to facilities</button>
    </div>
  )

  // All orders for this facility, newest first
  const facilityOrders = orders
    .filter(o => o.facility === facility.name)
    .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0))

  const activeCount    = facilityOrders.filter(o => o.status !== 'Billed' && o.status !== 'Completed').length
  const completedCount = facilityOrders.filter(o => o.status === 'Completed' || o.status === 'Billed').length
  const recentOrders   = facilityOrders.slice(0, 10)

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {editing && (
        <EditFacilityModal facility={facility} onClose={() => setEditing(false)} />
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/facilities')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          ← Facilities
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/orders/new', { state: { facilityName: facility.name } })}
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            + New Order
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Facility
          </button>
        </div>
      </div>

      {/* ── Facility info ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Facility</p>
        <h1 className="text-xl font-bold text-slate-800">{facility.name}</h1>

        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
          <Field label="City"           value={facility.city    ?? '—'} />
          <Field label="Address"        value={facility.address ?? '—'} />
          <Field label="Contact Person" value={facility.contact ?? '—'} />
          <Field label="Phone"          value={facility.phone   ?? '—'} />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Orders"     value={facilityOrders.length} />
        <StatCard label="Active Orders"    value={activeCount}    accent="blue" />
        <StatCard label="Completed"        value={completedCount} accent="green" />
      </div>

      {/* ── Recent order history ──────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Orders</h3>
          <span className="text-xs text-slate-400">
            {recentOrders.length} of {facilityOrders.length}
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No orders for this facility yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-sm text-slate-800">
                    {order.patient
                      ? `${order.patient.firstName} ${order.patient.lastName}`
                      : order.patientInitials ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{order.examType}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{order.date ?? '—'}</td>
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
          <p className="text-sm font-semibold text-red-700">Archive Facility</p>
          <p className="text-xs text-red-500 mt-0.5">
            {facilityOrders.length > 0
              ? `This facility has ${facilityOrders.length} order${facilityOrders.length !== 1 ? 's' : ''} on record — they will remain intact.`
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
          title="Archive this facility?"
          message={
            facilityOrders.length > 0
              ? `This facility has ${facilityOrders.length} linked order${facilityOrders.length !== 1 ? 's' : ''}. They will remain in the system — only the facility will be archived.`
              : 'It will be removed from the active facilities list. You can restore it any time from the Archive page.'
          }
          confirmLabel="Archive Facility"
          danger
          onConfirm={async () => {
            await archiveFacility(facility.id)
            toast('Facility archived')
            navigate('/facilities')
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

const accentMap = {
  blue:  'text-blue-700',
  green: 'text-green-700',
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accentMap[accent] ?? 'text-slate-800'}`}>{value}</p>
    </div>
  )
}
