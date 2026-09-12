import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useStudents() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', user.id)
      .order('is_active', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setStudents(data || [])
      setError(null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const addStudent = async ({ name, phone, class: cls, monthly_fee, is_active }) => {
    const { data, error } = await supabase
      .from('students')
      .insert({
        teacher_id: user.id,
        name,
        phone: phone || '',
        class: cls || '',
        monthly_fee: parseInt(monthly_fee) || 0,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) return { error }
    await fetchStudents()
    return { data }
  }

  const updateStudent = async (id, updates) => {
    const { data, error } = await supabase
      .from('students')
      .update({
        name: updates.name,
        phone: updates.phone || '',
        class: updates.class,
        monthly_fee: parseInt(updates.monthly_fee) || 0,
        is_active: updates.is_active
      })
      .eq('id', id)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (error) return { error }
    await fetchStudents()
    return { data }
  }

  const toggleActive = async (id, is_active) => {
    const { error } = await supabase
      .from('students')
      .update({ is_active })
      .eq('id', id)
      .eq('teacher_id', user.id)

    if (error) return { error }
    await fetchStudents()
    return {}
  }

  const deleteStudent = async (id) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('teacher_id', user.id)

    if (error) return { error }
    await fetchStudents()
    return {}
  }

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    toggleActive,
    deleteStudent,
    refetch: fetchStudents
  }
}
