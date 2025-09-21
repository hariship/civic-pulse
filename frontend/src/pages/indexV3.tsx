import React, { useState, useEffect } from 'react'
import { Issue } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function HomeV3() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('active')

  useEffect(() => {
    setMockData()
  }, [])

  const setMockData = () => {
    const mockIssues: Issue[] = [
      {
        id: '1',
        type: 'legal',
        category: 'legal',
        title: 'Air Pollution Case',
        location: { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
        severity: 'critical',
        progress: 0.65,
        trend: 'stable',
        age_days: 3287,
        update_count: 142,
        status: 'ongoing',
        last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'infrastructure',
        category: 'transport',
        title: 'Metro Phase 3',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.35,
        trend: 'stable',
        age_days: 265,
        update_count: 23,
        status: 'active',
        last_updated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'crime',
        category: 'security',
        title: 'Cyber Crime Reports',
        location: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        severity: 'high',
        progress: 0.2,
        trend: 'worsening',
        age_days: 45,
        update_count: 89,
        status: 'active',
        last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'infrastructure',
        category: 'health',
        title: 'AIIMS Expansion',
        location: { name: 'Delhi', lat: 28.5, lng: 77.2 },
        severity: 'low',
        progress: 0.85,
        trend: 'improving',
        age_days: 842,
        update_count: 31,
        status: 'active',
        last_updated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: 'infrastructure',
        category: 'transport',
        title: 'Coastal Road Project',
        location: { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        severity: 'medium',
        progress: 0.40,
        trend: 'stable',
        age_days: 1555,
        update_count: 67,
        status: 'delayed',
        last_updated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        type: 'legal',
        category: 'governance',
        title: 'RTI - Teacher Vacancies',
        location: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        severity: 'low',
        progress: 0.1,
        trend: 'stable',
        age_days: 120,
        update_count: 3,
        status: 'pending',
        last_updated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '7',
        type: 'infrastructure',
        category: 'water',
        title: 'Water Pipeline Repair',
        location: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
        severity: 'high',
        progress: 0.75,
        trend: 'improving',
        age_days: 30,
        update_count: 45,
        status: 'active',
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '8',
        type: 'legal',
        category: 'environment',
        title: 'Waste Management PIL',
        location: { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        severity: 'medium',
        progress: 0.55,
        trend: 'stable',
        age_days: 450,
        update_count: 28,
        status: 'hearing',
        last_updated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    setIssues(mockIssues)
  }

  const categories = {
    all: 'All',
    legal: '⚖️ Legal',
    health: '🏥 Health',
    transport: '🚇 Transport',
    security: '🔒 Security',
    governance: '📋 Governance',
    water: '💧 Water',
    environment: '🌳 Environment'
  }

  const locations = ['all', ...new Set(issues.map(i => i.location.name))].sort()

  const filteredIssues = issues.filter(issue => {
    const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory
    const locationMatch = selectedLocation === 'all' || issue.location.name === selectedLocation

    let timeMatch = true
    if (timeRange === 'new') {
      timeMatch = issue.age_days < 30
    } else if (timeRange === 'active') {
      const daysSinceUpdate = Math.round((Date.now() - new Date(issue.last_updated).getTime()) / (1000 * 60 * 60 * 24))
      timeMatch = daysSinceUpdate < 30
    } else if (timeRange === 'stale') {
      const daysSinceUpdate = Math.round((Date.now() - new Date(issue.last_updated).getTime()) / (1000 * 60 * 60 * 24))
      timeMatch = daysSinceUpdate >= 30
    }

    return categoryMatch && locationMatch && timeMatch
  })

  const getUpdateStatus = (issue: Issue) => {
    const daysSinceUpdate = Math.round((Date.now() - new Date(issue.last_updated).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceUpdate === 0) return { text: 'Today', color: 'text-green-600' }
    if (daysSinceUpdate === 1) return { text: 'Yesterday', color: 'text-green-600' }
    if (daysSinceUpdate < 7) return { text: `${daysSinceUpdate}d ago`, color: 'text-blue-600' }
    if (daysSinceUpdate < 30) return { text: `${daysSinceUpdate}d ago`, color: 'text-gray-600' }
    return { text: `${daysSinceUpdate}d ago`, color: 'text-orange-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light">Civic Pulse</h1>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex space-x-6 items-center">
            {/* Time Range */}
            <div className="flex space-x-2">
              {['new', 'active', 'stale', 'all'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === range
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === 'new' && '< 30 days'}
                  {range === 'active' && 'Recently updated'}
                  {range === 'stale' && 'No recent updates'}
                  {range === 'all' && 'All time'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Locations</option>
              {locations.filter(l => l !== 'all').map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <div className="ml-auto text-sm text-gray-500">
              {filteredIssues.length} issues
            </div>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-4">
          {filteredIssues.map(issue => {
            const updateStatus = getUpdateStatus(issue)
            const daysPerUpdate = issue.update_count ? Math.round(issue.age_days / issue.update_count) : issue.age_days

            return (
              <div key={issue.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{categories[issue.category]?.split(' ')[0] || '📍'}</span>
                      <div>
                        <h3 className="font-medium text-lg">{issue.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{issue.location.name}</span>
                          <span>•</span>
                          <span>Started {issue.age_days} days ago</span>
                          <span>•</span>
                          <span className={updateStatus.color}>Updated {updateStatus.text}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Progress</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gray-600 h-2 rounded-full transition-all"
                              style={{ width: `${issue.progress * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{Math.round(issue.progress * 100)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Updates</span>
                        <span className="font-medium">{issue.update_count}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Frequency</span>
                        <span className="font-medium">~{daysPerUpdate}d</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Status</span>
                        <span className="font-medium capitalize">{issue.status}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Type</span>
                        <span className="font-medium capitalize">{issue.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredIssues.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No issues match your filters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}