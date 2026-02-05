'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserArtifact } from '@/lib/gamification/types'
import { ARTIFACTS } from '@/lib/gamification/constants'
import ArtifactCard from './ArtifactCard'

interface ArtifactGalleryProps {
  userId: string
}

export default function ArtifactGallery({ userId }: ArtifactGalleryProps) {
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<UserArtifact[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'microphones' | 'certificates' | 'constellations' | 'avatar_frames' | 'themes'>('all')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadArtifacts()
  }, [userId])
  
  const loadArtifacts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_artifacts')
        .select('*')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error loading artifacts:', error)
        return
      }
      
      setUnlockedArtifacts(data || [])
    } catch (err) {
      console.error('Error in loadArtifacts:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleEquip = async (artifactId: string) => {
    try {
      const supabase = createClient()
      // Unequip all others of same type first
      // Then equip this one
      await supabase
        .from('user_artifacts')
        .update({ equipped: false })
        .eq('user_id', userId)
      
      await supabase
        .from('user_artifacts')
        .update({ equipped: true })
        .eq('id', artifactId)
      
      loadArtifacts()
    } catch (err) {
      console.error('Error equipping artifact:', err)
    }
  }
  
  const categories = [
    { id: 'all', name: 'All', icon: '🎁' },
    { id: 'microphones', name: 'Microphones', icon: '🎤' },
    { id: 'certificates', name: 'Certificates', icon: '📜' },
    { id: 'constellations', name: 'Constellations', icon: '⭐' },
    { id: 'avatar_frames', name: 'Frames', icon: '🖼️' },
    { id: 'themes', name: 'Themes', icon: '🎨' }
  ]
  
  // Get all artifacts from category
  const getAllArtifactsInCategory = () => {
    if (selectedCategory === 'all') {
      return Object.values(ARTIFACTS).flat()
    }
    return ARTIFACTS[selectedCategory] || []
  }
  
  const allArtifacts = getAllArtifactsInCategory()
  const unlockedSet = new Set(unlockedArtifacts.map(a => a.artifactName))
  const totalUnlocked = unlockedArtifacts.length
  const totalAvailable = Object.values(ARTIFACTS).flat().length
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🏆</span> Artifact Collection
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Unlock artifacts by achieving milestones
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{totalUnlocked}/{totalAvailable}</div>
          <div className="text-xs text-slate-600">Collected</div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
      
      {/* Artifacts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {allArtifacts.map((artifact, index) => {
          const unlocked = unlockedSet.has(artifact.name)
          const userArtifact = unlockedArtifacts.find(a => a.artifactName === artifact.name)
          
          return (
            <ArtifactCard
              key={`${artifact.type}-${index}`}
              artifact={artifact}
              unlocked={unlocked}
              equipped={userArtifact?.equipped || false}
              onEquip={userArtifact ? () => handleEquip(userArtifact.id) : undefined}
            />
          )
        })}
      </div>
      
      {allArtifacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <div className="text-lg font-semibold text-slate-900">No artifacts in this category</div>
          <div className="text-sm text-slate-600 mt-2">Try another category!</div>
        </div>
      )}
    </div>
  )
}