import { RANKS, XP_REWARDS, LEVEL_UP_XP_BASE } from './constants'
import { Rank } from './types'

// ==================== LEVEL CALCULATIONS ====================

/**
 * Calculate level from total XP
 * Each level requires 100 XP (configurable via LEVEL_UP_XP_BASE)
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / LEVEL_UP_XP_BASE) + 1
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * LEVEL_UP_XP_BASE
}

/**
 * Calculate XP progress within current level
 */
export function getXPInCurrentLevel(totalXP: number): number {
  return totalXP % LEVEL_UP_XP_BASE
}

/**
 * Calculate total XP needed to reach a specific level
 */
export function getTotalXPForLevel(level: number): number {
  return (level - 1) * LEVEL_UP_XP_BASE
}

/**
 * Calculate percentage progress to next level
 */
export function getLevelProgress(totalXP: number): number {
  const xpInLevel = getXPInCurrentLevel(totalXP)
  return Math.round((xpInLevel / LEVEL_UP_XP_BASE) * 100)
}

// ==================== RANK CALCULATIONS ====================

/**
 * Get rank information for a given level
 */
export function getRankForLevel(level: number): Rank {
  // Find the highest rank that the level qualifies for
  const qualifyingRanks = RANKS.filter(rank => level >= rank.level)
  return qualifyingRanks[qualifyingRanks.length - 1] || RANKS[0]
}

/**
 * Get next rank and XP needed
 */
export function getNextRank(currentLevel: number): { rank: Rank; xpNeeded: number } | null {
  const currentRank = getRankForLevel(currentLevel)
  const nextRankIndex = RANKS.findIndex(r => r.level === currentRank.level) + 1
  
  if (nextRankIndex >= RANKS.length) return null
  
  const nextRank = RANKS[nextRankIndex]
  const currentXP = getTotalXPForLevel(currentLevel)
  const xpNeeded = nextRank.xpRequired - currentXP
  
  return { rank: nextRank, xpNeeded }
}

/**
 * Check if user leveled up after gaining XP
 */
export function checkLevelUp(oldXP: number, newXP: number): { leveledUp: boolean; newLevel: number; oldLevel: number } {
  const oldLevel = calculateLevel(oldXP)
  const newLevel = calculateLevel(newXP)
  
  return {
    leveledUp: newLevel > oldLevel,
    newLevel,
    oldLevel
  }
}

/**
 * Check if user ranked up after leveling up
 */
export function checkRankUp(oldLevel: number, newLevel: number): { rankedUp: boolean; newRank: Rank; oldRank: Rank } {
  const oldRank = getRankForLevel(oldLevel)
  const newRank = getRankForLevel(newLevel)
  
  return {
    rankedUp: oldRank.level !== newRank.level,
    newRank,
    oldRank
  }
}

// ==================== XP GAIN CALCULATIONS ====================

/**
 * Calculate XP gained from completing a lesson
 */
export function calculateLessonXP(params: {
  score: number
  isFirstTimeCategory?: boolean
  hasEventMultiplier?: boolean
  eventMultiplier?: number
}): number {
  let xp = XP_REWARDS
  .LESSON_COMPLETION
  
  // Bonus for high scores
  if (params.score >= 90) {
    xp += XP_REWARDS.PERFECT_SCORE_BONUS
  }
  
  // Bonus for first time in category
  if (params.isFirstTimeCategory) {
    xp += XP_REWARDS.FIRST_TIME_CATEGORY
  }
  
  // Apply event multiplier if active
  if (params.hasEventMultiplier && params.eventMultiplier) {
    xp = Math.round(xp * params.eventMultiplier)
  }
  
  return xp
}

/**
 * Calculate XP from quest completion
 */
export function calculateQuestXP(baseXP: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  const multipliers = {
    easy: 1,
    medium: 1.5,
    hard: 2
  }
  
  return Math.round(baseXP * multipliers[difficulty])
}

/**
 * Calculate XP from achievement unlock
 */
export function calculateAchievementXP(baseXP: number): number {
  return Math.round(baseXP * XP_REWARDS.ACHIEVEMENT_MULTIPLIER)
}

// ==================== STREAK CALCULATIONS ====================

/**
 * Calculate current streak from session dates
 */
export function calculateStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create set of unique dates
  const uniqueDates = new Set(
    sessionDates.map(date => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )
  
  let streak = 0
  let currentDate = new Date(today)
  
  while (uniqueDates.has(currentDate.getTime())) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  return streak
}

/**
 * Check if streak is active (practiced today or yesterday)
 */
export function isStreakActive(lastPracticeDate: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastPractice = new Date(lastPracticeDate)
  lastPractice.setHours(0, 0, 0, 0)
  
  return lastPractice.getTime() === today.getTime() || lastPractice.getTime() === yesterday.getTime()
}

/**
 * Calculate days until streak breaks
 */
export function getDaysUntilStreakBreak(lastPracticeDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastPractice = new Date(lastPracticeDate)
  lastPractice.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (lastPractice.getTime() === today.getTime()) {
    return 1 // Must practice by tomorrow
  } else {
    return 0 // Streak already broken or at risk
  }
}

// ==================== POWERUP CALCULATIONS ====================

/**
 * Determine which powerup to award
 */
export function determinePowerupReward(type: 'random' | 'choice'): string | string[] {
  const powerupIds = ['focus_boost', 'time_extension', 'second_chance', 'pro_tip', 'confidence_shield']
  
  if (type === 'random') {
    return powerupIds[Math.floor(Math.random() * powerupIds.length)]
  } else {
    // Return 3 random options for user to choose from
    const shuffled = [...powerupIds].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }
}

