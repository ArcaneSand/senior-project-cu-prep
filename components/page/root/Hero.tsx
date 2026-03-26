import { Check, ChevronRight, Mic } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Hero = () => {
  return (
      <div className="px-12 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              AI-Powered Interview Practice
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your Next Interview with
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Voice Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Practice real interview scenarios with our advanced AI voice assistant. Get instant feedback, improve your responses, and boost your confidence.
            </p>
            <div className="flex gap-4">
              <Link
                href="/interview"
                className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
              >
                Start Practicing Free
                <ChevronRight size={20} />
              </Link>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                <span className="text-gray-600">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                <span className="text-gray-600">500+ interview questions</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mic className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">AI Interviewer</div>
                  <div className="text-sm text-gray-500">Ready to start</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Question 1 of 10</div>
                  <div className="text-gray-900">"Tell me about yourself and your background..."</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-gray-600">Clarity</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">A+</div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Hero