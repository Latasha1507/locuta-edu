'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WeeklyEvent } from '@/lib/gamification/types'

export default function WeeklyEventBanner() {
  const [event, setEvent] = useState<WeeklyEvent | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadActiveEvent()
  }, [])
  
  const loadActiveEvent = async () => {
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('weekly_events')
        .select('*')
        .eq('active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .single()
      
      if (error) {
        console.error('Error loading event:', error)
        return
      }
      
      setEvent(data)
    } catch (err) {
      console.error('Error in loadActiveEvent:', err)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading || !event) return null
  
  const eventIcons = {
    speed_round: '⚡',
    perfect_practice: '💯',
    category_takeover: '🎯',
    comeback_week: '🔄'
  }
  
  const eventColors = {
    speed_round: 'from-yellow-500 to-orange-500',
    perfect_practice: 'from-green-500 to-emerald-500',
    category_takeover: 'from-purple-500 to-pink-500',
    comeback_week: 'from-blue-500 to-cyan-500'
  }
  
  const icon = eventIcons[event.eventType as keyof typeof eventIcons] || '🎪'
  const color = eventColors[event.eventType as keyof typeof eventColors] || 'from-indigo-500 to-purple-500'
  
  const daysRemaining = Math.ceil(
    (new Date(event.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-5 text-white shadow-xl relative overflow-hidden`}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                Weekly Event
              </div>
              <div className="text-lg font-bold leading-tight">
                {event.eventName}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{event.xpMultiplier}x</div>
            <div className="text-xs text-white/80">XP Boost</div>
          </div>
        </div>
        
        <p className="text-sm text-white/90 mb-3">
          {event.eventDescription}
        </p>
        
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <span className="text-sm font-medium">Event ends in:</span>
          <span className="text-lg font-bold">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  )
}