'use client'

export default function LevelProgressRing({ 
  level, 
  xpInCurrentLevel,
  totalXP 
}: { 
  level: number
  xpInCurrentLevel: number
  totalXP: number
}) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = (xpInCurrentLevel / 100) * circumference
  
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 blur-2xl animate-pulse"></div>
      
      <div className="relative">
        <svg className="transform -rotate-90" width="180" height="180">
          <circle cx="90" cy="90" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <circle 
            cx="90" cy="90" r={radius}
            stroke="url(#gradient)" 
            strokeWidth="12" 
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            {level}
          </div>
          <div className="text-xs text-slate-600 font-bold tracking-wider">LEVEL</div>
          <div className="text-xs text-slate-500 mt-1">{totalXP} XP</div>
        </div>
      </div>
    </div>
  )
}