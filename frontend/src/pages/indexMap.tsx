import React, { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CivicLayer {
  name: string
  data: any
  last_updated: string
}

interface AreaData {
  [key: string]: any
}

export default function CivicMap() {
  const [selectedView, setSelectedView] = useState<'overview' | 'area'>('overview')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedLayer, setSelectedLayer] = useState<string>('all')
  const [civicData, setCivicData] = useState<any>({})
  const [areaData, setAreaData] = useState<AreaData>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const areas = [
    { id: 'Electronic City', name: 'Electronic City', coords: { lat: 12.8440, lng: 77.6630 } },
    { id: 'Whitefield', name: 'Whitefield', coords: { lat: 12.9698, lng: 77.7500 } },
    { id: 'Koramangala', name: 'Koramangala', coords: { lat: 12.9279, lng: 77.6271 } },
    { id: 'Indiranagar', name: 'Indiranagar', coords: { lat: 12.9784, lng: 77.6408 } },
    { id: 'Jayanagar', name: 'Jayanagar', coords: { lat: 12.9237, lng: 77.5838 } },
    { id: 'Hebbal', name: 'Hebbal', coords: { lat: 13.0356, lng: 77.5970 } }
  ]

  const layers = {
    all: { name: 'All Layers', icon: '🏙️' },
    air_quality: { name: 'Air Quality', icon: '🌫️' },
    crime_stats: { name: 'Safety', icon: '🔒' },
    infrastructure: { name: 'Infrastructure', icon: '⚡' },
    water_quality: { name: 'Water Quality', icon: '💧' },
    transport: { name: 'Transport', icon: '🚇' }
  }

  useEffect(() => {
    fetchCivicLayers()
  }, [])

  useEffect(() => {
    if (selectedArea && selectedView === 'area') {
      fetchAreaData(selectedArea)
    }
  }, [selectedArea, selectedView])

  const fetchCivicLayers = async () => {
    try {
      setLoading(true)
      console.log('Fetching from:', `${API_URL}/api/civic/layers`)
      const response = await fetch(`${API_URL}/api/civic/layers`)
      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)

      setCivicData(data.layers || {})
      setLastUpdate(data.last_updated || 'Never')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching civic data:', error)
      setLoading(false)
    }
  }

  const fetchAreaData = async (areaName: string) => {
    try {
      const response = await fetch(`${API_URL}/api/civic/area/${encodeURIComponent(areaName)}`)
      const data = await response.json()
      setAreaData(data.data || {})
    } catch (error) {
      console.error('Error fetching area data:', error)
    }
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500'
    if (aqi <= 100) return 'bg-yellow-500'
    if (aqi <= 150) return 'bg-orange-500'
    if (aqi <= 200) return 'bg-red-500'
    return 'bg-purple-500'
  }

  const getSafetyColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getLayerData = (area: string, layer: string) => {
    if (!civicData[layer] || !civicData[layer].areas) return null
    return civicData[layer].areas[area]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading civic data layers...</p>
        </div>
      </div>
    )
  }

  if (selectedView === 'area' && selectedArea) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {setSelectedView('overview'); setSelectedArea('')}}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to Bangalore
                </button>
                <h1 className="text-2xl font-light">{selectedArea}</h1>
              </div>
              <div className="text-sm text-gray-500">
                Updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Area Details */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Air Quality */}
            {areaData.air_quality && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center">
                    🌫️ Air Quality
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-white text-sm ${getAQIColor(areaData.air_quality.aqi)}`}>
                    AQI {areaData.air_quality.aqi}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{areaData.air_quality.status}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>PM2.5: {areaData.air_quality.pm25 || 'N/A'}</div>
                  <div>PM10: {areaData.air_quality.pm10 || 'N/A'}</div>
                </div>
              </div>
            )}

            {/* Safety */}
            {areaData.crime_stats && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center">
                    🔒 Safety Score
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-white text-sm ${getSafetyColor(areaData.crime_stats.safety_score)}`}>
                    {areaData.crime_stats.safety_score}/10
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Theft cases:</span>
                    <span>{areaData.crime_stats.theft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cybercrime:</span>
                    <span>{areaData.crime_stats.cybercrime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traffic violations:</span>
                    <span>{areaData.crime_stats.traffic_violations}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Infrastructure */}
            {areaData.infrastructure && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-medium flex items-center mb-4">
                  ⚡ Infrastructure
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power reliability:</span>
                    <span>{areaData.infrastructure.power_reliability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water supply:</span>
                    <span>{areaData.infrastructure.water_supply_hours}h/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Road condition:</span>
                    <span>{areaData.infrastructure.road_condition}</span>
                  </div>
                </div>
                {areaData.infrastructure.ongoing_projects && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Ongoing Projects:</p>
                    <div className="flex flex-wrap gap-1">
                      {areaData.infrastructure.ongoing_projects.map((project: string, index: number) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Water Quality */}
            {areaData.water_quality && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center">
                    💧 Water Quality
                  </h3>
                  <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                    {areaData.water_quality.quality_score}/10
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{areaData.water_quality.status}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>pH: {areaData.water_quality.ph_level}</div>
                  <div>TDS: {areaData.water_quality.tds} mg/L</div>
                  <div>Chlorine: {areaData.water_quality.chlorine} mg/L</div>
                </div>
              </div>
            )}

            {/* Transport */}
            {areaData.transport && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-medium flex items-center mb-4">
                  🚇 Transport
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metro:</span>
                    <span className="text-xs">{areaData.transport.metro_connectivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bus frequency:</span>
                    <span>{areaData.transport.bus_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traffic level:</span>
                    <span>{areaData.transport.traffic_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg commute:</span>
                    <span>{areaData.transport.avg_commute_time} min</span>
                  </div>
                </div>
              </div>
            )}
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
            <div>
              <h1 className="text-2xl font-light">Bangalore Civic Map</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time civic data by area</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCivicLayers}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Refresh Data
              </button>
              <div className="text-xs text-gray-500">
                Updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {Object.entries(layers).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setSelectedLayer(key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedLayer === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {layer.icon} {layer.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Area Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(area => {
            const airQuality = getLayerData(area.id, 'air_quality')
            const safety = getLayerData(area.id, 'crime_stats')
            const infrastructure = getLayerData(area.id, 'infrastructure')

            return (
              <div
                key={area.id}
                onClick={() => {setSelectedArea(area.id); setSelectedView('area')}}
                className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-medium text-lg mb-4">{area.name}</h3>

                <div className="space-y-3">
                  {/* Air Quality Indicator */}
                  {airQuality && (selectedLayer === 'all' || selectedLayer === 'air_quality') && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🌫️ Air Quality</span>
                      <div className={`px-2 py-1 rounded text-xs text-white ${getAQIColor(airQuality.aqi)}`}>
                        {airQuality.aqi}
                      </div>
                    </div>
                  )}

                  {/* Safety Indicator */}
                  {safety && (selectedLayer === 'all' || selectedLayer === 'crime_stats') && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🔒 Safety</span>
                      <div className={`px-2 py-1 rounded text-xs text-white ${getSafetyColor(safety.safety_score)}`}>
                        {safety.safety_score}/10
                      </div>
                    </div>
                  )}

                  {/* Infrastructure Indicator */}
                  {infrastructure && (selectedLayer === 'all' || selectedLayer === 'infrastructure') && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">⚡ Power</span>
                      <span className="text-sm font-medium">{infrastructure.power_reliability}%</span>
                    </div>
                  )}

                  {infrastructure && (selectedLayer === 'all' || selectedLayer === 'infrastructure') && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">💧 Water</span>
                      <span className="text-sm font-medium">{infrastructure.water_supply_hours}h</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-blue-600 text-sm">
                  View details →
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}