import React from 'react'

const Loading = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return (
      <div className="animate-pulse">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg skeleton"></div>
                <div className="w-6 h-6 bg-gray-200 rounded skeleton"></div>
              </div>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 skeleton"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 skeleton"></div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-premium p-6">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-6 w-1/3 skeleton"></div>
            <div className="w-64 h-64 bg-gray-200 rounded-full mx-auto skeleton"></div>
          </div>
          <div className="card-premium p-6">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-6 w-1/3 skeleton"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded skeleton"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-premium p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-6 w-1/4 skeleton"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg skeleton"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2 skeleton"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 skeleton"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-20 skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse">
        <div className="card-premium p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-6 w-1/4 skeleton"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg skeleton"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 skeleton"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 skeleton"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 bg-gray-200 rounded w-16 skeleton"></div>
                  <div className="h-5 bg-gray-200 rounded w-20 skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'cards') {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg skeleton"></div>
                <div className="w-6 h-6 bg-gray-200 rounded skeleton"></div>
              </div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 skeleton"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 skeleton"></div>
              <div className="w-full h-3 bg-gray-200 rounded-full skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse">
      <div className="card-premium p-8">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-xl skeleton"></div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded skeleton"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto skeleton"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading