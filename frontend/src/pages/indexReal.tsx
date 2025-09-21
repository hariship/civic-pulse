import React, { useState, useEffect } from 'react'
import { Issue } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function HomeReal() {
  const [selectedCity, setSelectedCity] = useState<string>('bangalore')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [dataSource, setDataSource] = useState<any>({})
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRealIssues()
    fetchDataSources()
  }, [])

  const fetchRealIssues = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/issues/bangalore`)
      const data = await response.json()

      setIssues(data.issues || [])
      setLastUpdate(data.last_updated || 'Never')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching real issues:', error)
      setLoading(false)
    }
  }

  const fetchDataSources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sources`)
      const data = await response.json()
      setDataSource(data)
    } catch (error) {
      console.error('Error fetching sources:', error)
    }
  }

  const refreshData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`${API_URL}/api/refresh`)
      const data = await response.json()

      if (data.status === 'refreshed') {
        await fetchRealIssues()
        setLastUpdate(data.timestamp)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const sectors = {
    all: 'All Sectors',
    environment: '🌳 Environment & Health',
    transport: '🚇 Transport & Infrastructure',
    governance: '📋 Governance & Admin',
    security: '🔒 Security & Safety',
    general: '📰 General News'
  }

  const filteredIssues = selectedSector === 'all'
    ? issues
    : issues.filter(issue => issue.category === selectedSector)

  const topIssues = filteredIssues
    .sort((a, b) => {
      // Sort by relevance: recent updates + news priority
      const scoreA = (a.age_days < 7 ? 10 : 0) + (a.type === 'news' ? 5 : 3) + (a.severity === 'critical' ? 8 : 0)
      const scoreB = (b.age_days < 7 ? 10 : 0) + (b.type === 'news' ? 5 : 3) + (b.severity === 'critical' ? 8 : 0)
      return scoreB - scoreA
    })
    .slice(0, 15)

  const sectorSummary = Object.keys(sectors).slice(1).map(sector => {
    const sectorIssues = issues.filter(i => i.category === sector)
    return {
      name: sectors[sector],
      key: sector,
      count: sectorIssues.length,
      recent: sectorIssues.filter(i => i.age_days < 7).length,
      avgAge: sectorIssues.length > 0
        ? Math.round(sectorIssues.reduce((sum, i) => sum + i.age_days, 0) / sectorIssues.length)
        : 0
    }
  }).filter(s => s.count > 0)

  const getSourceBadge = (issue: Issue) => {
    const metadata = issue.metadata || {}
    if (metadata.source?.includes('hindu')) return { text: 'Hindu', color: 'bg-blue-100 text-blue-800' }
    if (metadata.source?.includes('deccan')) return { text: 'DH', color: 'bg-green-100 text-green-800' }
    if (metadata.source?.includes('times')) return { text: 'TOI', color: 'bg-purple-100 text-purple-800' }
    if (metadata.source === 'BBMP') return { text: 'BBMP', color: 'bg-orange-100 text-orange-800' }
    if (metadata.court) return { text: 'Court', color: 'bg-red-100 text-red-800' }
    return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real Bangalore civic data...</p>
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
            <div>
              <h1 className="text-2xl font-light">Civic Pulse - Bangalore</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time data from news, government, and court sources</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-blue-800">
            <strong>Live Sources:</strong> {Object.keys(dataSource.news_sources || {}).length} news feeds,
            {Object.keys(dataSource.government_sources || {}).length} government sources, court records
            <span className="ml-4 text-blue-600">({issues.length} total issues found)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Sector Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <h3 className="font-medium mb-4">Live Data by Sector</h3>
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
                      {sector.count} total • {sector.recent} recent • avg {sector.avgAge}d old
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Real Issues */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-lg font-medium">
                {selectedSector === 'all' ? 'All Current Issues' : `${sectors[selectedSector]} Issues`}
              </h2>
              <p className="text-gray-600 text-sm">Live data from RSS feeds, government portals, and court records</p>
            </div>

            {topIssues.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500">No issues found for this sector</p>
                <button onClick={refreshData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topIssues.map((issue, index) => {
                  const sourceBadge = getSourceBadge(issue)

                  return (
                    <div key={issue.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              #{index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${sourceBadge.color}`}>
                              {sourceBadge.text}
                            </span>
                            <span className="text-2xl">{sectors[issue.category]?.split(' ')[0] || '📍'}</span>
                          </div>

                          <h3 className="font-medium text-lg mb-2">{issue.title}</h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 block">Age</span>
                              <span className="font-medium">
                                {issue.age_days === 0 ? 'Today' : `${issue.age_days}d ago`}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Type</span>
                              <span className="font-medium capitalize">{issue.type}</span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Status</span>
                              <span className="font-medium capitalize">{issue.status}</span>
                            </div>

                            <div>
                              <span className="text-gray-500 block">Trend</span>
                              <span className={`font-medium ${
                                issue.trend === 'active' ? 'text-green-600' :
                                issue.trend === 'stable' ? 'text-blue-600' : 'text-gray-600'
                              }`}>
                                {issue.trend}
                              </span>
                            </div>
                          </div>

                          {issue.metadata && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(issue.metadata)
                                .filter(([key, value]) => key !== 'summary' && key !== 'link' && value)
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <span key={key} className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-xs">
                                    {key}: {String(value).slice(0, 30)}
                                  </span>
                                ))}

                              {issue.metadata.link && (
                                <a
                                  href={issue.metadata.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100"
                                >
                                  View Source →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}