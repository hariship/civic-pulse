import React from 'react'
import { Issue } from '../types'

interface IssueCardProps {
  issue: Issue
  onClose: () => void
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClose }) => {
  const severityColors = {
    critical: 'border-pulse-red',
    high: 'border-pulse-orange',
    medium: 'border-pulse-yellow',
    low: 'border-pulse-green'
  }

  const trendIcons = {
    worsening: '↑',
    stable: '→',
    improving: '↓'
  }

  return (
    <div className={`absolute bottom-4 left-4 bg-black/90 backdrop-blur-md border-2 ${severityColors[issue.severity]} rounded-lg p-4 max-w-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium text-sm">{issue.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white ml-2"
        >
          ×
        </button>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-400">
        <span>{issue.age_days} days</span>
        <span className="text-lg">{trendIcons[issue.trend]}</span>
        <div className="flex-1">
          <div className="bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r from-pulse-red to-pulse-green`}
              style={{ width: `${issue.progress * 100}%` }}
            />
          </div>
        </div>
        <span>{Math.round(issue.progress * 100)}%</span>
      </div>
    </div>
  )
}

export default IssueCard