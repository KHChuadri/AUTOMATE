import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa6"
import { SlCamrecorder } from "react-icons/sl";
import SearchBar from "../components/SearchBar"
import Diagram from "../components/Diagram"

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoScribe
                </h1>
              </div>
            </div>

            <div className='flex items-center justify-center w-1/2'><SearchBar /></div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/50 rounded-lg px-3 py-2 border border-gray-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 flex flex-col gap-5">
        {/* Call to Action */}
        
        <div className="flex flex-col gap-1.5 mt-3 mb-2">
          <h2 className="text-6xl font-bold">{`Welcome Back Name`}</h2>
          <p className="pl-2 text-lg text-gray-500">Create or edit a new diagram from meeting</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between ">
            <button 
              onClick={() => navigate('/session/new')} 
              className= "w-1/4 group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-3">
                New Diagram
                <FaPlus />
              </span>
            </button>

            <button
              onClick={() => navigate('/session/new')} 
              className="w-1/4 group bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            > 
              <span className="flex items-center justify-center gap-3">
                Record Session
                <SlCamrecorder />
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-5 border-2 border-gray-200 rounded-lg pb-3">
            <div className='bg-gray-200 px-4 py-3'>
              <h2 className="font-bold text-2xl text-black">Diagram History</h2>
            </div>
            
            <div className='grid grid-cols-3 px-4 w-full'>
              <Diagram />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard