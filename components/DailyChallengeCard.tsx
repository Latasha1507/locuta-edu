'use client'

import { useState, useEffect } from 'react'

export default function DailyChallengeCard({ 
  userId,
  todaysSessions = 0,
  todaysHighScore = 0,
  hasStreak = false
}: {
  userId: string
  todaysSessions?: number
  todaysHighScore?: number
  hasStreak?: boolean
}) {
  const challenges = [
    { 
      id: 'daily_2_lessons', 
      icon: '🎯', 
      title: 'Complete 2 lessons today', 
      reward: 20, 
      progress: todaysSessions, 
      total: 2,
      completed: todaysSessions >= 2
    },
    { 
      id: 'daily_80_score', 
      icon: '⭐', 
      title: 'Score 80+ on any lesson', 
      reward: 15, 
      progress: todaysHighScore >= 80 ? 1 : 0, 
      total: 1,
      completed: todaysHighScore >= 80
    },
    { 
      id: 'daily_streak', 
      icon: '🔥', 
      title: 'Maintain your streak', 
      reward: 10, 
      progress: hasStreak ? 1 : 0, 
      total: 1,
      completed: hasStreak
    }
  ]
  
  const totalProgress = challenges.filter(c => c.completed).length
  const totalChallenges = challenges.length
  
  const [timeUntilReset, setTimeUntilReset] = useState('')
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">⚡</span> Daily Challenges
        </h3>
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-semibold">
          Resets in {timeUntilReset}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">Daily Progress</span>
          <span className="font-bold">{totalProgress}/{totalChallenges}</span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(totalProgress / totalChallenges) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${
              challenge.completed ? 'bg-white/20 border-2 border-white/40' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{challenge.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{challenge.title}</div>
                  <div className="text-xs text-white/80">+{challenge.reward} XP</div>
                </div>
              </div>
              {challenge.completed && <span className="text-2xl">✓</span>}
            </div>
            {!challenge.completed && (
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}