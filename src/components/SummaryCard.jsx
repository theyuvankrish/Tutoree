export function SummaryCard({ label, value, subtitle, color = 'blue', icon }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50',
    gray: 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700'
  }

  const iconColorMap = {
    blue: 'text-blue-400 dark:text-blue-500',
    green: 'text-emerald-400 dark:text-emerald-500',
    amber: 'text-amber-400 dark:text-amber-500',
    red: 'text-red-400 dark:text-red-500',
    gray: 'text-gray-400 dark:text-gray-500'
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
