// Header.jsx — The top bar shown on every page.
// Automatically displays the correct page title based on the current URL,
// and links to the New Order form.

import { useLocation, Link } from 'react-router-dom'
// useLocation — React Router hook that returns the current URL info (pathname, etc.)
// Link        — React Router's navigation component; navigates without a full page reload

// Maps each URL path to the title shown in the header.
// If you add a new page, add its path and label here too.
const titles = {
  '/':           'Dashboard',
  '/facilities': 'Facilities',
  '/orders':     'Orders',
  '/orders/new': 'New Order',
  '/schedule':   'Schedule',
  '/reports':    'Reports',
  '/billing':    'Billing',
}

export default function Header() {
  // pathname is the current URL path, e.g. "/" or "/orders"
  const { pathname } = useLocation()

  return (
    // shrink-0 = don't let this compress when the content below is tall
    // justify-between = pushes the title to the left and the button/date to the right
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">

      {/* Page title — looks up the current URL in the titles map above.
          ?? 'MobileOps' is a fallback if somehow the path isn't in the map. */}
      <h2 className="text-lg font-semibold text-slate-800">
        {titles[pathname] ?? 'MobileOps'}
      </h2>

      {/* Right side: date display + New Order button */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">May 7, 2026</span>

        {/* Link navigates to the New Order form page without a browser refresh.
            Styled to look like a button using Tailwind classes. */}
        <Link
          to="/orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          + New Order
        </Link>
      </div>

    </header>
  )
}
