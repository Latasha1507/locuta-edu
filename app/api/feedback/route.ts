import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const categoryMap: { [key: string]: string } = {
  // Middle School (Grades 5-8)
  'public-speaking-fundamentals': 'Public Speaking Fundamentals',
  'storytelling': 'Storytelling',
  'leadership-team-communication': 'Leadership & Team Communication',
  'conversation-skills': 'Conversation Skills',
  'project-academic-presentation': 'Project & Academic Presentation',
  'persuasive-speaking': 'Persuasive Speaking',
  
  // High School (Grades 9-12)
  'public-speaking-mastery': 'Public Speaking Mastery',
  'advanced-storytelling': 'Advanced Storytelling & Content',
  'leadership-team-advanced': 'Leadership & Team Communication (Advanced)',
  'content-creation-digital': 'Content Creation & Digital Communication',
  'entrepreneurial-sales': 'Entrepreneurial & Sales Communication',
  'debate-advanced-persuasion': 'Debate & Advanced Persuasion'
}

// IMPROVED: Updated scoring weights with delivery component
const SCORING_WEIGHTS = {
  GRAMMAR: 0.25,      // Reduced from 30%
  SENTENCE: 0.30,     // Reduced from 35%
  VOCABULARY: 0.25,   // Reduced from 35%
  DELIVERY: 0.20,     // NEW: Pace, fillers, fluency
  
  getContentWeight: (level: number) => {
    if (level <= 10) return 0.75  // Increased from 70% for beginners
    if (level <= 30) return 0.60
    return 0.50
  }
}

function getLevelExpectations(level: number) {
  if (level <= 10) return {
    grammar: 'basic sentence structure, simple tenses',
    vocabulary: 'everyday conversational words',
    sentences: 'simple and compound sentences',
    delivery: 'clear pace, minimal filler words'
  }
  if (level <= 30) return {
    grammar: 'consistent tenses, proper conjunctions',
    vocabulary: 'expanded vocabulary with variety',
    sentences: 'mix of compound and complex sentences',
    delivery: 'confident pace, controlled filler words'
  }
  return {
    grammar: 'advanced grammar, nuanced expressions',
    vocabulary: 'sophisticated word choices, minimal repetition',
    sentences: 'complex sentences with smooth transitions',
    delivery: 'natural flow, professional pace, no fillers'
  }
}

// NEW: Calculate delivery score from transcript metrics
function calculateDeliveryScore(metrics: any, level: number): number {
  const wpm = metrics.words_per_minute || 0
  const fillers = metrics.filler_words || 0
  const wordCount = metrics.word_count || 0
  
  let score = 100
  
  // Pace scoring (ideal: 120-150 WPM)
  if (wpm < 80) score -= 20        // Too slow
  else if (wpm < 100) score -= 10
  else if (wpm > 180) score -= 20  // Too fast
  else if (wpm > 160) score -= 10
  
  // Filler words penalty (more strict for higher levels)
  const fillerPenalty = level <= 10 ? 3 : level <= 30 ? 5 : 7
  score -= fillers * fillerPenalty
  
  // Word count (check if response is too short)
  const expectedWords = level <= 10 ? 40 : level <= 30 ? 60 : 80
  if (wordCount < expectedWords * 0.6) score -= 20  // Less than 60% of expected
  else if (wordCount < expectedWords * 0.8) score -= 10
  
  return Math.max(0, Math.min(100, score))
}

// NEW: Get performance tier
function getPerformanceTier(score: number, threshold: number): {
  tier: string
  message: string
  emoji: string
} {
  if (score >= threshold + 15) return {
    tier: 'EXCELLENT',
    message: 'Outstanding work! You\'ve mastered this lesson!',
    emoji: '🌟'
  }
  if (score >= threshold + 5) return {
    tier: 'GOOD',
    message: 'Great job! You\'re performing above expectations!',
    emoji: '✅'
  }
  if (score >= threshold) return {
    tier: 'PASSED',
    message: 'Well done! You\'ve successfully completed this lesson!',
    emoji: '👍'
  }
  if (score >= threshold - 5) return {
    tier: 'NEARLY_THERE',
    message: 'You\'re very close! Just a bit more practice!',
    emoji: '📈'
  }
  return {
    tier: 'NEEDS_PRACTICE',
    message: 'Keep practicing! You\'re on the right path!',
    emoji: '💪'
  }
}

