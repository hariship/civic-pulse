import React from 'react'

interface StatusBarProps {
  location: string
  metrics: {
    total: number
    new_today: number
    updated_today: number
    avg_age_days: number
    categories: Record<string, number>
  }
  lastUpdate: string
}

const StatusBarV2: React.FC<StatusBarProps> = ({ location, metrics, lastUpdate }) => {
  const topCategories = Object.entries(metrics.categories || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <h1 className="text-white text-lg font-light">{location}</h1>

          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Total:</span>
              <span className="text-white">{metrics.total}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-500">New:</span>
              <span className="text-white">+{metrics.new_today}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Updated:</span>
              <span className="text-white">{metrics.updated_today}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Avg age:</span>
              <span className="text-white">{metrics.avg_age_days}d</span>
            </div>

            <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center space-x-1">
                  <span className="text-gray-600 text-xs">{cat}:</span>
                  <span className="text-gray-300 text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-gray-600 text-xs">
          {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default StatusBarV2