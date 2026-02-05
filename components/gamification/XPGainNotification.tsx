'use client'

import { useEffect, useState } from 'react'

interface XPGainNotificationProps {
  xpAmount: number
  reason?: string
  onComplete?: () => void
}

export default function XPGainNotification({ xpAmount, reason, onComplete }: XPGainNotificationProps) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) {
        onComplete()
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])
  
  if (!visible) return null
  
  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl px-6 py-3 text-white shadow-2xl border-2 border-white/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <div>
            <div className="text-2xl font-bold">+{xpAmount} XP</div>
            {reason && (
              <div className="text-xs text-white/80">{reason}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}