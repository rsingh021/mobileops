import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toJS(row) {
  return {
    id:            row.id,
    firstName:     row.first_name,
    lastName:      row.last_name,
    dob:           row.date_of_birth,
    phone:         row.phone,
    insuranceType: row.insurance_type ?? 'Self-Pay',
    payerName:     row.payer_name     ?? null,
    memberId:      row.member_id      ?? null,
    groupNumber:   row.group_number   ?? null,
    policyHolder:  row.policy_holder  ?? null,
  }
}

const PatientsContext = createContext(null)

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPatients() {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .is('archived_at', null)
          .order('last_name', { ascending: true })

        if (cancelled) return
        if (error) throw error
        setPatients(data.map(toJS))
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPatients()

    const byLastName = (a, b) => a.lastName.localeCompare(b.lastName)

    const channel = supabase
      .channel('patients-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patients' }, ({ new: row }) => {
        if (row.archived_at) return
        const patient = toJS(row)
        setPatients(cur => cur.some(p => p.id === patient.id) ? cur : [...cur, patient].sort(byLastName))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, ({ new: row }) => {
        if (row.archived_at) {
          setPatients(cur => cur.filter(p => p.id !== row.id))
          return
        }
        const patient = toJS(row)
        setPatients(cur =>
          cur.some(p => p.id === patient.id)
            ? cur.map(p => p.id === patient.id ? patient : p).sort(byLastName)
            : [...cur, patient].sort(byLastName)
        )
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'patients' }, ({ old: row }) => {
        setPatients(cur => cur.filter(p => p.id !== row.id))
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  async function addPatient(newPatient) {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name:    newPatient.firstName,
        last_name:     newPatient.lastName,
        date_of_birth: newPatient.dob   || null,
        phone:         newPatient.phone || null,
        insurance_type: newPatient.insuranceType ?? 'Self-Pay',
        payer_name:    newPatient.payerName    || null,
        member_id:     newPatient.memberId     || null,
        group_number:  newPatient.groupNumber  || null,
        policy_holder: newPatient.policyHolder || null,
      })
      .select()
      .single()

    if (error) throw error
    const patient = toJS(data)
    setPatients(current => [...current, patient].sort((a, b) =>
      a.lastName.localeCompare(b.lastName)
    ))
    return patient
  }

  async function updatePatient(id, changes) {
    const { data, error } = await supabase
      .from('patients')
      .update({
        ...(changes.firstName     !== undefined && { first_name:     changes.firstName }),
        ...(changes.lastName      !== undefined && { last_name:      changes.lastName }),
        ...(changes.dob           !== undefined && { date_of_birth:  changes.dob }),
        ...(changes.phone         !== undefined && { phone:          changes.phone }),
        ...(changes.insuranceType !== undefined && { insurance_type: changes.insuranceType }),
        ...(changes.payerName     !== undefined && { payer_name:     changes.payerName }),
        ...(changes.memberId      !== undefined && { member_id:      changes.memberId }),
        ...(changes.groupNumber   !== undefined && { group_number:   changes.groupNumber }),
        ...(changes.policyHolder  !== undefined && { policy_holder:  changes.policyHolder }),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    const patient = toJS(data)
    setPatients(cur =>
      cur.map(p => p.id === id ? patient : p).sort((a, b) => a.lastName.localeCompare(b.lastName))
    )
    return patient
  }

  async function archivePatient(id) {
    const { error } = await supabase
      .from('patients')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setPatients(current => current.filter(p => p.id !== id))
  }

  async function restorePatient(id) {
    const { data, error } = await supabase
      .from('patients')
      .update({ archived_at: null })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    setPatients(current => [...current, toJS(data)].sort((a, b) => a.lastName.localeCompare(b.lastName)))
  }

  return (
    <PatientsContext.Provider value={{ patients, loading, error, addPatient, updatePatient, archivePatient, restorePatient }}>
      {children}
    </PatientsContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientsContext)
  if (!context) throw new Error('usePatients must be used inside a PatientsProvider')
  return context
}
