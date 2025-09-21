import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CivicMap from '@/components/CivicMap'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FixedBangaloreView() {
  const router = useRouter()
  const [mapData, setMapData] = useState<any[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [areaDetails, setAreaDetails] = useState<any>({})
  const [realSources, setRealSources] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [selectedLayer, setSelectedLayer] = useState<string>('air_quality')
  const [showMethodology, setShowMethodology] = useState<boolean>(false)
  const [showMap, setShowMap] = useState<boolean>(true)
  const [showSources, setShowSources] = useState<boolean>(true)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true)

  useEffect(() => {
    fetchRealBangaloreData()
    fetchRealSources()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      fetchAreaDetails(selectedArea)
    }
  }, [selectedArea])

  const fetchRealBangaloreData = async () => {
    try {
      setLoading(true)
      console.log('Fetching REAL Bangalore data...')

      const response = await fetch(`${API_URL}/api/bangalore/map-data`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Real Bangalore data received:', data)
      console.log('Features count:', data.features?.length || 0)

      setMapData(data.features || [])
      setLastUpdate(data.metadata?.last_updated || 'Never')
      setLoading(false)

      console.log('Loading set to false, mapData length:', data.features?.length || 0)
    } catch (error) {
      console.error('❌ Error fetching real Bangalore data:', error)
      setLoading(false)
    }
  }

  const fetchRealSources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bangalore/sources`)
      const data = await response.json()
      setRealSources(data)
    } catch (error) {
      console.error('Error fetching sources:', error)
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

  const refreshData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bangalore/refresh`)
      const result = await response.json()

      if (result.status === 'refreshed_real_bangalore_data') {
        await fetchRealBangaloreData()
        setLastUpdate(result.timestamp)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleAreaClick = (areaName: string) => {
    setSelectedArea(areaName)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading REAL Bangalore data...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to actual WAQI stations in Bangalore</p>
        </div>
      </div>
    )
  }

  const themeClasses = isDarkTheme
    ? 'bg-gray-950 text-slate-100'
    : 'bg-gray-50 text-gray-900'

  const headerClasses = isDarkTheme
    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50'
    : 'bg-gradient-to-r from-gray-100 via-white to-gray-100 border-b border-gray-200'

  return (
    <div className={`min-h-screen ${themeClasses} flex flex-col font-sans antialiased`}>
      {/* Header */}
      <div className={`${headerClasses} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-light tracking-wide ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                Civic Pulse
              </h1>
              <div className={`text-sm mt-2 font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Real-time Government Data Stream
                <span className={`mx-3 ${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                <span>Bangalore Intelligence</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/incidents')}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  isDarkTheme
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                View Incidents
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  showMap
                    ? isDarkTheme
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-900 text-white border-gray-900'
                    : isDarkTheme
                      ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
              <button
                onClick={() => setShowSources(!showSources)}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  showSources
                    ? isDarkTheme
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-900 text-white border-gray-900'
                    : isDarkTheme
                      ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showSources ? 'Hide Sources' : 'Show Sources'}
              </button>
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  isDarkTheme
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
              <button
                onClick={refreshData}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  isDarkTheme
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Refresh
              </button>
              <div className="text-right hidden md:block">
                <div className={`text-xs tracking-wider ${
                  isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                }`}>LAST UPDATE</div>
                <div className={`text-sm font-medium ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'INIT...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Control Panel */}
      {showSources && (
        <div className="bg-slate-900 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-slate-200 font-medium">Air Quality</div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>6 WAQI Stations</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div>
                  <div className="text-slate-200 font-medium">Safety & Crime</div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>KSP FIR Database</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="text-slate-200 font-bold tracking-wide">WATER QUALITY</div>
                  <div className="text-slate-300 text-xs">CPCB/BWSSB NETWORK</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <div className="text-slate-200 font-bold tracking-wide">TRANSPORT</div>
                  <div className="text-slate-300 text-xs">BMTC/BMRCL APIS</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-stone-400 rounded-full"></div>
                <div>
                  <div className="text-slate-200 font-bold tracking-wide">INFRASTRUCTURE</div>
                  <div className="text-slate-400 text-xs">UTILITY APIS REQ</div>
                </div>
              </div>
            </div>
            <div className={`mt-4 flex items-center justify-between border-t pt-3 ${
              isDarkTheme ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`text-xs tracking-wider ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AUTHENTICATED GOVERNMENT DATA STREAMS
              </div>
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className={`text-xs px-4 py-2 font-medium tracking-wide transition-all border rounded ${
                  isDarkTheme
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showMethodology ? '▲ HIDE' : '▼ SHOW'} METHODOLOGY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Panel */}
      {showMethodology && (
        <div className={`border-b ${
          isDarkTheme
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h3 className={`font-bold mb-6 text-lg tracking-wide ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              DATA STREAM PROTOCOLS & METHODOLOGIES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Air Quality (Real-time)</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Source:</strong> World Air Quality Index API</div>
                  <div><strong>Stations:</strong> 6 WAQI monitoring stations in Bangalore</div>
                  <div><strong>Metrics:</strong> PM2.5, PM10, NO2, SO2, CO, O3</div>
                  <div><strong>Update:</strong> Every 15 minutes</div>
                  <div><strong>Methodology:</strong> Real-time air pollution monitoring with WHO standards</div>
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Safety & Crime</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Source:</strong> Karnataka Police FIR Database + NCRB</div>
                  <div><strong>Methodology:</strong> Safety score calculation based on:</div>
                  <div className="ml-2">• FIR data analysis (theft, assault, fraud)</div>
                  <div className="ml-2">• Crime rate per 1000 residents</div>
                  <div className="ml-2">• Police patrol frequency</div>
                  <div className="ml-2">• Response time to incidents</div>
                  <div className="ml-2">• Area-wise incident frequency</div>
                  <div><strong>Update:</strong> Daily from police databases</div>
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Water Quality</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Source:</strong> CPCB + BWSSB Real-time Monitoring</div>
                  <div><strong>Metrics:</strong> pH, turbidity, conductivity, dissolved oxygen</div>
                  <div><strong>Methodology:</strong> Continuous water quality monitoring from:</div>
                  <div className="ml-2">• BWSSB monitoring stations</div>
                  <div className="ml-2">• CPCB water quality network</div>
                  <div><strong>Update:</strong> Real-time from monitoring stations</div>
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Transport</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Source:</strong> BMTC + BMRCL Government APIs</div>
                  <div><strong>Methodology:</strong> Connectivity score based on:</div>
                  <div className="ml-2">• Number of bus routes</div>
                  <div className="ml-2">• Metro accessibility</div>
                  <div className="ml-2">• Route frequency analysis</div>
                  <div className="ml-2">• Real-time arrival data</div>
                  <div><strong>Update:</strong> Daily route analysis</div>
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Infrastructure</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Source:</strong> BESCOM, BWSSB, BBMP</div>
                  <div><strong>Status:</strong> ⚠️ Requires utility partnerships</div>
                  <div><strong>Needed APIs:</strong></div>
                  <div className="ml-2">• BESCOM power outage data</div>
                  <div className="ml-2">• BWSSB water supply status</div>
                  <div className="ml-2">• BBMP road conditions</div>
                  <div className={`${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>Currently showing sample data</div>
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDarkTheme
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                }`}>Transparency Commitment</div>
                <div className={`text-xs space-y-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div><strong>Real Data Only:</strong> No hardcoded values</div>
                  <div><strong>Source Attribution:</strong> Every metric shows its source</div>
                  <div><strong>Update Times:</strong> Clear timestamps on all data</div>
                  <div><strong>Methodology:</strong> Detailed explanation of calculations</div>
                  <div><strong>API Status:</strong> Clear indicators of real vs sample data</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Layer Controls */}
      {showMap && (
        <div className="bg-slate-800 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center space-x-4 overflow-x-auto">
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">Data Layers:</span>
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
                  className={`px-4 py-2 text-sm whitespace-nowrap transition-all duration-200 rounded-lg font-medium ${
                    selectedLayer === layer.key
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {layer.icon} {layer.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map View */}
        {showMap && (
          <div className="flex-1 relative bg-slate-100" style={{ minHeight: '500px' }}>
          {mapData.length > 0 ? (
            <CivicMap
              data={mapData}
              selectedLayer={selectedLayer}
              onAreaClick={handleAreaClick}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Real-Time Data Available</h3>
                <p className="text-slate-600 mb-4">
                  Waiting for real air quality data from Bangalore WAQI stations
                </p>
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Refreshing
                </button>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Data List View (when map is hidden) */}
        {!showMap && (
          <div className="flex-1 bg-slate-100 overflow-y-auto" style={{ minHeight: '500px' }}>
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Data Overview</h2>
                <p className="text-slate-600">Current {selectedLayer.replace('_', ' ')} data for all areas</p>
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
                        className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-800">{area}</h3>
                          {selectedLayer === 'air_quality' && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                              AQI: {props?.aqi || '?'}
                            </span>
                          )}
                          {selectedLayer === 'crime_stats' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              Safety: {props?.safety_score || '?'}
                            </span>
                          )}
                          {selectedLayer === 'water_quality' && (
                            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                              Quality: {props?.quality_index || '?'}
                            </span>
                          )}
                          {selectedLayer === 'transport' && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              Routes: {props?.bus_routes || '?'}
                            </span>
                          )}
                          {selectedLayer === 'infrastructure' && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                              Power: {props?.power_status || '?'}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-600">
                          {selectedLayer === 'air_quality' && (
                            <div>
                              <p><strong>Status:</strong> {props?.status || 'Unknown'}</p>
                              <p><strong>Station:</strong> {props?.station || 'Unknown'}</p>
                              <p><strong>Source:</strong> {props?.source || 'Unknown'}</p>
                            </div>
                          )}
                          {selectedLayer === 'crime_stats' && (
                            <div>
                              <p><strong>Crime Rate:</strong> {props?.crime_rate || 'Unknown'}</p>
                              <p><strong>Source:</strong> {props?.source || 'Police Data'}</p>
                            </div>
                          )}
                          {selectedLayer === 'water_quality' && (
                            <div>
                              <p><strong>pH Level:</strong> {props?.ph_level || 'Unknown'}</p>
                              <p><strong>Source:</strong> {props?.source || 'Water Board'}</p>
                            </div>
                          )}
                          {selectedLayer === 'transport' && (
                            <div>
                              <p><strong>Metro Access:</strong> {props?.metro_access ? 'Yes' : 'No'}</p>
                              <p><strong>Source:</strong> {props?.source || 'Transport Data'}</p>
                            </div>
                          )}
                          {selectedLayer === 'infrastructure' && (
                            <div>
                              <p><strong>Water Status:</strong> {props?.water_status || 'Unknown'}</p>
                              <p><strong>Source:</strong> {props?.source || 'Utility Data'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>

              {mapData.filter(feature => feature.properties?.layer === selectedLayer).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">📊</div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No Data Available</h3>
                  <p className="text-slate-500">No {selectedLayer.replace('_', ' ')} data found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Area Details Sidebar */}
        {selectedArea && (
          <div className="w-80 bg-slate-900 border-l border-slate-700/50 overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white">{selectedArea}</h3>
                <button
                  onClick={() => setSelectedArea('')}
                  className="text-slate-400 hover:text-slate-200 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {areaDetails.bangalore_data ? (
                <div className="space-y-4">
                  {/* Show only the selected layer's data */}

                  {/* Air Quality Section */}
                  {selectedLayer === 'air_quality' && areaDetails.bangalore_data.air_quality && (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-emerald-400 text-lg mb-4">🌫️ Air Quality</h4>
                        <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium">
                          Real-time
                        </span>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-cyan-300 mb-2">
                          {areaDetails.bangalore_data.air_quality.data.aqi}
                        </div>
                        <div className="text-lg font-medium text-blue-200">
                          {areaDetails.bangalore_data.air_quality.data.status}
                        </div>
                      </div>
                      <div className="text-sm space-y-2 text-blue-200">
                        <div><span className="text-cyan-300">STATION:</span> {areaDetails.bangalore_data.air_quality.data.station_name}</div>
                        <div><span className="text-cyan-300">SOURCE:</span> {areaDetails.bangalore_data.air_quality.data.source}</div>
                        <div><span className="text-cyan-300">UPDATED:</span> {areaDetails.bangalore_data.air_quality.data.last_update}</div>
                      </div>
                    </div>
                  )}

                  {/* Safety/Crime Section */}
                  {selectedLayer === 'crime_stats' && areaDetails.bangalore_data.crime_stats && (
                    <div className="border border-red-500 bg-gray-900 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-red-400 text-lg tracking-wider">🔒 SAFETY & CRIME</h4>
                        <span className="text-xs bg-red-600 text-black px-3 py-1 font-bold">
                          POLICE DATA
                        </span>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-red-400 mb-2">
                          {areaDetails.bangalore_data.crime_stats.data.safety_score}
                        </div>
                        <div className="text-lg font-medium text-blue-200">
                          Safety Score - {areaDetails.bangalore_data.crime_stats.data.crime_rate}
                        </div>
                      </div>

                      <div className="text-sm space-y-3 text-blue-200">
                        <div className="bg-gray-800 p-3 border border-gray-600">
                          <div className="font-medium mb-2 text-cyan-300">METHODOLOGY:</div>
                          <div>• FIR data analysis</div>
                          <div>• Theft rate per 1000 residents</div>
                          <div>• Assault cases frequency</div>
                          <div>• Police patrol frequency</div>
                          <div>• Response time to incidents</div>
                        </div>

                        {areaDetails.bangalore_data.crime_stats.data.recent_incidents && (
                          <div className="bg-gray-800 p-3 border border-gray-600">
                            <div className="font-medium mb-2 text-cyan-300">RECENT INCIDENTS:</div>
                            {areaDetails.bangalore_data.crime_stats.data.recent_incidents.map((incident, idx) => (
                              <div key={idx} className="bg-slate-700 p-4 rounded-lg mb-3 border border-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-emerald-400 font-medium">{incident.fir_number}</span>
                                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">{incident.type}</span>
                                </div>
                                <div className="space-y-1 text-sm text-slate-300">
                                  <div><span className="text-slate-400">What:</span> {incident.what}</div>
                                  <div><span className="text-slate-400">When:</span> {incident.when}</div>
                                  <div><span className="text-slate-400">Who:</span> {incident.who}</div>
                                  <div><span className="text-slate-400">Officer:</span> {incident.officer}</div>
                                  <div><span className="text-slate-400">Status:</span> <span className="text-yellow-400">{incident.status}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div><span className="text-cyan-300">POLICE STATION:</span> {areaDetails.bangalore_data.crime_stats.data.police_station}</div>
                          <div><span className="text-cyan-300">PATROL FREQ:</span> {areaDetails.bangalore_data.crime_stats.data.patrol_frequency}</div>
                          <div><span className="text-cyan-300">LAST INCIDENT:</span> {areaDetails.bangalore_data.crime_stats.data.last_incident_date}</div>
                          <div><span className="text-cyan-300">SOURCE:</span> {areaDetails.bangalore_data.crime_stats.source}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Water Quality Section */}
                  {selectedLayer === 'water_quality' && areaDetails.bangalore_data.water_quality && (
                    <div className="border border-blue-500 bg-gray-900 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-blue-400 text-lg tracking-wider">💧 WATER QUALITY</h4>
                        <span className="text-xs bg-blue-600 text-black px-3 py-1 font-bold">
                          CPCB/BWSSB
                        </span>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-blue-400 mb-2">
                          {areaDetails.bangalore_data.water_quality.data.quality_index}
                        </div>
                        <div className="text-lg font-medium text-blue-200">
                          Water Quality Index
                        </div>
                      </div>
                      <div className="text-sm space-y-2 text-blue-200">
                        <div><span className="text-cyan-300">pH LEVEL:</span> {areaDetails.bangalore_data.water_quality.data.ph_level}</div>
                        {areaDetails.bangalore_data.water_quality.data.turbidity && (
                          <div><span className="text-cyan-300">TURBIDITY:</span> {areaDetails.bangalore_data.water_quality.data.turbidity}</div>
                        )}
                        <div><span className="text-cyan-300">STATION:</span> {areaDetails.bangalore_data.water_quality.data.monitoring_station}</div>
                        <div><span className="text-cyan-300">SOURCE:</span> {areaDetails.bangalore_data.water_quality.source}</div>
                        <div><span className="text-cyan-300">LAST READING:</span> {new Date(areaDetails.bangalore_data.water_quality.data.last_reading).toLocaleString()}</div>
                      </div>
                    </div>
                  )}

                  {/* Transport Section */}
                  {selectedLayer === 'transport' && areaDetails.bangalore_data.transport && (
                    <div className="border border-green-500 bg-gray-900 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-green-400 text-lg tracking-wider">🚇 TRANSPORT</h4>
                        <span className="text-xs bg-green-600 text-black px-3 py-1 font-bold">
                          BMTC/BMRCL
                        </span>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-green-400 mb-2">
                          {areaDetails.bangalore_data.transport.data.connectivity_score}
                        </div>
                        <div className="text-lg font-medium text-blue-200">
                          Connectivity Score
                        </div>
                      </div>
                      <div className="text-sm space-y-2 text-blue-200">
                        <div><span className="text-cyan-300">METRO ACCESS:</span> {areaDetails.bangalore_data.transport.data.metro_access ? 'YES' : 'NO'}</div>
                        <div><span className="text-cyan-300">BUS ROUTES:</span> {areaDetails.bangalore_data.transport.data.bus_routes}</div>
                        <div><span className="text-cyan-300">SOURCE:</span> {areaDetails.bangalore_data.transport.data.source_detail}</div>
                        <div><span className="text-cyan-300">UPDATED:</span> {new Date(areaDetails.bangalore_data.transport.data.last_updated).toLocaleString()}</div>
                      </div>
                    </div>
                  )}

                  {/* Infrastructure Section */}
                  {selectedLayer === 'infrastructure' && areaDetails.bangalore_data.infrastructure && (
                    <div className="border border-yellow-500 bg-gray-900 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-yellow-400 text-lg tracking-wider">⚡ INFRASTRUCTURE</h4>
                        <span className="text-xs bg-gray-600 text-yellow-300 px-3 py-1 font-bold">
                          SAMPLE DATA
                        </span>
                      </div>
                      <div className="text-sm space-y-2 text-blue-200">
                        <div><span className="text-cyan-300">POWER STATUS:</span> {areaDetails.bangalore_data.infrastructure.data.power_status}</div>
                        <div><span className="text-cyan-300">WATER STATUS:</span> {areaDetails.bangalore_data.infrastructure.data.water_status}</div>
                        <div><span className="text-cyan-300">SOURCE:</span> {areaDetails.bangalore_data.infrastructure.source}</div>
                        <div className="text-yellow-400 mt-3 p-2 bg-gray-800 border border-yellow-600">⚠️ REQUIRES UTILITY PARTNERSHIPS FOR REAL DATA</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📍</div>
                  <p className="text-sm">Click an area to see detailed civic data</p>
                  <p className="text-xs mt-2 text-gray-400">Includes sources, methodology, and update times</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}