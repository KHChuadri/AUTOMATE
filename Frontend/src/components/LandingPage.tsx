import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../pages/Navbar'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      navigate('/dashboard');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-purple-600 bg-clip-text text-transparent mb-4">
                Introducing AutoScribe
              </h2>
              <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                Your powerful automation diagram creator
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform your conversations into beautiful diagrams automatically.
                <br></br>
                Start creating with the power of automation.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Transcription</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automatically capture and transcribe your meetings with industry-leading speech recognition technology.
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Diagram Generation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI-powered diagram creation that understands technical conversations and transforms them into professional visuals.
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Updates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Watch as your diagrams evolve in real-time, keeping pace with your conversation and ideas.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-x-3">
              <button onClick={() => navigate('/register')} className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center justify-center">
                  Get Started
                  <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Navbar>
    </div>
  )
}

export default LandingPage