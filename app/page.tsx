import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  // Auth redirect
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/Icon.png" alt="Locuta" className="w-10 h-10" />
              <span className="text-2xl font-bold text-slate-900">Locuta</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors"
              >
                Admin Login
              </Link>
              <Link
                href="/auth/student-login"
                className="px-4 py-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors"
              >
                Student Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span>🎓</span>
              <span>Empowering Educational Institutions</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              Transform Student Communication
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
                with AI-Powered Practice
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Locuta provides comprehensive speaking and communication training for students. 
              Track progress, manage classes, and help students build confidence through personalized AI coaching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-slate-300 bg-white text-slate-700 rounded-xl font-semibold text-lg hover:border-indigo-400 hover:text-indigo-600 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Student Communication Training
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools for administrators, teachers, and students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Student Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Easily create and manage student accounts. Organize by grade, class, or section. 
                Track individual progress and engagement across all communication categories.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Analytics & Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive analytics dashboard showing student performance, completion rates, 
                and improvement trends. Export reports for administrators and parents.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Age-Appropriate Content</h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically filter content by grade level. Middle school (5-8) and high school (9-12) 
                students see appropriate lessons tailored to their developmental stage.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Feedback</h3>
              <p className="text-slate-600 leading-relaxed">
                Students receive instant, personalized feedback on their speaking practice. 
                AI analyzes delivery, clarity, confidence, and language use to provide actionable insights.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Comprehensive Curriculum</h3>
              <p className="text-slate-600 leading-relaxed">
                300+ lessons across 6 categories: Public Speaking, Storytelling, Workplace Communication, 
                Casual Conversation, Creator Content, and Pitch Anything.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with role-based access. Student data is protected and 
                compliant with educational privacy standards. No emails required for student accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple Setup, Powerful Results
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get your institution up and running in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Admin Account",
                description: "Sign up as an administrator and set up your institution profile"
              },
              {
                step: "2",
                title: "Add Students",
                description: "Create student accounts individually or in bulk. Students get unique IDs for login"
              },
              {
                step: "3",
                title: "Students Practice",
                description: "Students log in and practice speaking with AI-powered feedback across 6 categories"
              },
              {
                step: "4",
                title: "Track Progress",
                description: "Monitor student engagement, completion rates, and improvement through analytics dashboard"
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Student Communication?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start your free trial today. No credit card required. Set up your institution and begin 
              helping students build confident communication skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Admin Login
              </Link>
            </div>
            <p className="text-white/80 mt-6 text-sm">
              Free trial • No credit card required • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/Icon.png" alt="Locuta" className="w-10 h-10" />
              <span className="text-xl font-bold">Locuta</span>
            </div>
            <div className="flex gap-6">
              <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
                Admin Login
              </Link>
              <Link href="/auth/student-login" className="text-slate-400 hover:text-white transition-colors">
                Student Login
              </Link>
              <Link href="/auth/signup" className="text-slate-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 Locuta. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
