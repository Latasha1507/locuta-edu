'use client'

import { Artifact } from '@/lib/gamification/types'

interface ArtifactCardProps {
  artifact: Artifact
  unlocked: boolean
  equipped?: boolean
  onEquip?: () => void
}

export default function ArtifactCard({ artifact, unlocked, equipped = false, onEquip }: ArtifactCardProps) {
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
  
  const rarityGlow = {
    common: '',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-yellow-400/50 animate-pulse'
  }
  
  return (
    <div className={`relative bg-gradient-to-br ${unlocked ? artifact.color : 'from-slate-300 to-slate-400'} rounded-xl p-5 border-2 ${rarityBorders[artifact.rarity]} shadow-xl ${unlocked ? rarityGlow[artifact.rarity] : ''} transition-all hover:scale-105`}>
      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-xs font-semibold px-2">{artifact.requirement}</div>
          </div>
        </div>
      )}
      
      {/* Equipped Badge */}
      {equipped && unlocked && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ✓ Equipped
        </div>
      )}
      
      {/* Legendary Shine */}
      {artifact.rarity === 'legendary' && unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-xl"></div>
      )}
      
      <div className="relative z-10 text-white text-center">
        <div className="text-5xl mb-3">{artifact.icon}</div>
        <div className="font-bold text-sm mb-1">{artifact.name}</div>
        <div className="text-xs text-white/80 mb-3 line-clamp-2">{artifact.description}</div>
        
        {/* Rarity Badge */}
        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase">
          {artifact.rarity}
        </div>
        
        {/* Equip Button */}
        {unlocked && !equipped && onEquip && (
          <button
            onClick={onEquip}
            className="mt-3 w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-all text-sm"
          >
            Equip
          </button>
        )}
      </div>
    </div>
  )
}