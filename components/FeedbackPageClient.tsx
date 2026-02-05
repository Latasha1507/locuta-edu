'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackFeedbackViewed } from '@/lib/analytics/helpers'
import Mixpanel from '@/lib/mixpanel'
import { EVENTS } from '@/lib/analytics/events'
import RatingNudgeModal from '@/components/RatingNudgeModal'
import { useRatingNudge, markRatingShown } from '@/lib/hooks/useRatingNudge'

// Gamification components
import XPGainNotification from '@/components/gamification/XPGainNotification'
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation'
import AchievementPopup, { ACHIEVEMENTS } from '@/components/AchievementPopup'

// Gamification utilities
import { calculateLessonXP } from '@/lib/gamification/calculations'
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
  sessionId,
  session,
  feedback,
  score,
  userId,
  passed = false,
  passThreshold = 60
}: FeedbackPageClientProps) {
  const router = useRouter()
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [attemptCount, setAttemptCount] = useState(1)
  const [showRatingModal, setShowRatingModal] = useState(false)

  // Gamification state
  const [xpGain, setXpGain] = useState<{ amount: number; reason: string } | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; totalXP: number } | null>(null)
  const [showAchievement, setShowAchievement] = useState<keyof typeof ACHIEVEMENTS | null>(null)
  const [processing, setProcessing] = useState(true)

  // Rating nudge logic
  const { shouldShow, isFirstClear } = useRatingNudge(score, lessonId, userId)

  // Count previous attempts for this lesson
  useEffect(() => {
    const countAttempts = async () => {
      const supabase = createClient()
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('category', session.category)
        .eq('module_number', session.module_number)
        .eq('level_number', session.level_number)
      
      if (sessions) {
        setAttemptCount(sessions.length)
      }
    }
    
    countAttempts()
  }, [userId, session])

  // Track feedback viewed on mount
  useEffect(() => {
    if (!hasTrackedView) {
      trackFeedbackViewed({
        lessonId: lessonId,
        overallScore: score,
        passed: feedback.pass_level || false,
        timeToView: 0
      })
      setHasTrackedView(true)
    }
  }, [hasTrackedView, lessonId, score, feedback])

  // Process gamification on mount
  useEffect(() => {
    processGamification()
  }, [])

  const processGamification = async () => {
    try {
      const supabase = createClient()

      const xpEarned = calculateLessonXP({
        score,
        isFirstTimeCategory: false,
        hasEventMultiplier: false,
      })

      setXpGain({ amount: xpEarned, reason: 'Lesson completed!' })

      const xpResult = await awardXP(userId, xpEarned)
      
      if (xpResult.leveledUp) {
        setTimeout(() => {
          setLevelUpData({
            oldLevel: xpResult.oldLevel,
            newLevel: xpResult.newLevel,
            totalXP: xpResult.newLevel * 100
          })
          setShowLevelUp(true)
        }, 3000)
      }

      await checkQuestCompletion(userId, {
        score,
        category: session.category,
        moduleNumber: session.module_number,
        timestamp: new Date()
      })

      await checkAchievements(supabase)

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
    const { data: progress } = await supabase
      .from('user_progress')
      .select('completed')
      .eq('user_id', userId)

    const completedCount = progress?.filter((p: any) => p.completed).length || 0

    const achievements: (keyof typeof ACHIEVEMENTS)[] = []
    
    if (completedCount === 1) achievements.push('FIRST_LESSON')
    else if (completedCount === 5) achievements.push('FIVE_LESSONS')
    else if (completedCount === 10) achievements.push('TEN_LESSONS')
    else if (completedCount === 20) achievements.push('TWENTY_LESSONS')
    
    if (score === 100) achievements.push('PERFECT_SCORE')

    if (achievements.length > 0) {
      const achievementKey = achievements[0]
      
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

  // Show rating modal after 2 seconds
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowRatingModal(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  // Track AI example played
  const handleAudioPlay = () => {
    Mixpanel.track(EVENTS.AI_EXAMPLE_PLAYED, {
      lesson_id: lessonId,
      coaching_style: session.tone,
      session_id: sessionId
    })
  }

  // Track retry with attempt count
  const handleRetryClick = () => {
    Mixpanel.track(EVENTS.RETRY_LESSON_CLICKED, {
      lesson_id: lessonId,
      lesson_title: session.category,
      category: categoryId,
      module_number: parseInt(moduleId),
      level_number: parseInt(lessonId),
      previous_score: score,
      attempt_number: attemptCount,
      reason: score >= 80 ? 'want_better_score' : 'failed',
      score_difference_from_passing: 80 - score
    })
    
    Mixpanel.people.increment('Total Lesson Retries', 1)
  }

  // Track back to lessons
  const handleBackClick = () => {
    Mixpanel.track('Back to Lessons Clicked', {
      from_page: 'feedback',
      lesson_id: lessonId,
      final_score: score,
      attempt_number: attemptCount,
      passed: feedback.pass_level || false
    })
  }

  // Get tier styling
  const getTierStyling = (tier: string) => {
    switch(tier) {
      case 'EXCELLENT': return 'from-yellow-400 to-amber-500'
      case 'GOOD': return 'from-green-500 to-emerald-600'
      case 'PASSED': return 'from-blue-500 to-cyan-600'
      case 'NEARLY_THERE': return 'from-orange-400 to-orange-500'
      default: return 'from-orange-500 to-red-600'
    }
  }

  const scoreColor = feedback.performance_tier 
    ? getTierStyling(feedback.performance_tier)
    : (passed ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600')

  return (
    <>
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
          totalXP={levelUpData.totalXP}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {showAchievement && (
        <AchievementPopup 
          achievement={showAchievement} 
          onClose={() => setShowAchievement(null)} 
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* NEW: Improvement Banner */}
        {feedback.improvement !== undefined && feedback.improvement !== null && (
          <div className={`mb-6 rounded-2xl p-6 ${
            feedback.improvement > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' :
            feedback.improvement === 0 ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300' :
            'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`text-5xl ${
                feedback.improvement > 0 ? 'animate-bounce' : ''
              }`}>
                {feedback.improvement > 0 ? '📈' : feedback.improvement === 0 ? '➡️' : '📉'}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${
                  feedback.improvement > 0 ? 'text-green-900' :
                  feedback.improvement === 0 ? 'text-blue-900' :
                  'text-orange-900'
                }`}>
                  {feedback.improvement > 0 && `+${feedback.improvement} Points!`}
                  {feedback.improvement === 0 && 'Same Score'}
                  {feedback.improvement < 0 && `${feedback.improvement} Points`}
                </h3>
                <p className={`${
                  feedback.improvement > 0 ? 'text-green-700' :
                  feedback.improvement === 0 ? 'text-blue-700' :
                  'text-orange-700'
                }`}>
                  {feedback.improvement_message}
                </p>
                <div className="mt-2 text-sm font-medium">
                  <span className="text-gray-600">Previous: </span>
                  <span className="text-gray-900">{feedback.previous_score}</span>
                  <span className="mx-2">→</span>
                  <span className="text-gray-600">Current: </span>
                  <span className="text-gray-900 font-bold">{score}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Card with Performance Tier */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${scoreColor} px-8 py-12 text-white text-center`}>
            {/* NEW: Performance Tier Emoji */}
            {feedback.tier_emoji && (
              <div className="text-6xl mb-4 animate-bounce">{feedback.tier_emoji}</div>
            )}
            
            <div className="text-8xl font-bold mb-4">{score}</div>
            
            {/* NEW: Tier Message */}
            <div className="text-2xl font-semibold mb-2">
              {feedback.tier_message || (passed ? '🎉 Great Job!' : `Need ${passThreshold}+ to Pass`)}
            </div>
            
            <p className="text-white/90 mt-2 text-lg">
              {feedback.performance_tier && (
                <span className="bg-white/20 px-4 py-2 rounded-full font-medium">
                  {feedback.performance_tier.replace('_', ' ')}
                </span>
              )}
            </p>
            
            {/* XP Earned Banner */}
            {!processing && (
              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div className="text-left">
                    <div className="text-sm text-white/80">XP Earned</div>
                    <div className="text-2xl font-bold">
                      +{calculateLessonXP({ score, isFirstTimeCategory: false, hasEventMultiplier: false })} XP
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Area Scores */}
          {feedback?.focus_area_scores && Object.keys(feedback.focus_area_scores).length > 0 && (
            <div className="p-8 bg-gray-50">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Focus Area Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(feedback.focus_area_scores).map(([area, areaScore]: [string, any]) => (
                  <div key={area} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{areaScore}</div>
                    <div className="text-sm font-medium text-gray-700">{area}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NEW: Adaptive Suggestion Banner */}
        {feedback.adaptive_suggestion && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Personalized Suggestion</h3>
                <p className="text-indigo-700">{feedback.adaptive_suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Feedback */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Feedback</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            {feedback.detailed_feedback}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            {feedback?.strengths && feedback.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-lg text-green-900 mb-4">
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-green-800">
                      <span className="text-green-600">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {feedback?.improvements && feedback.improvements.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-lg text-blue-900 mb-4">
                  Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {feedback.improvements.map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-blue-800">
                      <span className="text-blue-600">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Your Transcript */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What You Said
          </h2>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-700 leading-relaxed italic">
              &quot;{session.user_transcript}&quot;
            </p>
          </div>

          {/* Transcript Metrics with NEW Delivery Score */}
          {feedback?.transcript_metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">Words</div>
                <div className="text-3xl font-bold text-purple-700">{feedback.transcript_metrics.word_count || 0}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">Speaking Pace</div>
                <div className="text-3xl font-bold text-blue-700">{feedback.transcript_metrics.words_per_minute || 0}</div>
                <div className="text-xs text-blue-600 mt-1">WPM</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="text-xs text-yellow-600 font-semibold mb-1">Filler Words</div>
                <div className="text-3xl font-bold text-yellow-700">{feedback.transcript_metrics.filler_words || 0}</div>
                <div className="text-xs text-yellow-600 mt-1">
                  {(feedback.transcript_metrics.filler_words || 0) < 3 ? '✓ Great' : 
                   (feedback.transcript_metrics.filler_words || 0) < 6 ? '○ OK' : '⚠ High'}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">Delivery</div>
                <div className="text-3xl font-bold text-green-700">
                  {feedback.linguistic_analysis?.delivery?.score || 'N/A'}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {feedback.linguistic_analysis?.delivery?.pace_quality || 'Good'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Example */}
        {session.ai_example_audio && session.ai_example_text && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold">
                How I Would Have Done It
              </h2>
              <p className="text-white/90 mt-1">Listen to an example response</p>
            </div>
            
            <div className="p-8">
              {/* Audio Player with tracking */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
                <audio
                  controls
                  className="w-full"
                  src={`data:audio/mpeg;base64,${session.ai_example_audio}`}
                  onPlay={handleAudioPlay}
                  preload="metadata"
                >
                  Your browser does not support audio playback.
                </audio>
              </div>

              {/* Transcript */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Transcript:</h3>
                <p className="text-gray-700 leading-relaxed">
                  {session.ai_example_text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Linguistic Analysis with Delivery */}
        {feedback?.linguistic_analysis && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Linguistic Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Grammar */}
              {feedback.linguistic_analysis.grammar && (
                <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-blue-900">Grammar</h3>
                    <span className="text-3xl font-bold text-blue-700">{feedback.linguistic_analysis.grammar.score}</span>
                  </div>
                  {feedback.linguistic_analysis.grammar.suggestions?.length > 0 && (
                    <ul className="text-sm text-blue-800 space-y-2">
                      {feedback.linguistic_analysis.grammar.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Sentence Formation */}
              {feedback.linguistic_analysis.sentence_formation && (
                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-green-900">Sentence Structure</h3>
                    <span className="text-3xl font-bold text-green-700">{feedback.linguistic_analysis.sentence_formation.score}</span>
                  </div>
                  <div className="text-sm text-green-800 mb-2">
                    <strong>Level:</strong> <span className="capitalize">{feedback.linguistic_analysis.sentence_formation.complexity_level || 'intermediate'}</span>
                  </div>
                  {feedback.linguistic_analysis.sentence_formation.suggestions?.length > 0 && (
                    <ul className="text-sm text-green-800 space-y-2">
                      {feedback.linguistic_analysis.sentence_formation.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Vocabulary */}
              {feedback.linguistic_analysis.vocabulary && (
                <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-purple-900">Vocabulary</h3>
                    <span className="text-3xl font-bold text-purple-700">{feedback.linguistic_analysis.vocabulary.score}</span>
                  </div>
                  {feedback.linguistic_analysis.vocabulary.advanced_words_used?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-purple-800 mb-2">Strong Words Used:</p>
                      <div className="flex flex-wrap gap-2">
                        {feedback.linguistic_analysis.vocabulary.advanced_words_used.map((word: string, i: number) => (
                          <span key={i} className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-medium">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {feedback.linguistic_analysis.vocabulary.suggestions?.length > 0 && (
                    <ul className="text-sm text-purple-800 space-y-2">
                      {feedback.linguistic_analysis.vocabulary.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* NEW: Delivery Analysis */}
              {feedback.linguistic_analysis.delivery && (
                <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-amber-900">Delivery & Pace</h3>
                    <span className="text-3xl font-bold text-amber-700">{feedback.linguistic_analysis.delivery.score}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="text-sm text-amber-800">
                      <strong>Pace:</strong> <span className="capitalize">{feedback.linguistic_analysis.delivery.pace_quality}</span>
                    </div>
                    <div className="text-sm text-amber-800">
                      <strong>Filler Frequency:</strong> <span className="capitalize">{feedback.linguistic_analysis.delivery.filler_word_frequency}</span>
                    </div>
                  </div>
                  {feedback.linguistic_analysis.delivery.suggestions?.length > 0 && (
                    <ul className="text-sm text-amber-800 space-y-2">
                      {feedback.linguistic_analysis.delivery.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons with tracking */}
        <div className="flex gap-4 justify-center">
          <Link
            href={`/category/${categoryId}/module/${moduleId}/lesson/${lessonId}/practice`}
            onClick={handleRetryClick}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl transition-transform hover:scale-105"
          >
            🎤 Practice Again
          </Link>
          <Link
            href={`/category/${categoryId}`}
            onClick={handleBackClick}
            className="px-8 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-bold transition-colors"
          >
            ← Back to Lessons
          </Link>
        </div>
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingNudgeModal
          score={score}
          lessonId={lessonId}
          category={categoryId}
          isFirstClear={isFirstClear}
          onClose={async () => {
            await markRatingShown(userId)
            setShowRatingModal(false)
          }}
        />
      )}
    </>
  )
}