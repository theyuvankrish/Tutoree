import { useState, useMemo } from 'react'
import { Layout } from '../components/Layout'
import { MonthSelector } from '../components/MonthSelector'
import { StudentForm } from '../components/StudentForm'
import { PaymentModal } from '../components/PaymentModal'
import { useStudents } from '../hooks/useStudents'
import { useFees } from '../hooks/useFees'
import { Plus, Search, Edit2, Trash2, Check, Circle } from 'lucide-react'

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

export function StudentsPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { students, loading, addStudent, updateStudent, toggleActive, deleteStudent } = useStudents()
  const { payments, markPaid, markUnpaid, getPaymentForStudent } = useFees(selectedMonth, selectedYear)

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.class?.toLowerCase().includes(q)
    )
  }, [students, search])

  // Group students by class, sorted numerically then alphabetically
  const studentsByClass = useMemo(() => {
    const groups = {}
    filteredStudents.forEach(s => {
      const cls = s.class?.trim() || 'No Class'
      if (!groups[cls]) groups[cls] = []
      groups[cls].push(s)
    })
    // Sort group keys: numeric first, then alphabetical
    const sorted = Object.keys(groups).sort((a, b) => {
      const numA = parseInt(a, 10)
      const numB = parseInt(b, 10)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      if (!isNaN(numA)) return -1
      if (!isNaN(numB)) return 1
      return a.localeCompare(b)
    })
    return sorted.map(cls => ({ cls, students: groups[cls] }))
  }, [filteredStudents])

  const handleAddSubmit = async (form) => {
    const result = await addStudent(form)
    if (!result.error) setShowForm(false)
    return result
  }

  const handleEditSubmit = async (form) => {
    const result = await updateStudent(editingStudent.id, form)
    if (!result.error) setEditingStudent(null)
    return result
  }

  const handleDelete = async (id) => {
    await deleteStudent(id)
    setDeleteConfirm(null)
  }

  const handlePaymentClick = (student) => {
    const payment = getPaymentForStudent(student.id)
    if (payment) {
      // Already paid — toggle unpaid
      markUnpaid(student.id)
    } else {
      // Open payment modal
      setPaymentStudent(student)
    }
  }

  return (
    <Layout>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <p className="text-sm text-gray-400">
            {students.filter(s => s.is_active).length} active · {students.filter(s => !s.is_active).length} inactive
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector month={selectedMonth} year={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students by name, phone, or class..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder:text-gray-300"
        />
      </div>

      {/* Class-Grouped Tables */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">
            {students.length === 0
              ? 'No students yet. Click "+ Add Student" to get started.'
              : 'No students match your search.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {studentsByClass.map(({ cls, students: groupStudents }) => (
            <div key={cls} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Class Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    Class {cls}
                  </span>
                  <span className="text-xs text-gray-400">
                    {groupStudents.length} student{groupStudents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {groupStudents.filter(s => s.is_active).length} active
                </span>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Student</th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Phone</th>
                      <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Monthly Fee</th>
                      <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                        {MONTH_NAMES_SHORT[selectedMonth - 1]} {selectedYear}
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {groupStudents.map(student => {
                      const payment = getPaymentForStudent(student.id)
                      const isPaid = !!payment
                      return (
                        <tr
                          key={student.id}
                          className={`group transition-colors ${
                            student.is_active
                              ? 'hover:bg-gray-50/50'
                              : 'bg-gray-50/30 opacity-60'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${student.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                              {student.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{student.phone || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">{formatCurrency(student.monthly_fee)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleActive(student.id, !student.is_active)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                student.is_active
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${student.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {student.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {student.is_active ? (
                              <button
                                onClick={() => handlePaymentClick(student)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600'
                                    : 'bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                title={isPaid ? `₹${payment.amount} — Paid on ${new Date(payment.paid_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Click to undo.` : 'Click to mark as paid'}
                              >
                                {isPaid ? (
                                  <>
                                    <Check size={12} />
                                    <span>{formatCurrency(payment.amount)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={12} />
                                    <span>Unpaid</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingStudent(student)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(student)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {groupStudents.map(student => {
                  const payment = getPaymentForStudent(student.id)
                  const isPaid = !!payment
                  return (
                    <div
                      key={student.id}
                      className={`p-4 ${!student.is_active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.phone ? `${student.phone}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(student)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{formatCurrency(student.monthly_fee)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(student.id, !student.is_active)}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              student.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {student.is_active ? '🟢 Active' : '⚪ Inactive'}
                          </button>
                          {student.is_active && (
                            <button
                              onClick={() => handlePaymentClick(student)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {isPaid ? `✓ ${formatCurrency(payment.amount)}` : '○ Unpaid'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      )}

      {/* Add Student Modal */}
      {showForm && (
        <StudentForm
          onSubmit={handleAddSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentForm
          student={editingStudent}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Payment Modal */}
      {paymentStudent && (
        <PaymentModal
          student={paymentStudent}
          month={selectedMonth}
          year={selectedYear}
          onMarkPaid={markPaid}
          onClose={() => setPaymentStudent(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-slideUp">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Student</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This will also remove all their fee records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
