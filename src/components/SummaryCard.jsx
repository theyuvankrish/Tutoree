export function SummaryCard({ label, value, subtitle, color = 'blue', icon }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100'
  }

  const iconColorMap = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    gray: 'text-gray-400'
  }

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]} transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
        {icon && <span className={`${iconColorMap[color]}`}>{icon}</span>}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  )
}
