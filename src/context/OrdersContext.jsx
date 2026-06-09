import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PATIENT_SELECT = 'id, first_name, last_name, date_of_birth, phone, insurance_type, payer_name'

function toJS(row) {
  return {
    id:              row.id,
    facility:        row.facility,
    examType:        row.exam_type,
    patientInitials: row.patient_initials,
    patientId:       row.patient_id,
    patient: row.patients ? {
      id:            row.patients.id,
      firstName:     row.patients.first_name,
      lastName:      row.patients.last_name,
      dob:           row.patients.date_of_birth,
      phone:         row.patients.phone,
      insuranceType: row.patients.insurance_type ?? 'Self-Pay',
      payerName:     row.patients.payer_name     ?? null,
    } : null,
    status:             row.status,
    billingStatus:      row.billing_status,
    clinicalIndication: row.clinical_indication ?? null,
    date:               row.date,
    time:               row.time ?? null,
    authNumber:         row.auth_number         ?? null,
    insuranceVerified:  row.insurance_verified  ?? false,
    updatedAt:          row.updated_at,
    createdAt:          row.created_at,
  }
}

function toDB(order) {
  return {
    facility:           order.facility,
    exam_type:          order.examType,
    patient_initials:   order.patientInitials ?? null,
    patient_id:         order.patientId       ?? null,
    status:             order.status,
    billing_status:     order.billingStatus,
    clinical_indication: order.clinicalIndication ?? null,
    date:               order.date,
    time:               order.time             ?? null,
    auth_number:        order.authNumber        ?? null,
    insurance_verified: order.insuranceVerified ?? false,
  }
}

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`*, patients(${PATIENT_SELECT})`)
          .is('archived_at', null)
          .order('created_at', { ascending: false })

        if (cancelled) return
        if (error) throw error
        setOrders(data.map(toJS))
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrders()

    async function refetchRow(id) {
      const { data } = await supabase
        .from('orders')
        .select(`*, patients(${PATIENT_SELECT})`)
        .eq('id', id)
        .single()
      return data
    }

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async ({ new: row }) => {
        if (row.archived_at) return
        const data = await refetchRow(row.id)
        if (!data) return
        setOrders(cur => cur.some(o => o.id === data.id) ? cur : [toJS(data), ...cur])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async ({ new: row }) => {
        if (row.archived_at) {
          setOrders(cur => cur.filter(o => o.id !== row.id))
          return
        }
        const data = await refetchRow(row.id)
        if (!data) return
        setOrders(cur =>
          cur.some(o => o.id === data.id)
            ? cur.map(o => o.id === data.id ? toJS(data) : o)
            : [toJS(data), ...cur]
        )
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, ({ old: row }) => {
        setOrders(cur => cur.filter(o => o.id !== row.id))
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  async function addOrder(newOrder) {
    const { data, error } = await supabase
      .from('orders')
      .insert(toDB(newOrder))
      .select(`*, patients(${PATIENT_SELECT})`)
      .single()

    if (error) throw error
    setOrders(current => [toJS(data), ...current])
    return toJS(data)
  }

  async function updateOrder(id, changes) {
    const dbChanges = {
      ...(changes.facility           !== undefined && { facility:            changes.facility }),
      ...(changes.examType           !== undefined && { exam_type:           changes.examType }),
      ...(changes.patientInitials    !== undefined && { patient_initials:    changes.patientInitials }),
      ...(changes.patientId          !== undefined && { patient_id:          changes.patientId }),
      ...(changes.status             !== undefined && { status:              changes.status }),
      ...(changes.billingStatus      !== undefined && { billing_status:      changes.billingStatus }),
      ...(changes.clinicalIndication !== undefined && { clinical_indication: changes.clinicalIndication }),
      ...(changes.date               !== undefined && { date:                changes.date }),
      ...(changes.time               !== undefined && { time:               changes.time }),
      ...(changes.authNumber         !== undefined && { auth_number:         changes.authNumber }),
      ...(changes.insuranceVerified  !== undefined && { insurance_verified:  changes.insuranceVerified }),
    }

    const { data, error } = await supabase
      .from('orders')
      .update(dbChanges)
      .eq('id', id)
      .select(`*, patients(${PATIENT_SELECT})`)
      .single()

    if (error) throw error
    setOrders(current => current.map(o => o.id === id ? toJS(data) : o))
  }

  async function archiveOrder(id) {
    const { error } = await supabase
      .from('orders')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setOrders(current => current.filter(o => o.id !== id))
  }

  async function restoreOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .update({ archived_at: null })
      .eq('id', id)
      .select(`*, patients(${PATIENT_SELECT})`)
      .single()
    if (error) throw error
    setOrders(current => [toJS(data), ...current])
  }

  return (
    <OrdersContext.Provider value={{ orders, loading, error, addOrder, updateOrder, archiveOrder, restoreOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside an OrdersProvider')
  return context
}
