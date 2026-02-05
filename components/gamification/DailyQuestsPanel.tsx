'use client'

import { useEffect, useState } from 'react'
import { getTodaysQuests, ensureDailyQuests } from '@/lib/gamification/questGenerator'
import { DailyQuest } from '@/lib/gamification/types'
import QuestCard from './QuestCard'

interface DailyQuestsPanelProps {
  userId: string
  grade: number
  userProgress?: {
    completedCategories: string[]
    weakCategories: string[]
    recentCategories: string[]
    currentStreak: number
    averageScore: number
    totalLessons: number
  }
}

export default function DailyQuestsPanel({ userId, grade, userProgress }: DailyQuestsPanelProps) {
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadQuests()
  }, [userId])
  
  const loadQuests = async () => {
    try {
      const defaultProgress = {
        completedCategories: [],
        weakCategories: [],
        recentCategories: [],
        currentStreak: 0,
        averageScore: 0,
        totalLessons: 0
      }
      
      const questsData = await ensureDailyQuests(
        userId, 
        grade, 
        userProgress || defaultProgress
      )
      setQuests(questsData)
    } catch (err) {
      console.error('Error loading quests:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const completedCount = quests.filter(q => q.completed).length
  const totalXP = quests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0)
  const possibleXP = quests.reduce((sum, q) => sum + q.xpReward, 0)
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>✨</span> Daily Quests
          </h3>
          <p className="text-sm text-white/80 mt-1">
            Complete quests to earn bonus XP
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{completedCount}/3</div>
          <div className="text-xs text-white/80">Completed</div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {quests.map((quest) => (
          <QuestCard 
            key={quest.id} 
            quest={quest}
            onComplete={loadQuests}
          />
        ))}
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quest XP Today</span>
          <span className="text-lg font-bold">{totalXP}/{possibleXP} XP</span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(totalXP / possibleXP) * 100}%` }}
          />
        </div>
      </div>
      
      {completedCount === 3 && (
        <div className="mt-4 bg-green-500 rounded-lg p-3 text-center">
          <div className="text-lg font-bold">🎉 All Quests Complete!</div>
          <div className="text-sm text-white/90 mt-1">Come back tomorrow for new challenges</div>
        </div>
      )}
    </div>
  )
}