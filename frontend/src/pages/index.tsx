import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import CivicMap from '@/components/CivicMap'
import { useTheme } from '../components/ui/ThemeProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface MetricCard {
  label: string
  value: string | number
  unit?: string
  status?: 'good' | 'moderate' | 'poor'
}

export default function CivicPulse() {
  const router = useRouter()
  const { theme, toggleTheme, isDarkTheme } = useTheme()
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [mapData, setMapData] = useState<any[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [areaDetails, setAreaDetails] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [selectedLayer, setSelectedLayer] = useState<string>('air_quality')
  const [showMap, setShowMap] = useState<boolean>(true)

  useEffect(() => {
    fetchData()
    fetchMapData()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      fetchAreaDetails(selectedArea)
    }
  }, [selectedArea])

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bangalore/real-data`)
      const data = await response.json()

      // Extract key metrics
      const airQuality = data.data?.air_quality?.areas || {}
      const crimeStats = data.data?.crime_stats?.areas || {}

      const avgAqi = Object.values(airQuality)
        .map((area: any) => area.aqi || 0)
        .reduce((a: number, b: number) => a + b, 0) / Object.keys(airQuality).length || 0

      const avgSafety = Object.values(crimeStats)
        .map((area: any) => area.safety_score || 0)
        .reduce((a: number, b: number) => a + b, 0) / Object.keys(crimeStats).length || 0

      const totalIncidents = Object.values(crimeStats)
        .reduce((total: number, area: any) => total + (area.recent_incidents?.length || 0), 0)

      setMetrics([
        { label: 'Air Quality', value: Math.round(avgAqi), unit: 'AQI', status: avgAqi <= 50 ? 'good' : avgAqi <= 100 ? 'moderate' : 'poor' },
        { label: 'Safety Score', value: Math.round(avgSafety), unit: '/100', status: avgSafety >= 80 ? 'good' : avgSafety >= 60 ? 'moderate' : 'poor' },
        { label: 'Recent Incidents', value: totalIncidents, unit: 'cases' },
        { label: 'Areas Monitored', value: Object.keys(airQuality).length, unit: 'zones' }
      ])

      setLastUpdate(new Date().toLocaleString())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const fetchMapData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bangalore/map-data`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setMapData(data.features || [])
    } catch (error) {
      console.error('Error fetching map data:', error)
    }
  }

  const fetchAreaDetails = async (areaName: string) => {
    try {
      const response = await fetch(`${API_URL}/api/bangalore/area/${encodeURIComponent(areaName)}`)
      const data = await response.json()
      setAreaDetails(data)
    } catch (error) {
      console.error('Error fetching area details:', error)
    }
  }

  const handleAreaClick = (areaName: string) => {
    setSelectedArea(areaName)
  }


  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return isDarkTheme ? 'text-green-400' : 'text-green-700'
      case 'moderate': return isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
      case 'poor': return isDarkTheme ? 'text-red-400' : 'text-red-600'
      default: return isDarkTheme ? 'text-gray-300' : 'text-gray-700'
    }
  }

  const bgClass = isDarkTheme ? 'bg-gray-900' : 'bg-white'
  const textClass = isDarkTheme ? 'text-gray-100' : 'text-gray-900'
  const subtextClass = isDarkTheme ? 'text-gray-400' : 'text-gray-600'
  const borderClass = isDarkTheme ? 'border-gray-700' : 'border-gray-200'
  const cardClass = isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'

  return (
    <>
      <Head>
        <title>Civic Pulse — Bangalore</title>
        <meta name="description" content="Real-time civic data for Bangalore" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`min-h-screen transition-colors duration-200 pb-12 sm:pb-8 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <header className="mb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Civic Pulse</h1>
                <p className={`text-base sm:text-lg mt-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Real-time civic data for Bangalore
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                <button
                  onClick={() => router.push('/incidents')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    isDarkTheme
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  View Incidents
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    showMap
                      ? isDarkTheme
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-200 border-gray-400'
                      : isDarkTheme
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                  aria-label="Toggle theme"
                >
                  {isDarkTheme ? '☀' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`inline-block w-8 h-8 border-2 rounded-full animate-spin ${
                isDarkTheme ? 'border-gray-700' : 'border-gray-200'
              }`} style={{ borderTopColor: 'transparent' }}></div>
              <p className={`mt-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
            </div>
          </div>
        )}


        {/* Layer Controls */}
        {!loading && mapData.length > 0 && (
          <div className={`border-b ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                <span className={`text-sm font-medium whitespace-nowrap ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>Data Layers:</span>
                {[
                  { key: 'air_quality', name: 'Air Quality', icon: '🌫️' },
                  { key: 'crime_stats', name: 'Safety', icon: '🔒' },
                  { key: 'infrastructure', name: 'Infrastructure', icon: '⚡' },
                  { key: 'water_quality', name: 'Water', icon: '💧' },
                  { key: 'transport', name: 'Transport', icon: '🚇' }
                ].map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => setSelectedLayer(layer.key)}
                    className={`px-3 sm:px-4 py-2 text-sm whitespace-nowrap transition-all duration-200 rounded-lg font-medium relative ${
                      selectedLayer === layer.key
                        ? isDarkTheme
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                        : isDarkTheme
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {layer.icon} {layer.name}
                    {layer.key !== 'air_quality' && (
                      <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                        isDarkTheme ? 'bg-amber-900 text-amber-300' : 'bg-amber-50 text-amber-700'
                      }`}>
                        Sample
                      </span>
                    )}
                    {layer.key === 'air_quality' && (
                      <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                        isDarkTheme ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        Real-time
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Map View */}
          {!loading && showMap && (
            <div className="flex-1 relative min-h-[450px] sm:min-h-[500px] lg:min-h-[500px] mb-4 sm:mb-6">
              {mapData.length > 0 ? (
                <CivicMap
                  data={mapData}
                  selectedLayer={selectedLayer}
                  onAreaClick={handleAreaClick}
                  theme={theme}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-medium mb-2">No Map Data Available</h3>
                    <p className={`mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      Waiting for real-time data from Bangalore stations
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data List View (when map is hidden) */}
          {!loading && !showMap && (
            <div className="flex-1 overflow-y-auto min-h-[300px] sm:min-h-[400px]">
              <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-light mb-2">Data Overview</h2>
                  <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current {selectedLayer.replace('_', ' ')} data for all areas
                  </p>
                </div>

                <div className="grid gap-4">
                  {mapData
                    .filter(feature => feature.properties?.layer === selectedLayer)
                    .map((feature, index) => {
                      const props = feature.properties
                      const area = props?.area || 'Unknown'

                      return (
                        <div
                          key={`${selectedLayer}-${index}`}
                          onClick={() => setSelectedArea(area)}
                          className={`p-6 rounded-lg border transition-all cursor-pointer ${
                            isDarkTheme
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">{area}</h3>
                            {selectedLayer === 'air_quality' ? (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isDarkTheme ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                AQI: {props?.aqi || '?'}
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isDarkTheme ? 'bg-amber-900 text-amber-300' : 'bg-amber-50 text-amber-700'
                              }`}>
                                Sample Data
                              </span>
                            )}
                          </div>
                          {selectedLayer !== 'air_quality' && (
                            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                              No real data available for this metric. Real-time data requires government API access.
                            </p>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Area Details Sidebar */}
          {selectedArea && (
            <div className={`w-full sm:w-80 border-l overflow-y-auto shadow-lg ${
              isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`p-6 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{selectedArea}</h3>
                  <button
                    onClick={() => setSelectedArea('')}
                    className={`text-xl ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {areaDetails.bangalore_data ? (
                  <div className="space-y-4">
                    {/* Air Quality - Real Data */}
                    {selectedLayer === 'air_quality' && areaDetails.bangalore_data.air_quality && (
                      <div className={`p-6 rounded-lg border ${
                        isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-lg">🌫️ Air Quality</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isDarkTheme ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                          }`}>Real-time</span>
                        </div>
                        <div className="text-center mb-6">
                          <div className="text-4xl font-light mb-2">
                            {areaDetails.bangalore_data.air_quality.data.aqi}
                          </div>
                          <div className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                            {areaDetails.bangalore_data.air_quality.data.status}
                          </div>
                        </div>
                        <div className={`text-sm space-y-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div><span className="font-medium">Station:</span> {areaDetails.bangalore_data.air_quality.data.station_name}</div>
                          <div><span className="font-medium">Source:</span> {areaDetails.bangalore_data.air_quality.data.source}</div>
                        </div>
                      </div>
                    )}

                    {/* Other Layers - Sample Data */}
                    {selectedLayer !== 'air_quality' && (
                      <div className={`p-6 rounded-lg border ${
                        isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-lg">
                            {selectedLayer === 'crime_stats' && '🔒 Safety & Crime'}
                            {selectedLayer === 'infrastructure' && '⚡ Infrastructure'}
                            {selectedLayer === 'water_quality' && '💧 Water Quality'}
                            {selectedLayer === 'transport' && '🚇 Transport'}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isDarkTheme ? 'bg-amber-900 text-amber-300' : 'bg-amber-50 text-amber-700'
                          }`}>Sample Data</span>
                        </div>
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">📊</div>
                          <h3 className="text-lg font-medium mb-2">No Real Data Available</h3>
                          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedLayer === 'crime_stats' && 'Crime data requires police API access'}
                            {selectedLayer === 'infrastructure' && 'Infrastructure data requires utility partnerships'}
                            {selectedLayer === 'water_quality' && 'Water quality data requires BWSSB/CPCB access'}
                            {selectedLayer === 'transport' && 'Transport data requires BMTC/BMRCL API access'}
                          </p>
                          <p className={`text-xs mt-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                            Only Air Quality data is currently available from real government sources
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📍</div>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click an area to see detailed civic data
                    </p>
                    <p className={`text-xs mt-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                      Real-time Air Quality • Sample data for other metrics
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <footer className={`text-center text-sm border-t pt-6 pb-8 sm:pt-6 sm:pb-4 ${
            isDarkTheme ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
          }`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <p>Last updated: {lastUpdate}</p>
              <p className="mt-2">
                Data transparency: Air quality from verified stations, other metrics from government sources
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  )
}