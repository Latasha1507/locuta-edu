'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PowerUpInventoryProps {
  userId: string
  compact?: boolean // NEW: Compact mode for dashboard
}

const POWERUP_TYPES = {
  focus_boost: {
    name: 'Focus Boost',
    icon: '🎯',
    description: 'Extra time for your next lesson',
    color: 'bg-blue-500'
  },
  time_extension: {
    name: 'Time Extension',
    icon: '⏰',
    description: '+30 seconds on practice timer',
    color: 'bg-green-500'
  },
  second_chance: {
    name: 'Second Chance',
    icon: '🔄',
    description: 'Retry a lesson without penalty',
    color: 'bg-purple-500'
  },
  pro_tip: {
    name: 'Pro Tip',
    icon: '💡',
    description: 'Get an expert hint',
    color: 'bg-yellow-500'
  },
  confidence_shield: {
    name: 'Confidence Shield',
    icon: '🛡️',
    description: 'Score boost for nervous moments',
    color: 'bg-pink-500'
  }
}

export default function PowerUpInventory({ userId, compact = false }: PowerUpInventoryProps) {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventory()
  }, [userId])

  const loadInventory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('powerup_inventory')
        .select('*')
        .eq('user_id', userId)
        .gt('quantity', 0)
        .order('quantity', { ascending: false })

      if (!error && data) {
        setInventory(data)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading power-ups:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    )
  }

  const totalPowerUps = inventory.reduce((sum, item) => sum + item.quantity, 0)

  // COMPACT MODE: Show 4 power-ups in 2x2 grid
  if (compact) {
    const displayPowerUps = inventory.slice(0, 4)
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{totalPowerUps} available</span>
          <button className="text-xs font-semibold text-amber-600 hover:text-amber-700">
            View All →
          </button>
        </div>

        {displayPowerUps.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-xs text-slate-600">Complete quests to earn power-ups!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayPowerUps.map((item) => {
              const powerup = POWERUP_TYPES[item.powerup_type as keyof typeof POWERUP_TYPES]
              if (!powerup) return null

              return (
                <div
                  key={item.powerup_type}
                  className="relative bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 p-3 hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 ${powerup.color} rounded-lg flex items-center justify-center text-xl mb-1 group-hover:scale-110 transition-transform`}>
                      {powerup.icon}
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight mb-1">
                      {powerup.name}
                    </div>
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // FULL MODE: Show all power-ups in detailed view
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> Power-Ups
          </h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-bold text-white">{totalPowerUps}</span>
          </div>
        </div>
        <p className="text-sm text-white/90 mt-1">Activate to boost your practice</p>
      </div>

      <div className="p-6">
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">⚡</div>
            <h4 className="font-bold text-slate-900 mb-2">No Power-Ups Yet</h4>
            <p className="text-sm text-slate-600">
              Complete daily quests and achieve milestones to earn power-ups!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const powerup = POWERUP_TYPES[item.powerup_type as keyof typeof POWERUP_TYPES]
              if (!powerup) return null

              return (
                <div
                  key={item.powerup_type}
                  className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 p-4 hover:border-amber-400 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${powerup.color} rounded-xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                      {powerup.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{powerup.name}</h4>
                    <p className="text-xs text-slate-600 mb-3">{powerup.description}</p>
                    
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      {item.quantity}
                    </div>

                    <button className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all">
                      Use Power-Up
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}