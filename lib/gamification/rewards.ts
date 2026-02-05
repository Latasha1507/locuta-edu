import { createClient } from '@/lib/supabase/client'
import { POWERUPS, POWERUP_EARN_CONDITIONS } from './constants'
import { determinePowerupReward } from './calculations'

/**
 * Award XP to user and update level/rank
 */
export async function awardXP(
  userId: string,
  xpAmount: number
): Promise<{ success: boolean; newLevel: number; oldLevel: number; leveledUp: boolean }> {
  try {
    const supabase = createClient()
    
    // Get current gamification data
    const { data: currentData, error: fetchError } = await supabase
      .from('user_gamification')
      .select('total_xp, level')
      .eq('user_id', userId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching gamification data:', fetchError)
      return { success: false, newLevel: 1, oldLevel: 1, leveledUp: false }
    }
    
    const oldXP = currentData?.total_xp || 0
    const oldLevel = currentData?.level || 1
    const newXP = oldXP + xpAmount
    const newLevel = Math.floor(newXP / 100) + 1
    
    // Update XP and level
    const { error: updateError } = await supabase
      .from('user_gamification')
      .upsert({
        user_id: userId,
        total_xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
    
    if (updateError) {
      console.error('Error updating XP:', updateError)
      return { success: false, newLevel: oldLevel, oldLevel, leveledUp: false }
    }
    
    return {
      success: true,
      newLevel,
      oldLevel,
      leveledUp: newLevel > oldLevel
    }
  } catch (err) {
    console.error('Error in awardXP:', err)
    return { success: false, newLevel: 1, oldLevel: 1, leveledUp: false }
  }
}

/**
 * Award powerup to user
 */
export async function awardPowerup(
  userId: string,
  powerupType: string,
  quantity: number = 1
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get current powerup quantity
    const { data: existing } = await supabase
      .from('user_powerups')
      .select('quantity')
      .eq('user_id', userId)
      .eq('powerup_type', powerupType)
      .single()
    
    const newQuantity = (existing?.quantity || 0) + quantity
    
    const { error } = await supabase
      .from('user_powerups')
      .upsert({
        user_id: userId,
        powerup_type: powerupType,
        quantity: newQuantity,
        last_earned: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error awarding powerup:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error in awardPowerup:', err)
    return false
  }
}

/**
 * Check and award powerups based on conditions
 */
export async function checkPowerupRewards(
  userId: string,
  condition: 'daily_login' | 'perfect_score' | 'seven_day_streak' | 'quest_completion'
): Promise<{ awarded: boolean; powerup?: string }> {
  const conditions = POWERUP_EARN_CONDITIONS[condition.toUpperCase() as keyof typeof POWERUP_EARN_CONDITIONS]
  
  if (!conditions) return { awarded: false }
  
  // Check if should award based on chance
  if ('chance' in conditions) {
    if (Math.random() > conditions.chance) {
      return { awarded: false }
    }
  }
  
  // Determine powerup
  const powerupResult = determinePowerupReward(conditions.powerup as 'random' | 'choice')
  const powerupType = Array.isArray(powerupResult) ? powerupResult[0] : powerupResult
  
  // Award the powerup
  const success = await awardPowerup(userId, powerupType, 'count' in conditions ? conditions.count : 1)
  
  return {
    awarded: success,
    powerup: powerupType
  }
}

/**
 * Award artifact to user
 */
export async function awardArtifact(
  userId: string,
  artifactType: string,
  artifactName: string,
  artifactRarity: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_artifacts')
      .insert({
        user_id: userId,
        artifact_type: artifactType,
        artifact_name: artifactName,
        artifact_rarity: artifactRarity,
        earned_at: new Date().toISOString(),
        equipped: false
      })
    
    if (error) {
      console.error('Error awarding artifact:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error in awardArtifact:', err)
    return false
  }
}

/**
 * Unlock achievement for user
 */
export async function unlockAchievement(
  userId: string,
  achievementKey: string,
  achievementTier: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_key', achievementKey)
      .single()
    
    if (existing) return true // Already unlocked
    
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_key: achievementKey,
        achievement_tier: achievementTier,
        unlocked_at: new Date().toISOString(),
        notified: false
      })
    
    if (error) {
      console.error('Error unlocking achievement:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error in unlockAchievement:', err)
    return false
  }
}