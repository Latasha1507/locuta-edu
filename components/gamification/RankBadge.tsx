'use client'

import { getRankForLevel } from '@/lib/gamification/calculations'

interface RankBadgeProps {
  level: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
}

export default function RankBadge({ 
  level, 
  showProgress = false, 
  size = 'md',
  showDescription = false 
}: RankBadgeProps) {
  const rank = getRankForLevel(level)
  
  const sizes = {
    sm: {
      container: 'w-10 h-10',
      text: 'text-lg',
      titleSize: 'text-sm',
      levelSize: 'text-xs'
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-2xl',
      titleSize: 'text-base',
      levelSize: 'text-sm'
    },
    lg: {
      container: 'w-24 h-24',
      text: 'text-4xl',
      titleSize: 'text-xl',
      levelSize: 'text-base'
    }
  }
  
  const sizeClasses = sizes[size]
  
  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses.container} rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg ring-4 ring-white/20`}>
        <span className={sizeClasses.text}>{rank.icon}</span>
      </div>
      <div>
        <div className={`font-bold text-slate-900 ${sizeClasses.titleSize}`}>
          {rank.title}
        </div>
        <div className={`text-slate-600 ${sizeClasses.levelSize}`}>
          Level {level}
        </div>
        {showDescription && size !== 'sm' && (
          <div className="text-xs text-slate-500 mt-1 max-w-xs">
            {rank.description}
          </div>
        )}
      </div>
    </div>
  )
}