/**
 * Check if powerup can be used
 */
export function canUsePowerup(quantity: number, activePowerupsCount: number, maxActive: number = 1): boolean {
  return quantity > 0 && activePowerupsCount < maxActive
}

// ==================== LEADERBOARD CALCULATIONS ====================

/**
 * Calculate leaderboard score based on type
 */
export function calculateLeaderboardScore(
  type: 'weekly_class' | 'monthly_school' | 'streak' | 'perfect_scores' | 'category_master',
  data: {
    weeklyXP?: number
    monthlyXP?: number
    currentStreak?: number
    perfectScoreCount?: number
    categoryAvgScore?: number
  }
): number {
  switch (type) {
    case 'weekly_class':
      return data.weeklyXP || 0
    case 'monthly_school':
      return data.monthlyXP || 0
    case 'streak':
      return data.currentStreak || 0
    case 'perfect_scores':
      return data.perfectScoreCount || 0
    case 'category_master':
      return data.categoryAvgScore || 0
    default:
      return 0
  }
}

// ==================== ARTIFACT UNLOCK CHECKS ====================

/**
 * Check if artifact should be unlocked
 */
export function checkArtifactUnlock(
  artifactCondition: { type: string; value: number; category?: string },
  userData: {
    perfectScores?: number
    categoryCompletions?: Record<string, number>
    currentStreak?: number
    level?: number
    totalXP?: number
  }
): boolean {
  switch (artifactCondition.type) {
    case 'perfect_scores':
      return (userData.perfectScores || 0) >= artifactCondition.value
    
    case 'category_complete':
      if (!artifactCondition.category) return false
      const categoryProgress = userData.categoryCompletions?.[artifactCondition.category] || 0
      return categoryProgress >= artifactCondition.value
    
    case 'streak_days':
      return (userData.currentStreak || 0) >= artifactCondition.value
    
    case 'level_reached':
      return (userData.level || 0) >= artifactCondition.value
    
    case 'total_xp':
      return (userData.totalXP || 0) >= artifactCondition.value
    
    default:
      return false
  }
}

// ==================== PROGRESS CALCULATIONS ====================

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0
  return Math.round((completedLessons / totalLessons) * 100)
}

/**
 * Calculate category completion percentage
 */
export function calculateCategoryProgress(
  completedInCategory: number,
  totalInCategory: number
): number {
  if (totalInCategory === 0) return 0
  return Math.round((completedInCategory / totalInCategory) * 100)
}

/**
 * Calculate estimated time to reach level
 */
export function estimateTimeToLevel(
  currentXP: number,
  targetLevel: number,
  avgXPPerDay: number
): number {
  const xpNeeded = getTotalXPForLevel(targetLevel) - currentXP
  if (avgXPPerDay === 0) return Infinity
  return Math.ceil(xpNeeded / avgXPPerDay)
}

// ==================== QUEST PROGRESS TRACKING ====================

/**
 * Calculate quest progress percentage
 */
export function calculateQuestProgress(
  currentProgress: number,
  targetValue: number
): number {
  if (targetValue === 0) return 0
  return Math.min(Math.round((currentProgress / targetValue) * 100), 100)
}

/**
 * Check if quest is completed
 */
export function isQuestCompleted(
  currentProgress: number,
  targetValue: number
): boolean {
  return currentProgress >= targetValue
}

// ==================== RARITY SCORE CALCULATIONS ====================

/**
 * Calculate rarity score for profile
 */
export function calculateRarityScore(artifacts: Array<{ rarity: string }>): number {
  const rarityPoints = {
    common: 1,
    rare: 3,
    epic: 5,
    legendary: 10
  }
  
  return artifacts.reduce((total, artifact) => {
    return total + (rarityPoints[artifact.rarity as keyof typeof rarityPoints] || 0)
  }, 0)
}

// ==================== ACHIEVEMENT CHECKING ====================

/**
 * Check if achievement should be unlocked
 */
export function checkAchievementUnlock(
  achievementCondition: { type: string; value: number; category?: string },
  userData: {
    lessonsCompleted?: number
    perfectScores?: number
    consecutiveHighScores?: number
    currentStreak?: number
    weekendPractice?: boolean
    categoryCompletions?: Record<string, number>
  }
): boolean {
  switch (achievementCondition.type) {
    case 'lessons_completed':
      return (userData.lessonsCompleted || 0) >= achievementCondition.value
    
    case 'perfect_score':
      return (userData.perfectScores || 0) >= achievementCondition.value
    
    case 'consecutive_high_scores':
      return (userData.consecutiveHighScores || 0) >= achievementCondition.value
    
    case 'streak_days':
      return (userData.currentStreak || 0) >= achievementCondition.value
    
    case 'weekend_practice':
      return userData.weekendPractice === true
    
    case 'category_complete':
      if (!achievementCondition.category) return false
      const categoryProgress = userData.categoryCompletions?.[achievementCondition.category] || 0
      return categoryProgress >= 30 // Assuming 30 lessons per category
    
    default:
      return false
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format XP with commas
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString()
}

/**
 * Get XP gain color based on amount
 */
export function getXPGainColor(xp: number): string {
  if (xp >= 50) return 'text-purple-600'
  if (xp >= 30) return 'text-blue-600'
  if (xp >= 15) return 'text-green-600'
  return 'text-slate-600'
}

/**
 * Calculate time played in minutes
 */
export function calculateTimePlayed(sessions: Array<{ created_at: string }>): number {
  // Assuming average 3 minutes per session
  return sessions.length * 3
}

/**
 * Format time played
 */
export function formatTimePlayed(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}