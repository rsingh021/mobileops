const colors = {
  Scheduled:    'bg-blue-100 text-blue-800',
  Completed:    'bg-violet-100 text-violet-800',
  'Report Sent':'bg-green-100 text-green-800',
  Billed:       'bg-slate-100 text-slate-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
