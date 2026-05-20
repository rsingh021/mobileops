// FacilitiesContext.jsx — Shared state for the facilities list, backed by Supabase.
// Same pattern as OrdersContext: fetch on load, expose an addFacility function.
//
// How to use from any page or component:
//   const { facilities, loading, error } = useFacilities()

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FacilitiesContext = createContext(null)

export function FacilitiesProvider({ children }) {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // Fetch all facilities from Supabase when the app first loads
  useEffect(() => {
    let cancelled = false

    async function fetchFacilities() {
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('id, name, city, address, contact, phone')
          .is('archived_at', null)
          .order('name', { ascending: true })

        if (cancelled) return
        if (error) throw error
        setFacilities(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchFacilities()

    const byName = (a, b) => a.name.localeCompare(b.name)

    const channel = supabase
      .channel('facilities-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'facilities' }, ({ new: row }) => {
        if (row.archived_at) return
        setFacilities(cur => cur.some(f => f.id === row.id) ? cur : [...cur, row].sort(byName))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'facilities' }, ({ new: row }) => {
        if (row.archived_at) {
          setFacilities(cur => cur.filter(f => f.id !== row.id))
          return
        }
        setFacilities(cur =>
          cur.some(f => f.id === row.id)
            ? cur.map(f => f.id === row.id ? row : f).sort(byName)
            : [...cur, row].sort(byName)
        )
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'facilities' }, ({ old: row }) => {
        setFacilities(cur => cur.filter(f => f.id !== row.id))
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  // addFacility — inserts a new facility into Supabase and prepends it to local state
  async function addFacility(newFacility) {
    const { data, error } = await supabase
      .from('facilities')
      .insert({
        name:    newFacility.name,
        city:    newFacility.city,
        address: newFacility.address ?? null,
        contact: newFacility.contact,
        phone:   newFacility.phone ?? null,
      })
      .select()
      .single()

    if (error) throw error

    setFacilities(current => [...current, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function updateFacility(id, changes) {
    const { data, error } = await supabase
      .from('facilities')
      .update({
        ...(changes.name    !== undefined && { name:    changes.name }),
        ...(changes.city    !== undefined && { city:    changes.city }),
        ...(changes.address !== undefined && { address: changes.address }),
        ...(changes.contact !== undefined && { contact: changes.contact }),
        ...(changes.phone   !== undefined && { phone:   changes.phone }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setFacilities(current =>
      current.map(f => f.id === id ? data : f).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data
  }

  async function archiveFacility(id) {
    const { error } = await supabase
      .from('facilities')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setFacilities(current => current.filter(f => f.id !== id))
  }

  async function restoreFacility(id) {
    const { data, error } = await supabase
      .from('facilities')
      .update({ archived_at: null })
      .eq('id', id)
      .select('id, name, city, address, contact, phone')
      .single()
    if (error) throw error
    setFacilities(current => [...current, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  return (
    <FacilitiesContext.Provider value={{ facilities, loading, error, addFacility, updateFacility, archiveFacility, restoreFacility }}>
      {children}
    </FacilitiesContext.Provider>
  )
}

export function useFacilities() {
  const context = useContext(FacilitiesContext)
  if (!context) throw new Error('useFacilities must be used inside a FacilitiesProvider')
  return context
}
