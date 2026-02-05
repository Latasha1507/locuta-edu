'use client'

import { DailyQuest } from '@/lib/gamification/types'

interface QuestCardProps {
  quest: DailyQuest
  onComplete?: () => void
}

export default function QuestCard({ quest, onComplete }: QuestCardProps) {
  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-blue-500 to-cyan-500',
    hard: 'from-purple-500 to-pink-500'
  }
  
  const questTypeIcons = {
    practice: '📚',
    performance: '🎯',
    streak: '🔥',
    challenge: '💪',
    exploration: '🗺️',
    timing: '⏰',
    mastery: '👑'
  }
  
  const icon = questTypeIcons[quest.questType as keyof typeof questTypeIcons] || '✨'
  
  return (
    <div className={`bg-gradient-to-br ${quest.completed ? 'from-slate-300 to-slate-400' : 'from-white to-slate-50'} rounded-xl p-4 border-2 ${quest.completed ? 'border-green-500' : 'border-slate-200'} shadow-lg transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-md">
            {icon}
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm leading-tight">
              {quest.questDescription}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-purple-600">
                +{quest.xpReward} XP
              </span>
            </div>
          </div>
        </div>
        
        {quest.completed && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {!quest.completed && quest.progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600">Progress</span>
            <span className="font-bold text-slate-900">{quest.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${quest.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {quest.completed && (
        <div className="mt-3 pt-3 border-t border-slate-300">
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-xs font-bold">✓ Completed!</span>
            {quest.completedAt && (
              <span className="text-xs text-slate-600">
                {new Date(quest.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}