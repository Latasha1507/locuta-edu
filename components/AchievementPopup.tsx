'use client'

import { useEffect, useState } from 'react'

export const ACHIEVEMENTS = {
  // Completion Milestones
  FIRST_LESSON: { icon: '🎯', color: 'from-yellow-400 to-amber-500', title: 'First Steps!', desc: 'Completed your first lesson', xp: 50 },
  FIVE_LESSONS: { icon: '🌟', color: 'from-blue-400 to-cyan-500', title: 'Rising Star', desc: '5 lessons complete', xp: 100 },
  TEN_LESSONS: { icon: '💎', color: 'from-purple-400 to-pink-500', title: 'Diamond Speaker', desc: '10 lessons complete', xp: 200 },
  TWENTY_LESSONS: { icon: '👑', color: 'from-yellow-500 to-orange-600', title: 'Speech Royalty', desc: '20 lessons complete', xp: 500 },
  
  // Score-based
  PERFECT_SCORE: { icon: '💯', color: 'from-green-400 to-emerald-500', title: 'Perfect!', desc: 'Scored 100 in a lesson', xp: 250 },
  CONSISTENT_HIGH: { icon: '📈', color: 'from-teal-400 to-blue-500', title: 'Consistent Star', desc: '5 lessons with 80+ score', xp: 300 },
  
  // Streak-based
  THREE_DAY_STREAK: { icon: '🔥', color: 'from-orange-400 to-red-500', title: 'On Fire!', desc: '3-day streak', xp: 150 },
  WEEK_WARRIOR: { icon: '⚡', color: 'from-red-500 to-orange-600', title: 'Week Warrior', desc: '7-day streak', xp: 400 },
  
  // Category-based
  CATEGORY_COMPLETE: { icon: '🎓', color: 'from-indigo-500 to-purple-600', title: 'Category Master', desc: 'Completed a full category', xp: 1000 },
  
  // Special
  WEEKEND_WARRIOR: { icon: '🎮', color: 'from-green-400 to-teal-500', title: 'Weekend Warrior', desc: 'Practice on Saturday/Sunday', xp: 100 },
}

export default function AchievementPopup({ 
  achievement, 
  onClose 
}: { 
  achievement: keyof typeof ACHIEVEMENTS
  onClose: () => void 
}) {
  const [show, setShow] = useState(false)
  const badge = ACHIEVEMENTS[achievement]
  
  useEffect(() => {
    setTimeout(() => setShow(true), 100)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => {
        setShow(false)
        setTimeout(onClose, 300)
      }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animation: `confetti ${2 + Math.random()}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          >
            {['🎉', '⭐', '✨'][Math.floor(Math.random() * 3)]}
          </div>
        ))}
      </div>
      
      <div 
        className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 relative z-10 transform transition-all duration-300 ${
          show ? 'scale-100' : 'scale-50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">{badge.icon}</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Achievement Unlocked!</h2>
          <div className={`inline-block bg-gradient-to-r ${badge.color} text-white px-6 py-2 rounded-full text-xl font-bold shadow-lg mb-3`}>
            {badge.title}
          </div>
          <p className="text-slate-600 mb-4">{badge.desc}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">⚡</span>
            <span className="text-2xl font-bold text-purple-600">+{badge.xp} XP</span>
          </div>
          <button 
            onClick={() => {
              setShow(false)
              setTimeout(onClose, 300)
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            Awesome! 🎉
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}