import React from 'react'

interface MapProps {
  data: any[]
  selectedLayer: string
  onAreaClick: (area: string) => void
  theme: 'light' | 'dark'
}

const CivicMap: React.FC<MapProps> = ({ data, selectedLayer, onAreaClick, theme }) => {
  const getLayerColor = (feature: any) => {
    const props = feature.properties

    switch (selectedLayer) {
      case 'air_quality':
        const aqi = props?.aqi || 0
        if (aqi <= 50) return '#4a7c59'  // Earthy Green
        if (aqi <= 100) return '#eab308' // Yellow
        if (aqi <= 150) return '#f97316' // Orange
        return '#ef4444' // Red

      case 'crime_stats':
        const safety = props?.safety_score || 0
        if (safety >= 85) return '#4a7c59'  // Earthy Green - Very Safe
        if (safety >= 75) return '#eab308'  // Yellow - Safe
        if (safety >= 65) return '#f97316'  // Orange - Moderate
        return '#ef4444' // Red - Unsafe

      case 'infrastructure':
        const power = props?.power_status || ''
        if (power === 'Excellent') return '#4a7c59'
        if (power === 'Good') return '#eab308'
        if (power === 'Fair') return '#f97316'
        return '#ef4444'

      case 'water_quality':
        const quality = props?.quality_index || 0
        if (quality >= 85) return '#4a7c59'
        if (quality >= 75) return '#eab308'
        if (quality >= 65) return '#f97316'
        return '#ef4444'

      case 'transport':
        const metro = props?.metro_access || false
        const buses = props?.bus_routes || 0
        if (metro && buses >= 25) return '#4a7c59'
        if (metro || buses >= 20) return '#eab308'
        if (buses >= 10) return '#f97316'
        return '#ef4444'

      default:
        return '#6b7280' // Gray
    }
  }

  const getDisplayValue = (feature: any) => {
    const props = feature.properties

    switch (selectedLayer) {
      case 'air_quality':
        return props?.aqi || '?'
      case 'crime_stats':
        return props?.safety_score || '?'
      case 'infrastructure':
        return props?.power_status?.charAt(0) || '?'
      case 'water_quality':
        return props?.quality_index || '?'
      case 'transport':
        return props?.bus_routes || '?'
      default:
        return '?'
    }
  }

  // Actual geographic positions in Bangalore (relative positioning)
  const areaPositions:any = {
    "Hebbal": { top: "15%", left: "45%" },        // North
    "Whitefield": { top: "35%", left: "75%" },    // East
    "Indiranagar": { top: "40%", left: "55%" },   // Central-East
    "Koramangala": { top: "60%", left: "50%" },   // Central-South
    "Jayanagar": { top: "70%", left: "40%" },     // South
    "Electronic City": { top: "85%", left: "35%" } // Far South
  }

  return (
    <div className={`w-full h-full relative overflow-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'
    }`}>
      {/* Map Background - Bangalore outline */}
      <div className="absolute inset-0 p-8">
        <div className={`relative w-full h-full rounded-2xl border-2 shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-800 border-slate-600'
            : 'bg-white border-gray-300'
        }`}>

          {/* Bangalore city label */}
          <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-emerald-400'
              : 'bg-gray-50 border-gray-300 text-emerald-600'
          }`}>
            <span className="text-sm font-medium">Bangalore</span>
          </div>

          {/* Water bodies (lakes) */}
          <div className="absolute top-20 right-20 w-16 h-10 bg-blue-500/30 rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-12 h-8 bg-blue-500/30 rounded-full"></div>

          {/* Roads/highways as lines */}
          <div className={`absolute top-1/2 left-0 right-0 h-0.5 transform rotate-12 ${
            theme === 'dark' ? 'bg-slate-600/30' : 'bg-gray-400/30'
          }`}></div>
          <div className={`absolute top-1/3 left-0 right-0 h-0.5 transform -rotate-45 ${
            theme === 'dark' ? 'bg-slate-600/30' : 'bg-gray-400/30'
          }`}></div>

          {/* Area markers positioned geographically */}
          {data
            .filter(feature => feature.properties?.layer === selectedLayer)
            .map((feature, index) => {
              const props = feature.properties
              const area = props?.area || 'Unknown'
              const position = areaPositions[area] || { top: "50%", left: "50%" }
              const color = getLayerColor(feature)
              const value = getDisplayValue(feature)

              return (
                <div
                  key={`${selectedLayer}-${index}`}
                  onClick={() => onAreaClick(area)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all"
                  style={{ top: position.top, left: position.left }}
                >
                  {/* Area circle */}
                  <div
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-white font-bold text-sm">{value}</span>
                  </div>

                  {/* Area label */}
                  <div className={`absolute top-14 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded border text-xs font-medium whitespace-nowrap ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-600 text-emerald-400'
                      : 'bg-white border-gray-300 text-emerald-600'
                  }`}>
                    {area}
                  </div>
                </div>
              )
            })}

          {/* Compass */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-sm border flex items-center justify-center">
            <div className="text-xs font-bold">
              <div className="text-red-500">N</div>
              <div className="text-gray-400 text-[8px]">↑</div>
            </div>
          </div>

          {/* Scale */}
          <div className={`absolute bottom-4 left-4 px-2 py-1 rounded shadow-sm border text-xs ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-slate-200'
              : 'bg-white border-gray-300 text-gray-700'
          }`}>
            ~50km
          </div>
        </div>
      </div>

      {/* Dynamic Legend - Mobile Responsive */}
      <div className={`absolute bottom-1 right-1 sm:bottom-4 sm:right-4 p-1.5 sm:p-4 rounded-lg shadow-2xl border max-w-[45%] sm:max-w-none ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-600'
          : 'bg-white border-gray-300'
      }`}>
        <h4 className={`text-[10px] sm:text-sm font-medium mb-1 sm:mb-3 ${
          theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
        }`}>
          {selectedLayer === 'air_quality' && '🌫️ Air Quality Index'}
          {selectedLayer === 'crime_stats' && '🔒 Safety Score'}
          {selectedLayer === 'infrastructure' && '⚡ Infrastructure Status'}
          {selectedLayer === 'water_quality' && '💧 Water Quality Index'}
          {selectedLayer === 'transport' && '🚇 Transport Connectivity'}
        </h4>
        <div className="space-y-0.5 sm:space-y-1">
          {selectedLayer === 'air_quality' && (
            <>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{backgroundColor: '#4a7c59'}}></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Good (0-50)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Moderate (51-100)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Unhealthy (101-150)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Very Unhealthy (150+)</span>
              </div>
            </>
          )}
          {selectedLayer === 'crime_stats' && (
            <>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{backgroundColor: '#4a7c59'}}></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Very Safe (85+)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Safe (75-84)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Moderate (65-74)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Unsafe (below 65)</span>
              </div>
            </>
          )}
          {selectedLayer === 'infrastructure' && (
            <>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{backgroundColor: '#4a7c59'}}></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Excellent</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Good</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Fair</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Poor</span>
              </div>
            </>
          )}
          {selectedLayer === 'water_quality' && (
            <>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{backgroundColor: '#4a7c59'}}></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Excellent (85+)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Good (75-84)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Fair (65-74)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Poor (below 65)</span>
              </div>
            </>
          )}
          {selectedLayer === 'transport' && (
            <>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{backgroundColor: '#4a7c59'}}></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Excellent (Metro + 25+ buses)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Good (Metro or 20+ buses)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Fair (10-19 buses)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className={`text-[8px] sm:text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>Poor (under 10 buses)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CivicMap