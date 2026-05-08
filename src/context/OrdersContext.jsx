// OrdersContext.jsx — Shared state for the orders list.
//
// The problem this solves: multiple pages (Dashboard, Orders, Reports, Billing)
// all need to read the same orders list, and NewOrder needs to add to it.
// Without context, you'd have to pass orders and addOrder down as props through
// every component — which gets messy fast. Context lets any component grab them directly.
//
// How to use from any page or component:
//   const { orders, addOrder } = useOrders()

import { createContext, useContext, useState } from 'react'
// createContext — creates the context object (the "channel" components share)
// useContext   — lets a component read from that channel
// useState     — stores the orders list so React re-renders pages when it changes

import { orders as initialOrders } from '../data/orders'
// The mock data file is the starting point for the list.
// When Supabase is added, replace this with a fetch from the database.

// Create the context with null as default.
// The actual value is set by OrdersProvider below.
// Components must be inside OrdersProvider or useOrders() will throw.
const OrdersContext = createContext(null)

// OrdersProvider — wraps the app (in App.jsx) and makes orders available everywhere.
// Props:
//   children — everything nested inside <OrdersProvider> in App.jsx
export function OrdersProvider({ children }) {
  // orders = the live list of orders (starts from the mock data)
  // setOrders = the only way to update the list (React re-renders when this is called)
  const [orders, setOrders] = useState(initialOrders)

  // addOrder — prepends a new order to the top of the list.
  // Called by NewOrder.jsx when the form is submitted.
  function addOrder(newOrder) {
    setOrders(currentOrders => [
      {
        id: Date.now(),  // Temporary ID using timestamp — database will generate real IDs later
        ...newOrder,     // Spread all the form fields (facility, examType, etc.) into the object
      },
      ...currentOrders,  // Keep all existing orders after the new one
    ])
  }

  return (
    // .Provider makes the value available to every component inside it.
    // Any component that calls useOrders() gets { orders, addOrder } from here.
    <OrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

// useOrders — the custom hook components call to access orders and addOrder.
// Wrapping useContext in a custom hook gives a clear error message if someone
// forgets to put OrdersProvider above their component in the tree.
export function useOrders() {
  const context = useContext(OrdersContext)

  // If context is null, it means this hook was called outside of OrdersProvider
  if (!context) {
    throw new Error('useOrders must be used inside an OrdersProvider')
  }

  return context
}
