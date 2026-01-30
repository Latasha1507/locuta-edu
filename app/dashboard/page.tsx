'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Admin Dashboard Component
function AdminDashboard({ user }: { user: any }) {
  const [segment, setSegment] = useState<'both' | 'ms' | 'hs'>('both')

  const middleSchoolCategories = [
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', icon: '🎤', color: 'from-purple-500 to-pink-500', dbName: 'Public Speaking Fundamentals' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖', color: 'from-blue-500 to-cyan-500', dbName: 'Storytelling' },
    { id: 'leadership-team-communication', name: 'Leadership & Teams', icon: '👥', color: 'from-green-500 to-emerald-500', dbName: 'Leadership & Team Communication' },
    { id: 'conversation-skills', name: 'Conversation Skills', icon: '💬', color: 'from-yellow-500 to-orange-500', dbName: 'Conversation Skills' },
    { id: 'project-academic-presentation', name: 'Presentations', icon: '📊', color: 'from-red-500 to-pink-500', dbName: 'Project & Academic Presentation Skills' },
    { id: 'persuasive-speaking', name: 'Persuasive Speaking', icon: '🎯', color: 'from-indigo-500 to-purple-500', dbName: 'Persuasive Speaking' }
  ]

  const highSchoolCategories = [
    { id: 'public-speaking-mastery', name: 'Public Speaking Mastery', icon: '🎤', color: 'from-purple-600 to-indigo-600', dbName: 'Public Speaking Mastery' },
    { id: 'advanced-storytelling', name: 'Advanced Storytelling', icon: '📖', color: 'from-blue-600 to-purple-600', dbName: 'Advanced Storytelling & Content' },
    { id: 'leadership-team-advanced', name: 'Leadership (Advanced)', icon: '👥', color: 'from-green-600 to-teal-600', dbName: 'Leadership & Team Communication (Advanced)' },
    { id: 'content-creation-digital', name: 'Digital Communication', icon: '🎥', color: 'from-pink-600 to-rose-600', dbName: 'Content Creation & Digital Communication' },
    { id: 'entrepreneurial-sales', name: 'Sales & Entrepreneurship', icon: '💼', color: 'from-orange-600 to-red-600', dbName: 'Entrepreneurial & Sales Communication' },
    { id: 'debate-advanced-persuasion', name: 'Debate & Persuasion', icon: '⚖️', color: 'from-indigo-600 to-blue-600', dbName: 'Debate & Advanced Persuasion' }
  ]

  const categoriesToShow =
    segment === 'ms' ? middleSchoolCategories : segment === 'hs' ? highSchoolCategories : [...middleSchoolCategories, ...highSchoolCategories]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/create-student"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">👨‍🎓</div>
            <div>
              <div className="font-bold text-sm">Create Student</div>
              <div className="text-xs text-white/80">Add new student account</div>
            </div>
          </div>
        </Link>
        
        <Link
          href="/admin/analytics"
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">📊</div>
            <div>
              <div className="font-bold text-sm">Analytics</div>
              <div className="text-xs text-white/80">View reports & stats</div>
            </div>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">👥</div>
            <div>
              <div className="font-bold text-sm">Student Management</div>
              <div className="text-xs text-white/80">Coming soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content selector + categories */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>📚</span> Curriculum Categories
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 font-medium">Show:</span>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold"
          >
            <option value="both">All Categories</option>
            <option value="ms">Middle School (5-8)</option>
            <option value="hs">High School (9-12)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {categoriesToShow.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 text-white hover:shadow-lg transition-all hover:scale-[1.02] h-[120px] flex flex-col justify-between`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              {cat.icon}
            </div>
            <div className="text-sm font-semibold leading-snug">{cat.name}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">Recent Activity</h3>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">
            Student management, class analytics, and activity tracking coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}

// Student Dashboard Component
function StudentDashboard({ user, grade }: { user: any, grade: number | null }) {
  const [progress, setProgress] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [allSessions, setAllSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const [progressResult, lessonsResult, sessionsResult] = await Promise.all([
          supabase
            .from('user_progress')
            .select('category, module_number, level_number, completed, best_score')
            .eq('user_id', user.id),
          supabase
            .from('lessons')
            .select('category, module_number, level_number'),
          supabase
            .from('sessions')
            .select('id, overall_score, created_at, category')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)
        ])

        setProgress(progressResult.data || [])
        setLessons(lessonsResult.data || [])
        setAllSessions(sessionsResult.data || [])
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [user.id])

  const isMiddleSchool = grade !== null && grade >= 5 && grade <= 8
  
  const categories = isMiddleSchool ? [
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', description: 'Master presentations', icon: '🎤', color: 'from-purple-500 to-pink-500', dbName: 'Public Speaking Fundamentals' },
    { id: 'storytelling', name: 'Storytelling', description: 'Craft narratives', icon: '📖', color: 'from-blue-500 to-cyan-500', dbName: 'Storytelling' },
    { id: 'leadership-team-communication', name: 'Leadership & Teams', description: 'Lead groups', icon: '👥', color: 'from-green-500 to-emerald-500', dbName: 'Leadership & Team Communication' },
    { id: 'conversation-skills', name: 'Conversation Skills', description: 'Social interactions', icon: '💬', color: 'from-yellow-500 to-orange-500', dbName: 'Conversation Skills' },
    { id: 'project-academic-presentation', name: 'Presentations', description: 'Classroom presentations', icon: '📊', color: 'from-red-500 to-pink-500', dbName: 'Project & Academic Presentation Skills' },
    { id: 'persuasive-speaking', name: 'Persuasive Speaking', description: 'Persuasive communication', icon: '🎯', color: 'from-indigo-500 to-purple-500', dbName: 'Persuasive Speaking' }
  ] : [
    { id: 'public-speaking-mastery', name: 'Public Speaking Mastery', description: 'Advanced techniques', icon: '🎤', color: 'from-purple-600 to-indigo-600', dbName: 'Public Speaking Mastery' },
    { id: 'advanced-storytelling', name: 'Advanced Storytelling', description: 'Impactful narratives', icon: '📖', color: 'from-blue-600 to-purple-600', dbName: 'Advanced Storytelling & Content' },
    { id: 'leadership-team-advanced', name: 'Leadership (Advanced)', description: 'Lead teams', icon: '👥', color: 'from-green-600 to-teal-600', dbName: 'Leadership & Team Communication (Advanced)' },
    { id: 'content-creation-digital', name: 'Digital Communication', description: 'Digital audiences', icon: '🎥', color: 'from-pink-600 to-rose-600', dbName: 'Content Creation & Digital Communication' },
    { id: 'entrepreneurial-sales', name: 'Sales & Entrepreneurship', description: 'Sales and pitches', icon: '💼', color: 'from-orange-600 to-red-600', dbName: 'Entrepreneurial & Sales Communication' },
    { id: 'debate-advanced-persuasion', name: 'Debate & Persuasion', description: 'Advanced debate', icon: '⚖️', color: 'from-indigo-600 to-blue-600', dbName: 'Debate & Advanced Persuasion' }
  ]

  const categoryStats = categories.map(category => {
    const categoryLessons = lessons?.filter((l: any) => 
      l.category === category.dbName
    ) || []
    
    const totalLessons = categoryLessons.length
    const categoryProgress = progress?.filter((p: any) => 
      p.category === category.dbName
    ) || []
    
    const completedLessons = categoryProgress.filter((p: any) => p.completed).length
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const bestScore = categoryProgress.length > 0 ? Math.max(...categoryProgress.map((p: any) => p.best_score || 0)) : 0

    return { ...category, totalLessons, completedLessons, completionPercentage, bestScore }
  })

  const totalCompleted = progress?.filter((p: any) => p.completed).length || 0
  const totalAvailable = lessons?.length || 0
  const overallPercentage = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0

  const calculateStreak = () => {
    if (!allSessions || allSessions.length === 0) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDates = new Set(
      allSessions.map((s: any) => {
        const date = new Date(s.created_at)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
    let streak = 0
    let currentDate = new Date(today)
    while (sessionDates.has(currentDate.getTime())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    return streak
  }

  const getLevelAndXP = () => {
    const xpPerLesson = 10
    const totalXP = totalCompleted * xpPerLesson
    const level = Math.floor(totalXP / 100) + 1
    const xpInCurrentLevel = totalXP % 100
    const xpToNextLevel = 100 - xpInCurrentLevel
    return { level, xpInCurrentLevel, xpToNextLevel, totalXP }
  }

  const { level, xpInCurrentLevel, xpToNextLevel } = getLevelAndXP()
  const currentStreak = calculateStreak()
  const avgScore = allSessions?.length > 0 
    ? Math.round(allSessions.reduce((sum: number, s: any) => sum + (s.overall_score || 0), 0) / allSessions.length)
    : 0
  const bestScore = progress?.length > 0 ? Math.max(...progress.map((p: any) => p.best_score || 0)) : 0

  return (
    <div className="space-y-4">
      {/* Welcome & Level */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back! 👋
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full">
              Level {level}
            </span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {grade === null ? 'Grade not set' : (isMiddleSchool ? 'Middle School' : 'High School')} • Grade {grade ?? '—'}
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 rounded-lg p-3 border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-slate-900 text-sm">{xpInCurrentLevel} / 100 XP</span>
          </div>
          <span className="text-xs font-semibold text-purple-700">{xpToNextLevel} XP to Level {level + 1}</span>
        </div>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all"
            style={{ width: `${xpInCurrentLevel}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">Progress</div>
          <div className="text-lg font-bold text-purple-700">{overallPercentage}%</div>
          <div className="text-xs text-slate-600">{totalCompleted}/{totalAvailable}</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-lg p-3 border border-orange-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">Streak</div>
          <div className="text-lg font-bold text-orange-700 flex items-center gap-1">
            <span>🔥</span>
            <span>{currentStreak}</span>
          </div>
          <div className="text-xs text-slate-600">days</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">Avg Score</div>
          <div className="text-lg font-bold text-yellow-700">{avgScore || '-'}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 border border-green-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">Best Score</div>
          <div className="text-lg font-bold text-green-700">{bestScore || '-'}</div>
        </div>
      </div>

      {/* Categories - 3x2 Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>🎯</span> Practice Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((category: any) => (
            <Link key={category.id} href={`/category/${category.id}`} className="group">
              <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 p-6 h-[180px] flex flex-col hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 text-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {category.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-3 leading-tight line-clamp-2 flex-grow group-hover:text-purple-700 transition-colors">
                  {category.name}
                </h4>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-600 font-medium">{category.completedLessons}/{category.totalLessons} lessons</span>
                  {category.completionPercentage > 0 && (
                    <span className="text-purple-600 font-bold">{category.completionPercentage}%</span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${category.completionPercentage}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📜</span> Recent Practice
          </h3>
          <Link href="/history" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {allSessions.slice(0, 5).map((session: any) => (
              <div key={session.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{session.category}</div>
                  <div className="text-xs text-slate-600">
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-600">{session.overall_score || '-'}</div>
              </div>
            ))}
            {allSessions.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                No practice sessions yet. Start practicing!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [grade, setGrade] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)
        
        // Check if admin or student
        const metaAccountType = user.user_metadata?.account_type
        const metaIsAdmin = user.user_metadata?.is_admin === true
        const isAdmin = metaIsAdmin || metaAccountType !== 'student'
        setIsUserAdmin(isAdmin)

        // Get grade for students
        if (!isAdmin && metaAccountType === 'student') {
          const gradeValue = user.user_metadata?.grade || null
          setGrade(gradeValue ? parseInt(gradeValue) : null)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Dashboard load error:', err)
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-lg font-semibold text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const sidebarLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      name: 'History',
      href: '/history',
      icon: (
        <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-20 lg:w-56 sticky top-0 left-0 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-sm">
        <div>
          <div className="px-3 py-4 flex items-center justify-center lg:justify-start gap-2">
            <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
            <span className="text-lg font-bold text-slate-900 hidden lg:inline">Locuta</span>
          </div>
          <nav className="mt-2">
            <ul className="flex flex-col gap-1">
              {sidebarLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-slate-100 transition-colors group">
                    <span className="text-slate-600 group-hover:text-indigo-600">{link.icon}</span>
                    <span className="hidden lg:inline text-sm text-slate-700 group-hover:text-indigo-700 font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mb-4 px-3">
          <form action="/auth/signout" method="post" className="w-full">
            <button type="submit" className="flex items-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-slate-900">Locuta</h1>
          </div>
          <Link href="/history" className="text-slate-700 hover:text-purple-600">
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          </Link>
        </header>
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg px-4 sm:px-6 py-6 border border-slate-100">
              {isUserAdmin ? (
                <AdminDashboard user={user} />
              ) : (
                <StudentDashboard user={user} grade={grade} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}