import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DiagramProps {
  id: string;
  title: string;
  created_at?: string;
  last_edited?: string;
}

const Diagram: React.FC<DiagramProps> = ({ id, title, created_at, last_edited }) => {
  const navigate = useNavigate();

  // Calculate time difference for "X minutes/hours ago"
  const getTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 60) return `${diffInMins} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  // Format date as YYYY-MM-DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col px-6 py-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 border-2 gap-4">
      <div className="flex flex-col">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        
        {last_edited && (
          <p className='text-gray-400 flex flex-row items-center gap-1.5'>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeDifference(last_edited)}
          </p>
        )}

        {created_at && (
          <p className='text-gray-400 flex flex-row items-center gap-1.5'>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(created_at)}
          </p>
        )}
      </div>

      <div className='flex justify-center gap-4 items-center'>
        <button 
          onClick={() => navigate(`/record/${id}`)}
          className='w-1/2 h-full bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white text-md font-semibold px-4 py-2 transition-colors'
        >
          View
        </button>
        <button
          onClick={() => navigate(`/diagram/${id}/edit`)}
          className='w-1/2 h-full border-gray-300 border hover:bg-gray-100 rounded-lg flex items-center justify-center text-md font-semibold px-4 py-2 transition-colors'
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export default Diagram;