import { useState, useMemo } from 'react'
import { Layout } from '../components/Layout'
import { MonthSelector } from '../components/MonthSelector'
import { SummaryCard } from '../components/SummaryCard'
import { useStudents } from '../hooks/useStudents'
import { useFees } from '../hooks/useFees'
import { useDashboard } from '../hooks/useDashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { IndianRupee, TrendingUp, Clock, UserCheck, UserX, Wallet } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm font-semibold text-blue-600">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const { students } = useStudents()
  const { payments, getPaymentForStudent } = useFees(selectedMonth, selectedYear)
  const { monthlyData, totalCollected } = useDashboard()

  const activeStudents = useMemo(() => students.filter(s => s.is_active), [students])

  const stats = useMemo(() => {
    let collected = 0
    let paidCount = 0
    let expected = 0

    activeStudents.forEach(student => {
      expected += student.monthly_fee
      const payment = getPaymentForStudent(student.id)
      if (payment) {
        collected += payment.amount
        paidCount++
      }
    })

    return {
      collected,
      expected,
      pending: expected - collected,
      paidCount,
      unpaidCount: activeStudents.length - paidCount
    }
  }, [activeStudents, payments, getPaymentForStudent])

  // Student-wise collection for selected month
  const studentPayments = useMemo(() => {
    return activeStudents.map(student => {
      const payment = getPaymentForStudent(student.id)
      return {
        ...student,
        paid: payment ? payment.amount : 0,
        paidOn: payment ? payment.paid_on : null,
        isPaid: !!payment
      }
    }).sort((a, b) => b.isPaid - a.isPaid || a.name.localeCompare(b.name))
  }, [activeStudents, getPaymentForStudent])

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h2>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">{MONTH_NAMES[selectedMonth - 1]} {selectedYear} overview</p>
        </div>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
      </div>

      {/* All-time total banner */}
      <div className="mb-6 px-5 py-4 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet size={22} className="text-blue-100" />
          <div>
            <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Total Money Collected (All Time)</p>
            <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalCollected)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          label="Collected"
          value={formatCurrency(stats.collected)}
          color="green"
          icon={<IndianRupee size={18} />}
        />
        <SummaryCard
          label="Expected"
          value={formatCurrency(stats.expected)}
          color="blue"
          icon={<TrendingUp size={18} />}
        />
        <SummaryCard
          label="Pending"
          value={formatCurrency(stats.pending)}
          color={stats.pending > 0 ? 'amber' : 'green'}
          icon={<Clock size={18} />}
        />
        <SummaryCard
          label="Paid"
          value={stats.paidCount}
          subtitle="students"
          color="green"
          icon={<UserCheck size={18} />}
        />
        <SummaryCard
          label="Unpaid"
          value={stats.unpaidCount}
          subtitle="students"
          color={stats.unpaidCount > 0 ? 'red' : 'green'}
          icon={<UserX size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Collection</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="collected" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">No collection data yet</p>
            </div>
          )}
        </div>

        {/* Student-wise Collection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Student Collection — {MONTH_NAMES[selectedMonth - 1]}
          </h3>
          {studentPayments.length === 0 ? (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">No active students</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white dark:bg-gray-800">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Student</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Fee</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {studentPayments.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.isPaid ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          {s.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(s.monthly_fee)}</td>
                      <td className={`px-3 py-2 text-sm font-medium text-right ${s.isPaid ? 'text-emerald-600' : 'text-gray-300'}`}>
                        {s.isPaid ? formatCurrency(s.paid) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
