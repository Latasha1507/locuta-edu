'use client'

import { useEffect, useState } from 'react'
import { getRankForLevel, checkRankUp } from '@/lib/gamification/calculations'
import Confetti from 'react-confetti'

interface LevelUpAnimationProps {
  oldLevel: number
  newLevel: number
  totalXP: number
  onClose: () => void
}

export default function LevelUpAnimation({ oldLevel, newLevel, totalXP, onClose }: LevelUpAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const { rankedUp, newRank, oldRank } = checkRankUp(oldLevel, newLevel)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 max-w-md w-full text-white shadow-2xl relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        <div className="relative z-10 text-center">
          {/* Level Up Icon */}
          <div className="mb-6 animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2">LEVEL UP!</h2>
            <div className="text-6xl font-black">
              {oldLevel} → {newLevel}
            </div>
          </div>
          
          {/* Rank Up Section */}
          {rankedUp && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded
            -xl p-6 border-2 border-white/20">
              <div className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">
                🏆 Rank Promoted!
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${oldRank.color} rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg`}>
                    {oldRank.icon}
                  </div>
                  <div className="text-xs font-medium">{oldRank.title}</div>
                </div>
                <div className="text-3xl">→</div>
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${newRank.color} rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg ring-4 ring-white/30 animate-pulse`}>
                    {newRank.icon}
                  </div>
                  <div className="text-sm font-bold">{newRank.title}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="mb-6 space-y-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm text-white/80">Total XP</div>
              <div className="text-2xl font-bold">{totalXP}</div>
            </div>
            {!rankedUp && (
              <div className="text-sm text-white/90">
                {newRank.description}
              </div>
            )}
          </div>
          
          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full bg-white text-purple-600 font-bold py-4 px-6 rounded-xl hover:bg-white/90 transition-all text-lg shadow-xl"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}