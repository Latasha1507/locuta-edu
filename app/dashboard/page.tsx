'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Gamification components - ONLY essential ones
import XPGainNotification from '@/components/gamification/XPGainNotification'
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation'
import AchievementPopup, { ACHIEVEMENTS } from '@/components/AchievementPopup'

// Admin Dashboard Component
function AdminDashboard({ user }: { user: any }) {
  const [segment, setSegment] = useState<'both' | 'ms' | 'hs'>('both')

  const middleSchoolCategories = [
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', icon: '🎤', color: 'from-purple-500 to-pink-500', dbName: 'Public Speaking Fundamentals' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖', color: 'from-blue-500 to-cyan-500', dbName: 'Storytelling' },
    { id: 'leadership-team-communication', name: 'Leadership & Teams', icon: '👥', color: 'from-green-500 to-emerald-500', dbName: 'Leadership & Team Communication' },
    { id: 'conversation-skills', name: 'Conversation Skills', icon: '💬', color: 'from-yellow-500 to-orange-500', dbName: 'Conversation Skills' },
    { id: 'project-academic-presentation', name: 'Project & Academic', icon: '📊', color: 'from-red-500 to-pink-500', dbName: 'Project & Academic Presentation' },
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

  const CategoryTile = ({ cat }: { cat: { id: string; name: string; icon: string; color: string } }) => (
    <Link
      href={`/category/${cat.id}`}
      className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 text-white hover:shadow-lg transition-all hover:scale-[1.02] h-[120px] flex flex-col justify-between`}
    >
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
        {cat.icon}
      </div>
      <div className="text-sm font-semibold leading-snug">{cat.name}</div>
    </Link>
  )

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
          <CategoryTile key={cat.id} cat={cat} />
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

// REDESIGNED Student Dashboard - Clean & Focused
function StudentDashboard({ user, grade }: { user: any, grade: number | null }) {
  const [progress, setProgress] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [allSessions, setAllSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAchievement, setShowAchievement] = useState<keyof typeof ACHIEVEMENTS | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; totalXP: number } | null>(null)
  const [xpGain, setXpGain] = useState<{ amount: number; reason: string } | null>(null)

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
            .select('id, overall_score, created_at, category, module_number, level_number')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
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

  const calculateStreak = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDates = new Set(
      sessions.map((s: any) => {
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

  const isMiddleSchool = grade !== null && grade >= 5 && grade <= 8
  
  const categories = isMiddleSchool ? [
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', description: 'Master presentations', icon: '🎤', color: 'from-purple-500 to-pink-500', dbName: 'Public Speaking Fundamentals' },
    { id: 'storytelling', name: 'Storytelling', description: 'Craft narratives', icon: '📖', color: 'from-blue-500 to-cyan-500', dbName: 'Storytelling' },
    { id: 'leadership-team-communication', name: 'Leadership & Teams', description: 'Lead groups', icon: '👥', color: 'from-green-500 to-emerald-500', dbName: 'Leadership & Team Communication' },
    { id: 'conversation-skills', name: 'Conversation Skills', description: 'Social interactions', icon: '💬', color: 'from-yellow-500 to-orange-500', dbName: 'Conversation Skills' },
    { id: 'project-academic-presentation', name: 'Project & Academic', description: 'Classroom presentations', icon: '📊', color: 'from-red-500 to-pink-500', dbName: 'Project & Academic Presentation' },
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
    const categoryLessons = lessons?.filter((l: any) => l.category === category.dbName) || []
    const totalLessons = categoryLessons.length
    const categoryProgress = progress?.filter((p: any) => p.category === category.dbName) || []
    const completedLessons = categoryProgress.filter((p: any) => p.completed).length
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const bestScore = categoryProgress.length > 0 ? Math.max(...categoryProgress.map((p: any) => p.best_score || 0)) : 0

    return { ...category, totalLessons, completedLessons, completionPercentage, bestScore }
  })

  const totalCompleted = progress?.filter((p: any) => p.completed).length || 0
  const totalAvailable = lessons?.length || 0
  const currentStreak = calculateStreak(allSessions)
  const avgScore = allSessions?.length > 0 
    ? Math.round(allSessions.reduce((sum: number, s: any) => sum + (s.overall_score || 0), 0) / allSessions.length)
    : 0

  const getLevelAndXP = () => {
    const xpPerLesson = 10
    const totalXP = totalCompleted * xpPerLesson
    const level = Math.floor(totalXP / 100) + 1
    const xpInCurrentLevel = totalXP % 100
    return { level, xpInCurrentLevel, totalXP }
  }

  const { level, xpInCurrentLevel } = getLevelAndXP()

  return (
    <div className="space-y-6">
      {/* Gamification Overlays */}
      {xpGain && <XPGainNotification xpAmount={xpGain.amount} reason={xpGain.reason} onComplete={() => setXpGain(null)} />}
      {showLevelUp && levelUpData && <LevelUpAnimation oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} totalXP={levelUpData.totalXP} onClose={() => setShowLevelUp(false)} />}
      {showAchievement && <AchievementPopup achievement={showAchievement} onClose={() => setShowAchievement(null)} />}
      
      {/* Compact Stats Bar */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back! 👋</h2>
            <p className="text-white/90 text-sm">
              {isMiddleSchool ? 'Middle School' : 'High School'} • Grade {grade ?? '—'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-xs text-white/80">Level</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold">{totalCompleted}</div>
              <div className="text-xs text-white/80">Lessons</div>
            </div>
            {currentStreak > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold">🔥{currentStreak}</div>
                <div className="text-xs text-white/80">Streak</div>
              </div>
            )}
            {avgScore > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{avgScore}</div>
                <div className="text-xs text-white/80">Avg Score</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN FOCUS: Practice Categories */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>🎯</span> Choose a Category to Practice
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categoryStats.map((category: any) => (
            <Link key={category.id} href={`/category/${category.id}`} className="group">
              <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-200 p-5 flex flex-col hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                
                <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight group-hover:text-purple-700 transition-colors">
                  {category.name}
                </h4>
                
                <p className="text-xs text-slate-600 mb-3">{category.description}</p>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">{category.completedLessons}/{category.totalLessons} done</span>
                  {category.completionPercentage > 0 && (
                    <span className="text-purple-600 font-bold">{category.completionPercentage}%</span>
                  )}
                </div>
                
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-500`}
                    style={{ width: `${category.completionPercentage}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity - Compact */}
      {allSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📜</span> Recent Practice
            </h3>
            <Link href="/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {allSessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{session.category}</div>
                    <div className="text-xs text-slate-600">
                      Lesson {session.level_number} • {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-purple-600">{session.overall_score || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
        
        const metaAccountType = user.user_metadata?.account_type
        const metaIsAdmin = user.user_metadata?.is_admin === true
        const isAdmin = metaIsAdmin || metaAccountType !== 'student'
        setIsUserAdmin(isAdmin)

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
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    )
  }

  const sidebarLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    },
    {
      name: 'History',
      href: '/history',
      icon: <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" />
      </svg>
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-20 lg:w-56 sticky top-0 left-0 bg-white/80 backdrop-blur-xl border-r border-slate-200">
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
          <div className="max-w-6xl mx-auto">
            {isUserAdmin ? (
              <AdminDashboard user={user} />
            ) : (
              <StudentDashboard user={user} grade={grade} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}