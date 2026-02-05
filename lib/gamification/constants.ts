import { Rank, PowerUp, QuestTemplate, Artifact, LeaderboardType, Achievement } from './types'

// ==================== XP CONSTANTS ====================
export const XP_REWARDS = {
  LESSON_COMPLETION: 10,
  PERFECT_SCORE_BONUS: 5,
  FIRST_TIME_CATEGORY: 15,
  DAILY_LOGIN: 5,
  QUEST_COMPLETION_BASE: 20,
  ACHIEVEMENT_MULTIPLIER: 1.5
}

export const LEVEL_UP_XP_BASE = 100 // Each level requires 100 XP

// ==================== POWERUP EARN RATES ====================
export const POWERUP_EARN_CONDITIONS = {
  DAILY_LOGIN: { chance: 0.3, powerup: 'random' },
  PERFECT_SCORE: { chance: 0.5, powerup: 'choice' },
  SEVEN_DAY_STREAK: { count: 2, powerup: 'choice' },
  QUEST_COMPLETION: { chance: 0.2, powerup: 'random' }
}

// ==================== RANKS ====================
export const RANKS: Rank[] = [
  {
    level: 1,
    title: 'Novice Speaker',
    icon: '🥉',
    color: 'from-amber-600 to-orange-600',
    xpRequired: 0,
    description: 'Just starting your speaking journey'
  },
  {
    level: 6,
    title: 'Confident Voice',
    icon: '🎤',
    color: 'from-blue-500 to-cyan-500',
    xpRequired: 500,
    description: 'Building confidence in communication'
  },
  {
    level: 11,
    title: 'Articulate Student',
    icon: '💬',
    color: 'from-green-500 to-emerald-500',
    xpRequired: 1000,
    description: 'Expressing ideas clearly and effectively'
  },
  {
    level: 16,
    title: 'Skilled Orator',
    icon: '🎯',
    color: 'from-purple-500 to-pink-500',
    xpRequired: 1500,
    description: 'Mastering the art of persuasion'
  },
  {
    level: 21,
    title: 'Master Communicator',
    icon: '🌟',
    color: 'from-yellow-500 to-orange-500',
    xpRequired: 2000,
    description: 'Captivating audiences with ease'
  },
  {
    level: 26,
    title: 'Elite Speaker',
    icon: '👑',
    color: 'from-indigo-600 to-purple-600',
    xpRequired: 2500,
    description: 'Among the top communicators'
  },
  {
    level: 31,
    title: 'Legendary Voice',
    icon: '💎',
    color: 'from-pink-600 to-rose-600',
    xpRequired: 3000,
    description: 'Your voice inspires others'
  },
  {
    level: 36,
    title: 'Academy Champion',
    icon: '⚡',
    color: 'from-orange-600 to-red-600',
    xpRequired: 3500,
    description: 'A true champion of communication'
  },
  {
    level: 41,
    title: 'Speaking Grandmaster',
    icon: '🔥',
    color: 'from-red-600 to-pink-700',
    xpRequired: 4000,
    description: 'The highest honor in the Speaking Academy'
  }
]

// ==================== POWER-UPS ====================
export const POWERUPS: Record<string, PowerUp> = {
  focus_boost: {
    id: 'focus_boost',
    name: 'Focus Boost',
    icon: '🎯',
    description: 'Get AI hints during practice to improve your response',
    color: 'from-blue-500 to-cyan-500',
    usageLimit: 1,
    effectDuration: 10,
    rarity: 'common'
  },
  time_extension: {
    id: 'time_extension',
    name: 'Time Extension',
    icon: '⏱️',
    description: 'Extra 30 seconds for recording your response',
    color: 'from-green-500 to-emerald-500',
    usageLimit: 1,
    rarity: 'common'
  },
  second_chance: {
    id: 'second_chance',
    name: 'Second Chance',
    icon: '🔄',
    description: 'Retry a lesson without losing your streak',
    color: 'from-purple-500 to-pink-500',
    usageLimit: 1,
    rarity: 'rare'
  },
  pro_tip: {
    id: 'pro_tip',
    name: 'Pro Tip',
    icon: '💡',
    description: 'Unlock advanced framework and expert strategies',
    color: 'from-yellow-500 to-orange-500',
    usageLimit: 1,
    rarity: 'rare'
  },
  confidence_shield: {
    id: 'confidence_shield',
    name: 'Confidence Shield',
    icon: '🎭',
    description: 'Your score cannot drop below 70% for next lesson',
    color: 'from-indigo-500 to-purple-500',
    usageLimit: 1,
    rarity: 'epic'
  }
}

