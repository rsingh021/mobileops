// App.jsx — The root layout shell of the entire application.
// Three responsibilities:
//   1. Wrap everything in BrowserRouter so React Router can track the URL.
//   2. Wrap everything in OrdersProvider so any page can read/write the orders list.
//   3. Render the persistent layout (Sidebar + Header) around whichever page is active.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
// BrowserRouter — listens to the browser's URL and provides routing context to everything inside it
// Routes      — looks at the current URL and renders only the matching Route
// Route       — pairs a URL path (e.g. "/orders") with a page component (e.g. <Orders />)

import { OrdersProvider } from './context/OrdersContext'
// OrdersProvider holds the shared orders array in state.
// It must wrap every component that calls useOrders() — so it goes here at the top level.

import Sidebar from './components/Sidebar' // Left nav — always visible
import Header from './components/Header'   // Top bar — always visible

// Page components — each one is rendered when its URL path is matched by a <Route>
import Dashboard  from './pages/Dashboard'
import Facilities from './pages/Facilities'
import Orders     from './pages/Orders'
import Schedule   from './pages/Schedule'
import Reports    from './pages/Reports'
import Billing    from './pages/Billing'
import NewOrder   from './pages/NewOrder'

export default function App() {
  return (
    // BrowserRouter must be the outermost wrapper so every component inside can use
    // routing hooks (useLocation, NavLink, useNavigate, etc.)
    <BrowserRouter>

      {/* OrdersProvider sits just inside BrowserRouter so it can eventually use
          routing too if needed, and so every page below can call useOrders(). */}
      <OrdersProvider>

        {/* Full-screen flex row: Sidebar on the left, everything else on the right.
            overflow-hidden prevents double scrollbars — only <main> scrolls. */}
        <div className="flex h-screen bg-slate-50 overflow-hidden">

          {/* Sidebar is fixed-width and never scrolls */}
          <Sidebar />

          {/* Right column: Header on top, scrollable page content below */}
          <div className="flex flex-col flex-1 min-w-0">

            {/* Header stays pinned at the top — shrink-0 prevents it from collapsing */}
            <Header />

            {/* Main content area — this is the only part that scrolls when content is tall */}
            <main className="flex-1 overflow-y-auto p-6">

              {/* Routes checks the URL and renders the first matching Route.
                  Only one page renders at a time. */}
              <Routes>
                <Route path="/"           element={<Dashboard />}  />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/orders"     element={<Orders />}     />
                <Route path="/orders/new" element={<NewOrder />}   />
                <Route path="/schedule"   element={<Schedule />}   />
                <Route path="/reports"    element={<Reports />}    />
                <Route path="/billing"    element={<Billing />}    />
              </Routes>

            </main>
          </div>
        </div>

      </OrdersProvider>
    </BrowserRouter>
  )
}
