'use client'

import { getRankForLevel, getNextRank } from '@/lib/gamification/calculations'

interface RankProgressBarProps {
  level: number
  totalXP: number
}

export default function RankProgressBar({ level, totalXP }: RankProgressBarProps) {
  const currentRank = getRankForLevel(level)
  const nextRankInfo = getNextRank(level)
  
  if (!nextRankInfo) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white text-center">
        <div className="text-2xl mb-2">👑</div>
        <div className="font-bold">Maximum Rank Achieved!</div>
        <div className="text-sm text-white/80 mt-1">You've reached {currentRank.title}</div>
      </div>
    )
  }
  
  const { rank: nextRank, xpNeeded } = nextRankInfo
  const xpIntoRank = totalXP - currentRank.xpRequired
  const xpForRank = nextRank.xpRequired - currentRank.xpRequired
  const progressPercent = Math.min(Math.round((xpIntoRank / xpForRank) * 100), 100)
  
  return (
    <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentRank.color} flex items-center justify-center text-2xl shadow-md`}>
            {currentRank.icon}
          </div>
          <div>
            <div className="font-bold text-slate-900">{currentRank.title}</div>
            <div className="text-xs text-slate-600">Current Rank</div>
          </div>
        </div>
        
        <div className="text-center px-4">
          <div className="text-2xl">→</div>
          <div className="text-xs text-slate-600 mt-1">{xpNeeded} XP</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-slate-900 text-right">{nextRank.title}</div>
            <div className="text-xs text-slate-600 text-right">Next Rank</div>
          </div>
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${nextRank.color} flex items-center justify-center text-2xl shadow-md opacity-50`}>
            {nextRank.icon}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${nextRank.color} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-slate-600">{progressPercent}% to next rank</span>
          <span className="font-bold text-purple-600">{xpNeeded} XP needed</span>
        </div>
      </div>
    </div>
  )
}