// ==================== QUEST TEMPLATES ====================
export const QUEST_TEMPLATES: Record<string, QuestTemplate[]> = {
  practice: [
    {
      type: 'practice',
      description: 'Complete 2 lessons in any category',
      target: { count: 2 },
      xpReward: 20,
      difficulty: 'easy'
    },
    {
      type: 'practice',
      description: 'Complete 3 lessons today',
      target: { count: 3 },
      xpReward: 30,
      difficulty: 'medium'
    },
    {
      type: 'practice',
      description: 'Complete 5 lessons in one day',
      target: { count: 5 },
      xpReward: 50,
      difficulty: 'hard'
    }
  ],
  performance: [
    {
      type: 'performance',
      description: 'Score 85+ on any lesson',
      target: { score: 85 },
      xpReward: 30,
      difficulty: 'medium'
    },
    {
      type: 'performance',
      description: 'Score 90+ on any lesson',
      target: { score: 90 },
      xpReward: 40,
      difficulty: 'medium'
    },
    {
      type: 'performance',
      description: 'Get a perfect score (100)',
      target: { score: 100 },
      xpReward: 50,
      difficulty: 'hard'
    }
  ],
  streak: [
    {
      type: 'streak',
      description: 'Maintain your daily streak',
      target: { maintain: true },
      xpReward: 15,
      difficulty: 'easy'
    },
    {
      type: 'streak',
      description: 'Practice 2 days in a row',
      target: { streak: 2 },
      xpReward: 25,
      difficulty: 'easy'
    }
  ],
  challenge: [
    {
      type: 'challenge',
      description: 'Beat your best score in any module',
      target: { beatBest: true },
      xpReward: 40,
      difficulty: 'medium'
    },
    {
      type: 'challenge',
      description: 'Complete a lesson you struggled with before',
      target: { retry: true },
      xpReward: 35,
      difficulty: 'medium'
    }
  ],
  exploration: [
    {
      type: 'exploration',
      description: 'Try a lesson from a new category',
      target: { newCategory: true },
      xpReward: 25,
      difficulty: 'easy'
    },
    {
      type: 'exploration',
      description: 'Practice in 2 different categories today',
      target: { categoriesCount: 2 },
      xpReward: 30,
      difficulty: 'medium'
    },
    {
      type: 'exploration',
      description: 'Practice in 3 different categories',
      target: { categoriesCount: 3 },
      xpReward: 45,
      difficulty: 'hard'
    }
  ],
  timing: [
    {
      type: 'timing',
      description: 'Practice before 10 AM (Early Bird)',
      target: { before: '10:00' },
      xpReward: 35,
      difficulty: 'medium'
    },
    {
      type: 'timing',
      description: 'Practice in the evening (after 6 PM)',
      target: { after: '18:00' },
      xpReward: 30,
      difficulty: 'easy'
    },
    {
      type: 'timing',
      description: 'Practice late night (after 10 PM)',
      target: { after: '22:00' },
      xpReward: 40,
      difficulty: 'medium'
    }
  ],
  mastery: [
    {
      type: 'mastery',
      description: 'Complete 3 lessons without hints',
      target: { noHints: true, count: 3 },
      xpReward: 50,
      difficulty: 'hard'
    },
    {
      type: 'mastery',
      description: 'Score 80+ on 2 consecutive lessons',
      target: { consecutive: 2, score: 80 },
      xpReward: 45,
      difficulty: 'hard'
    },
    {
      type: 'mastery',
      description: 'Score 90+ on 3 consecutive lessons',
      target: { consecutive: 3, score: 90 },
      xpReward: 60,
      difficulty: 'hard'
    }
  ]
}

