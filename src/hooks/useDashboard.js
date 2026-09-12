import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard() {
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState([])
  const [totalCollected, setTotalCollected] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchMonthlyData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Fetch last 6 months of payment data
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() })
    }

    const { data: payments, error } = await supabase
      .from('fee_payments')
      .select('month, year, amount')
      .eq('teacher_id', user.id)
      .or(
        months.map(m => `and(month.eq.${m.month},year.eq.${m.year})`).join(',')
      )

    if (!error && payments) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const result = months.map(m => {
        const monthPayments = payments.filter(p => p.month === m.month && p.year === m.year)
        const total = monthPayments.reduce((sum, p) => sum + p.amount, 0)
        return {
          name: `${monthNames[m.month - 1]} ${m.year}`,
          shortName: monthNames[m.month - 1],
          month: m.month,
          year: m.year,
          collected: total,
          count: monthPayments.length
        }
      })
      setMonthlyData(result)
    }

    // Fetch all-time total collected
    const { data: allPayments, error: allError } = await supabase
      .from('fee_payments')
      .select('amount')
      .eq('teacher_id', user.id)

    if (!allError && allPayments) {
      const total = allPayments.reduce((sum, p) => sum + p.amount, 0)
      setTotalCollected(total)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchMonthlyData()
  }, [fetchMonthlyData])

  return {
    monthlyData,
    totalCollected,
    loading,
    refetch: fetchMonthlyData
  }
}
