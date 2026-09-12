import { useState, useMemo } from 'react'
import { Layout } from '../components/Layout'
import { MonthSelector } from '../components/MonthSelector'
import { SummaryCard } from '../components/SummaryCard'
import { useStudents } from '../hooks/useStudents'
import { useFees } from '../hooks/useFees'
import { IndianRupee, UserCheck, UserX } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

export function FeesPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const { students } = useStudents()
  const { payments, getPaymentForStudent } = useFees(selectedMonth, selectedYear)

  const activeStudents = useMemo(() => students.filter(s => s.is_active), [students])

  const { paidStudents, unpaidStudents, totalCollected } = useMemo(() => {
    const paid = []
    const unpaid = []
    let collected = 0

    activeStudents.forEach(student => {
      const payment = getPaymentForStudent(student.id)
      if (payment) {
        paid.push({ ...student, payment })
        collected += payment.amount
      } else {
        unpaid.push(student)
      }
    })

    return { paidStudents: paid, unpaidStudents: unpaid, totalCollected: collected }
  }, [activeStudents, payments, getPaymentForStudent])

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fees</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
        </div>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="Collected"
          value={formatCurrency(totalCollected)}
          color="green"
          icon={<IndianRupee size={18} />}
        />
        <SummaryCard
          label="Paid"
          value={paidStudents.length}
          subtitle={`of ${activeStudents.length} students`}
          color="blue"
          icon={<UserCheck size={18} />}
        />
        <SummaryCard
          label="Unpaid"
          value={unpaidStudents.length}
          subtitle={unpaidStudents.length > 0 ? 'needs follow up' : 'all clear!'}
          color={unpaidStudents.length > 0 ? 'amber' : 'green'}
          icon={<UserX size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paid Students */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paid Students ({paidStudents.length})
          </h3>
          {paidStudents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">No payments recorded yet</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Student</th>
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Class</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Amount</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Paid On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {paidStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{s.class || '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 font-medium text-right">{formatCurrency(s.payment.amount)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 text-right">
                        {new Date(s.payment.paid_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unpaid Students */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Unpaid Students ({unpaidStudents.length})
          </h3>
          {unpaidStudents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
              <p className="text-sm text-emerald-600">🎉 Everyone has paid!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Student</th>
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Class</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Expected</th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {unpaidStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{s.class || '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium text-right">{formatCurrency(s.monthly_fee)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          ○ Unpaid
                        </span>
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
