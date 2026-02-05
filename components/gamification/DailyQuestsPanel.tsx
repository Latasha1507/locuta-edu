'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateDailyQuests } from '@/lib/gamification/questGenerator'

interface DailyQuestsPanelProps {
  userId: string
  grade: number
  userProgress: {
    completedCategories: string[]
    weakCategories: string[]
    recentCategories: string[]
    currentStreak: number
    averageScore: number
    totalLessons: number
  }
  compact?: boolean // NEW: Compact mode for dashboard
}

export default function DailyQuestsPanel({ 
  userId, 
  grade, 
  userProgress,
  compact = false 
}: DailyQuestsPanelProps) {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completedToday, setCompletedToday] = useState(0)

  useEffect(() => {
    loadQuests()
  }, [userId])

  const loadQuests = async () => {
    try {
      const supabase = createClient()
      
      // Check if we have quests for today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingQuests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
  
      if (existingQuests && existingQuests.length > 0) {
        setQuests(existingQuests)
        setCompletedToday(existingQuests.filter(q => q.completed).length)
      } else {
        // Generate new quests for today
        const newQuests = await generateDailyQuests(userId, grade, userProgress as any)
        
        // Save to database
        const questsToInsert = newQuests.map(quest => ({
          user_id: userId,
          date: today,
          quest_type: quest.type,
          quest_data: quest,
          completed: false,
          xp_reward: quest.xpReward
        }))
  
        const { data: insertedQuests, error } = await supabase
          .from('daily_quests')
          .insert(questsToInsert)
          .select()
  
        if (!error && insertedQuests) {
          setQuests(insertedQuests)
        } else {
          // Fallback: use generated quests without DB
          setQuests(newQuests.map(q => ({ quest_data: q, completed: false })))
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading quests:', err)
      setLoading(false)
    }
  }
  
  const checkAndCompleteQuest = async (quest: any) => {
    // Check if quest should be auto-completed based on user progress
    let shouldComplete = false

    const questData = quest.quest_data || quest

    switch (questData.type) {
      case 'complete_lessons':
        // Check if user completed required lessons today
        shouldComplete = userProgress.totalLessons >= questData.target
        break
      case 'achieve_score':
        // Check if user achieved the target score
        shouldComplete = userProgress.averageScore >= questData.target
        break
      case 'maintain_streak':
        shouldComplete = userProgress.currentStreak >= questData.target
        break
      case 'practice_category':
        shouldComplete = userProgress.recentCategories.includes(questData.category)
        break
    }

    if (shouldComplete && !quest.completed) {
      const supabase = createClient()
      await supabase
        .from('daily_quests')
        .update({ completed: true })
        .eq('id', quest.id)

      // Award XP
      await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: questData.xpReward
      })

      loadQuests()
    }
  }

  useEffect(() => {
    quests.forEach(quest => {
      checkAndCompleteQuest(quest)
    })
  }, [userProgress])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // COMPACT MODE: Show only 3 quests
  const displayQuests = compact ? quests.slice(0, 3) : quests
  const totalQuests = quests.length

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{completedToday}/{totalQuests} completed</span>
          <span className="text-xs font-bold text-blue-600">+{quests.reduce((sum, q) => sum + (q.xp_reward || q.quest_data?.xpReward || 0), 0)} XP</span>
        </div>

        <div className="space-y-2">
          {displayQuests.map((quest, idx) => {
            const questData = quest.quest_data || quest
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all ${
                  quest.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    quest.completed ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {quest.completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 leading-tight mb-1">
                      {questData.title}
                    </div>
                    <div className="text-xs text-slate-600">{questData.description}</div>
                  </div>
                  <div className="text-xs font-bold text-blue-600">+{questData.xpReward}</div>
                </div>
              </div>
            )
          })}
        </div>

        {totalQuests > 3 && (
          <div className="text-center pt-2">
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All {totalQuests} Quests →
            </button>
          </div>
        )}
      </div>
    )
  }

  // FULL MODE: Show all quests
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> Daily Quests
          </h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-bold text-white">{completedToday}/{totalQuests}</span>
          </div>
        </div>
        <p className="text-sm text-white/90 mt-1">Complete quests to earn bonus XP</p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Quest XP Today</span>
            <span className="font-bold text-blue-600">
              +{quests.filter(q => q.completed).reduce((sum, q) => sum + (q.xp_reward || q.quest_data?.xpReward || 0), 0)} / 
              {quests.reduce((sum, q) => sum + (q.xp_reward || q.quest_data?.xpReward || 0), 0)} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${totalQuests > 0 ? (completedToday / totalQuests) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          {quests.map((quest, idx) => {
            const questData = quest.quest_data || quest
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all ${
                  quest.completed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    quest.completed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {quest.completed ? '✓' : questData.icon || '⚡'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{questData.title}</h4>
                      <div className="flex items-center gap-1 bg-blue-100 rounded-full px-2 py-1">
                        <span className="text-xs font-bold text-blue-700">+{questData.xpReward} XP</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{questData.description}</p>
                    {quest.completed && (
                      <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                        <span>✓</span>
                        <span>Completed!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}