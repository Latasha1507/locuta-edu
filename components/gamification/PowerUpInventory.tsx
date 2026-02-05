'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPowerUp } from '@/lib/gamification/types'
import PowerUpButton from './PowerUpButton'

interface PowerUpInventoryProps {
  userId: string
  onActivate?: (powerupType: string) => void
}

export default function PowerUpInventory({ userId, onActivate }: PowerUpInventoryProps) {
  const [powerups, setPowerups] = useState<UserPowerUp[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadPowerups()
  }, [userId])
  
  const loadPowerups = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_powerups')
        .select('*')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error loading powerups:', error)
        return
      }
      
      // Initialize all powerup types with 0 quantity if not present
      const allPowerupTypes = ['focus_boost', 'time_extension', 'second_chance', 'pro_tip', 'confidence_shield']
      const powerupMap = new Map(data?.map(p => [p.powerup_type, p]) || [])
      
      const completePowerups = allPowerupTypes.map(type => 
        powerupMap.get(type) || {
          userId,
          powerupType: type,
          quantity: 0,
          lastEarned: undefined
        }
      )
      
      setPowerups(completePowerups)
    } catch (err) {
      console.error('Error in loadPowerups:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleActivate = (powerupType: string) => {
    if (onActivate) {
      onActivate(powerupType)
    }
    // Reload powerups after activation
    loadPowerups()
  }
  
  const totalPowerups = powerups.reduce((sum, p) => sum + (p.quantity || 0), 0)
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>⚡</span> Power-Ups
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Activate to boost your practice
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{totalPowerups}</div>
          <div className="text-xs text-slate-600">Available</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {powerups.map((powerup) => (
          <PowerUpButton
            key={powerup.powerupType}
            powerupType={powerup.powerupType}
            quantity={powerup.quantity || 0}
            onActivate={() => handleActivate(powerup.powerupType)}
          />
        ))}
      </div>
      
      {totalPowerups === 0 && (
        <div className="mt-4 bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-sm font-semibold text-slate-900">No power-ups yet</div>
          <div className="text-xs text-slate-600 mt-1">
            Earn them by completing quests, perfect scores, and maintaining streaks!
          </div>
        </div>
      )}
    </div>
  )
}