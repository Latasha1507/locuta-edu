'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProgressData } from '@/lib/gamification/types'

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

  const categoriesToShow = segment === 'ms' ? middleSchoolCategories : segment === 'hs' ? highSchoolCategories : [...middleSchoolCategories, ...highSchoolCategories]

  return (
    <div className="space-y-5">
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

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-bold text-slate-900">📚 Curriculum Categories</h3>
        <select value={segment} onChange={(e) => setSegment(e.target.value as any)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 font-medium">
          <option value="both">All</option>
          <option value="ms">Middle School</option>
          <option value="hs">High School</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoriesToShow.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.id}`} className={`bg-gradient-to-br ${cat.color} rounded-lg p-3 text-white hover:shadow-lg transition-all hover:scale-105 h-24 flex flex-col justify-between`}>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">{cat.icon}</div>
            <div className="text-xs font-semibold leading-tight">{cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// REDESIGNED Student Dashboard
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
    { id: 'public-speaking-fundamentals', name: 'Public Speaking', shortName: 'Speaking', icon: '🎙️', gradient: 'from-violet-500 to-purple-600', dbName: 'Public Speaking Fundamentals', order: 1 },
    { id: 'storytelling', name: 'Storytelling', shortName: 'Stories', icon: '📚', gradient: 'from-blue-500 to-cyan-500', dbName: 'Storytelling', order: 2 },
    { id: 'leadership-team-communication', name: 'Leadership', shortName: 'Lead', icon: '🎯', gradient: 'from-emerald-500 to-green-600', dbName: 'Leadership & Team Communication', order: 3 },
    { id: 'conversation-skills', name: 'Conversation', shortName: 'Talk', icon: '💭', gradient: 'from-amber-500 to-orange-500', dbName: 'Conversation Skills', order: 4 },
    { id: 'project-academic-presentation', name: 'Presentations', shortName: 'Present', icon: '📊', gradient: 'from-rose-500 to-pink-600', dbName: 'Project & Academic Presentation', order: 5 },
    { id: 'persuasive-speaking', name: 'Persuasion', shortName: 'Persuade', icon: '⚡', gradient: 'from-indigo-500 to-blue-600', dbName: 'Persuasive Speaking', order: 6 }
  ] : [
    { id: 'public-speaking-mastery', name: 'Public Speaking', shortName: 'Speaking', icon: '🎙️', gradient: 'from-violet-600 to-purple-700', dbName: 'Public Speaking Mastery', order: 1 },
    { id: 'advanced-storytelling', name: 'Storytelling', shortName: 'Stories', icon: '📚', gradient: 'from-blue-600 to-cyan-600', dbName: 'Advanced Storytelling & Content', order: 2 },
    { id: 'leadership-team-advanced', name: 'Leadership', shortName: 'Lead', icon: '🎯', gradient: 'from-emerald-600 to-green-700', dbName: 'Leadership & Team Communication (Advanced)', order: 3 },
    { id: 'content-creation-digital', name: 'Digital', shortName: 'Digital', icon: '📱', gradient: 'from-fuchsia-500 to-pink-600', dbName: 'Content Creation & Digital Communication', order: 4 },
    { id: 'entrepreneurial-sales', name: 'Sales', shortName: 'Sales', icon: '💼', gradient: 'from-orange-500 to-red-600', dbName: 'Entrepreneurial & Sales Communication', order: 5 },
    { id: 'debate-advanced-persuasion', name: 'Debate', shortName: 'Debate', icon: '⚖️', gradient: 'from-indigo-600 to-violet-700', dbName: 'Debate & Advanced Persuasion', order: 6 }
  ]

  // FIXED: Calculate stats properly
  const categoryStats = categories.map(category => {
    const categoryLessons = lessons?.filter((l: any) => l.category === category.dbName) || []
    const totalLessons = categoryLessons.length
    const categoryProgress = progress?.filter((p: any) => p.category === category.dbName) || []
    const completedLessons = categoryProgress.filter((p: any) => p.completed).length
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const bestScore = categoryProgress.length > 0 ? Math.max(...categoryProgress.map((p: any) => p.best_score || 0)) : 0
    
    // UNLOCK LOGIC: First category always unlocked, rest unlock when previous is 50% complete
    const previousCategory = categories.find(c => c.order === category.order - 1)
    let isUnlocked = category.order === 1 // First is always unlocked
    
    if (previousCategory && category.order > 1) {
      const prevStats = categoryStats.find((cs: any) => cs.id === previousCategory.id)
      if (prevStats && prevStats.completionPercentage >= 50) {
        isUnlocked = true
      }
    }

    return { ...category, totalLessons, completedLessons, completionPercentage, bestScore, isUnlocked }
  })

  const totalCompleted = progress?.filter((p: any) => p.completed).length || 0
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

  const userProgressData: UserProgressData = {
    completedCategories: categoryStats.filter(c => c.completionPercentage === 100).map(c => c.dbName),
    weakCategories: categoryStats.filter(c => c.bestScore > 0 && c.bestScore < 70).map(c => c.dbName),
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
      
      {/* TOP: Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <RankBadge level={level} size="sm" showDescription={false} />
            </div>
            <div>
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-xs text-white/80">Level</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{totalCompleted}</div>
          <div className="text-xs text-white/80">Lessons Done</div>
          <div className="mt-1 text-xs font-medium">{xpInCurrentLevel}/100 XP</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-xs text-white/80">Day Streak 🔥</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{avgScore || '—'}</div>
          <div className="text-xs text-white/80">Avg Score</div>
        </div>
      </div>

      {/* MAIN: Learning Journey - Locked/Unlocked Progression */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">🗺️ Your Learning Path</h2>
            <p className="text-sm text-slate-600">{isMiddleSchool ? 'Middle School' : 'High School'} • Grade {grade ?? '—'}</p>
          </div>
        </div>
        
        {/* Progressive Unlock Path */}
        <div className="space-y-4">
          {categoryStats.map((cat: any, idx: number) => (
            <div key={cat.id} className="relative">
              {/* Connection Line */}
              {idx < categoryStats.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-slate-200"></div>
              )}
              
              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                cat.isUnlocked 
                  ? 'border-slate-200 hover:border-purple-300 hover:shadow-md cursor-pointer'
                  : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
              }`}
                onClick={() => {
                  if (cat.isUnlocked) {
                    window.location.href = `/category/${cat.id}`
                  }
                }}
              >
                {/* Icon Circle */}
                <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl flex-shrink-0 ${
                  cat.isUnlocked ? 'shadow-lg' : 'grayscale'
                }`}>
                  {cat.isUnlocked ? cat.icon : '🔒'}
                  {cat.completionPercentage === 100 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm shadow-md">
                      ⭐
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{cat.name}</h3>
                      <p className="text-xs text-slate-600">
                        {cat.isUnlocked ? `${cat.completedLessons}/${cat.totalLessons} lessons` : 'Complete previous category to unlock'}
                      </p>
                    </div>
                    {cat.bestScore > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{cat.bestScore}</div>
                        <div className="text-xs text-slate-500">Best</div>
                      </div>
                    )}
                  </div>
                  
                  {cat.isUnlocked && (
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                        style={{ width: `${cat.completionPercentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {!cat.isUnlocked && (
                  <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    Locked
                  </div>
                )}
                {cat.isUnlocked && cat.completionPercentage === 0 && (
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Start Now!
                  </div>
                )}
                {cat.isUnlocked && cat.completionPercentage > 0 && cat.completionPercentage < 100 && (
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {cat.completionPercentage}%
                  </div>
                )}
                {cat.completionPercentage === 100 && (
                  <div className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                    ✓ Complete
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quests & Power-Ups Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              ⚡ Daily Quests
            </h4>
          </div>
          <div className="p-4">
            <DailyQuestsPanel userId={user.id} grade={grade || 5} userProgress={userProgressData} compact={true} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              ⚡ Power-Ups
            </h4>
          </div>
          <div className="p-4">
            <PowerUpInventory userId={user.id} compact={true} />
          </div>
        </div>
      </div>

      {/* Recent + Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Practice - Compact */}
        {allSessions.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">📜 Recent Practice</h4>
              <Link href="/history" className="text-xs text-white/80 hover:text-white font-semibold">View All →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {allSessions.slice(0, 3).map((session: any) => (
                <div key={session.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{session.category}</div>
                    <div className="text-xs text-slate-500">Lesson {session.level_number}</div>
                  </div>
                  <div className="text-xl font-bold text-purple-600">{session.overall_score || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard - Compact (Only 3) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <LeaderboardWidget userId={user.id} type="weekly_class" limit={3} />
        </div>
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
    
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5">
      <div className="max-w-6xl mx-auto">
        {isUserAdmin ? <AdminDashboard user={user} /> : <StudentDashboard user={user} grade={grade} />}
      </div>
    </main>
  </div>
</div>
)
}