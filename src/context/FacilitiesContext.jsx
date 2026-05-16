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
          .select('*')
          .order('name', { ascending: true }) // Alphabetical order

        if (error) throw error
        // Facility columns (name, city, contact) already match JS naming — no mapping needed
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
        contact: newFacility.contact,
      })
      .select()
      .single()

    if (error) throw error

    setFacilities(current => [...current, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  return (
    <FacilitiesContext.Provider value={{ facilities, loading, error, addFacility }}>
      {children}
    </FacilitiesContext.Provider>
  )
}

export function useFacilities() {
  const context = useContext(FacilitiesContext)
  if (!context) throw new Error('useFacilities must be used inside a FacilitiesProvider')
  return context
}