// ==================== ARTIFACTS ====================
export const ARTIFACTS: Record<string, Artifact[]> = {
  microphones: [
    {
      type: 'microphone',
      name: 'Bronze Mic',
      description: 'Your first perfect score achievement',
      rarity: 'common',
      icon: '🎤',
      color: 'from-amber-600 to-orange-600',
      requirement: '1 perfect score',
      unlockCondition: { type: 'perfect_scores', value: 1 }
    },
    {
      type: 'microphone',
      name: 'Silver Mic',
      description: 'Consistent excellence in speaking',
      rarity: 'rare',
      icon: '🎤',
      color: 'from-slate-400 to-slate-600',
      requirement: '5 perfect scores',
      unlockCondition: { type: 'perfect_scores', value: 5 }
    },
    {
      type: 'microphone',
      name: 'Gold Mic',
      description: 'A true master of communication',
      rarity: 'epic',
      icon: '🎤',
      color: 'from-yellow-500 to-orange-500',
      requirement: '10 perfect scores',
      unlockCondition: { type: 'perfect_scores', value: 10 }
    },
    {
      type: 'microphone',
      name: 'Diamond Mic',
      description: 'Elite speaking champion',
      rarity: 'legendary',
      icon: '🎤',
      color: 'from-cyan-400 to-blue-600',
      requirement: '25 perfect scores',
      unlockCondition: { type: 'perfect_scores', value: 25 }
    },
    {
      type: 'microphone',
      name: 'Legendary Mic',
      description: 'The ultimate speaking achievement',
      rarity: 'legendary',
      icon: '🎤',
      color: 'from-purple-600 to-pink-600',
      requirement: '50 perfect scores',
      unlockCondition: { type: 'perfect_scores', value: 50 }
    }
  ],
  certificates: [
    {
      type: 'certificate',
      name: 'Public Speaking Certificate',
      description: 'Mastered all public speaking lessons',
      rarity: 'epic',
      icon: '📜',
      color: 'from-purple-500 to-pink-500',
      requirement: 'Complete all lessons in category',
      unlockCondition: { type: 'category_complete', value: 30, category: 'Public Speaking Fundamentals' }
    },
    {
      type: 'certificate',
      name: 'Storytelling Certificate',
      description: 'Expert storyteller and narrator',
      rarity: 'epic',
      icon: '📜',
      color: 'from-blue-500 to-cyan-500',
      requirement: 'Complete all lessons in category',
      unlockCondition: { type: 'category_complete', value: 30, category: 'Storytelling' }
    }
  ],
  constellations: [
    {
      type: 'constellation',
      name: 'Orion Constellation',
      description: '7 days of consistent practice',
      rarity: 'rare',
      icon: '⭐',
      color: 'from-indigo-500 to-purple-500',
      requirement: '7-day streak',
      unlockCondition: { type: 'streak_days', value: 7 }
    },
    {
      type: 'constellation',
      name: 'Phoenix Constellation',
      description: '30 days of dedication',
      rarity: 'epic',
      icon: '🌟',
      color: 'from-orange-500 to-red-500',
      requirement: '30-day streak',
      unlockCondition: { type: 'streak_days', value: 30 }
    },
    {
      type: 'constellation',
      name: 'Dragon Constellation',
      description: '100 days of mastery',
      rarity: 'legendary',
      icon: '✨',
      color: 'from-red-600 to-pink-600',
      requirement: '100-day streak',
      unlockCondition: { type: 'streak_days', value: 100 }
    }
  ],
  avatar_frames: [
    {
      type: 'avatar_frame',
      name: 'Bronze Frame',
      description: 'Your journey begins',
      rarity: 'common',
      icon: '🔶',
      color: 'from-amber-600 to-orange-600',
      requirement: 'Reach Level 5',
      unlockCondition: { type: 'level_reached', value: 5 }
    },
    {
      type: 'avatar_frame',
      name: 'Silver Frame',
      description: 'Rising through the ranks',
      rarity: 'rare',
      icon: '🔷',
      color: 'from-slate-400 to-slate-600',
      requirement: 'Reach Level 15',
      unlockCondition: { type: 'level_reached', value: 15 }
    },
    {
      type: 'avatar_frame',
      name: 'Gold Frame',
      description: 'Elite communicator status',
      rarity: 'epic',
      icon: '💠',
      color: 'from-yellow-500 to-orange-500',
      requirement: 'Reach Level 25',
      unlockCondition: { type: 'level_reached', value: 25 }
    },
    {
      type: 'avatar_frame',
      name: 'Diamond Frame',
      description: 'Legendary speaker recognized',
      rarity: 'legendary',
      icon: '💎',
      color: 'from-cyan-400 to-blue-600',
      requirement: 'Reach Level 40',
      unlockCondition: { type: 'level_reached', value: 40 }
    }
  ],
  themes: [
    {
      type: 'theme',
      name: 'Ocean Theme',
      description: 'Calm and flowing like water',
      rarity: 'common',
      icon: '🌊',
      color: 'from-blue-400 to-cyan-500',
      requirement: '500 Total XP',
      unlockCondition: { type: 'total_xp', value: 500 }
    },
    {
      type: 'theme',
      name: 'Forest Theme',
      description: 'Natural and grounded',
      rarity: 'common',
      icon: '🌲',
      color: 'from-green-500 to-emerald-600',
      requirement: '500 Total XP',
      unlockCondition: { type: 'total_xp', value: 500 }
    },
    {
      type: 'theme',
      name: 'Galaxy Theme',
      description: 'Infinite possibilities',
      rarity: 'legendary',
      icon: '🌌',
      color: 'from-purple-600 to-pink-600',
      requirement: '5000 Total XP',
      unlockCondition: { type: 'total_xp', value: 5000 }
    }
  ]
}

