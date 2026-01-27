'use client'

import { useState } from 'react'
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
      if (age >= 10 && age <= 17) {
        setFormData(prev => ({ ...prev, grade: String(age - 5) }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    try {
      const response = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student')
      }

      alert(`✅ Student created successfully!\n\n📝 Student ID: ${data.student_id}\n🔑 Password: ${formData.password}\n\n⚠️ Please save these credentials securely.`)
      router.push('/dashboard')

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create student'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getGradeRange = () => {
    if (!formData.grade) return { range: '5-8 or 9-12', level: 'age-appropriate' }
    const grade = parseInt(formData.grade)
    return grade <= 8 
      ? { range: '5-8', level: 'Middle School' }
      : { range: '9-12', level: 'High School' }
  }

  const { range, level } = getGradeRange()

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Create Student Account</h1>
            <Link 
              href="/dashboard" 
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
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
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter student's full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
                  Age *
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  required
                  min="10"
                  max="18"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Age"
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-semibold text-slate-700 mb-2">
                  Grade/Class *
                </label>
                <select
                  id="grade"
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select Grade</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="class_section" className="block text-sm font-semibold text-slate-700 mb-2">
                  Section (Optional)
                </label>
                <input
                  id="class_section"
                  type="text"
                  name="class_section"
                  value={formData.class_section}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <label htmlFor="roll_number" className="block text-sm font-semibold text-slate-700 mb-2">
                  Roll Number (Optional)
                </label>
                <input
                  id="roll_number"
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Roll No."
                />
              </div>
            </div>

            <div>
              <label htmlFor="student_id" className="block text-sm font-semibold text-slate-700 mb-2">
                Student ID (Optional - Auto-generated if empty)
              </label>
              <input
                id="student_id"
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Leave empty to auto-generate"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Grade {range} students will see{' '}
                <strong>{level}</strong> content.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Student...' : 'Create Student Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}