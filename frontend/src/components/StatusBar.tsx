import React from 'react'

interface StatusBarProps {
  location: string
  issueCount: {
    total: number
    critical: number
    active: number
    resolved: number
  }
  lastUpdate: string
}

const StatusBar: React.FC<StatusBarProps> = ({ location, issueCount, lastUpdate }) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <h1 className="text-white text-xl font-medium">{location}</h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-pulse-red animate-pulse"></div>
              <span className="text-gray-300 text-sm">{issueCount.critical}</span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-pulse-yellow"></div>
              <span className="text-gray-300 text-sm">{issueCount.active}</span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-pulse-green"></div>
              <span className="text-gray-300 text-sm">{issueCount.resolved}</span>
            </div>
          </div>
        </div>

        <div className="text-gray-500 text-xs">
          Updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default StatusBar