import React, { useState, useEffect } from 'react'
import CivicMap from '@/components/CivicMap'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function RealMapView() {
  const [selectedLayer, setSelectedLayer] = useState<string>('air_quality')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [mapData, setMapData] = useState<any[]>([])
  const [areaDetails, setAreaDetails] = useState<any>({})
  const [dataTransparency, setDataTransparency] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const layers = {
    air_quality: { name: 'Air Quality (Real-time)', icon: '🌫️', source: 'WAQI API' },
    crime_stats: { name: 'Crime Data', icon: '🔒', source: 'NCRB/Police APIs' },
    infrastructure: { name: 'Infrastructure', icon: '⚡', source: 'BESCOM/BWSSB' },
    water_quality: { name: 'Water Quality', icon: '💧', source: 'CPCB' },
    transport: { name: 'Transport', icon: '🚇', source: 'BMRCL/BMTC' }
  }

  useEffect(() => {
    fetchRealMapData()
    fetchDataSources()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      fetchAreaDetails(selectedArea)
    }
  }, [selectedArea])

  const fetchRealMapData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/real-civic/map-data`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Real map data received:', data)

      setMapData(data.features || [])
      setLastUpdate(data.metadata?.last_updated || 'Never')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching real map data:', error)
      setLoading(false)
    }
  }

  const fetchDataSources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/real-civic/sources`)
      const data = await response.json()
      setDataTransparency(data)
    } catch (error) {
      console.error('Error fetching data sources:', error)
    }
  }

  const fetchAreaDetails = async (areaName: string) => {
    try {
      const response = await fetch(`${API_URL}/api/real-civic/area/${encodeURIComponent(areaName)}`)
      const data = await response.json()
      setAreaDetails(data)
    } catch (error) {
      console.error('Error fetching area details:', error)
    }
  }

  const refreshData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/real-civic/refresh`)
      const result = await response.json()

      if (result.status === 'refreshed_from_real_apis') {
        await fetchRealMapData()
        setLastUpdate(result.timestamp)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleAreaClick = (areaName: string) => {
    setSelectedArea(areaName)
  }

  const filteredMapData = mapData.filter(feature =>
    selectedLayer === 'all' || feature.properties?.layer === selectedLayer
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real civic data from APIs...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to WAQI, NCRB, Government APIs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Bangalore Civic Map</h1>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium text-green-600">🟢 Real APIs Only</span> - No hardcoded data
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
              >
                Refresh APIs
              </button>
              <div className="text-xs text-gray-500">
                Updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Transparency Notice */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-blue-800">
            <strong>🔍 Data Transparency:</strong> All data sourced from real APIs - WAQI (Air Quality),
            NCRB (Crime), Government portals. {dataTransparency.transparency_commitment || 'Some APIs require authorization.'}
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Data Layers:</span>
            {Object.entries(layers).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setSelectedLayer(key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedLayer === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {layer.icon} {layer.name}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Current source: {layers[selectedLayer]?.source || 'Multiple APIs'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map View */}
        <div className="flex-1 relative">
          <CivicMap
            data={filteredMapData}
            selectedLayer={selectedLayer}
            onAreaClick={handleAreaClick}
          />

          {/* Map Info Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg max-w-xs">
            <h3 className="font-medium text-sm mb-2">Current Layer: {layers[selectedLayer]?.name}</h3>
            <p className="text-xs text-gray-600 mb-2">
              Data points: {filteredMapData.length} | Source: {layers[selectedLayer]?.source}
            </p>
            <div className="text-xs text-gray-500">
              Click on any area to see detailed real-time data with full source attribution.
            </div>
          </div>
        </div>

        {/* Area Details Sidebar */}
        {selectedArea && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{selectedArea}</h3>
                <button
                  onClick={() => setSelectedArea('')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {areaDetails.real_data && Object.keys(areaDetails.real_data).length > 0 ? (
                Object.entries(areaDetails.real_data).map(([layer, data]: [string, any]) => (
                  <div key={layer} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm capitalize">
                        {layers[layer]?.icon} {layer.replace('_', ' ')}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        data.real_time ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {data.real_time ? 'Real-time' : 'Periodic'}
                      </span>
                    </div>

                    {/* Display actual data */}
                    <div className="space-y-2 text-sm">
                      {data.data && typeof data.data === 'object' ? (
                        Object.entries(data.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">{data.data || 'No data available'}</p>
                      )}
                    </div>

                    {/* Source attribution */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div><strong>Source:</strong> {data.source}</div>
                        <div><strong>API:</strong> {data.api_endpoint}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm">No real-time data available for this area</p>
                  <p className="text-xs mt-1">API access may be required</p>
                </div>
              )}

              {/* Transparency info */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-blue-900 mb-2">Data Transparency</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>✅ All data from real APIs</div>
                  <div>✅ No hardcoded values</div>
                  <div>✅ Source attribution provided</div>
                  <div>⚠️ Some govt APIs need authorization</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}