// StatusBadge.jsx — A small colored pill label that displays an order's status.
// Used in the orders table on multiple pages.
// Centralizing it here means you only define the color logic once.

// Maps each status string to a pair of Tailwind color classes (background + text).
// This is called a "lookup object" — faster and cleaner than a chain of if/else statements.
const colors = {
  Requested:    'bg-amber-100 text-amber-800',   // Yellow  — order placed, not yet scheduled
  Scheduled:    'bg-blue-100 text-blue-800',     // Blue    — on the calendar
  Completed:    'bg-violet-100 text-violet-800', // Purple  — exam done, report not sent yet
  'Report Sent':'bg-green-100 text-green-800',   // Green   — report delivered to facility
  Billed:       'bg-slate-100 text-slate-700',   // Gray    — fully closed out
}

// Props:
//   status — a string matching one of the keys above (e.g. "Scheduled")
export default function StatusBadge({ status }) {
  return (
    // rounded-full makes it a pill shape
    // ?? fallback: if status isn't in the colors map, use a neutral gray so nothing breaks
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
