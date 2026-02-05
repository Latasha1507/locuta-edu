'use client'

import { LeaderboardEntry } from '@/lib/gamification/types'

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  currentUserId?: string
  scoreLabel: string
}

export default function LeaderboardRow({ entry, currentUserId, scoreLabel }: LeaderboardRowProps) {
  const isCurrentUser = entry.userId === currentUserId
  
  const rankColors = {
    1: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    2: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900',
    3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
  }
  
  const rankColor = rankColors[entry.rank as keyof typeof rankColors] || 'bg-slate-100 text-slate-700'
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
      isCurrentUser 
        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg' 
        : 'bg-white hover:bg-slate-50'
    }`}>
      {/* Rank Badge */}
      <div className={`w-12 h-12 rounded-full ${rankColor} flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}>
        {entry.rank <= 3 ? (
          <span className="text-2xl">
            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
          </span>
        ) : (
          entry.rank
        )}
      </div>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {entry.rankIcon && (
            <span className="text-xl">{entry.rankIcon}</span>
          )}
          <div className="font-bold text-slate-900 truncate">
            {entry.userName}
            {isCurrentUser && (
              <span className="ml-2 text-xs font-semibold text-purple-600">(You)</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
          {entry.rankTitle && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              {entry.rankTitle}
            </span>
          )}
          {entry.userGrade && (
            <span>Grade {entry.userGrade}</span>
          )}
        </div>
      </div>
      
      {/* Score */}
      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-bold text-purple-600">{entry.score.toLocaleString()}</div>
        <div className="text-xs text-slate-600">{scoreLabel}</div>
      </div>
    </div>
  )
}