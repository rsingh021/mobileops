import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider }       from './context/AuthContext'
import { ToastProvider }      from './context/ToastContext'
import { OrdersProvider }     from './context/OrdersContext'
import { FacilitiesProvider } from './context/FacilitiesContext'
import { PatientsProvider }   from './context/PatientsContext'
import { useAuth }            from './context/AuthContext'

import Sidebar from './components/Sidebar'
import Header  from './components/Header'

import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Facilities     from './pages/Facilities'
import Orders         from './pages/Orders'
import Schedule       from './pages/Schedule'
import Billing        from './pages/Billing'
import NewOrder       from './pages/NewOrder'
import OrderDetail    from './pages/OrderDetail'
import FacilityDetail from './pages/FacilityDetail'
import Patients       from './pages/Patients'
import PatientDetail  from './pages/PatientDetail'
import Archive        from './pages/Archive'
import Upcoming       from './pages/Upcoming'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null // still checking — avoid flash
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppShell() {
  return (
    <FacilitiesProvider>
    <PatientsProvider>
    <OrdersProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"               element={<Dashboard />}      />
              <Route path="/facilities"     element={<Facilities />}     />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/patients"       element={<Patients />}       />
              <Route path="/patients/:id"   element={<PatientDetail />}  />
              <Route path="/archive"        element={<Archive />}        />
              <Route path="/orders"         element={<Orders />}         />
              <Route path="/orders/new"     element={<NewOrder />}       />
              <Route path="/orders/:id"     element={<OrderDetail />}    />
              <Route path="/upcoming"       element={<Upcoming />}       />
              <Route path="/schedule"       element={<Schedule />}       />
              <Route path="/billing"        element={<Billing />}        />
            </Routes>
          </main>
        </div>
      </div>
    </OrdersProvider>
    </PatientsProvider>
    </FacilitiesProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
