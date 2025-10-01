import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa6"
import { SlCamrecorder } from "react-icons/sl";
import Diagram from "../components/Diagram"
import Navbar from './Navbar'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar>

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
                onClick={() => navigate('/record')} 
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
      </Navbar>
    </div>
  )
}

export default Dashboard