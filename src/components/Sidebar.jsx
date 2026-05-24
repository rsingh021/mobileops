import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { label: 'Dashboard',  to: '/' },
  { label: 'Orders',     to: '/orders' },
  { label: 'Patients',   to: '/patients' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Upcoming',   to: '/upcoming' },
  { label: 'Schedule',   to: '/schedule' },
  { label: 'Reports',    to: '/reports' },
  { label: 'Billing',    to: '/billing' },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-56 bg-slate-900 flex flex-col shrink-0">

      {/* ── Brand ────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <p className="text-white font-bold text-base tracking-tight">MobileOps</p>
        <p className="text-slate-400 text-xs mt-0.5">Divine Imaging ATL</p>
      </div>

      {/* ── Nav links ────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Archive link ─────────────────────────────────────── */}
      <div className="px-2 pb-2">
        <NavLink
          to="/archive"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-700 text-slate-200'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`
          }
        >
          Archive
        </NavLink>
      </div>

      {/* ── User / sign out ───────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <p className="text-slate-300 text-xs font-medium truncate">{user?.email}</p>
        <button
          onClick={signOut}
          className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Sign out
        </button>
      </div>

    </aside>
  )
}
