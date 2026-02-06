// Core gamification types and interfaces

export interface Rank {
  level: number
  title: string
  icon: string
  color: string
  xpRequired: number
  description: string
}

export interface PowerUp {
  id: string
  name: string
  icon: string
  description: string
  color: string
  usageLimit: number
  effectDuration?: number // in minutes
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// NEW: Added for dashboard
export interface UserProgressData {
  completedCategories: string[]
  weakCategories: string[]
  recentCategories: string[]
  currentStreak: number
  averageScore: number
  totalLessons: number
}

export interface QuestTemplate {
  id?: string // Made optional for compatibility
  type: 'practice' | 'performance' | 'streak' | 'challenge' | 'exploration' | 'timing' | 'mastery'
  title?: string // Added for display
  description: string
  icon?: string // Added for display
  target: QuestTarget | number // Allow both formats
  xpReward: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuestTarget {
  count?: number
  score?: number
  category?: string
  streak?: number
  maintain?: boolean
  beatBest?: boolean
  retry?: boolean
  newCategory?: boolean
  categoriesCount?: number
  before?: string // time like "10:00"
  after?: string
  noHints?: boolean
  consecutive?: number
}

export interface DailyQuest {
  id: string
  userId: string
  questType: string
  questDescription: string
  questTarget: QuestTarget
  xpReward: number
  completed: boolean
  questDate: string
  completedAt?: string
  progress?: number // for tracking partial progress
  quest_data?: QuestTemplate // Added for backward compatibility
}

export interface UserGamification {
  userId: string
  totalXp: number
  level: number
  rank: string
  prestigeLevel: number
  longestStreak: number
}

export interface UserPowerUp {
  userId: string
  powerupType: string
  quantity: number
  lastEarned?: string
}

export interface ActivePowerUp {
  id: string
  userId: string
  powerupType: string
  lessonId?: string
  activatedAt: string
  expiresAt?: string
}

export interface Artifact {
  type: 'microphone' | 'certificate' | 'constellation' | 'avatar_frame' | 'theme' | 'title'
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
  color: string
  requirement: string
  unlockCondition: ArtifactUnlockCondition
}

export interface ArtifactUnlockCondition {
  type: 'perfect_scores' | 'category_complete' | 'streak_days' | 'level_reached' | 'total_xp'
  value: number
  category?: string
}

export interface UserArtifact {
  id: string
  userId: string
  artifactType: string
  artifactName: string
  artifactRarity: string
  earnedAt: string
  equipped: boolean
}

export interface WeeklyEvent {
  id: string
  eventName: string
  eventType: 'speed_round' | 'perfect_practice' | 'category_takeover' | 'comeback_week'
  eventDescription: string
  xpMultiplier: number
  targetCategory?: string
  startDate: string
  endDate: string
  active: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userGrade?: number
  score: number
  avatar?: string
  rankIcon?: string
  rankTitle?: string
}

export interface LeaderboardType {
  type: 'weekly_class' | 'monthly_school' | 'streak' | 'perfect_scores' | 'category_master'
  title: string
  description: string
  icon: string
  scoreLabel: string
}

export interface Achievement {
  key: string
  name: string
  description: string
  icon: string
  color: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  xpReward: number
  unlockCondition: {
    type: string
    value: number
    category?: string
  }
}