// NEW: Lesson-specific focus area weights
function getFocusAreaWeights(categoryName: string, lessonTitle: string): { [key: string]: number } {
  // Default equal weights
  const defaultWeights: { [key: string]: number } = {
    'Clarity': 0.33,
    'Confidence': 0.33,
    'Delivery': 0.34
  }
  
  // Persuasion-focused lessons
  if (categoryName.includes('Persuasive') || categoryName.includes('Debate')) {
    return {
      'Persuasiveness': 0.40,
      'Evidence': 0.30,
      'Clarity': 0.30
    }
  }
  
  // Storytelling lessons
  if (categoryName.includes('Storytelling')) {
    return {
      'Engagement': 0.35,
      'Structure': 0.35,
      'Creativity': 0.30
    }
  }
  
  // Leadership lessons
  if (categoryName.includes('Leadership')) {
    return {
      'Authority': 0.35,
      'Clarity': 0.35,
      'Inspiration': 0.30
    }
  }
  
  return defaultWeights
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const tone = formData.get('tone') as string
    const categoryId = formData.get('categoryId') as string
    const moduleId = formData.get('moduleId') as string
    const lessonId = formData.get('lessonId') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryName = categoryMap[categoryId]
    const levelNumber = parseInt(lessonId)

    // Get lesson
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('category', categoryName)
      .eq('module_number', parseInt(moduleId))
      .eq('level_number', levelNumber)

    const lesson = lessons?.[0]
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const levelExpectations = getLevelExpectations(levelNumber)
    const contentWeight = SCORING_WEIGHTS.getContentWeight(levelNumber)
    const linguisticWeight = 1 - contentWeight

    // NEW: Get previous attempt for improvement tracking
    const { data: previousAttempts } = await supabase
      .from('sessions')
      .select('overall_score, feedback')
      .eq('user_id', user.id)
      .eq('category', categoryName)
      .eq('module_number', parseInt(moduleId))
      .eq('level_number', levelNumber)
      .order('created_at', { ascending: false })
      .limit(1)

    const previousScore = previousAttempts?.[0]?.overall_score || null

    // Step 1: Transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    })

    const userTranscript = transcription.text

    // Step 2: Generate personalized improved version
    const focusAreas = Array.isArray(lesson.feedback_focus_areas) 
      ? lesson.feedback_focus_areas.join(', ')
      : lesson.feedback_focus_areas || 'Clarity, Confidence, Delivery'

    const improvedVersionPrompt = `You are a speaking coach helping a Level ${levelNumber} student improve.

**Task:** ${lesson.practice_prompt}
**Student's Response:** "${userTranscript}"
**Focus Areas:** ${focusAreas}
**Level ${levelNumber} Expectations:** ${JSON.stringify(levelExpectations)}

Create an IMPROVED version of their response that:
1. Keeps their core ideas and story
2. Fixes grammar/clarity issues
3. Improves pacing and flow
4. Demonstrates proper ${focusAreas}
5. Uses appropriate vocabulary for Level ${levelNumber}
6. Sounds natural and conversational
7. Similar length to original

IMPORTANT: Keep their personal voice and ideas. Just make it better.

Respond with ONLY the improved speech text.`

    const improvedResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You improve student responses while keeping their core message. Sound natural and authentic.' 
        },
        { role: 'user', content: improvedVersionPrompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    })

    const aiExampleText = improvedResponse.choices[0].message.content || 'Example not available.'

    // Step 3: Generate audio
    const aiAudioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: aiExampleText,
    })

    const aiAudioBuffer = Buffer.from(await aiAudioResponse.arrayBuffer())
    const aiAudioBase64 = aiAudioBuffer.toString('base64')

    // NEW: Get focus area weights
    const focusAreaWeights = getFocusAreaWeights(categoryName, lesson.level_title)

    // Step 4: Generate feedback with IMPROVED prompt
    const feedbackPrompt = `Analyze this Level ${levelNumber} speaking practice.

**Lesson:** ${lesson.level_title}
**Task:** ${lesson.practice_prompt}
**Focus Areas with Weights:** ${JSON.stringify(focusAreaWeights)}
**Student Response:** "${userTranscript}"
**Level Expectations:** ${JSON.stringify(levelExpectations)}

**Scoring Weights:**
- Content & Delivery: ${contentWeight * 100}%
- Linguistic Quality: ${linguisticWeight * 100}%
  - Grammar: ${SCORING_WEIGHTS.GRAMMAR * 100}%
  - Sentence Formation: ${SCORING_WEIGHTS.SENTENCE * 100}%
  - Vocabulary: ${SCORING_WEIGHTS.VOCABULARY * 100}%
  - Delivery: ${SCORING_WEIGHTS.DELIVERY * 100}%

Respond with ONLY valid JSON:
{
  "overall_score": 85,
  "content_score": 80,
  "linguistic_score": 90,
  "passed": true,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "detailed_feedback": "Comprehensive paragraph",
  "focus_area_scores": {
    "${Object.keys(focusAreaWeights)[0]}": 80,
    "${Object.keys(focusAreaWeights)[1]}": 85,
    "${Object.keys(focusAreaWeights)[2]}": 90
  },
  "linguistic_analysis": {
    "grammar": {
      "score": 85,
      "suggestions": ["suggestion 1"]
    },
    "sentence_formation": {
      "score": 88,
      "complexity_level": "intermediate",
      "suggestions": ["suggestion 1"]
    },
    "vocabulary": {
      "score": 82,
      "advanced_words_used": ["word1", "word2"],
      "suggestions": ["suggestion 1"]
    },
    "delivery": {
      "score": 85,
      "pace_quality": "good",
      "filler_word_frequency": "low",
      "suggestions": ["suggestion 1"]
    }
  },
  "transcript_metrics": {
    "word_count": 50,
    "words_per_minute": 120,
    "filler_words": 3,
    "pace_feedback": "Good pace"
  }
}

Be encouraging but honest. For beginners (Level ${levelNumber <= 10 ? 'yes' : 'no'}), focus more on content and confidence.`

    const feedbackResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert speaking coach. Respond ONLY with valid JSON.' 
        },
        { role: 'user', content: feedbackPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const feedbackText = feedbackResponse.choices[0].message.content || '{}'
    const feedback = JSON.parse(feedbackText)

    // Calculate final scores with IMPROVED formula
    
    // 1. Calculate weighted content score using focus area weights
    if (!feedback.content_score && feedback.focus_area_scores) {
      let weightedSum = 0
      let totalWeight = 0
      
      for (const [area, score] of Object.entries(feedback.focus_area_scores)) {
        const weight = focusAreaWeights[area] || (1 / Object.keys(feedback.focus_area_scores).length)
        weightedSum += (score as number) * weight
        totalWeight += weight
      }
      
      feedback.content_score = Math.round(weightedSum / totalWeight)
    }
    
    // 2. Calculate delivery score from transcript metrics
    if (feedback.transcript_metrics) {
      const deliveryScore = calculateDeliveryScore(feedback.transcript_metrics, levelNumber)
      
      // If AI didn't provide delivery analysis, use calculated score
      if (!feedback.linguistic_analysis.delivery) {
        feedback.linguistic_analysis.delivery = {
          score: deliveryScore,
          pace_quality: feedback.transcript_metrics.pace_feedback || 'good',
          filler_word_frequency: feedback.transcript_metrics.filler_words < 3 ? 'low' : 
                                 feedback.transcript_metrics.filler_words < 6 ? 'moderate' : 'high',
          suggestions: []
        }
      }
    }
    
    // 3. Calculate linguistic score with NEW weights
    if (!feedback.linguistic_score && feedback.linguistic_analysis) {
      const g = feedback.linguistic_analysis.grammar.score || 75
      const s = feedback.linguistic_analysis.sentence_formation.score || 75
      const v = feedback.linguistic_analysis.vocabulary.score || 75
      const d = feedback.linguistic_analysis.delivery?.score || 75
      
      feedback.linguistic_score = Math.round(
        g * SCORING_WEIGHTS.GRAMMAR +
        s * SCORING_WEIGHTS.SENTENCE +
        v * SCORING_WEIGHTS.VOCABULARY +
        d * SCORING_WEIGHTS.DELIVERY
      )
    }
    
    // 4. Calculate overall score
    feedback.overall_score = Math.round(
      feedback.content_score * contentWeight +
      feedback.linguistic_score * linguisticWeight
    )
    
    // 5. Determine pass/fail and performance tier
    const passThreshold = levelNumber <= 10 ? 60 : levelNumber <= 30 ? 65 : 70
    feedback.passed = feedback.overall_score >= passThreshold
    
    // NEW: Add performance tier
    const performanceTier = getPerformanceTier(feedback.overall_score, passThreshold)
    feedback.performance_tier = performanceTier.tier
    feedback.tier_message = performanceTier.message
    feedback.tier_emoji = performanceTier.emoji
    
    // NEW: Add improvement tracking
    if (previousScore !== null) {
      feedback.improvement = feedback.overall_score - previousScore
      feedback.previous_score = previousScore
      
      // Add improvement message
      if (feedback.improvement > 0) {
        feedback.improvement_message = `You improved by ${feedback.improvement} points since your last attempt! 🎉`
      } else if (feedback.improvement === 0) {
        feedback.improvement_message = `You maintained your score. Try focusing on the improvement suggestions!`
      } else {
        feedback.improvement_message = `Keep practicing! Review the feedback to improve next time.`
      }
    }

    // Step 5: Save session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log('💾 Attempting to save session:', {
      sessionId,
      userId: user.id,
      category: categoryName,
      moduleNumber: parseInt(moduleId),
      levelNumber: levelNumber,
      hasAudio: !!aiAudioBase64,
      hasFeedback: !!feedback
    })

    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        user_id: user.id,
        category: categoryName,
        module_number: parseInt(moduleId),
        level_number: levelNumber,
        tone: 'Supportive',
        user_transcript: userTranscript,
        ai_example_text: aiExampleText,
        ai_example_audio: aiAudioBase64,
        feedback: feedback,
        overall_score: feedback.overall_score,
        status: 'completed',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('❌ Session insert failed:', insertError)
      return NextResponse.json({ 
        error: 'Failed to save session', 
        details: insertError.message 
      }, { status: 500 })
    } else {
      console.log('✅ Session saved successfully!')
    }

    // Step 6: Update progress with adaptive suggestions
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('best_score, completed, attempts_count')
      .eq('user_id', user.id)
      .eq('category', categoryName)
      .eq('module_number', parseInt(moduleId))
      .eq('level_number', levelNumber)
      .single()

    const isNewBest = !existingProgress || feedback.overall_score > (existingProgress.best_score || 0)
    const isCompleted = feedback.overall_score >= passThreshold
    const finalCompleted = existingProgress?.completed || isCompleted
    const attemptsCount = (existingProgress?.attempts_count || 0) + 1

    // NEW: Adaptive suggestions
    let adaptiveSuggestion = null
    if (attemptsCount >= 3 && feedback.overall_score >= 90) {
      adaptiveSuggestion = "You're excelling at this level! Consider moving to more challenging lessons."
    } else if (attemptsCount >= 5 && feedback.overall_score < 50) {
      adaptiveSuggestion = "This level seems challenging. Consider reviewing earlier lessons or asking for help."
    }

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        category: categoryName,
        module_number: parseInt(moduleId),
        level_number: levelNumber,
        completed: finalCompleted,
        best_score: isNewBest ? feedback.overall_score : existingProgress?.best_score,
        attempts_count: attemptsCount,
        last_attempted_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,category,module_number,level_number'
      })

    // Add adaptive suggestion to response
    if (adaptiveSuggestion) {
      feedback.adaptive_suggestion = adaptiveSuggestion
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      feedback: feedback,
      score: feedback.overall_score,
      passed: feedback.passed,
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process feedback', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}