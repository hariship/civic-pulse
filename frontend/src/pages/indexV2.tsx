import React, { useState, useEffect } from 'react'
import IndiaMapV2 from '@/components/IndiaMapV2'
import StatusBarV2 from '@/components/StatusBarV2'
import IssueCardV2 from '@/components/IssueCardV2'
import { Issue } from '@/types'
import axios from 'axios'
import io from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function HomeV2() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [currentLocation, setCurrentLocation] = useState('India')
  const [currentLevel, setCurrentLevel] = useState<'country' | 'state' | 'city'>('country')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'age' | 'updates' | 'progress'>('age')

  useEffect(() => {
    fetchIssues()
    connectWebSocket()
  }, [currentLocation, currentLevel])

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/issues/map`, {
        params: {
          level: currentLevel,
          location_id: currentLocation
        }
      })

      const issuesData = response.data.features.map((feature: any) => ({
        ...feature.properties,
        location: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          name: currentLocation
        }
      }))

      setIssues(issuesData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching issues:', error)
      setMockData()
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockIssues: Issue[] = [
      {
        id: '1',
        type: 'legal',
        category: 'legal',
        title: 'Air Pollution Case - Delhi',
        location: { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
        severity: 'critical',
        progress: 0.65,
        trend: 'stable',
        age_days: 3287,
        update_count: 142,
        status: 'ongoing',
        last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          court: 'Supreme Court',
          next_hearing: '2024-10-15',
          petitioners: 'Environmental Groups'
        }
      },
      {
        id: '2',
        type: 'infrastructure',
        category: 'infrastructure',
        title: 'Metro Phase 3 - Bangalore',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.35,
        trend: 'stable',
        age_days: 265,
        update_count: 23,
        status: 'active',
        last_updated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          budget: '15000 crores',
          contractor: 'L&T',
          expected_completion: '2025-12-31'
        }
      },
      {
        id: '3',
        type: 'crime',
        category: 'crime',
        title: 'Cyber Crime Reports - Hyderabad',
        location: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        severity: 'high',
        progress: 0.2,
        trend: 'worsening',
        age_days: 45,
        update_count: 89,
        status: 'active',
        last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          cases_filed: 234,
          resolved: 47,
          area: 'HITEC City'
        }
      },
      {
        id: '4',
        type: 'infrastructure',
        category: 'health',
        title: 'AIIMS Expansion - Delhi',
        location: { name: 'Delhi', lat: 28.5, lng: 77.2 },
        severity: 'low',
        progress: 0.85,
        trend: 'improving',
        age_days: 842,
        update_count: 31,
        status: 'active',
        last_updated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          beds_added: 500,
          departments: 'Oncology, Cardiology'
        }
      },
      {
        id: '5',
        type: 'infrastructure',
        category: 'infrastructure',
        title: 'Coastal Road - Mumbai',
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
        title: 'RTI Response Pending - Education',
        location: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        severity: 'low',
        progress: 0.1,
        trend: 'stable',
        age_days: 120,
        update_count: 3,
        status: 'pending',
        last_updated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    setIssues(mockIssues)
  }

  const connectWebSocket = () => {
    try {
      const socket = io(API_URL)

      socket.on('connect', () => {
        console.log('Connected to live updates')
      })

      socket.on('update', (data) => {
        setLastUpdate(new Date().toISOString())
        fetchIssues()
      })

      return () => {
        socket.disconnect()
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  const handleLocationClick = (location: string) => {
    setCurrentLocation(location)

    if (currentLevel === 'country') {
      setCurrentLevel('state')
    } else if (currentLevel === 'state') {
      setCurrentLevel('city')
    }
  }

  const handleZoomOut = () => {
    if (currentLevel === 'city') {
      setCurrentLevel('state')
    } else if (currentLevel === 'state') {
      setCurrentLevel('country')
      setCurrentLocation('India')
    }
  }

  const calculateMetrics = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newToday = issues.filter(i => {
      const created = new Date(i.last_updated)
      created.setHours(0, 0, 0, 0)
      return created.getTime() === today.getTime() && i.age_days === 0
    }).length

    const updatedToday = issues.filter(i => {
      const updated = new Date(i.last_updated)
      updated.setHours(0, 0, 0, 0)
      return updated.getTime() === today.getTime() && i.age_days > 0
    }).length

    const avgAge = issues.length > 0
      ? Math.round(issues.reduce((sum, i) => sum + i.age_days, 0) / issues.length)
      : 0

    const categories = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: issues.length,
      new_today: newToday,
      updated_today: updatedToday,
      avg_age_days: avgAge,
      categories
    }
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <StatusBarV2
        location={currentLocation}
        metrics={calculateMetrics()}
        lastUpdate={lastUpdate}
      />

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading civic data...</div>
        </div>
      ) : (
        <>
          <IndiaMapV2
            issues={issues}
            onLocationClick={handleLocationClick}
            currentLevel={currentLevel}
          />

          {currentLevel !== 'country' && (
            <button
              onClick={handleZoomOut}
              className="absolute top-16 left-4 bg-black/80 text-gray-300 px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors text-sm"
            >
              ← Back
            </button>
          )}

          {selectedIssue && (
            <IssueCardV2
              issue={selectedIssue}
              onClose={() => setSelectedIssue(null)}
            />
          )}

          {/* Legend - factual metrics only */}
          <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg p-3 text-xs text-gray-500 border border-gray-800">
            <div className="space-y-2">
              <div className="font-medium text-gray-400 mb-2">Visual Encoding</div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                <span>Size = Age (days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gray-600 opacity-30"></div>
                <span>Opacity = Update frequency</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="16" height="16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="#666" strokeWidth="1"/>
                  <path d="M 8 2 A 6 6 0 0 1 14 8" fill="none" stroke="#fff" strokeWidth="2"/>
                </svg>
                <span>Arc = Progress %</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}