import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

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

    const { text, voice = 'nova' } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Get user's first name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const firstName = profile?.full_name?.split(' ')[0] || null

    // Generate greeting audio separately
    let greetingAudio = ''
    let greetingText = ''

    if (firstName) {
      greetingText = `Hello, ${firstName}.`
      
      const greetingResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: greetingText,
        speed: 0.95,
      })

      const greetingBuffer = Buffer.from(await greetingResponse.arrayBuffer())
      greetingAudio = greetingBuffer.toString('base64')
    }

    // Generate lesson audio
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      speed: 0.95,
    })

    const buffer = Buffer.from(await mp3Response.arrayBuffer())
    const audioBase64 = buffer.toString('base64')

    return NextResponse.json({
      audioBase64: audioBase64,
      greetingAudio: greetingAudio,
      greetingText: greetingText,
      success: true,
    })

  } catch (error) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}