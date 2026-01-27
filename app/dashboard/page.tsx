'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAdminClient } from '@/lib/admin-client';

function AnimatedRadialProgress({ percentage, size = 72 }: { percentage: number, size?: number }) {
  const radius = (size - 8) / 2
  const circ = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(1, percentage / 100))
  return (
    <svg width={size} height={size} className="overflow-visible">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e9e9f3" strokeWidth={8} opacity={0.3} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#8b5cf6" strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0.2, 0.2, 1)' }}
      />
      <text x="50%" y="54%" textAnchor="middle" alignmentBaseline="middle" fontSize={size * 0.34} fontWeight="bold" className="fill-slate-900">
        {percentage}%
      </text>
    </svg>
  )
}

const sidebarLinks = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <svg width={21} height={21} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  },
  {
    name: 'Practice History',
    href: '/history',
    icon: <svg width={21} height={21} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="9" />
    </svg>
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/auth/login';
          return;
        }

        setUser(user);
        
        // Get user's grade level from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('grade_level')
          .eq('id', user.id)
          .single()
        
        setGradeLevel(profile?.grade_level || null);
        
        // Admin check
        isAdminClient().then(setIsUserAdmin).catch(() => setIsUserAdmin(false));
        
        // Fetch data
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
        ]);

        setProgress(progressResult.data || []);
        setLessons(lessonsResult.data || []);
        setAllSessions(sessionsResult.data || []);
        setLoading(false);

      } catch (err) {
        console.error('Dashboard load error:', err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // B2B Categories - filtered by grade level
  const getCategories = () => {
    const middleSchoolCategories = [
      { id: 'public-speaking-fundamentals', name: 'Public Speaking Fundamentals', description: 'Master presentations, speeches, and public events', icon: '🎤', color: 'from-purple-400 to-pink-500' },
      { id: 'storytelling', name: 'Storytelling', description: 'Craft compelling narratives that captivate audiences', icon: '📖', color: 'from-blue-400 to-cyan-500' },
      { id: 'leadership-team-communication', name: 'Leadership & Team Communication', description: 'Build confidence in leading groups and teams', icon: '👥', color: 'from-green-400 to-emerald-500' },
      { id: 'conversation-skills', name: 'Conversation Skills', description: 'Build confidence in everyday social interactions', icon: '💬', color: 'from-yellow-400 to-orange-500' },
      { id: 'project-academic-presentation', name: 'Project & Academic Presentation Skills', description: 'Excel in classroom presentations and projects', icon: '📊', color: 'from-red-400 to-pink-500' }
    ];

    const highSchoolCategories = [
      { id: 'public-speaking-mastery', name: 'Public Speaking Mastery', description: 'Advanced presentation and speech techniques', icon: '🎤', color: 'from-purple-400 to-indigo-600' },
      { id: 'advanced-storytelling', name: 'Advanced Storytelling & Content', description: 'Create impactful narratives for various audiences', icon: '📖', color: 'from-blue-400 to-purple-500' },
      { id: 'leadership-team-advanced', name: 'Leadership & Team Communication (Advanced)', description: 'Lead teams and facilitate productive discussions', icon: '👥', color: 'from-green-400 to-teal-500' },
      { id: 'content-creation-digital', name: 'Content Creation & Digital Communication', description: 'Engage with audiences through digital platforms', icon: '🎥', color: 'from-pink-400 to-rose-500' }
    ];

    if (!gradeLevel) return middleSchoolCategories;
    return (gradeLevel >= 5 && gradeLevel <= 8) ? middleSchoolCategories : highSchoolCategories;
  };

  const categories = getCategories();

  const categoryStats = categories.map(category => {
    const categoryLessons = lessons?.filter((l: any) => 
      l.category.toLowerCase().replace(/\s+/g, '-') === category.id
    ) || []
    
    const totalLessons = categoryLessons.length
    const categoryProgress = progress?.filter((p: any) => 
      p.category.toLowerCase().replace(/\s+/g, '-') === category.id
    ) || []
    
    const completedLessons = categoryProgress.filter((p: any) => p.completed).length
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const bestScore = categoryProgress.length > 0 ? Math.max(...categoryProgress.map((p: any) => p.best_score || 0)) : 0
    const hasStarted = completedLessons > 0

    return { ...category, totalLessons, completedLessons, completionPercentage, bestScore, hasStarted }
  })

  const totalCompleted = progress?.filter((p: any) => p.completed).length || 0
  const totalAvailable = lessons?.length || 0
  const overallPercentage = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0

  // Gamification: Calculate streak
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

  // Gamification: Get level and XP
  const getLevelAndXP = () => {
    const xpPerLesson = 10
    const totalXP = totalCompleted * xpPerLesson
    const level = Math.floor(totalXP / 100) + 1
    const xpInCurrentLevel = totalXP % 100
    const xpToNextLevel = 100 - xpInCurrentLevel
    
    return { level, xpInCurrentLevel, xpToNextLevel, totalXP }
  }

  // Gamification: Get badges
  const getBadges = () => {
    const badges = []
    if (totalCompleted >= 1) badges.push({ name: 'First Steps', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' })
    if (totalCompleted >= 10) badges.push({ name: 'Speaker', icon: '🎤', color: 'bg-purple-100 text-purple-700' })
    if (totalCompleted >= 25) badges.push({ name: 'Communicator', icon: '💬', color: 'bg-blue-100 text-blue-700' })
    if (totalCompleted >= 50) badges.push({ name: 'Master', icon: '🏆', color: 'bg-orange-100 text-orange-700' })
    if (calculateStreak() >= 3) badges.push({ name: '3-Day Streak', icon: '🔥', color: 'bg-red-100 text-red-700' })
    if (calculateStreak() >= 7) badges.push({ name: 'Week Warrior', icon: '⚡', color: 'bg-green-100 text-green-700' })
    const perfectScores = progress.filter((p: any) => p.best_score >= 90).length
    if (perfectScores >= 5) badges.push({ name: 'Perfectionist', icon: '✨', color: 'bg-pink-100 text-pink-700' })
    
    return badges
  }

  const currentStreak = calculateStreak()
  const { level, xpInCurrentLevel, xpToNextLevel } = getLevelAndXP()
  const badges = getBadges()
  const avgScore = allSessions?.length > 0 
    ? Math.round(allSessions.reduce((sum: number, s: any) => sum + (s.overall_score || 0), 0) / allSessions.length)
    : 0

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-[82px] lg:w-64 sticky top-0 left-0 bg-white/40 backdrop-blur-xl border-r border-slate-200 shadow-lg pb-4">
        <div>
          <div className="px-0 py-7 flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl shadow-lg">
              <img src="/Icon.png" alt="Locuta" className="w-full h-full object-contain" />
            </div>
            <span className="ml-0 lg:ml-2 mt-2 lg:mt-0 text-xl font-bold text-slate-900 hidden lg:inline-block">Locuta.ai</span>
          </div>
          <nav className="mt-2">
            <ul className="flex flex-col gap-1">
              {sidebarLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="flex lg:px-6 px-0 py-2 mb-0 items-center group hover:bg-white/30 rounded-lg transition-all">
                    <span className="w-12 h-12 flex items-center justify-center">
                      <span className="text-slate-700 group-hover:text-indigo-600">{link.icon}</span>
                    </span>
                    <span className="hidden lg:inline-block text-base text-slate-700 group-hover:text-indigo-700 font-semibold">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mb-2 flex flex-col items-center gap-2">
          {isUserAdmin && (
            <Link href="/admin" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] transition-all">
              <span className="text-lg">🔑</span>
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}
          <form action="/auth/signout" method="post" className="w-full flex justify-center">
            <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] transition-all">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M13 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" />
              </svg>
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200 px-4 py-4 shadow-lg sticky top-0">
          <div className="flex items-center gap-3">
            <img src="/Icon.png" alt="Locuta" className="w-10 h-10 rounded-xl shadow-md" />
            <h1 className="text-xl font-bold text-slate-900">Locuta.ai</h1>
          </div>
          <Link href="/history" className="flex items-center gap-1 text-slate-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-white/50">
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
              <path d="M12 8v5l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7"/>
            </svg>
            <span className="hidden sm:inline">History</span>
          </Link>
        </header>
        
        <main className="w-full flex-1 px-1 md:px-0 py-8 flex flex-col items-center">
          <div className="w-full max-w-7xl mx-auto rounded-3xl bg-white/70 backdrop-blur-2xl shadow-2xl px-4 sm:px-8 py-10 border border-slate-100">
            
            {/* Welcome Section with Level */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-4xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  Welcome back! 👋
                  <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-bold rounded-full shadow-lg animate-pulse">
                    Level {level}
                  </span>
                </h2>
                <p className="text-slate-600 text-lg">Keep up the amazing work! 🚀</p>
              </div>
            </div>
            {/* School Admin: Create Student Button */}
<div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-2xl font-bold mb-2">👨‍🎓 Manage Students</h3>
      <p className="text-white/90">Create and manage student accounts for your institution</p>
    </div>
    <Link 
      href="/admin/create-student"
      className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
    >
      + Create Student
    </Link>
  </div>
</div>

            {/* XP Progress Bar */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="font-bold text-slate-900">{xpInCurrentLevel} / 100 XP</span>
                </div>
                <span className="text-sm font-semibold text-purple-700">{xpToNextLevel} XP to Level {level + 1}</span>
              </div>
              <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>

            {/* Stats Cards - Gamified */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <AnimatedRadialProgress percentage={overallPercentage} size={88} />
                <div>
                  <div className="text-lg font-bold text-slate-800">Your Progress</div>
                  <div className="text-purple-700 font-semibold">{totalCompleted} / {totalAvailable} lessons</div>
                </div>
              </div>
              
              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🔥</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">Streak</div>
                  <div className="text-orange-700 font-bold text-xl">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">⭐</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">Avg Score</div>
                  <div className="text-yellow-700 font-bold text-xl">{avgScore || '-'}</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🏆</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">Best Score</div>
                  <div className="text-green-700 font-bold text-xl">
                    {progress?.length > 0 ? Math.max(...progress.map((p: any) => p.best_score || 0)) : '-'}
                  </div>
                </div>
              </div>
            </section>

            {/* Badges Section */}
            {badges.length > 0 && (
              <section className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🎖️</span> Your Badges
                </h3>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge, i) => (
                    <div key={i} className={`${badge.color} px-4 py-2 rounded-xl font-bold shadow-md border-2 border-current flex items-center gap-2 hover:scale-105 transition-transform`}>
                      <span className="text-2xl">{badge.icon}</span>
                      <span>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories Section - More Colorful */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🎯</span> Choose Your Practice Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryStats.map((category: any) => (
                  <Link key={category.id} href={`/category/${category.id}`} className="group">
                    <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:scale-[1.03] border-2 border-transparent hover:border-purple-300">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                      
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:rotate-6`}>
                            <span className="text-3xl">{category.icon}</span>
                          </div>
                          {category.completionPercentage > 0 && (
                            <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${category.color} text-white text-sm font-bold shadow-md`}>
                              {category.completionPercentage}%
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{category.description}</p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="text-lg">📚</span>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Lessons</div>
                              <div className="text-sm font-bold text-slate-900">{category.completedLessons}/{category.totalLessons}</div>
                            </div>
                          </div>
                          
                          {category.bestScore > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <span className="text-lg">✨</span>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">Best</div>
                                <div className="text-sm font-bold text-slate-900">{category.bestScore}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-700 shadow-lg`}
                                 style={{ width: `${category.completionPercentage}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm font-bold">
                          <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                            {category.hasStarted ? '🎮 Continue' : '🚀 Start Now'}
                          </span>
                          <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* First Time User Message - More Exciting */}
            {totalCompleted === 0 && (
              <div className="mt-12 text-center bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 border-4 border-purple-300 rounded-3xl p-12 shadow-2xl">
                <div className="inline-block mb-4 animate-bounce">
                  <span className="text-6xl">🎉</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">Ready to Start Your Adventure?</h3>
                <p className="text-slate-700 text-xl max-w-2xl mx-auto leading-relaxed mb-6">
                  Choose any category above to begin! Earn XP, unlock badges, and level up as you practice! 🚀
                </p>
                <div className="flex justify-center gap-4 text-sm font-semibold text-slate-600">
                  <span>🌟 Earn 10 XP per lesson</span>
                  <span>🏆 Unlock cool badges</span>
                  <span>🔥 Build your streak</span>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white/70 backdrop-blur-xl border-t border-slate-200 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-lg font-bold text-slate-900">Locuta.ai</span>
              <p className="text-slate-600 text-sm">© 2025 Locuta.ai. Elevate your voice.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}