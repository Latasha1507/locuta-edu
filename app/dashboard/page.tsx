'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Gamification components
import XPGainNotification from '@/components/gamification/XPGainNotification'
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation'
import AchievementPopup, { ACHIEVEMENTS } from '@/components/AchievementPopup'
import RankBadge from '@/components/gamification/RankBadge'
import DailyQuestsPanel from '@/components/gamification/DailyQuestsPanel'
import PowerUpInventory from '@/components/gamification/PowerUpInventory'
import LeaderboardWidget from '@/components/gamification/LeaderboardWidget'

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

  return (
    <div className="space-y-5">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/admin/create-student" className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">👨‍🎓</div>
            <div>
              <div className="font-bold text-sm">Create Student</div>
              <div className="text-xs text-white/80">Add new account</div>
            </div>
          </div>
        </Link>
        
        <Link href="/admin/analytics" className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">📊</div>
            <div>
              <div className="font-bold text-sm">Analytics</div>
              <div className="text-xs text-white/80">View reports</div>
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

      {/* Categories */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-bold text-slate-900">📚 Curriculum Categories</h3>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value as any)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
        >
          <option value="both">All</option>
          <option value="ms">Middle School</option>
          <option value="hs">High School</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoriesToShow.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={`bg-gradient-to-br ${cat.color} rounded-lg p-3 text-white hover:shadow-lg transition-all hover:scale-105 h-24 flex flex-col justify-between`}
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">{cat.icon}</div>
            <div className="text-xs font-semibold leading-tight">{cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Professional Student Dashboard
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
          supabase.from('user_progress').select('category, module_number, level_number, completed, best_score').eq('user_id', user.id),
          supabase.from('lessons').select('category, module_number, level_number'),
          supabase.from('sessions').select('id, overall_score, created_at, category, module_number, level_number').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
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
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', icon: '🎤', color: 'bg-purple-500', dbName: 'Public Speaking Fundamentals' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖', color: 'bg-blue-500', dbName: 'Storytelling' },
    { id: 'leadership-team-communication', name: 'Leadership', icon: '👥', color: 'bg-green-500', dbName: 'Leadership & Team Communication' },
    { id: 'conversation-skills', name: 'Conversation', icon: '💬', color: 'bg-yellow-500', dbName: 'Conversation Skills' },
    { id: 'project-academic-presentation', name: 'Presentations', icon: '📊', color: 'bg-red-500', dbName: 'Project & Academic Presentation' },
    { id: 'persuasive-speaking', name: 'Persuasion', icon: '🎯', color: 'bg-indigo-500', dbName: 'Persuasive Speaking' }
  ] : [
    { id: 'public-speaking-mastery', name: 'Public Speaking', icon: '🎤', color: 'bg-purple-600', dbName: 'Public Speaking Mastery' },
    { id: 'advanced-storytelling', name: 'Storytelling', icon: '📖', color: 'bg-blue-600', dbName: 'Advanced Storytelling & Content' },
    { id: 'leadership-team-advanced', name: 'Leadership', icon: '👥', color: 'bg-green-600', dbName: 'Leadership & Team Communication (Advanced)' },
    { id: 'content-creation-digital', name: 'Digital', icon: '🎥', color: 'bg-pink-600', dbName: 'Content Creation & Digital Communication' },
    { id: 'entrepreneurial-sales', name: 'Sales', icon: '💼', color: 'bg-orange-600', dbName: 'Entrepreneurial & Sales Communication' },
    { id: 'debate-advanced-persuasion', name: 'Debate', icon: '⚖️', color: 'bg-indigo-600', dbName: 'Debate & Advanced Persuasion' }
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
  const avgScore = allSessions?.length > 0 ? Math.round(allSessions.reduce((sum: number, s: any) => sum + (s.overall_score || 0), 0) / allSessions.length) : 0

  const getLevelAndXP = () => {
    const xpPerLesson = 10
    const totalXP = totalCompleted * xpPerLesson
    const level = Math.floor(totalXP / 100) + 1
    const xpInCurrentLevel = totalXP % 100
    return { level, xpInCurrentLevel, totalXP }
  }

  const { level, xpInCurrentLevel, totalXP } = getLevelAndXP()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysSessions = allSessions.filter(s => {
    const sessionDate = new Date(s.created_at)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime()
  })
  const todaysHighScore = todaysSessions.length > 0 ? Math.max(...todaysSessions.map(s => s.overall_score || 0)) : 0

  const userProgressData = {
    completedCategories: categories.filter(c => {
      const catStats = categoryStats.find(cs => cs.id === c.id)
      return catStats && catStats.completionPercentage === 100
    }).map(c => c.dbName),
    weakCategories: categoryStats.filter(c => c.bestScore < 70).map(c => c.dbName),
    recentCategories: allSessions.slice(0, 5).map(s => s.category),
    currentStreak,
    averageScore: avgScore,
    totalLessons: totalCompleted
  }

  return (
    <div className="space-y-5">
      {/* Gamification Overlays */}
      {xpGain && <XPGainNotification xpAmount={xpGain.amount} reason={xpGain.reason} onComplete={() => setXpGain(null)} />}
      {showLevelUp && levelUpData && <LevelUpAnimation oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} totalXP={levelUpData.totalXP} onClose={() => setShowLevelUp(false)} />}
      {showAchievement && <AchievementPopup achievement={showAchievement} onClose={() => setShowAchievement(null)} />}
      
      {/* TOP: Learning Journey Map */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">🗺️ Your Learning Journey</h3>
          <span className="text-xs font-medium text-slate-500">{isMiddleSchool ? 'Middle School' : 'High School'} • Grade {grade ?? '—'}</span>
        </div>
        
        {/* Category Map - Horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {categoryStats.map((cat: any, idx: number) => (
            <Link key={cat.id} href={`/category/${cat.id}`} className="flex-shrink-0 group">
              <div className="relative">
                {/* Connection line */}
                {idx < categoryStats.length - 1 && (
                  <div className="absolute top-8 left-full w-8 h-0.5 bg-slate-200 hidden sm:block"></div>
                )}
                
                {/* Category node */}
                <div className="flex flex-col items-center gap-2 w-20">
                  <div className={`w-16 h-16 ${cat.color} rounded-full flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform relative`}>
                    {cat.icon}
                    {cat.completionPercentage === 100 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">✓</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">{cat.name}</div>
                    <div className="text-xs text-slate-500">{cat.completedLessons}/{cat.totalLessons}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MIDDLE: Grid of Progress Stats, Quests, and Power-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Progress Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-white/80">Your Progress</div>
              <div className="text-3xl font-bold mt-1">{totalCompleted}</div>
              <div className="text-xs text-white/70">lessons completed</div>
            </div>
            <div className="relative">
              <RankBadge level={level} size="md" showDescription={false} />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Level Progress</span>
              <span className="font-bold">{xpInCurrentLevel}/100 XP</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${xpInCurrentLevel}%` }}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold">{currentStreak}</div>
                <div className="text-xs text-white/70">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{avgScore || '—'}</div>
                <div className="text-xs text-white/70">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{level}</div>
                <div className="text-xs text-white/70">Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Daily Quests - Compact */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>⚡</span> Daily Quests
            </h4>
          </div>
          <div className="p-4">
            <DailyQuestsPanel userId={user.id} grade={grade || 5} userProgress={userProgressData} compact={true} />
          </div>
        </div>

        {/* Right: Power-Ups - Compact */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>⚡</span> Power-Ups
            </h4>
          </div>
          <div className="p-4">
            <PowerUpInventory userId={user.id} compact={true} />
          </div>
        </div>
      </div>

      {/* Practice Categories - Clean Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">🎯 Start Practicing</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryStats.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.id}`} className="group">
              <div className="bg-white rounded-lg border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all p-3 flex flex-col">
                <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="text-xs font-bold text-slate-900 mb-1 leading-tight">{cat.name}</div>
                <div className="text-xs text-slate-600 mb-2">{cat.completedLessons}/{cat.totalLessons}</div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${cat.completionPercentage}%` }}></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Practice */}
      {allSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">📜 Recent Practice</h3>
            <Link href="/history" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">View All →</Link>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {allSessions.slice(0, 5).map((session: any) => (
              <div key={session.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-slate-900">{session.category}</div>
                  <div className="text-xs text-slate-500">Lesson {session.level_number} • {new Date(session.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-lg font-bold text-purple-600">{session.overall_score || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM: Leaderboard */}
      <div>
        <LeaderboardWidget userId={user.id} type="weekly_class" limit={5} />
      </div>
    </div>
  )
}

// Main Component
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
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-medium text-slate-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-16 lg:w-52 sticky top-0 left-0 bg-white border-r border-slate-200">
        <div>
          <div className="px-3 py-4 flex items-center justify-center lg:justify-start gap-2">
            <img src="/Icon.png" alt="Locuta" className="w-7 h-7" />
            <span className="text-base font-bold text-slate-900 hidden lg:inline">Locuta</span>
          </div>
          <nav className="mt-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg bg-purple-50 text-purple-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="/history" className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden lg:inline text-sm font-medium">History</span>
            </Link>
          </nav>
        </div>
        <div className="mb-4 px-3">
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/Icon.png" alt="Locuta" className="w-7 h-7" />
            <h1 className="text-base font-bold text-slate-900">Locuta</h1>
          </div>
          <Link href="/history" className="text-slate-700 hover:text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </header>
        
        <main className="flex-1 px-4 sm:px-6
        lg:px-8 py-5">
          <div className="max-w-7xl mx-auto">
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