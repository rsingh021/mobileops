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
    async function fetchFacilities() {
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('id, name, city, address, contact, phone')
          .order('name', { ascending: true })

        if (error) throw error
        setFacilities(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
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

  return (
    <FacilitiesContext.Provider value={{ facilities, loading, error, addFacility, updateFacility }}>
      {children}
    </FacilitiesContext.Provider>
  )
}

export function useFacilities() {
  const context = useContext(FacilitiesContext)
  if (!context) throw new Error('useFacilities must be used inside a FacilitiesProvider')
  return context
}
