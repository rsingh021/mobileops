import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useOrders } from '../context/OrdersContext'
import { useFacilities } from '../context/FacilitiesContext'
import { usePatients } from '../context/PatientsContext'
import { useToast } from '../context/ToastContext'

const TABS = ['Orders', 'Patients', 'Facilities']

export default function Archive() {
  const [tab, setTab] = useState('Orders')

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Archive</h1>
        <p className="mt-1 text-sm text-slate-500">Archived records are hidden from active views. Restore them at any time.</p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Orders'     && <ArchivedOrders />}
      {tab === 'Patients'   && <ArchivedPatients />}
      {tab === 'Facilities' && <ArchivedFacilities />}

    </div>
  )
}

// ── Archived Orders ────────────────────────────────────────────────────────────

function ArchivedOrders() {
  const navigate = useNavigate()
  const { restoreOrder } = useOrders()
  const { toast } = useToast()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, facility, exam_type, status, date, archived_at, patients(first_name, last_name), patient_initials')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  async function handleRestore(id) {
    setRestoring(id)
    await restoreOrder(id)
    setRows(r => r.filter(x => x.id !== id))
    setRestoring(null)
    toast('Order restored')
  }

  return (
    <ArchiveTable
      loading={loading}
      empty="No archived orders."
      headers={['Patient', 'Facility', 'Exam Type', 'Status', 'Date', 'Archived']}
    >
      {rows.map(r => (
        <tr key={r.id} className="border-b border-slate-50">
          <td className="px-5 py-3.5 text-sm text-slate-700">
            {r.patients
              ? `${r.patients.first_name} ${r.patients.last_name}`
              : r.patient_initials ?? '—'}
          </td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.facility}</td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.exam_type}</td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.status}</td>
          <td className="px-5 py-3.5 text-sm text-slate-400">{r.date ?? '—'}</td>
          <td className="px-5 py-3.5 text-xs text-slate-400">
            {new Date(r.archived_at).toLocaleDateString()}
          </td>
          <td className="px-5 py-3.5">
            <button
              onClick={() => handleRestore(r.id)}
              disabled={restoring === r.id}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
            >
              {restoring === r.id ? 'Restoring...' : 'Restore'}
            </button>
          </td>
        </tr>
      ))}
    </ArchiveTable>
  )
}

// ── Archived Patients ──────────────────────────────────────────────────────────

function ArchivedPatients() {
  const { restorePatient } = usePatients()
  const { toast } = useToast()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)

  useEffect(() => {
    supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth, phone, archived_at')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  async function handleRestore(id) {
    setRestoring(id)
    await restorePatient(id)
    setRows(r => r.filter(x => x.id !== id))
    setRestoring(null)
    toast('Patient restored')
  }

  return (
    <ArchiveTable
      loading={loading}
      empty="No archived patients."
      headers={['Name', 'Date of Birth', 'Phone', 'Archived']}
    >
      {rows.map(r => (
        <tr key={r.id} className="border-b border-slate-50">
          <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
            {r.last_name}, {r.first_name}
          </td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.date_of_birth ?? '—'}</td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.phone ?? '—'}</td>
          <td className="px-5 py-3.5 text-xs text-slate-400">
            {new Date(r.archived_at).toLocaleDateString()}
          </td>
          <td className="px-5 py-3.5">
            <button
              onClick={() => handleRestore(r.id)}
              disabled={restoring === r.id}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
            >
              {restoring === r.id ? 'Restoring...' : 'Restore'}
            </button>
          </td>
        </tr>
      ))}
    </ArchiveTable>
  )
}

// ── Archived Facilities ────────────────────────────────────────────────────────

function ArchivedFacilities() {
  const { restoreFacility } = useFacilities()
  const { toast } = useToast()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)

  useEffect(() => {
    supabase
      .from('facilities')
      .select('id, name, city, contact, archived_at')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  async function handleRestore(id) {
    setRestoring(id)
    await restoreFacility(id)
    setRows(r => r.filter(x => x.id !== id))
    setRestoring(null)
    toast('Facility restored')
  }

  return (
    <ArchiveTable
      loading={loading}
      empty="No archived facilities."
      headers={['Name', 'City', 'Contact', 'Archived']}
    >
      {rows.map(r => (
        <tr key={r.id} className="border-b border-slate-50">
          <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{r.name}</td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.city ?? '—'}</td>
          <td className="px-5 py-3.5 text-sm text-slate-600">{r.contact ?? '—'}</td>
          <td className="px-5 py-3.5 text-xs text-slate-400">
            {new Date(r.archived_at).toLocaleDateString()}
          </td>
          <td className="px-5 py-3.5">
            <button
              onClick={() => handleRestore(r.id)}
              disabled={restoring === r.id}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
            >
              {restoring === r.id ? 'Restoring...' : 'Restore'}
            </button>
          </td>
        </tr>
      ))}
    </ArchiveTable>
  )
}

// ── Shared table shell ────────────────────────────────────────────────────────

function ArchiveTable({ loading, empty, headers, children }) {
  if (loading) return (
    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Loading...</div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {/* children will be zero rows when empty */}
          {Array.isArray(children) && children.length === 0 ? (
            <tr>
              <td colSpan={headers.length + 1} className="px-5 py-10 text-center text-sm text-slate-400">
                {empty}
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}
