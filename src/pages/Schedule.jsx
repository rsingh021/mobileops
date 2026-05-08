// Schedule.jsx — The schedule page ("/schedule").
// Shows a weekly calendar view with visits mapped to each day.
// Today (Wed 5/7) is highlighted in blue.

// The 5 days shown across the top of the calendar
const days = ['Mon 5/5', 'Tue 5/6', 'Wed 5/7', 'Thu 5/8', 'Fri 5/9']

// Hardcoded visit slots per day.
// Key = day label, value = array of visit strings.
// An empty array means no visits scheduled that day.
// When Supabase is connected, this will be replaced with real scheduled orders filtered by date.
const slots = {
  'Mon 5/5': ['Gwinnett Senior Care — Echo', 'North Atlanta Rehab — Abdominal US'],
  'Tue 5/6': ['Sandy Springs Care — Carotid Doppler'],
  'Wed 5/7': ['Peachtree Rehab — Venous Doppler', 'Buckhead Medical — Venous Doppler'],
  'Thu 5/8': [],
  'Fri 5/9': [],
}

export default function Schedule() {
  return (
    <div className="space-y-4">

      {/* ── Weekly calendar grid ─────────────────────────────── */}
      {/* grid-cols-5 = one column per weekday, side by side */}
      <div className="grid grid-cols-5 gap-3">

        {days.map(day => (
          <div key={day} className="bg-white rounded-xl border border-slate-200 min-h-40">

            {/* Day header — highlighted blue for today (Wed 5/7) */}
            <div className={`px-3 py-2.5 border-b border-slate-100 rounded-t-xl ${day === 'Wed 5/7' ? 'bg-blue-600' : ''}`}>
              <p className={`text-xs font-semibold ${day === 'Wed 5/7' ? 'text-white' : 'text-slate-500'}`}>{day}</p>
              {/* Only show "Today" label on the current day */}
              {day === 'Wed 5/7' && <p className="text-white text-xs opacity-75">Today</p>}
            </div>

            {/* Visit slots for this day */}
            <div className="p-2 space-y-1.5">
              {slots[day].length === 0 ? (
                // Empty state — no visits scheduled
                <p className="text-xs text-slate-300 px-1 pt-1">No visits</p>
              ) : (
                // Render one card per visit on this day
                slots[day].map((slot, i) => (
                  // i (index) is used as the key since these strings don't have unique IDs
                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                    <p className="text-xs text-blue-800 font-medium leading-snug">{slot}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming next</p>
        <p className="text-sm text-amber-700 mt-0.5">Drag-and-drop scheduling, technologist assignment, and route optimization per day.</p>
      </div>

    </div>
  )
}
