// OrdersContext.jsx — Shared state for the orders list, now backed by Supabase.
//
// How it works:
//   1. When the app loads, useEffect fetches all orders from the database.
//   2. addOrder inserts a new row into the database, then adds it to local state.
//   3. Any page that calls useOrders() gets the live list + loading state.
//
// Column name mapping:
//   Supabase uses snake_case (exam_type, billing_status, patient_initials).
//   The React app uses camelCase (examType, billingStatus, patientInitials).
//   toJS() converts DB rows → JS objects. toDB() converts JS objects → DB rows.

import { createContext, useContext, useState, useEffect } from 'react'
// useEffect — runs code after the component mounts (used here to fetch orders on load)

import { supabase } from '../lib/supabase'
// The shared Supabase client — one connection for the whole app

// --- Column name helpers ---

// Converts a raw Supabase row (snake_case) into the shape the app uses (camelCase)
function toJS(row) {
  return {
    id:               row.id,
    facility:         row.facility,
    examType:         row.exam_type,
    patientInitials:  row.patient_initials,
    status:           row.status,
    billingStatus:    row.billing_status,
    date:             row.date,
  }
}

// Converts a JS order object (camelCase) into the shape Supabase expects (snake_case)
// Note: id and created_at are excluded — the database generates those automatically
function toDB(order) {
  return {
    facility:          order.facility,
    exam_type:         order.examType,
    patient_initials:  order.patientInitials,
    status:            order.status,
    billing_status:    order.billingStatus,
    date:              order.date,
  }
}

// --- Context setup ---

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)   // true while the first fetch is in flight
  const [error, setError]     = useState(null)   // holds an error message if the fetch fails

  // Fetch all orders from Supabase when the app first loads.
  // useEffect with an empty [] dependency array runs exactly once after the first render.
  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }) // Newest orders first

        if (error) throw error

        // Convert each DB row to the camelCase shape the app uses
        setOrders(data.map(toJS))
      } catch (err) {
        setError(err.message)
      } finally {
        // Always stop the loading spinner, even if the fetch failed
        setLoading(false)
      }
    }

    fetchOrders()
  }, []) // [] = run once on mount, never again

  // addOrder — inserts a new order into Supabase, then prepends it to local state.
  // Returns the saved order (with the real database ID) so callers can use it.
  async function addOrder(newOrder) {
    const { data, error } = await supabase
      .from('orders')
      .insert(toDB(newOrder))  // Convert to snake_case before sending to DB
      .select()                // Ask Supabase to return the newly created row
      .single()                // We inserted one row, so expect one row back

    if (error) throw error // Let the calling component handle the error

    // Add the new order (with its real DB id) to the top of the list
    setOrders(current => [toJS(data), ...current])

    return toJS(data)
  }

  // updateOrder — updates specific fields on an existing order in Supabase and local state.
  // `changes` is a partial JS object, e.g. { status: 'Completed' } or { billingStatus: 'Ready' }
  async function updateOrder(id, changes) {
    // Build a snake_case object containing only the fields that were passed in.
    // Fields not included in `changes` are left untouched in the database.
    const dbChanges = {
      ...(changes.facility        !== undefined && { facility:         changes.facility }),
      ...(changes.examType        !== undefined && { exam_type:        changes.examType }),
      ...(changes.patientInitials !== undefined && { patient_initials: changes.patientInitials }),
      ...(changes.status          !== undefined && { status:           changes.status }),
      ...(changes.billingStatus   !== undefined && { billing_status:   changes.billingStatus }),
      ...(changes.date            !== undefined && { date:             changes.date }),
    }

    const { data, error } = await supabase
      .from('orders')
      .update(dbChanges)
      .eq('id', id)  // Only update the row with this id
      .select()
      .single()

    if (error) throw error

    // Swap the updated order in local state so the UI reflects the change immediately
    setOrders(current => current.map(o => o.id === id ? toJS(data) : o))
  }

  return (
    <OrdersContext.Provider value={{ orders, loading, error, addOrder, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

// useOrders — the hook components call to access the shared orders state.
export function useOrders() {
  const context = useContext(OrdersContext)

  if (!context) {
    throw new Error('useOrders must be used inside an OrdersProvider')
  }

  return context
}
