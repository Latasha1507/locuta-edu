'use client'

import { PowerUp } from '@/lib/gamification/types'
import { POWERUPS } from '@/lib/gamification/constants'

interface PowerUpButtonProps {
  powerupType: string
  quantity: number
  onActivate: () => void
  disabled?: boolean
}

export default function PowerUpButton({ 
  powerupType, 
  quantity, 
  onActivate,
  disabled = false 
}: PowerUpButtonProps) {
  const powerup = POWERUPS[powerupType]
  
  if (!powerup) return null
  
  const rarityColors = {
    common: 'from-slate-500 to-slate-600',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-yellow-500 to-orange-500'
  }
  
  const rarityBorders = {
    common: 'border-slate-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  }
  
  return (
    <button
      onClick={onActivate}
      disabled={disabled || quantity === 0}
      className={`relative bg-gradient-to-br ${powerup.color} rounded-xl p-4 text-white transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 ${rarityBorders[powerup.rarity]}`}
    >
      {/* Quantity Badge */}
      {quantity > 0 && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-slate-900">{quantity}</span>
        </div>
      )}
      
      {/* Rarity Shine Effect */}
      {powerup.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-xl"></div>
      )}
      
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="text-4xl">{powerup.icon}</div>
        <div className="text-center">
          <div className="font-bold text-sm leading-tight">{powerup.name}</div>
          <div className="text-xs text-white/80 mt-1 line-clamp-2">{powerup.description}</div>
        </div>
        
        {quantity === 0 && (
          <div className="text-xs font-bold text-white/60 mt-1">
            Out of stock
          </div>
        )}
      </div>
    </button>
  )
}