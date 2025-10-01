const Diagram = () => {
  return (
    <div className="flex flex-col px-6 py-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 border-2 gap-4">
      <div className="flex flex-col">
        <h3 className="font-bold text-lg mb-1">System Architecture Diagram</h3>
        <p className='text-gray-400 flex flex-row items-center gap-1.5'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          30 minutes
        </p>

        <p className='text-gray-400 flex flex-row items-center gap-1.5'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          2024-11-10
        </p>
      </div>

      <div className='flex justify-center gap-4 items-center'>
        <button 
          className='w-1/2 h-full bg-blue-500 rounded-lg flex items-center justify-center text-white text-md font-semibold px-4 py-2'
        >
          View
        </button>
        <button
          className='w-1/2 h-full border-gray-300 border rounded-lg flex items-center justify-center text-md font-semibold px-4 py-2'
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export default Diagram;