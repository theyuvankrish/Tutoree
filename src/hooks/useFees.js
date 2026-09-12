import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useFees(month, year) {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    if (!user || !month || !year) return
    setLoading(true)
    const { data, error } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('teacher_id', user.id)
      .eq('month', month)
      .eq('year', year)

    if (!error) {
      setPayments(data || [])
    }
    setLoading(false)
  }, [user, month, year])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const markPaid = async (studentId, amount, paidOn) => {
    const { data, error } = await supabase
      .from('fee_payments')
      .upsert({
        student_id: studentId,
        teacher_id: user.id,
        month,
        year,
        amount: parseInt(amount) || 0,
        paid_on: paidOn || new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'student_id,month,year'
      })
      .select()
      .single()

    if (error) return { error }
    await fetchPayments()
    return { data }
  }

  const markUnpaid = async (studentId) => {
    const { error } = await supabase
      .from('fee_payments')
      .delete()
      .eq('student_id', studentId)
      .eq('teacher_id', user.id)
      .eq('month', month)
      .eq('year', year)

    if (error) return { error }
    await fetchPayments()
    return {}
  }

  const getPaymentForStudent = (studentId) => {
    return payments.find(p => p.student_id === studentId)
  }

  return {
    payments,
    loading,
    markPaid,
    markUnpaid,
    getPaymentForStudent,
    refetch: fetchPayments
  }
}
