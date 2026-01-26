'use client'

import { useState, useRef, useEffect } from 'react'
import { useSequentialAudio } from '@/lib/hooks/useSequentialAudio'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Mic, Square, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackLessonStart, trackRecordingStart, trackRecordingStop, trackAudioSubmission, trackLessonCompletion, trackError } from '@/lib/analytics/helpers'

const FEEDBACK_MESSAGES = [
  'Transcribing your audio...',
  'Analyzing your performance...',
  'Evaluating clarity and delivery...',
  'Generating personalized feedback...',
]

const CATEGORY_MAP: { [key: string]: string } = {
  'public-speaking': 'Public Speaking',
  'storytelling': 'Storytelling',
  'creator-speaking': 'Creator Speaking',
  'casual-conversation': 'Casual Conversation',
  'workplace-communication': 'Workplace Communication',
  'pitch-anything': 'Pitch Anything',
}

export default function PracticePage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.categoryId as string
  const moduleId = params?.moduleId as string
  const lessonId = params?.lessonId as string

  // State
  const [step, setStep] = useState<'loading' | 'intro' | 'recording'>('loading')
  const [introAudio, setIntroAudio] = useState('')
  const [greetingAudio, setGreetingAudio] = useState('')
  const [greetingText, setGreetingText] = useState('')
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [lessonData, setLessonData] = useState({ title: '', explanation: '', prompt: '' })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaderMsg, setLoaderMsg] = useState(0)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { isPlaying, currentTime, duration, play, pause, skipBackward, skipForward, replay, seek } = 
    useSequentialAudio(greetingAudio, introAudio)

  useEffect(() => {
    loadLesson()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => setLoaderMsg(p => (p + 1) % FEEDBACK_MESSAGES.length), 2000)
      return () => clearInterval(interval)
    }
  }, [isSubmitting])

  const loadLesson = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('lessons')
        .select('level_title, lesson_explanation, practice_prompt')
        .eq('category', CATEGORY_MAP[categoryId])
        .eq('module_number', parseInt(moduleId))
        .eq('level_number', parseInt(lessonId))
        .single()

      if (data) {
        setLessonData({
          title: data.level_title,
          explanation: data.lesson_explanation,
          prompt: data.practice_prompt
        })
        setStep('intro')
        generateAudio(data.lesson_explanation)
        trackLessonStart({
          lessonId,
          lessonTitle: data.level_title,
          category: categoryId,
          moduleNumber: parseInt(moduleId),
          lessonNumber: parseInt(lessonId),
          coachingStyle: 'Supportive',
          isFirstLesson: false
        })
      }
    } catch (err) {
      setError('Failed to load lesson')
      setStep('intro')
    }
  }

  const generateAudio = async (text: string) => {
    try {
      setIsAudioLoading(true)
      
      const res = await fetch('/api/lesson-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' })
      })
      const data = await res.json()
      
      // Set greeting and lesson audio separately
      setGreetingAudio(data.greetingAudio || '')
      setGreetingText(data.greetingText || '')
      setIntroAudio(data.audioBase64 || '')
      
      setIsAudioLoading(false)
    } catch (err) {
      console.error('Audio generation failed:', err)
      setIsAudioLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      })
      
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      trackRecordingStart({ lessonId, attemptNumber: 1, coachingStyle: 'Supportive' })
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
    } catch (err) {
      setError('Failed to access microphone')
      trackError({ errorType: 'microphone_error', errorMessage: String(err), context: { lessonId } })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      
      trackRecordingStop({ 
        lessonId, 
        duration: recordingTime,
        tooShort: recordingTime < 30,
        tooLong: recordingTime > 120
      })
    }
  }

  const submitRecording = async () => {
    if (!audioBlob) return
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('tone', 'Supportive')
      formData.append('categoryId', categoryId)
      formData.append('moduleId', moduleId)
      formData.append('lessonId', lessonId)

      const res = await fetch('/api/feedback', { method: 'POST', body: formData })
      const data = await res.json()

      trackLessonCompletion({
        lessonId,
        lessonTitle: lessonData.title,
        category: categoryId,
        moduleNumber: parseInt(moduleId),
        lessonNumber: parseInt(lessonId),
        coachingStyle: 'Supportive',
        overallScore: data.score || 0,
        passed: data.passed || false,
        attempts: 1,
        totalTime: recordingTime,
        transcriptWordCount: 0,
        fillerWordsCount: 0
      })

      router.push(`/category/${categoryId}/module/${moduleId}/lesson/${lessonId}/feedback?session=${data.sessionId}`)
    } catch (err) {
      setError('Failed to submit recording')
      setIsSubmitting(false)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/category/${categoryId}`} className="text-slate-700 hover:text-indigo-600 font-medium">
            ← Back
          </Link>
          <img src="/Icon.png" alt="Locuta" className="w-8 h-8" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {step === 'loading' && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-5xl mb-6 animate-pulse">📚</div>
            <h2 className="text-2xl font-bold text-purple-600">Loading Lesson...</h2>
          </div>
        )}

        {step === 'intro' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{lessonData.title}</h2>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">📚 Lesson Overview</h3>
              <p className="text-purple-800 leading-relaxed">{lessonData.explanation}</p>
            </div>

            {/* Audio Loading State */}
            {isAudioLoading && !introAudio && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 mb-6 text-center">
                <div className="animate-pulse flex items-center justify-center gap-2 text-purple-600">
                  <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                  <span className="text-sm font-medium">Generating audio...</span>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {introAudio && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between text-xs text-slate-600 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="relative w-full h-2 bg-white/60 rounded-full mb-4">
                  <div className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                       style={{ width: `${duration ? (currentTime/duration)*100 : 0}%` }} />
                  <input type="range" min={0} max={duration} value={currentTime} 
                         onChange={e => seek(parseFloat(e.target.value))}
                         className="absolute top-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                
                {/* Show greeting text if available */}
                {greetingText && (
                  <div className="mb-3 p-3 bg-white rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">{greetingText}</p>
                  </div>
                )}
                
                <div className="flex justify-center gap-3">
                  <button onClick={() => skipBackward()} className="w-12 h-12 rounded-full bg-white shadow-md hover:bg-gray-50" type="button">
                    <SkipBack className="w-5 h-5 mx-auto" />
                  </button>
                  <button onClick={isPlaying ? pause : play} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg" type="button">
                    {isPlaying ? <Pause className="w-6 h-6 mx-auto" /> : <Play className="w-6 h-6 mx-auto ml-1" />}
                  </button>
                  <button onClick={() => skipForward()} className="w-12 h-12 rounded-full bg-white shadow-md hover:bg-gray-50" type="button">
                    <SkipForward className="w-5 h-5 mx-auto" />
                  </button>
                  <button onClick={replay} className="w-12 h-12 rounded-full bg-white shadow-md hover:bg-gray-50" type="button">
                    <RotateCcw className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setStep('recording')} 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl" type="button">
              Continue to Recording →
            </button>
          </div>
        )}

        {step === 'recording' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Your Task</h3>
              <p className="text-slate-800 leading-relaxed">{lessonData.prompt}</p>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 text-center">
              {!isRecording && !audioBlob && !isSubmitting && (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 mb-8">Ready to Record</h2>
                  <button onClick={startRecording} className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all" type="button">
                    <Mic className="w-16 h-16 mx-auto" strokeWidth={2} />
                  </button>
                </>
              )}

              {isRecording && (
                <>
                  <h2 className="text-3xl font-bold text-red-600 mb-4">Recording...</h2>
                  <div className="text-4xl font-bold text-slate-900 mb-8">{formatTime(recordingTime)}</div>
                  <button onClick={stopRecording} className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full hover:shadow-2xl" type="button">
                    <Square className="w-12 h-12 mx-auto" strokeWidth={2} fill="white" />
                  </button>
                </>
              )}

              {audioBlob && !isSubmitting && (
                <>
                  <div className="text-6xl mb-6">✅</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-4">Recording Complete!</h2>
                  <p className="text-slate-600 mb-8">Duration: {formatTime(recordingTime)}</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setAudioBlob(null)} className="px-8 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300" type="button">
                      Re-record
                    </button>
                    <button onClick={submitRecording} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-xl" type="button">
                      Submit for Feedback →
                    </button>
                  </div>
                </>
              )}

              {isSubmitting && (
                <div className="py-8">
                  <div className="text-6xl mb-6 animate-bounce">🤔</div>
                  <h2 className="text-3xl font-bold text-purple-600 mb-2">Analyzing Your Response</h2>
                  <p className="text-slate-600 animate-pulse">{FEEDBACK_MESSAGES[loaderMsg]}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}