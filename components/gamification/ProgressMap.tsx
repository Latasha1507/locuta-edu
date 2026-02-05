'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProgressMapProps {
  userId: string
  grade: number
  categories: Array<{
    id: string
    name: string
    icon: string
    color: string
    completedLessons: number
    totalLessons: number
  }>
}

export default function ProgressMap({ userId, grade, categories }: ProgressMapProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🗺️</span> Your Learning Journey
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Explore categories and track your progress
        </p>
      </div>
      
      {/* Journey Map - Island Style */}
      <div className="relative">
        {/* Path Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {categories.map((_, index) => {
            if (index === categories.length - 1) return null
            const isEven = index % 2 === 0
            return (
              <line
                key={index}
                x1={isEven ? "25%" : "75%"}
                y1={`${(index / categories.length) * 100 + 8}%`}
                x2={isEven ? "75%" : "25%"}
                y2={`${((index + 1) / categories.length) * 100 + 8}%`}
                stroke="url(#pathGradient)"
                strokeWidth="4"
                strokeDasharray="8,4"
                opacity="0.3"
              />
            )
          })}
        </svg>
        
        {/* Category Islands */}
        <div className="relative space-y-8" style={{ zIndex: 1 }}>
          {categories.map((category, index) => {
            const isEven = index % 2 === 0
            const completionPercent = Math.round((category.completedLessons / category.totalLessons) * 100)
            const isCompleted = completionPercent === 100
            const isUnlocked = index === 0 || categories[index - 1].completedLessons > 0
            
            return (
              <div
                key={category.id}
                className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
              >
                <Link
                  href={isUnlocked ? `/category/${category.id}` : '#'}
                  className={`group relative ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 w-64 shadow-xl border-4 ${
                    isCompleted ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-white'
                  } transition-all ${isUnlocked ? 'hover:scale-105 hover:shadow-2xl' : ''}`}>
                    {/* Lock Icon */}
                    {!isUnlocked && (
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        🔒
                      </div>
                    )}
                    
                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-lg animate-bounce">
                        ⭐
                      </div>
                    )}
                    
                    <div className="text-white">
                      <div className="text-5xl mb-3">{category.icon}</div>
                      <h4 className="text-lg font-bold mb-2 leading-tight">{category.name}</h4>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>{category.completedLessons}/{category.totalLessons} lessons</span>
                        <span className="font-bold">{completionPercent}%</span>
                      </div>
                      
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      
                      {isCompleted && (
                        <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center text-xs font-bold">
                          ✓ Category Mastered!
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}