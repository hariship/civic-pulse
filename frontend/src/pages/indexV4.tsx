import React, { useState, useEffect } from 'react'
import { Issue } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function HomeV4() {
  const [selectedCity, setSelectedCity] = useState<string>('overview')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    setMockData()
  }, [])

  const setMockData = () => {
    const bangaloreIssues: Issue[] = [
      // Health/Environment
      {
        id: 'blr_001',
        type: 'legal',
        category: 'environment',
        title: 'Air Quality Monitoring Case',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'high',
        progress: 0.45,
        trend: 'stable',
        age_days: 234,
        update_count: 18,
        status: 'ongoing',
        last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { court: 'Karnataka High Court', area: 'Silk Board' }
      },
      {
        id: 'blr_002',
        type: 'infrastructure',
        category: 'health',
        title: 'Hospital Bed Shortage',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'high',
        progress: 0.20,
        trend: 'worsening',
        age_days: 67,
        update_count: 34,
        status: 'critical',
        last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { area: 'Whitefield', hospitals: 4 }
      },
      {
        id: 'blr_003',
        type: 'infrastructure',
        category: 'environment',
        title: 'Lake Restoration Project',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.65,
        trend: 'improving',
        age_days: 890,
        update_count: 45,
        status: 'active',
        last_updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { area: 'Hebbal Lake', budget: '50 crores' }
      },

      // Transport
      {
        id: 'blr_004',
        type: 'infrastructure',
        category: 'transport',
        title: 'Metro Phase 3 Delays',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'high',
        progress: 0.35,
        trend: 'stable',
        age_days: 456,
        update_count: 89,
        status: 'delayed',
        last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { contractor: 'L&T', expected: '2025' }
      },
      {
        id: 'blr_005',
        type: 'infrastructure',
        category: 'transport',
        title: 'ORR Pothole Repairs',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.80,
        trend: 'improving',
        age_days: 23,
        update_count: 12,
        status: 'active',
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { area: 'Outer Ring Road', length: '15 km' }
      },
      {
        id: 'blr_006',
        type: 'infrastructure',
        category: 'transport',
        title: 'Bus Route Optimization',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'low',
        progress: 0.90,
        trend: 'improving',
        age_days: 120,
        update_count: 15,
        status: 'implementation',
        last_updated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { routes_added: 25, area: 'Electronics City' }
      },

      // Governance
      {
        id: 'blr_007',
        type: 'legal',
        category: 'governance',
        title: 'Property Tax Reform',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.55,
        trend: 'stable',
        age_days: 678,
        update_count: 23,
        status: 'review',
        last_updated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { department: 'BBMP', impact: '2.5 lakh properties' }
      },
      {
        id: 'blr_008',
        type: 'legal',
        category: 'governance',
        title: 'Building Permit Delays',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'high',
        progress: 0.25,
        trend: 'worsening',
        age_days: 234,
        update_count: 67,
        status: 'escalated',
        last_updated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { pending_applications: 1200, department: 'BDA' }
      },

      // Security
      {
        id: 'blr_009',
        type: 'crime',
        category: 'security',
        title: 'IT Corridor Safety',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'medium',
        progress: 0.70,
        trend: 'improving',
        age_days: 89,
        update_count: 43,
        status: 'active',
        last_updated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { area: 'Whitefield-Marathahalli', cctv_installed: 150 }
      },
      {
        id: 'blr_010',
        type: 'crime',
        category: 'security',
        title: 'Cyber Crime Training',
        location: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        severity: 'low',
        progress: 0.85,
        trend: 'improving',
        age_days: 45,
        update_count: 8,
        status: 'implementation',
        last_updated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { officers_trained: 200, department: 'CEN Crime' }
      }
    ]

    setIssues(bangaloreIssues)
  }

  const cities = [
    { id: 'overview', name: 'India Overview', count: 150 },
    { id: 'bangalore', name: 'Bangalore', count: 23 },
    { id: 'delhi', name: 'Delhi', count: 34 },
    { id: 'mumbai', name: 'Mumbai', count: 28 },
    { id: 'chennai', name: 'Chennai', count: 19 }
  ]

  const sectors = {
    all: 'All Sectors',
    environment: '🌳 Environment & Health',
    transport: '🚇 Transport & Infrastructure',
    governance: '📋 Governance & Admin',
    security: '🔒 Security & Safety'
  }

  const filteredIssues = selectedSector === 'all'
    ? issues
    : issues.filter(issue => issue.category === selectedSector)

  const topIssues = filteredIssues
    .sort((a, b) => {
      // Sort by urgency: high update frequency + recent updates + low progress
      const urgencyA = (a.update_count || 1) / Math.max(a.age_days, 1) + (1 - a.progress)
      const urgencyB = (b.update_count || 1) / Math.max(b.age_days, 1) + (1 - b.progress)
      return urgencyB - urgencyA
    })
    .slice(0, 10)

  const sectorSummary = Object.keys(sectors).slice(1).map(sector => {
    const sectorIssues = issues.filter(i => i.category === sector)
    return {
      name: sectors[sector],
      key: sector,
      count: sectorIssues.length,
      active: sectorIssues.filter(i => {
        const daysSinceUpdate = Math.round((Date.now() - new Date(i.last_updated).getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceUpdate < 7
      }).length,
      avgProgress: sectorIssues.length > 0
        ? sectorIssues.reduce((sum, i) => sum + i.progress, 0) / sectorIssues.length
        : 0
    }
  })

  if (selectedCity === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-light">Civic Pulse</h1>
            <p className="text-gray-600 mt-2">Real-time civic intelligence across India</p>
          </div>
        </div>

        {/* City Selection */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-xl font-medium mb-6">Select a City</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cities.slice(1).map(city => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className="bg-white border rounded-lg p-6 text-left hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-lg">{city.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{city.count} active issues</p>
                <div className="mt-3 text-blue-600 text-sm">View details →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCity('overview')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← All Cities
              </button>
              <h1 className="text-2xl font-light">Bangalore</h1>
            </div>
            <div className="text-sm text-gray-500">
              {issues.length} total issues • {topIssues.length} shown
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Sector Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <h3 className="font-medium mb-4">Sectors</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedSector('all')}
                  className={`w-full text-left p-3 rounded ${
                    selectedSector === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">All Sectors</div>
                  <div className="text-sm text-gray-600">{issues.length} issues</div>
                </button>

                {sectorSummary.map(sector => (
                  <button
                    key={sector.key}
                    onClick={() => setSelectedSector(sector.key)}
                    className={`w-full text-left p-3 rounded ${
                      selectedSector === sector.key ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{sector.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {sector.count} issues • {sector.active} active
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${sector.avgProgress * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(sector.avgProgress * 100)}% avg progress
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Top Issues */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-lg font-medium">
                {selectedSector === 'all' ? 'Top 10 Issues' : `Top Issues - ${sectors[selectedSector]}`}
              </h2>
              <p className="text-gray-600 text-sm">Sorted by urgency (update frequency + progress needed)</p>
            </div>

            <div className="space-y-4">
              {topIssues.map((issue, index) => {
                const daysSinceUpdate = Math.round((Date.now() - new Date(issue.last_updated).getTime()) / (1000 * 60 * 60 * 24))
                const updateFreq = issue.update_count ? Math.round(issue.age_days / issue.update_count) : issue.age_days

                return (
                  <div key={issue.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-2xl">{sectors[issue.category]?.split(' ')[0] || '📍'}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              #{index + 1}
                            </span>
                            <h3 className="font-medium">{issue.title}</h3>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 block">Progress</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${issue.progress * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{Math.round(issue.progress * 100)}%</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Age</span>
                              <span className="font-medium">{issue.age_days}d</span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Updates</span>
                              <span className="font-medium">{issue.update_count} ({updateFreq}d avg)</span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Last Update</span>
                              <span className={`font-medium ${
                                daysSinceUpdate < 7 ? 'text-green-600' :
                                daysSinceUpdate < 30 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {daysSinceUpdate}d ago
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Status</span>
                              <span className="font-medium capitalize">{issue.status}</span>
                            </div>
                          </div>

                          {issue.metadata && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(issue.metadata).slice(0, 3).map(([key, value]) => (
                                <span key={key} className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-xs">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}