// ==================== LEADERBOARD TYPES ====================
export const LEADERBOARD_TYPES: LeaderboardType[] = [
  {
    type: 'weekly_class',
    title: 'Weekly Class Leaders',
    description: 'Top XP earners this week in your class',
    icon: '📊',
    scoreLabel: 'XP'
  },
  {
    type: 'monthly_school',
    title: 'Monthly School Champions',
    description: 'Best performers this month across your school',
    icon: '🏆',
    scoreLabel: 'XP'
  },
  {
    type: 'streak',
    title: 'Streak Champions',
    description: 'Longest active practice streaks',
    icon: '🔥',
    scoreLabel: 'Days'
  },
  {
    type: 'perfect_scores',
    title: 'Perfectionists',
    description: 'Most 100% scores achieved',
    icon: '💯',
    scoreLabel: 'Perfect Scores'
  },
  {
    type: 'category_master',
    title: 'Category Masters',
    description: 'Top performers in each category',
    icon: '🌟',
    scoreLabel: 'Avg Score'
  }
]

// ==================== ACHIEVEMENTS ====================
export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_LESSON: {
    key: 'FIRST_LESSON',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    tier: 'bronze',
    xpReward: 10,
    unlockCondition: { type: 'lessons_completed', value: 1 }
  },
  FIVE_LESSONS: {
    key: 'FIVE_LESSONS',
    name: 'Getting Started',
    description: 'Complete 5 lessons',
    icon: '📚',
    color: 'from-green-500 to-emerald-500',
    tier: 'bronze',
    xpReward: 25,
    unlockCondition: { type: 'lessons_completed', value: 5 }
  },
  TEN_LESSONS: {
    key: 'TEN_LESSONS',
    name: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: '⭐',
    color: 'from-purple-500 to-pink-500',
    tier: 'silver',
    xpReward: 50,
    unlockCondition: { type: 'lessons_completed', value: 10 }
  },
  TWENTY_LESSONS: {
    key: 'TWENTY_LESSONS',
    name: 'Rising Star',
    description: 'Complete 20 lessons',
    icon: '🌟',
    color: 'from-yellow-500 to-orange-500',
    tier: 'gold',
    xpReward: 100,
    unlockCondition: { type: 'lessons_completed', value: 20 }
  },
  PERFECT_SCORE: {
    key: 'PERFECT_SCORE',
    name: 'Perfectionist',
    description: 'Score 100% on a lesson',
    icon: '💯',
    color: 'from-pink-500 to-rose-500',
    tier: 'gold',
    xpReward: 50,
    unlockCondition: { type: 'perfect_score', value: 1 }
  },
  CONSISTENT_HIGH: {
    key: 'CONSISTENT_HIGH',
    name: 'Consistently Great',
    description: 'Score 90+ on 5 consecutive lessons',
    icon: '🎯',
    color: 'from-indigo-500 to-purple-500',
    tier: 'gold',
    xpReward: 75,
    unlockCondition: { type: 'consecutive_high_scores', value: 5 }
  },
  THREE_DAY_STREAK: {
    key: 'THREE_DAY_STREAK',
    name: 'Getting Consistent',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    tier: 'bronze',
    xpReward: 30,
    unlockCondition: { type: 'streak_days', value: 3 }
  },
  WEEK_WARRIOR: {
    key: 'WEEK_WARRIOR',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    tier: 'silver',
    xpReward: 75,
    unlockCondition: { type: 'streak_days', value: 7 }
  },
  WEEKEND_WARRIOR: {
    key: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Practice on a weekend',
    icon: '🎪',
    color: 'from-green-500 to-teal-500',
    tier: 'bronze',
    xpReward: 20,
    unlockCondition: { type: 'weekend_practice', value: 1 }
  },
  CATEGORY_COMPLETE: {
    key: 'CATEGORY_COMPLETE',
    name: 'Category Champion',
    description: 'Complete all lessons in a category',
    icon: '🏆',
    color: 'from-purple-600 to-pink-600',
    tier: 'platinum',
    xpReward: 200,
    unlockCondition: { type: 'category_complete', value: 1 }
  }
}