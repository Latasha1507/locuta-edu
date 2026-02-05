'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/lib/gamification/types'
import LeaderboardRow from './LeaderboardRow'
import Link from 'next/link'

interface LeaderboardWidgetProps {
  userId: string
  type?: 'weekly_class' | 'monthly_school' | 'streak'
  limit?: number
}

export default function LeaderboardWidget({ 
  userId, 
  type = 'weekly_class',
  limit = 5 
}: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  
  useEffect(() => {
    loadLeaderboard()
  }, [userId, type])
  
  const loadLeaderboard = async () => {
    try {
      const supabase = createClient()
      
      // For now, mock data - you'll replace with actual leaderboard query
      const mockData: LeaderboardEntry[] = [
        { rank: 1, userId: 'user1', userName: 'Priya Sharma', userGrade: 8, score: 450, rankIcon: '👑', rankTitle: 'Master Communicator' },
        { rank: 2, userId: 'user2', userName: 'Rahul Verma', userGrade: 8, score: 380, rankIcon: '🎯', rankTitle: 'Skilled Orator' },
        { rank: 3, userId: userId, userName: 'You', userGrade: 8, score: 320, rankIcon: '💬', rankTitle: 'Articulate Student' },
        { rank: 4, userId: 'user4', userName: 'Ananya Patel', userGrade: 7, score: 290, rankIcon: '🎤', rankTitle: 'Confident Voice' },
        { rank: 5, userId: 'user5', userName: 'Arjun Kumar', userGrade: 8, score: 250, rankIcon: '🥉', rankTitle: 'Novice Speaker' }
      ]
      
      setEntries(mockData.slice(0, limit))
      
      const currentUserEntry = mockData.find(e => e.userId === userId)
      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank)
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const typeLabels = {
    weekly_class: { title: 'Weekly Class Leaders', icon: '📊', scoreLabel: 'XP' },
    monthly_school: { title: 'Monthly Champions', icon: '🏆', scoreLabel: 'XP' },
    streak: { title: 'Streak Champions', icon: '🔥', scoreLabel: 'Days' }
  }
  
  const config = typeLabels[type]
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{config.icon}</span> {config.title}
          </h3>
          {userRank && (
            <p className="text-sm text-slate-600 mt-1">
              You're ranked #{userRank}
            </p>
          )}
        </div>
        <Link 
          href="/leaderboard" 
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
        >
          View All →
        </Link>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            currentUserId={userId}
            scoreLabel={config.scoreLabel}
          />
        ))}
      </div>
      
      {entries.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <div className="text-sm font-semibold text-slate-900">No rankings yet</div>
          <div className="text-xs text-slate-600 mt-1">Complete lessons to appear on the leaderboard!</div>
        </div>
      )}
    </div>
  )
}