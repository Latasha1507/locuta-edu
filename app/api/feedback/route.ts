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

const SCORING_WEIGHTS = {
  GRAMMAR: 0.30,
  SENTENCE: 0.35,
  VOCABULARY: 0.35,
  
  getContentWeight: (level: number) => level <= 10 ? 0.70 : level <= 30 ? 0.60 : 0.50
}

function getLevelExpectations(level: number) {
  if (level <= 10) return {
    grammar: 'basic sentence structure, simple tenses',
    vocabulary: 'everyday conversational words',
    sentences: 'simple and compound sentences'
  }
  if (level <= 30) return {
    grammar: 'consistent tenses, proper conjunctions',
    vocabulary: 'expanded vocabulary with variety',
    sentences: 'mix of compound and complex sentences'
  }
  return {
    grammar: 'advanced grammar, nuanced expressions',
    vocabulary: 'sophisticated word choices, minimal repetition',
    sentences: 'complex sentences with smooth transitions'
  }
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

    // Step 4: Generate feedback
    const feedbackPrompt = `Analyze this Level ${levelNumber} speaking practice.

**Lesson:** ${lesson.level_title}
**Task:** ${lesson.practice_prompt}
**Focus Areas:** ${focusAreas}
**Student Response:** "${userTranscript}"
**Level Expectations:** ${JSON.stringify(levelExpectations)}

**Scoring Weights:**
- Content & Delivery: ${contentWeight * 100}%
- Linguistic Quality: ${linguisticWeight * 100}%
  - Grammar: ${SCORING_WEIGHTS.GRAMMAR * 100}%
  - Sentence Formation: ${SCORING_WEIGHTS.SENTENCE * 100}%
  - Vocabulary: ${SCORING_WEIGHTS.VOCABULARY * 100}%

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
    "Clarity": 80,
    "Confidence": 85,
    "Delivery": 90
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
    }
  },
  "transcript_metrics": {
    "word_count": 50,
    "words_per_minute": 120,
    "filler_words": 3,
    "pace_feedback": "Good pace"
  }
}

Be encouraging but honest.`

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

    // Calculate final scores
    if (!feedback.content_score && feedback.focus_area_scores) {
      const scores = Object.values(feedback.focus_area_scores) as number[]
      feedback.content_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }
    
    if (!feedback.linguistic_score && feedback.linguistic_analysis) {
      const g = feedback.linguistic_analysis.grammar.score || 75
      const s = feedback.linguistic_analysis.sentence_formation.score || 75
      const v = feedback.linguistic_analysis.vocabulary.score || 75
      
      feedback.linguistic_score = Math.round(
        g * SCORING_WEIGHTS.GRAMMAR +
        s * SCORING_WEIGHTS.SENTENCE +
        v * SCORING_WEIGHTS.VOCABULARY
      )
    }
    
    feedback.overall_score = Math.round(
      feedback.content_score * contentWeight +
      feedback.linguistic_score * linguisticWeight
    )
    
    const passThreshold = levelNumber <= 10 ? 60 : levelNumber <= 30 ? 65 : 70
    feedback.passed = feedback.overall_score >= passThreshold

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
    // Step 6: Update progress
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('best_score, completed')
      .eq('user_id', user.id)
      .eq('category', categoryName)
      .eq('module_number', parseInt(moduleId))
      .eq('level_number', levelNumber)
      .single()

    const isNewBest = !existingProgress || feedback.overall_score > (existingProgress.best_score || 0)
    const isCompleted = feedback.overall_score >= passThreshold
    const finalCompleted = existingProgress?.completed || isCompleted

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        category: categoryName,
        module_number: parseInt(moduleId),
        level_number: levelNumber,
        completed: finalCompleted,
        best_score: isNewBest ? feedback.overall_score : existingProgress?.best_score,
        last_attempted_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,category,module_number,level_number'
      })

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