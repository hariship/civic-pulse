import React from 'react'

interface Incident {
  fir_number: string
  type: string
  what: string
  when: string
  who: string
  officer: string
  status: string
  area?: string
}

interface IncidentCardProps {
  incident: Incident
  index: number
  isDarkTheme: boolean
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, index, isDarkTheme }) => {
  const getStatusColor = (status: string) => {
    if (isDarkTheme) {
      switch (status.toLowerCase()) {
        case 'under investigation': return 'bg-amber-900 text-amber-200'
        case 'closed': return 'bg-green-900 text-green-200'
        case 'suspect identified': return 'bg-blue-900 text-blue-200'
        case 'referred to cyber crime': return 'bg-purple-900 text-purple-200'
        default: return 'bg-stone-700 text-stone-200'
      }
    } else {
      switch (status.toLowerCase()) {
        case 'under investigation': return 'bg-amber-100 text-amber-800'
        case 'closed': return 'bg-green-100 text-green-800'
        case 'suspect identified': return 'bg-blue-100 text-blue-800'
        case 'referred to cyber crime': return 'bg-purple-100 text-purple-800'
        default: return 'bg-stone-200 text-stone-800'
      }
    }
  }

  return (
    <div
      key={`${incident.fir_number}-${index}`}
      className={`p-3 sm:p-6 rounded-lg border ${
        isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <span className="font-medium text-base sm:text-lg">{incident.fir_number}</span>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${getStatusColor(incident.status)}`}>
              {incident.status}
            </span>
            <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
              isDarkTheme ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-800'
            }`}>
              {incident.type}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Area</div>
          <div className="font-medium">{incident.area}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 text-sm">
        <div>
          <span className={`font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>What:</span>
          <p className="mt-1">{incident.what}</p>
        </div>

        <div>
          <span className={`font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>When:</span>
          <p className="mt-1">{new Date(incident.when).toLocaleString()}</p>
        </div>

        <div>
          <span className={`font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Who:</span>
          <p className="mt-1">{incident.who}</p>
        </div>

        <div>
          <span className={`font-medium ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
          }`}>Investigating Officer:</span>
          <p className={`mt-1 ${
            isDarkTheme ? 'text-gray-200' : 'text-gray-800'
          }`}>{incident.officer}</p>
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <span className={`font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
          <p className="mt-1">{incident.status}</p>
        </div>
      </div>
    </div>
  )
}

export default IncidentCard