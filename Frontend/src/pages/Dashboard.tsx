import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FaPlus } from "react-icons/fa6"
import Diagram from "../components/Diagram"
import Navbar from './Navbar'
import { fetchUserDiagrams, type Diagram as DiagramType } from '../lib/api'
import StartSessionModal from '../components/StartSession'

const Dashboard: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [isCreatingNewDiagram, setIsCreatingNewDiagram] = useState(false);

  useEffect(() => {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const parsedUserData = JSON.parse(authUser);
      setUserId(parsedUserData.id);
      setUserName(parsedUserData.name);
    }
  }, []);

  // Fetch diagrams using TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['diagrams', userId],
    queryFn: () => fetchUserDiagrams(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!isCreatingNewDiagram) {
      refetch();
    }
  }, [isCreatingNewDiagram])


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <Navbar>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 mt-3 mb-2">
            <h2 className="text-6xl font-bold from-blue-600 to-purple-600">{`Welcome Back, ${userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'User'}`}</h2>
            <p className="pl-2 text-lg text-gray-500">Create or edit a new diagram from meeting</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between ">
              <button 
                onClick={() => setIsCreatingNewDiagram(true)} 
                className="w-1/4 group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-3">
                  New Diagram
                  <FaPlus />
                </span>
              </button>

            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className='bg-gradient-to-r bg-gray-3  00 px-6 py-4'>
                <h2 className="font-bold text-2xl text-black flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Diagram History
                </h2>
                <p className="text-black text-sm mt-1">Your recent diagram creations</p>
              </div>
              
              <div className='p-6 w-full'>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-purple-600 bg-purple-50 transition ease-in-out duration-150">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading diagrams...
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                      <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 font-medium mb-2">Error loading diagrams</p>
                      <p className="text-red-600 text-sm mb-4">Something went wrong while fetching your diagrams</p>
                      <button 
                        onClick={() => refetch()}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                ) : data && data.diagrams && data.diagrams.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {data.diagrams.map((diagram: DiagramType) => (
                      <Diagram 
                        key={diagram.id}
                        id={diagram.id}
                        title={diagram.title}
                        created_at={diagram.created_at}
                        last_edited={diagram.last_edited}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md mx-auto">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet</h3>
                      <p className="text-gray-500 mb-4">Create your first diagram to get started!</p>
                      <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105">
                        Create Diagram
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Navbar>

      {isCreatingNewDiagram && (
        <>
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <StartSessionModal setCreate={setIsCreatingNewDiagram} onSuccess={() => refetch()} />
          </div>
        </>
      )}

    </div>
  )
}

export default Dashboard;
