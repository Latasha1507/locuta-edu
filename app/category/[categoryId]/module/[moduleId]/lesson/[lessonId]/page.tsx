import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const categoryMap: { [key: string]: string } = {
  'public-speaking': 'Public Speaking',
  'storytelling': 'Storytelling',
  'creator-speaking': 'Creator Speaking',
  'casual-conversation': 'Casual Conversation',
  'workplace-communication': 'Workplace Communication',
  'pitch-anything': 'Pitch Anything',
}

export default async function LessonToneSelectionPage({
  params,
}: {
  params: Promise<{ categoryId: string; moduleId: string; lessonId: string }>
}) {
  const resolvedParams = await params
  const { categoryId, moduleId, lessonId } = resolvedParams

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const categoryName = categoryMap[categoryId]

  if (!categoryName) {
    notFound()
  }

  // Get lesson details
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('category', categoryName)
    .eq('module_number', parseInt(moduleId))
    .eq('level_number', parseInt(lessonId))
    .single()

  if (!lesson) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/category/${categoryId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lesson.level_title}
              </h1>
              <p className="text-sm text-gray-600">
                Module {lesson.module_number} • Lesson {lesson.level_number}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Lesson Explanation */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              📚
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Lesson Overview
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {lesson.lesson_explanation}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">
              📝 Your Task:
            </h3>
            <p className="text-purple-800">{lesson.practice_prompt}</p>
            <p className="text-sm text-purple-600 mt-2">
              Expected duration: ~{lesson.expected_duration_sec} seconds
            </p>
          </div>
        </div>

        {/* Start Practice Button - REMOVED TONE SELECTION */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Practice?
          </h2>
          <p className="text-gray-600 mb-8">
            Click below to start your speaking practice session
          </p>

          <Link
            href={`/category/${categoryId}/module/${moduleId}/lesson/${lessonId}/practice`}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-lg"
          >
            <span>🎤</span>
            Start Practice
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>💡</span> Tips for Success
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Find a quiet space with minimal background noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Speak clearly and at a natural pace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Don't worry about being perfect - focus on practicing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>The AI will provide constructive feedback to help you improve</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}