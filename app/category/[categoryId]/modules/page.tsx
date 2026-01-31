import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_MAP: { [key: string]: string } = {
  'public-speaking-fundamentals': 'Public Speaking Fundamentals',
  'storytelling': 'Storytelling',
  'leadership-team-communication': 'Leadership & Team Communication',
  'conversation-skills': 'Conversation Skills',
  'project-academic-presentation': 'Project & Academic Presentation',
  'persuasive-speaking': 'Persuasive Speaking',
  'public-speaking-mastery': 'Public Speaking Mastery',
  'advanced-storytelling': 'Advanced Storytelling & Content',
  'leadership-team-advanced': 'Leadership & Team Communication (Advanced)',
  'content-creation-digital': 'Content Creation & Digital Communication',
  'entrepreneurial-sales': 'Entrepreneurial & Sales Communication',
  'debate-advanced-persuasion': 'Debate & Advanced Persuasion'
}

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const categoryName = CATEGORY_MAP[categoryId]
  if (!categoryName) notFound()

  const userGrade = user.user_metadata?.grade || 5

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('category', categoryName)
    .order('module_number', { ascending: true })
    .order('level_number', { ascending: true })

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', categoryName)

  const modules: { [key: number]: any[] } = {}
  lessons?.forEach(lesson => {
    if (!modules[lesson.module_number]) {
      modules[lesson.module_number] = []
    }
    modules[lesson.module_number].push(lesson)
  })

  const totalLessons = lessons?.length || 0
  const completedLessons = progress?.filter(p => p.completed).length || 0
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const segment = userGrade <= 8 ? 'Middle School' : 'High School'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-700 hover:text-purple-600 font-medium text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">Grade {userGrade} • {segment}</span>
            <img src="/Icon.png" alt="Locuta" className="w-7 h-7" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Compact Category Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{categoryName}</h1>
              <p className="text-white/90 text-sm">{Object.keys(modules).length} modules • {totalLessons} lessons</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{overallProgress}%</div>
              <div className="text-white/90 text-sm">{completedLessons}/{totalLessons} Complete</div>
            </div>
          </div>
          
          <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* Modules - Card Based Layout */}
        {Object.keys(modules).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No lessons yet</h2>
            <p className="text-slate-600">Content coming soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(modules).map(([moduleNum, moduleLessons]) => {
              const moduleNumber = parseInt(moduleNum)
              const moduleTitle = moduleLessons[0]?.module_title || `Module ${moduleNumber}`
              
              const moduleProgress = progress?.filter(p => p.module_number === moduleNumber) || []
              const moduleCompleted = moduleProgress.filter(p => p.completed).length
              const modulePercentage = Math.round((moduleCompleted / moduleLessons.length) * 100)

              return (
                <div key={moduleNumber} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Compact Module Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/80 text-xs font-medium mb-0.5">MODULE {moduleNumber}</div>
                        <h2 className="text-xl font-bold text-white">{moduleTitle}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{modulePercentage}%</div>
                        <div className="text-white/90 text-xs">{moduleCompleted}/{moduleLessons.length} Complete</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${modulePercentage}%` }} />
                    </div>
                  </div>

                  {/* Card-based Lessons Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {moduleLessons.map(lesson => {
                        const lessonProgress = progress?.find(
                          p => p.module_number === moduleNumber && p.level_number === lesson.level_number
                        )
                        const isCompleted = lessonProgress?.completed || false
                        const bestScore = lessonProgress?.best_score || 0

                        return (
                          <Link
                            key={lesson.level_number}
                            href={`/category/${categoryId}/module/${moduleNumber}/lesson/${lesson.level_number}/practice`}
                            className="group"
                          >
                            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg transition-all">
                              <div className="flex items-start gap-4">
                                {/* Lesson Number/Status Badge */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                                  isCompleted 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                }`}>
                                  {isCompleted ? '✓' : lesson.level_number}
                                </div>

                                {/* Lesson Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors leading-tight">
                                      {lesson.level_title}
                                    </h3>
                                    {isCompleted && bestScore > 0 && (
                                      <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex-shrink-0">
                                        {bestScore}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">
                                    {lesson.lesson_explanation}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 text-xs">
                                      ⏱ {lesson.expected_duration_sec}s
                                    </span>
                                    <span className={`font-semibold text-sm ${isCompleted ? 'text-green-700' : 'text-purple-700'}`}>
                                      {isCompleted ? 'Practice Again' : 'Start'} →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}