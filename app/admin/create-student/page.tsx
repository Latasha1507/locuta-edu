'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    grade: '',
    class_section: '',
    roll_number: '',
    student_id: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-calculate grade from age
    if (name === 'age' && value) {
      const age = parseInt(value)
      if (age >= 10 && age <= 13) {
        setFormData(prev => ({ ...prev, grade: String(age - 5) })) // Age 10 = Grade 5
      } else if (age >= 14 && age <= 17) {
        setFormData(prev => ({ ...prev, grade: String(age - 5) }))
      }
    }
  }

  const generateStudentId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `STU${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Generate student ID if not provided
      const studentId = formData.student_id || generateStudentId()
      const email = `${studentId}@student.locuta.edu` // Fake email for auth

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            account_type: 'student',
            student_id: studentId,
            grade: parseInt(formData.grade)
          }
        }
      })

      if (authError) throw authError

      // Update profile with student details
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            account_type: 'student',
            student_id: studentId,
            grade: parseInt(formData.grade),
            class_section: formData.class_section || null,
            roll_number: formData.roll_number || null,
            created_by_admin_id: user.id
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError
      }

      alert(`Student created successfully!\n\nStudent ID: ${studentId}\nPassword: ${formData.password}\n\nPlease save these credentials.`)
      router.push('/dashboard')

    } catch (err: any) {
      setError(err.message || 'Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Create Student Account</h1>
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              ← Back
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter student's full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  min="10"
                  max="18"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Grade/Class *
                </label>
                <select
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Grade</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Section (Optional)
                </label>
                <input
                  type="text"
                  name="class_section"
                  value={formData.class_section}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Roll No."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Student ID (Optional - Auto-generated if empty)
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Leave empty to auto-generate"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Grade {formData.grade ? (parseInt(formData.grade) <= 8 ? '5-8' : '9-12') : '5-8 or 9-12'} students will see{' '}
                <strong>{formData.grade ? (parseInt(formData.grade) <= 8 ? 'Middle School' : 'High School') : 'age-appropriate'}</strong> content.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Student...' : 'Create Student Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}