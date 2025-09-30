import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AutoScribe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to AutoScribe Dashboard
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your automated real-time diagram generation platform
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Transcription</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Automatically capture and transcribe your meetings
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Diagram Generation</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    AI-powered diagram creation from your conversations
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Live Updates</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Diagrams update in real-time as you speak
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                Start a New Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
