import React from 'react'
import { Issue } from '../types'

interface IssueCardProps {
  issue: Issue
  onClose: () => void
}

const IssueCardV2: React.FC<IssueCardProps> = ({ issue, onClose }) => {
  // Calculate factual metrics
  const daysPerUpdate = issue.update_count ? Math.round(issue.age_days / issue.update_count) : issue.age_days
  const lastUpdateDaysAgo = issue.last_updated
    ? Math.round((Date.now() - new Date(issue.last_updated).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const getStatus = () => {
    if (issue.progress >= 1) return 'Resolved'
    if (issue.status === 'closed') return 'Closed'
    if (lastUpdateDaysAgo > 30) return 'Stale'
    if (lastUpdateDaysAgo < 7) return 'Active'
    return 'Monitoring'
  }

  return (
    <div className="absolute bottom-4 left-4 bg-black/95 backdrop-blur-md border border-gray-700 rounded-lg p-4 max-w-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-white font-light text-sm mb-1">{issue.title}</h3>
          <span className="text-gray-500 text-xs">{issue.category}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white ml-2 text-xl"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Started:</span>
            <span className="text-gray-300">{issue.age_days} days ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Updates:</span>
            <span className="text-gray-300">{issue.update_count || 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frequency:</span>
            <span className="text-gray-300">~{daysPerUpdate}d/update</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="text-gray-300">{getStatus()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Progress:</span>
            <span className="text-gray-300">{Math.round(issue.progress * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last update:</span>
            <span className="text-gray-300">{lastUpdateDaysAgo}d ago</span>
          </div>
        </div>
      </div>

      {issue.metadata && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs space-y-1">
            {Object.entries(issue.metadata)
              .filter(([key]) => !key.startsWith('_'))
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-400">{String(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="bg-gray-900 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gray-500 transition-all duration-500"
            style={{ width: `${issue.progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default IssueCardV2