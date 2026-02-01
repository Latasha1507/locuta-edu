// app/api/lesson-audio/route.ts
// Simple TTS endpoint for lesson explanations with optional greeting

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, voice = 'nova' } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    console.log('🔊 Generating TTS audio...')

    // Get user's first name for greeting
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const firstName = profile?.full_name?.split(' ')[0] || null

    // Generate greeting audio if we have a first name
    let greetingAudio = ''
    let greetingText = ''

    if (firstName) {
      greetingText = `Hello, ${firstName}.`
      console.log('👋 Generating greeting audio...')
      
      try {
        const greetingResponse = await openai.audio.speech.create({
          model: 'tts-1',
          voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
          input: greetingText,
          speed: 0.95,
        })

        const greetingBuffer = Buffer.from(await greetingResponse.arrayBuffer())
        greetingAudio = greetingBuffer.toString('base64')
        console.log('✅ Greeting audio generated')
      } catch (err) {
        console.error('⚠️ Greeting audio failed (non-critical):', err)
        // Continue without greeting audio
      }
    }

    // Generate lesson audio
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: 0.95
    })

    const buffer = Buffer.from(await mp3Response.arrayBuffer())
    const audioBase64 = buffer.toString('base64')

    console.log('✅ Audio generated successfully')

    return NextResponse.json({
      audioBase64: audioBase64,
      greetingAudio: greetingAudio,
      greetingText: greetingText,
      success: true
    })

  } catch (error) {
    console.error('❌ Audio generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}