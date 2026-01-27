import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify admin is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, age, grade, class_section, roll_number, student_id, password } = body

    // Generate student ID if not provided
    const finalStudentId = student_id || `STU${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    // Create fake email (students never use this)
    const email = `${finalStudentId}@student.locuta.internal`

    // Use service role to create user (bypasses email confirmation)
    const supabaseAdmin = await createClient()
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name,
        account_type: 'student',
        student_id: finalStudentId,
        grade: parseInt(grade)
      }
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Update profile
    if (newUser.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: full_name,
          account_type: 'student',
          student_id: finalStudentId,
          grade: parseInt(grade),
          class_section: class_section || null,
          roll_number: roll_number || null,
          created_by_admin_id: user.id
        })
        .eq('id', newUser.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      student_id: finalStudentId,
      message: 'Student created successfully'
    })

  } catch (error: any) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}