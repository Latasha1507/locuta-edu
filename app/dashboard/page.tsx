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

// 🎮 FUN & GAMIFIED Student Dashboard
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

  const categoryStats = categories.map(category => {
    const categoryLessons = lessons?.filter((l: any) => l.category === category.dbName) || []
    const totalLessons = categoryLessons.length
    const categoryProgress = progress?.filter((p: any) => p.category === category.dbName) || []
    const completedLessons = categoryProgress.filter((p: any) => p.completed).length
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const bestScore = categoryProgress.length > 0 ? Math.max(...categoryProgress.map((p: any) => p.best_score || 0)) : 0

    return { ...category, totalLessons, completedLessons, completionPercentage, bestScore, isUnlocked: false }
  })

  categoryStats.forEach((cat, index) => {
    if (index === 0) {
      cat.isUnlocked = true
    } else {
      const previousCat = categoryStats[index - 1]
      cat.isUnlocked = previousCat.completionPercentage >= 50
    }
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
    <div className="space-y-6">
      {/* Gamification Overlays */}
      {xpGain && <XPGainNotification xpAmount={xpGain.amount} reason={xpGain.reason} onComplete={() => setXpGain(null)} />}
      {showLevelUp && levelUpData && <LevelUpAnimation oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} totalXP={levelUpData.totalXP} onClose={() => setShowLevelUp(false)} />}
      {showAchievement && <AchievementPopup achievement={showAchievement} onClose={() => setShowAchievement(null)} />}
      
      {/* 🎮 HERO: Player Stats Card */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 overflow-hidden shadow-2xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Welcome Back, Champ! 🎉</h2>
              <p className="text-white/80 text-sm">{isMiddleSchool ? 'Middle School' : 'High School'} • Grade {grade ?? '—'}</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform shadow-xl">
                <RankBadge level={level} size="lg" showDescription={false} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black shadow-lg animate-bounce">
                {level}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-3xl font-black text-white">{totalCompleted}</div>
              <div className="text-xs text-white/80 font-medium">Lessons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-3xl font-black text-yellow-300">{currentStreak} 🔥</div>
              <div className="text-xs text-white/80 font-medium">Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-3xl font-black text-green-300">{avgScore || '—'}</div>
              <div className="text-xs text-white/80 font-medium">Avg Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-lg font-black text-cyan-300">{xpInCurrentLevel}/100</div>
              <div className="text-xs text-white/80 font-medium">XP</div>
            </div>
          </div>

          <div className="mt-4 w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${xpInCurrentLevel}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 🗺️ GAME MAP: Learning Journey */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            🗺️
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Your Quest Map</h3>
            <p className="text-sm text-slate-600">Complete 50% to unlock next level!</p>
          </div>
        </div>

        {/* Journey Map - Winding Path */}
        <div className="space-y-2">
          {categoryStats.map((cat: any, idx: number) => {
            const isLeft = idx % 2 === 0
            return (
              <div key={cat.id} className={`flex items-center gap-4 ${!isLeft && 'flex-row-reverse'}`}>
                {/* Connection Path */}
                {idx < categoryStats.length - 1 && (
                  <div className={`absolute ${isLeft ? 'left-1/2' : 'right-1/2'} w-1 h-16 bg-gradient-to-b from-purple-300 to-blue-300 -mt-8 ${cat.isUnlocked ? '' : 'opacity-30'}`}></div>
                )}

                {/* Level Node */}
                <Link href={cat.isUnlocked ? `/category/${cat.id}` : '#'} 
                  className={`relative group flex-1 ${isLeft ? 'mr-auto' : 'ml-auto'} max-w-md`}>
                  <div className={`relative bg-white rounded-2xl p-4 border-2 transition-all ${
                    cat.isUnlocked 
                      ? `border-purple-300 hover:border-purple-500 hover:shadow-2xl hover:scale-105 cursor-pointer`
                      : 'border-slate-200 opacity-60 cursor-not-allowed grayscale'
                  }`}>
                    {/* Completion Star */}
                    {cat.completionPercentage === 100 && (
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-xl animate-bounce">
                        ⭐
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform ${
                        !cat.isUnlocked && 'grayscale'
                      }`}>
                        {cat.isUnlocked ? cat.icon : '🔒'}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900">{cat.name}</h4>
                          {cat.completionPercentage > 0 && cat.completionPercentage < 100 && (
                            <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {cat.completionPercentage}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          {cat.isUnlocked ? `${cat.completedLessons}/${cat.totalLessons} completed` : 'Unlock previous level!'}
                        </p>
                        
                        {cat.isUnlocked && (
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                              style={{ width: `${cat.completionPercentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>

                      {/* Best Score Badge */}
                      {cat.bestScore > 0 && (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {cat.bestScore}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Best</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Daily Quests */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl border-2 border-blue-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                ⚡ Today's Quests
              </h4>
            </div>
            <div className="p-5">
              <DailyQuestsPanel userId={user.id} grade={grade || 5} userProgress={userProgressData} compact={true} />
            </div>
          </div>

          {/* Recent Activity */}
          {allSessions.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  📜 Recent Practice
                </h4>
                <Link href="/history" className="text-sm text-white/90 hover:text-white font-bold">
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {allSessions.slice(0, 5).map((session: any) => (
                  <div key={session.id} className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{session.category}</div>
                      <div className="text-sm text-slate-500">Lesson {session.level_number} • {new Date(session.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {session.overall_score || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-5">
          {/* Power-Ups */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-2xl border-2 border-orange-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-5 py-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                ⚡ Power-Ups
              </h4>
            </div>
            <div className="p-5">
              <PowerUpInventory userId={user.id} compact={true} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
            <LeaderboardWidget userId={user.id} type="weekly_class" limit={5} />
          </div>
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
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple
          -600 border-t-transparent mb-3"></div>
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