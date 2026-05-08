// Sidebar.jsx — The persistent left navigation panel.
// Renders a vertical list of links. The currently active link is highlighted in blue automatically.

import { NavLink } from 'react-router-dom'
// NavLink is like a regular anchor <a> tag but it's aware of the current URL.
// It accepts a function for className that receives { isActive }, so you can style the active link differently.

// Navigation items — each entry becomes one link in the sidebar.
// To add a new page: add it here, create the page file, and add a Route in App.jsx.
const nav = [
  { label: 'Dashboard',  to: '/' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Orders',     to: '/orders' },
  { label: 'Schedule',   to: '/schedule' },
  { label: 'Reports',    to: '/reports' },
  { label: 'Billing',    to: '/billing' },
]

export default function Sidebar() {
  return (
    // <aside> is a semantic HTML element that tells browsers/screen readers this is a sidebar
    // w-56 = fixed 224px width | shrink-0 = never compress even if the window is narrow
    // flex flex-col = stacks children vertically (logo section → nav → footer)
    <aside className="w-56 bg-slate-900 flex flex-col shrink-0">

      {/* ── Logo / brand section ─────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <p className="text-white font-bold text-base tracking-tight">MobileOps</p>
        <p className="text-slate-400 text-xs mt-0.5">Divine Imaging ATL</p>
      </div>

      {/* ── Nav links ────────────────────────────────────────── */}
      {/* flex-1 makes this section grow and fill space, which pushes the footer to the bottom */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">

        {/* Loop over the nav array and render a NavLink for each item */}
        {nav.map(({ label, to }) => (
          <NavLink
            key={to}         // React requires a unique key when rendering a list — we use the path
            to={to}          // The URL this link navigates to when clicked
            end={to === '/'} // "end" means: only mark as active when path is EXACTLY "/"
                             // Without this, Dashboard would stay highlighted on every page
                             // because every path starts with "/"
            className={({ isActive }) =>
              // isActive is true when this link's path matches the current URL
              // Ternary: active → blue pill, inactive → dimmed with hover effect
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

      {/* ── Footer / user info ───────────────────────────────── */}
      {/* Hardcoded for now — replace with real user data after auth is added */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <p className="text-slate-300 text-sm font-medium">Admin</p>
        <p className="text-slate-500 text-xs truncate">mobileops@divine.com</p>
      </div>

    </aside>
  )
}
