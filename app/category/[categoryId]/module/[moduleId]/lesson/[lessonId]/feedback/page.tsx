'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Gamification components
import XPGainNotification from '@/components/gamification/XPGainNotification'
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation'
import AchievementPopup, { ACHIEVEMENTS } from '@/components/AchievementPopup'

// Gamification utilities
import { calculateLessonXP, calculateLevel } from '@/lib/gamification/calculations'
import { awardXP, unlockAchievement, checkPowerupRewards } from '@/lib/gamification/rewards'
import { checkQuestCompletion } from '@/lib/gamification/questGenerator'

interface FeedbackPageClientProps {
  categoryId: string
  moduleId: string
  lessonId: string
  sessionId: string 
  session: any
  feedback: any
  score: number
  userId: string
  passed?: boolean        
  passThreshold?: number  
}

export default function FeedbackPageClient({
  categoryId,
  moduleId,
  lessonId,
  session,
  feedback,
  score,
  passed,
  passThreshold,
  userId
}: FeedbackPageClientProps) {
  const router = useRouter()
  const [xpGain, setXpGain] = useState<{ amount: number; reason: string } | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; totalXP: number } | null>(null)
  const [showAchievement, setShowAchievement] = useState<keyof typeof ACHIEVEMENTS | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    processGamification()
  }, [])

  const processGamification = async () => {
    try {
      const supabase = createClient()

      // 1. Calculate XP earned
      const xpEarned = calculateLessonXP({
        score,
        isFirstTimeCategory: false, // TODO: Check if first time in category
        hasEventMultiplier: false, // TODO: Check for active events
      })

      // Show XP notification
      setXpGain({ amount: xpEarned, reason: 'Lesson completed!' })

      // 2. Award XP and check for level up
      const xpResult = await awardXP(userId, xpEarned)
      
      if (xpResult.leveledUp) {
        // Show level up animation after XP notification
        setTimeout(() => {
          setLevelUpData({
            oldLevel: xpResult.oldLevel,
            newLevel: xpResult.newLevel,
            totalXP: 0 // Will be calculated in component
          })
          setShowLevelUp(true)
        }, 3000)
      }

      // 3. Check for quest completion
      await checkQuestCompletion(userId, {
        score,
        category: session.category,
        moduleNumber: session.module_number,
        timestamp: new Date()
      })

      // 4. Check for achievements
      await checkAchievements(supabase)

      // 5. Award power-ups for perfect score
      if (score === 100) {
        await checkPowerupRewards(userId, 'perfect_score')
      }

      setProcessing(false)
    } catch (err) {
      console.error('Error processing gamification:', err)
      setProcessing(false)
    }
  }

  const checkAchievements = async (supabase: any) => {
    // Get user's total progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('completed')
      .eq('user_id', userId)

    const completedCount = progress?.filter((p: any) => p.completed).length || 0

    // Check milestone achievements
    const achievements: (keyof typeof ACHIEVEMENTS)[] = []
    
    if (completedCount === 1) achievements.push('FIRST_LESSON')
    else if (completedCount === 5) achievements.push('FIVE_LESSONS')
    else if (completedCount === 10) achievements.push('TEN_LESSONS')
    else if (completedCount === 20) achievements.push('TWENTY_LESSONS')
    
    if (score === 100) achievements.push('PERFECT_SCORE')

    // Unlock and show first achievement
    if (achievements.length > 0) {
      const achievementKey = achievements[0]
      
      // Determine tier based on achievement
      const tierMap: { [key: string]: 'bronze' | 'silver' | 'gold' | 'platinum' } = {
        'FIRST_LESSON': 'bronze',
        'FIVE_LESSONS': 'bronze',
        'TEN_LESSONS': 'silver',
        'TWENTY_LESSONS': 'gold',
        'PERFECT_SCORE': 'platinum'
      }
      
      const tier = tierMap[achievementKey] || 'bronze'
      
      await unlockAchievement(userId, achievementKey, tier)
      
      setTimeout(() => {
        setShowAchievement(achievementKey)
      }, showLevelUp ? 8000 : 5000)
    }
  }
  const scoreColor = passed ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600'
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#edf2f7] to-[#f7f9fb]">
      {/* Gamification Overlays */}
      {xpGain && (
        <XPGainNotification 
          xpAmount={xpGain.amount}
          reason={xpGain.reason}
          onComplete={() => setXpGain(null)}
        />
      )}

      {showLevelUp && levelUpData && (
        <LevelUpAnimation
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={levelUpData.oldLevel * 100} // Placeholder
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {showAchievement && (
        <AchievementPopup 
          achievement={showAchievement} 
          onClose={() => setShowAchievement(null)} 
        />
      )}

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href={`/category/${categoryId}`} className="text-slate-700 hover:text-indigo-600 font-medium text-sm sm:text-base flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lessons
            </Link>
            <div className="flex items-center gap-3">
              <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
              <div className="text-purple-600 font-semibold text-sm">Lesson {lessonId} Feedback</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Overall Score */}
        <div className={`bg-gradient-to-br ${scoreColor} rounded-3xl shadow-2xl overflow-hidden mb-8`}>
          <div className="px-6 sm:px-8 py-10 sm:py-12 text-center text-white">
            <div className="text-7xl sm:text-8xl font-bold mb-4">{score}</div>
            <div className="text-2xl sm:text-3xl font-semibold mb-2">
              {passed ? '🎉 Great Job!' : `Need ${passThreshold}+ to Pass`}
            </div>
            <p className="text-lg text-white/90">
              {passed ? "You're making excellent progress!" : "Keep practicing - you're improving!"}
            </p>
            
            {/* XP Earned Banner */}
            {!processing && (
              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div className="text-left">
                    <div className="text-sm text-white/80">XP Earned</div>
                    <div className="text-2xl font-bold">+{calculateLessonXP({ score, isFirstTimeCategory: false, hasEventMultiplier: false })} XP</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Area Scores */}
          {feedback?.focus_area_scores && Object.keys(feedback.focus_area_scores).length > 0 && (
            <div className="px-6 sm:px-8 py-8 bg-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-xl text-white mb-6 text-center">Performance Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(feedback.focus_area_scores).map(([area, areaScore]: [string, any]) => (
                  <div key={area} className="bg-white rounded-xl p-4 sm:p-5">
                    <div className={`text-4xl font-bold mb-2 ${
                      areaScore >= 75 ? 'text-green-700' : areaScore >= 65 ? 'text-yellow-700' : 'text-orange-700'
                    }`}>{areaScore}</div>
                    <div className="text-sm font-semibold text-gray-700">{area}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Personalized Feedback */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Personalized Feedback</h2>
          
          {feedback?.detailed_feedback && (
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-8">
              {feedback.detailed_feedback}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            {feedback?.strengths && feedback.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-5 sm:p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">✓</span>
                  </div>
                  <h3 className="font-bold text-lg text-green-900">What You Did Well</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-green-800">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span className="text-sm sm:text-base">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {feedback?.improvements && feedback.improvements.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-5 sm:p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">↗</span>
                  </div>
                  <h3 className="font-bold text-lg text-blue-900">How to Improve</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.improvements.map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-blue-800">
                      <span className="text-blue-600 font-bold mt-0.5">→</span>
                      <span className="text-sm sm:text-base">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Your Response */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Response</h2>
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed italic">
              &quot;{session.user_transcript}&quot;
            </p>
          </div>

          {/* Metrics */}
          {feedback?.transcript_metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                <div className="text-xs text-purple-600 font-semibold mb-1">Words</div>
                <div className="text-2xl font-bold text-purple-700">{feedback.transcript_metrics.word_count || 0}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                <div className="text-xs text-blue-600 font-semibold mb-1">WPM</div>
                <div className="text-2xl font-bold text-blue-700">{feedback.transcript_metrics.words_per_minute || 0}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
                <div className="text-xs text-yellow-600 font-semibold mb-1">Fillers</div>
                <div className="text-2xl font-bold text-yellow-700">{feedback.transcript_metrics.filler_words || 0}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                <div className="text-xs text-green-600 font-semibold mb-1">Pace</div>
                <div className="text-sm font-bold text-green-700 mt-2">{feedback.transcript_metrics.pace_feedback || 'Good'}</div>
              </div>
            </div>
          )}
        </div>

        {/* PERSONALIZED AI EXAMPLE */}
        {session.ai_example_audio && session.ai_example_text && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 sm:px-8 py-6 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                <span>✨</span> How You Could Say It Better
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Here's an improved version of YOUR response - same ideas, better delivery!
              </p>
            </div>
            
            <div className="p-6 sm:p-8">
              {/* Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold">You</span>
                    </div>
                    <h3 className="font-bold text-orange-900">Your Version</h3>
                  </div>
                  <p className="text-orange-800 text-sm leading-relaxed italic">
                    &quot;{session.user_transcript}&quot;
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <h3 className="font-bold text-green-900">Improved Version</h3>
                  </div>
                  <p className="text-green-800 text-sm leading-relaxed">
                    {session.ai_example_text}
                  </p>
                </div>
              </div>

              {/* Audio */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 sm:p-6 border-2 border-purple-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl">🔊</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm sm:text-base">Listen to the Improved Version</div>
                    <div className="text-xs text-slate-500">Hear how YOUR response could sound better</div>
                  </div>
                </div>
                <audio controls className="w-full" src={`data:audio/mpeg;base64,${session.ai_example_audio}`} preload="metadata">
                  Your browser does not support audio playback.
                </audio>
              </div>

              {/* Key Improvements */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span>💡</span> What Changed?
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  The improved version keeps YOUR core ideas and story, but enhances:
                </p>
                <ul className="space-y-2 text-sm text-blue-800">
                  {feedback?.improvements?.slice(0, 3).map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">
                    <strong>💪 Practice Tip:</strong> Record yourself saying the improved version, 
                    then apply those improvements to a NEW response!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Linguistic Analysis */}
        {feedback?.linguistic_analysis && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Detailed Analysis</h2>
            
            <div className="space-y-6">
              {feedback.linguistic_analysis.grammar && (
                <div className="border-l-4 border-blue-500 pl-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-900">Grammar</h3>
                    <span className="text-3xl font-bold text-blue-700">{feedback.linguistic_analysis.grammar.score}</span>
                  </div>
                  {feedback.linguistic_analysis.grammar.suggestions?.length > 0 && (
                    <ul className="text-sm text-slate-600 space-y-2">
                      {feedback.linguistic_analysis.grammar.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {feedback.linguistic_analysis.sentence_formation && (
                <div className="border-l-4 border-green-500 pl-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-900">Sentence Formation</h3>
                    <span className="text-3xl font-bold text-green-700">{feedback.linguistic_analysis.sentence_formation.score}</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    Complexity: <span className="font-semibold capitalize">{feedback.linguistic_analysis.sentence_formation.complexity_level || 'intermediate'}</span>
                  </div>
                  {feedback.linguistic_analysis.sentence_formation.suggestions?.length > 0 && (
                    <ul className="text-sm text-slate-600 space-y-2">
                      {feedback.linguistic_analysis.sentence_formation.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {feedback.linguistic_analysis.vocabulary && (
                <div className="border-l-4 border-purple-500 pl-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-900">Vocabulary</h3>
                    <span className="text-3xl font-bold text-purple-700">{feedback.linguistic_analysis.vocabulary.score}</span>
                  </div>
                  {feedback.linguistic_analysis.vocabulary.advanced_words_used?.length > 0 && (
                    <div className="text-sm text-slate-600 mb-3">
                      <strong>Strong vocabulary:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {feedback.linguistic_analysis.vocabulary.advanced_words_used.map((word: string, i: number) => (
                          <span key={i} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">{word}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/category/${categoryId}/module/${moduleId}/lesson/${lessonId}/practice`}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl transition-all hover:scale-105 text-center">
            🎤 Practice Again
          </Link>
          <Link href={`/category/${categoryId}`}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-bold transition-colors text-center">
            ← Back to Lessons
          </Link>
        </div>
      </main>
    </div>
  )
}