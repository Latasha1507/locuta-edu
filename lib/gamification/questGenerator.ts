import { createClient } from '@/lib/supabase/client'
import { QUEST_TEMPLATES } from './constants'
import { QuestTemplate, DailyQuest } from './types'

/**
 * Generate 3 personalized daily quests for a user
 */
export async function generateDailyQuests(
  userId: string,
  grade: number,
  userProgress: {
    completedCategories: string[]
    weakCategories: string[]
    recentCategories: string[]
    currentStreak: number
    averageScore: number
    totalLessons: number
  }
): Promise<QuestTemplate[]> {
  const quests: QuestTemplate[] = []
  const questTypes = Object.keys(QUEST_TEMPLATES)
  
  // Always include one practice quest
  const practiceQuest = selectQuestByDifficulty(
    QUEST_TEMPLATES.practice,
    userProgress.totalLessons
  )
  quests.push(practiceQuest)
  
  // Add performance quest if user has completed at least 5 lessons
  if (userProgress.totalLessons >= 5) {
    const performanceQuest = selectQuestByDifficulty(
      QUEST_TEMPLATES.performance,
      userProgress.averageScore
    )
    quests.push(performanceQuest)
  } else {
    // For beginners, add exploration quest
    const explorationQuest = QUEST_TEMPLATES.exploration[0]
    quests.push(explorationQuest)
  }
  
  // Third quest - varied based on user behavior
  if (userProgress.currentStreak === 0) {
    // Encourage streak building
    quests.push(QUEST_TEMPLATES.streak[0])
  } else if (userProgress.weakCategories.length > 0) {
    // Encourage practicing weak areas
    const challengeQuest = QUEST_TEMPLATES.challenge[0]
    quests.push(challengeQuest)
  } else if (Math.random() < 0.5) {
    // Random timing quest for variety
    const timingQuests = QUEST_TEMPLATES.timing
    quests.push(timingQuests[Math.floor(Math.random() * timingQuests.length)])
  } else {
    // Mastery quest for advanced users
    const masteryQuests = QUEST_TEMPLATES.mastery
    quests.push(masteryQuests[Math.floor(Math.random() * masteryQuests.length)])
  }
  
  return quests
}

/**
 * Select quest based on difficulty appropriate for user
 */
function selectQuestByDifficulty(
  quests: QuestTemplate[],
  userMetric: number
): QuestTemplate {
  if (userMetric < 10) {
    return quests.find(q => q.difficulty === 'easy') || quests[0]
  } else if (userMetric < 50) {
    return quests.find(q => q.difficulty === 'medium') || quests[0]
  } else {
    return quests.find(q => q.difficulty === 'hard') || quests[quests.length - 1]
  }
}

/**
 * Save generated quests to database
 */
export async function saveDailyQuests(
  userId: string,
  quests: QuestTemplate[]
): Promise<boolean> {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    const questsToInsert = quests.map(quest => ({
      user_id: userId,
      quest_type: quest.type,
      quest_description: quest.description,
      quest_target: quest.target,
      xp_reward: quest.xpReward,
      quest_date: today,
      completed: false
    }))
    
    const { error } = await supabase
      .from('daily_quests')
      .insert(questsToInsert)
    
    if (error) {
      console.error('Error saving daily quests:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error in saveDailyQuests:', err)
    return false
  }
}

/**
 * Get today's quests for a user
 */
export async function getTodaysQuests(userId: string): Promise<DailyQuest[]> {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_date', today)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching daily quests:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Error in getTodaysQuests:', err)
    return []
  }
}

/**
 * Check and create quests if they don't exist for today
 */
export async function ensureDailyQuests(
  userId: string,
  grade: number,
  userProgress: any
): Promise<DailyQuest[]> {
  const existingQuests = await getTodaysQuests(userId)
  
  if (existingQuests.length > 0) {
    return existingQuests
  }
  
  // Generate new quests
  const questTemplates = await generateDailyQuests(userId, grade, userProgress)
  await saveDailyQuests(userId, questTemplates)
  
  // Fetch the newly created quests
  return await getTodaysQuests(userId)
}

/**
 * Mark quest as completed
 */
export async function completeQuest(questId: string): Promise<{ success: boolean; xpEarned: number }> {
  try {
    const supabase = createClient()
    
    // Get quest details first
    const { data: quest, error: fetchError } = await supabase
      .from('daily_quests')
      .select('xp_reward, completed')
      .eq('id', questId)
      .single()
    
    if (fetchError || !quest) {
      console.error('Error fetching quest:', fetchError)
      return { success: false, xpEarned: 0 }
    }
    
    if (quest.completed) {
      return { success: true, xpEarned: 0 } // Already completed
    }
    
    // Mark as completed
    const { error: updateError } = await supabase
      .from('daily_quests')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', questId)
    
    if (updateError) {
      console.error('Error completing quest:', updateError)
      return { success: false, xpEarned: 0 }
    }
    
    return { success: true, xpEarned: quest.xp_reward }
  } catch (err) {
    console.error('Error in completeQuest:', err)
    return { success: false, xpEarned: 0 }
  }
}

/**
 * Check if a session completes any quests
 */
export async function checkQuestCompletion(
  userId: string,
  sessionData: {
    score: number
    category: string
    moduleNumber: number
    timestamp: Date
  }
): Promise<string[]> {
  const completedQuestIds: string[] = []
  const quests = await getTodaysQuests(userId)
  
  for (const quest of quests) {
    if (quest.completed) continue
    
    let shouldComplete = false
    const target = quest.questTarget as any
    
    switch (quest.questType) {
      case 'performance':
        if (target.score && sessionData.score >= target.score) {
          shouldComplete = true
        }
        break
      
      case 'timing':
        const hour = sessionData.timestamp.getHours()
        if (target.before) {
          const targetHour = parseInt(target.before.split(':')[0])
          if (hour < targetHour) shouldComplete = true
        }
        if (target.after) {
          const targetHour = parseInt(target.after.split(':')[0])
          if (hour >= targetHour) shouldComplete = true
        }
        break
      
      // Add more quest type checks as needed
    }
    
    if (shouldComplete) {
      const result = await completeQuest(quest.id)
      if (result.success) {
        completedQuestIds.push(quest.id)
      }
    }
  }
  
  return completedQuestIds
}