import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toJS(row) {
  return {
    id:        row.id,
    firstName: row.first_name,
    lastName:  row.last_name,
    dob:       row.date_of_birth,
    phone:     row.phone,
  }
}

const PatientsContext = createContext(null)

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchPatients() {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .is('archived_at', null)
          .order('last_name', { ascending: true })

        if (error) throw error
        setPatients(data.map(toJS))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  // addPatient — inserts a new patient and appends to local state
  async function addPatient(newPatient) {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name:    newPatient.firstName,
        last_name:     newPatient.lastName,
        date_of_birth: newPatient.dob || null,
        phone:         newPatient.phone || null,
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
    <PatientsContext.Provider value={{ patients, loading, error, addPatient, archivePatient, restorePatient }}>
      {children}
    </PatientsContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientsContext)
  if (!context) throw new Error('usePatients must be used inside a PatientsProvider')
  return context
}
