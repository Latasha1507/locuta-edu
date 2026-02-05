import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FeedbackPageClient from '@/components/FeedbackPageClient'

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string; moduleId: string; lessonId: string }>
  searchParams: Promise<{ session?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { categoryId, moduleId, lessonId } = resolvedParams
  const sessionId = resolvedSearchParams.session

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Not Found</h2>
          <p className="text-slate-600 mb-6">No feedback session was provided.</p>
          <Link href={`/category/${categoryId}`} 
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all">
            Back to Lessons
          </Link>
        </div>
      </div>
    )
  }
  
  const adminClient = createAdminClient()
  const { data: session, error: sessionError } = await adminClient
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Feedback Not Available</h2>
          <p className="text-slate-600 mb-2">We couldn't find your feedback session.</p>
          <Link href={`/category/${categoryId}/module/${moduleId}/lesson/${lessonId}/practice`} 
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all">
            Try Recording Again
          </Link>
        </div>
      </div>
    )
  }

  const feedback = session.feedback
  const score = feedback?.overall_score || 0
  const moduleNumber = session.module_number || parseInt(moduleId)
  const passThreshold = moduleNumber <= 10 ? 60 : moduleNumber <= 30 ? 65 : 70
  const passed = feedback?.passed || score >= passThreshold

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href={`/category/${categoryId}`} className="text-slate-700 hover:text-indigo-600 font-medium text-sm sm:text-base flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lessons
            </Link>
            <div className="flex items-center gap-3">
              <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
              <div className="text-purple-600 font-semibold text-sm">Lesson {lessonId} Feedback</div>
            </div>
          </div>
        </div>
      </header>

      <FeedbackPageClient
        categoryId={categoryId}
        moduleId={moduleId}
        lessonId={lessonId}
        sessionId={sessionId}
        session={session}
        feedback={feedback}
        score={score}
        userId={user.id}
        passed={passed}
        passThreshold={passThreshold}
      />
    </div>
  )
}