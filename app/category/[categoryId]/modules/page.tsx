import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_MAP: { [key: string]: string } = {
  // Middle School - EXACT names from database
  'public-speaking-fundamentals': 'Public Speaking Fundamentals',
  'storytelling': 'Storytelling',
  'leadership-team-communication': 'Leadership & Team Communication',
  'conversation-skills': 'Conversation Skills',
  'project-academic-presentation': 'Project & Academic Presentation Skills',
  'persuasive-speaking': 'Persuasive Speaking',
  
  // High School - EXACT names from database
  'public-speaking-mastery': 'Public Speaking Mastery',
  'advanced-storytelling': 'Advanced Storytelling & Content',
  'leadership-team-advanced': 'Leadership & Team Communication (Advanced)',
  'content-creation-digital': 'Content Creation & Digital Communication',
  'entrepreneurial-sales': 'Entrepreneurial & Sales Communication',
  'debate-advanced-persuasion': 'Debate & Advanced Persuasion'
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'public-speaking-fundamentals': 'from-purple-400 to-pink-500',
  'storytelling': 'from-blue-400 to-cyan-500',
  'leadership-team-communication': 'from-green-400 to-emerald-500',
  'conversation-skills': 'from-yellow-400 to-orange-500',
  'project-academic-presentation': 'from-red-400 to-pink-500',
  'persuasive-speaking': 'from-indigo-400 to-purple-500',
  'public-speaking-mastery': 'from-purple-400 to-indigo-600',
  'advanced-storytelling': 'from-blue-400 to-purple-500',
  'leadership-team-advanced': 'from-green-400 to-teal-500',
  'content-creation-digital': 'from-pink-400 to-rose-500',
  'entrepreneurial-sales': 'from-orange-400 to-red-500',
  'debate-advanced-persuasion': 'from-cyan-400 to-blue-500'
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

  // Get user's grade from metadata
  const userGrade = user.user_metadata?.grade || 5

  // Get all lessons for this category
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('category', categoryName)
    .order('module_number', { ascending: true })
    .order('level_number', { ascending: true })

  // Get user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', categoryName)

  // Group lessons by module
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
  
  const gradientColor = CATEGORY_COLORS[categoryId] || 'from-purple-500 to-indigo-600'
  const segment = userGrade <= 8 ? 'Middle School' : 'High School'

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-slate-700 hover:text-indigo-600 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Grade {userGrade} • {segment}
              </div>
              <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className={`bg-gradient-to-r ${gradientColor} rounded-3xl shadow-2xl p-8 mb-8 text-white`}>
          <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-5xl font-bold">{overallProgress}%</div>
              <div className="text-white/90">Overall Progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{completedLessons}/{totalLessons}</div>
              <div className="text-white/90">Lessons Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{Object.keys(modules).length}</div>
              <div className="text-white/90">Modules</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 bg-white/20 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Modules List */}
        {Object.keys(modules).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No lessons yet</h2>
            <p className="text-slate-600">Lessons for this category are coming soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(modules).map(([moduleNum, moduleLessons]) => {
              const moduleNumber = parseInt(moduleNum)
              const moduleTitle = moduleLessons[0]?.module_title || `Module ${moduleNumber}`
              
              const moduleProgress = progress?.filter(
                p => p.module_number === moduleNumber
              ) || []
              
              const moduleCompleted = moduleProgress.filter(p => p.completed).length
              const modulePercentage = Math.round((moduleCompleted / moduleLessons.length) * 100)

              return (
                <div key={moduleNumber} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Module Header */}
                  <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-90 mb-1">Module {moduleNumber}</div>
                        <h2 className="text-2xl font-bold">{moduleTitle}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{modulePercentage}%</div>
                        <div className="text-sm opacity-90">{moduleCompleted}/{moduleLessons.length} lessons</div>
                      </div>
                    </div>
                    
                    {/* Module Progress Bar */}
                    <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${modulePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Lessons Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <div className={`rounded-xl p-5 border-2 transition-all hover:scale-105 ${
                              isCompleted 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400'
                                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                                  isCompleted 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                }`}>
                                  {isCompleted ? '✓' : lesson.level_number}
                                </div>
                                {isCompleted && bestScore > 0 && (
                                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    {bestScore}
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                                {lesson.level_title}
                              </h3>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                  {lesson.expected_duration_sec}s
                                </span>
                                <span className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-purple-700'}`}>
                                  {isCompleted ? 'Practice Again' : 'Start'} →
                                </span>
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