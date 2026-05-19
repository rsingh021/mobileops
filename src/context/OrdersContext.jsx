// OrdersContext.jsx — Shared state for the orders list, backed by Supabase.
// Each order is fetched with its linked patient so pages have full name/info available.
// One patient → many orders. The join here just means "give me the one patient for this order."

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Converts a Supabase row (snake_case + nested patients object) → JS object (camelCase)
function toJS(row) {
  return {
    id:              row.id,
    facility:        row.facility,
    examType:        row.exam_type,
    patientInitials: row.patient_initials, // fallback for old records with no patient_id
    patientId:       row.patient_id,
    // patients is the joined row from the patients table (null if no patient linked yet)
    patient: row.patients ? {
      id:        row.patients.id,
      firstName: row.patients.first_name,
      lastName:  row.patients.last_name,
      dob:       row.patients.date_of_birth,
      phone:     row.patients.phone,
    } : null,
    status:        row.status,
    billingStatus: row.billing_status,
    date:          row.date,
    time:          row.time ?? null,
    updatedAt:     row.updated_at,
    createdAt:     row.created_at,
  }
}

// Converts a JS order object → Supabase insert/update shape (snake_case)
function toDB(order) {
  return {
    facility:         order.facility,
    exam_type:        order.examType,
    patient_initials: order.patientInitials ?? null,
    patient_id:       order.patientId ?? null,
    status:           order.status,
    billing_status:   order.billingStatus,
    date:             order.date,
    time:             order.time ?? null,
  }
}

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          // Join patients so each order includes the linked patient's info
          .select('*, patients(id, first_name, last_name, date_of_birth, phone)')
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data.map(toJS))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // addOrder — inserts a new order and returns it with the joined patient already attached
  async function addOrder(newOrder) {
    const { data, error } = await supabase
      .from('orders')
      .insert(toDB(newOrder))
      .select('*, patients(id, first_name, last_name, date_of_birth, phone)')
      .single()

    if (error) throw error
    setOrders(current => [toJS(data), ...current])
    return toJS(data)
  }

  // updateOrder — patches specific fields on an existing order
  async function updateOrder(id, changes) {
    const dbChanges = {
      ...(changes.facility        !== undefined && { facility:         changes.facility }),
      ...(changes.examType        !== undefined && { exam_type:        changes.examType }),
      ...(changes.patientInitials !== undefined && { patient_initials: changes.patientInitials }),
      ...(changes.patientId       !== undefined && { patient_id:       changes.patientId }),
      ...(changes.status          !== undefined && { status:           changes.status }),
      ...(changes.billingStatus   !== undefined && { billing_status:   changes.billingStatus }),
      ...(changes.date            !== undefined && { date:             changes.date }),
      ...(changes.time            !== undefined && { time:             changes.time }),
    }

    const { data, error } = await supabase
      .from('orders')
      .update(dbChanges)
      .eq('id', id)
      .select('*, patients(id, first_name, last_name, date_of_birth, phone)')
      .single()

    if (error) throw error
    setOrders(current => current.map(o => o.id === id ? toJS(data) : o))
  }

  return (
    <OrdersContext.Provider value={{ orders, loading, error, addOrder, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside an OrdersProvider')
  return context
}
