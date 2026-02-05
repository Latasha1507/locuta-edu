'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Existing components
import LevelProgressRing from '@/components/LevelProgressRing'
import DailyChallengeCard from '@/components/DailyChallengeCard'
import AchievementPopup, { ACHIEVEMENTS } from '@/components/AchievementPopup'
import AchievementBadge from '@/components/AchievementBadge'

// NEW Gamification components
import RankBadge from '@/components/gamification/RankBadge'
import RankProgressBar from '@/components/gamification/RankProgressBar'
import DailyQuestsPanel from '@/components/gamification/DailyQuestsPanel'
import PowerUpInventory from '@/components/gamification/PowerUpInventory'
import WeeklyEventBanner from '@/components/gamification/WeeklyEventBanner'
import LeaderboardWidget from '@/components/gamification/LeaderboardWidget'
import ArtifactGallery from '@/components/gamification/ArtifactGallery'
import ProgressMap from '@/components/gamification/ProgressMap'
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation'
import XPGainNotification from '@/components/gamification/XPGainNotification'

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

// Enhanced Student Dashboard Component with FULL GAMIFICATION
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
            .limit(50)
        ])

        const progressData = progressResult.data || []
        const lessonsData = lessonsResult.data || []
        const sessionsData = sessionsResult.data || []

        setProgress(progressData)
        setLessons(lessonsData)
        setAllSessions(sessionsData)
        
        // Check for new achievements
        checkAchievements(progressData, sessionsData)
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [user.id])

  // Achievement checking logic
  const checkAchievements = (progressData: any[], sessionsData: any[]) => {
    const completedCount = progressData.filter(p => p.completed).length
    const newAchievements: (keyof typeof ACHIEVEMENTS)[] = []
    
    // Check completion milestones
    if (completedCount === 1 && !hasAchievement('FIRST_LESSON')) {
      newAchievements.push('FIRST_LESSON')
    } else if (completedCount === 5 && !hasAchievement('FIVE_LESSONS')) {
      newAchievements.push('FIVE_LESSONS')
    } else if (completedCount === 10 && !hasAchievement('TEN_LESSONS')) {
      newAchievements.push('TEN_LESSONS')
    } else if (completedCount === 20 && !hasAchievement('TWENTY_LESSONS')) {
      newAchievements.push('TWENTY_LESSONS')
    }
    
    // Check for perfect score
    const hasPerfectScore = sessionsData.some(s => s.overall_score === 100)
    if (hasPerfectScore && !hasAchievement('PERFECT_SCORE')) {
      newAchievements.push('PERFECT_SCORE')
    }
    
    // Check streak
    const streak = calculateStreak(sessionsData)
    if (streak === 3 && !hasAchievement('THREE_DAY_STREAK')) {
      newAchievements.push('THREE_DAY_STREAK')
    } else if (streak === 7 && !hasAchievement('WEEK_WARRIOR')) {
      newAchievements.push('WEEK_WARRIOR')
    }
    
    // Check for weekend practice
    const hasWeekendPractice = sessionsData.some(s => {
      const day = new Date(s.created_at).getDay()
      return day === 0 || day === 6
    })
    if (hasWeekendPractice && !hasAchievement('WEEKEND_WARRIOR')) {
      newAchievements.push('WEEKEND_WARRIOR')
    }
    
    // Show first achievement if any
    if (newAchievements.length > 0) {
      setShowAchievement(newAchievements[0])
      // Store in localStorage
      const stored = localStorage.getItem(`achievements_${user.id}`) || '[]'
      const existing = JSON.parse(stored)
      localStorage.setItem(`achievements_${user.id}`, JSON.stringify([...existing, ...newAchievements]))
    }
  }
  
  const hasAchievement = (achievement: string) => {
    const stored = localStorage.getItem(`achievements_${user.id}`) || '[]'
    return JSON.parse(stored).includes(achievement)
  }

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
  const overallPercentage = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0

  const getLevelAndXP = () => {
    const xpPerLesson = 10
    const totalXP = totalCompleted * xpPerLesson
    const level = Math.floor(totalXP / 100) + 1
    const xpInCurrentLevel = totalXP % 100
    return { level, xpInCurrentLevel, totalXP }
  }

  const { level, xpInCurrentLevel, totalXP } = getLevelAndXP()
  const currentStreak = calculateStreak(allSessions)
  const avgScore = allSessions?.length > 0 
    ? Math.round(allSessions.reduce((sum: number, s: any) => sum + (s.overall_score || 0), 0) / allSessions.length)
    : 0
  const bestScore = progress?.length > 0 ? Math.max(...progress.map((p: any) => p.best_score || 0)) : 0
  
  // Today's stats for daily challenges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysSessions = allSessions.filter(s => {
    const sessionDate = new Date(s.created_at)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime()
  })
  const todaysHighScore = todaysSessions.length > 0 
    ? Math.max(...todaysSessions.map(s => s.overall_score || 0))
    : 0

  // User progress data for quests
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
    <div className="space-y-6">
      {/* XP Gain Notification */}
      {xpGain && (
        <XPGainNotification 
          xpAmount={xpGain.amount}
          reason={xpGain.reason}
          onComplete={() => setXpGain(null)}
        />
      )}
      
      {/* Level Up Animation */}
      {showLevelUp && levelUpData && (
        <LevelUpAnimation
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={levelUpData.totalXP}
          onClose={() => setShowLevelUp(false)}
        />
      )}
      
      {/* Achievement Popup */}
      {showAchievement && (
        <AchievementPopup 
          achievement={showAchievement} 
          onClose={() => setShowAchievement(null)} 
        />
      )}
      
      {/* Hero Section - Level, Rank & Welcome */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-6">
            {/* Level Ring */}
            <LevelProgressRing 
              level={level} 
              xpInCurrentLevel={xpInCurrentLevel}
              totalXP={totalXP}
            />
            
            {/* Rank Badge */}
            <RankBadge level={level} size="lg" showDescription={false} />
            
            {/* Welcome Text */}
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                Welcome back! 👋
              </h2>
              <p className="text-white/90 text-lg mb-3">
                {grade === null ? 'Grade not set' : (isMiddleSchool ? 'Middle School' : 'High School')} • Grade {grade ?? '—'}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span>🎯</span>
                  <span className="font-bold">{totalCompleted} Lessons</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span>🔥</span>
                    <span className="font-bold">{currentStreak} Day Streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-3xl font-bold">{overallPercentage}%</div>
              <div className="text-xs text-white/80 mt-1">Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-3xl font-bold">{avgScore || '-'}</div>
              <div className="text-xs text-white/80 mt-1">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Progress Bar */}
      <RankProgressBar level={level} totalXP={totalXP} />

      {/* Daily Quests & Challenges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyChallengeCard 
          userId={user.id}
          todaysSessions={todaysSessions.length}
          todaysHighScore={todaysHighScore}
          hasStreak={currentStreak > 0}
        />
        <DailyQuestsPanel 
          userId={user.id}
          grade={grade || 5}
          userProgress={userProgressData}
        />
      </div>

      {/* Power-Ups, Events & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PowerUpInventory userId={user.id} />
        </div>
        <WeeklyEventBanner />
      </div>

      <LeaderboardWidget userId={user.id} type="weekly_class" limit={5} />

      {/* Progress Map */}
      <ProgressMap 
        userId={user.id}
        grade={grade || 5}
        categories={categoryStats}
      />

      {/* Artifact Gallery */}
      <ArtifactGallery userId={user.id} />

      {/* Categories */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>🎯</span> Practice Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryStats.map((category: any) => (
            <Link key={category.id} href={`/category/${category.id}`} className="group">
              <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 p-6 min-h-[220px] flex flex-col hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 text-3xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {category.icon}
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight flex-grow group-hover:text-purple-700 transition-colors">
                  {category.name}
                </h4>
                
                <p className="text-xs text-slate-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between text-base mb-3">
                  <span className="text-slate-600 font-medium text-sm">{category.completedLessons}/{category.totalLessons} lessons</span>
                  {category.completionPercentage > 0 && (
                    <span className="text-purple-600 font-bold text-lg">{category.completionPercentage}%</span>
                  )}
                </div>
                
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${category.completionPercentage}%` }}
                  />
                </div>
                
                {category.bestScore > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <AchievementBadge score={category.bestScore} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📜</span> Recent Practice
          </h3>
          <Link href="/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
            View All →
          </Link>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-lg">
          <div className="divide-y divide-slate-100">
            {allSessions.slice(0, 5).map((session: any) => (
              <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">{session.category}</div>
                  <div className="text-xs text-slate-600">
                    Module {session.module_number} • Lesson {session.level_number} • {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{session.overall_score || '-'}</div>
                  </div>
                  {session.overall_score && (
                    <AchievementBadge score={session.overall_score} />
                  )}
                </div>
              </div>
            ))}
            {allSessions.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">🎤</div>
                <p className="text-slate-600 font-medium">No practice sessions yet!</p>
                <p className="text-sm text-slate-500 mt-1">Start practicing to see your activity here</p>
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
  const [user, setUser] = useState
  <any>(null)
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