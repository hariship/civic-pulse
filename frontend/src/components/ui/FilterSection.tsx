import React from 'react'

interface FilterSectionProps {
  filter: string
  selectedArea: string
  selectedType: string
  availableAreas: string[]
  availableTypes: string[]
  isDarkTheme: boolean
  filteredCount: number
  onFilterChange: (filter: string) => void
  onAreaChange: (area: string) => void
  onTypeChange: (type: string) => void
  onReset: () => void
  onDownloadCSV: () => void
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filter,
  selectedArea,
  selectedType,
  availableAreas,
  availableTypes,
  isDarkTheme,
  filteredCount,
  onFilterChange,
  onAreaChange,
  onTypeChange,
  onReset,
  onDownloadCSV
}) => {
  return (
    <div className={`p-4 sm:p-6 rounded-lg border mb-4 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <h2 className="text-lg font-medium mb-4">Filter Incidents</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Time Period</label>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-gray-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
            }`}
          >
            <option value="recent">Recent Incidents</option>
            <option value="all">All 2025 Incidents</option>
          </select>
        </div>

        {/* Area Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Area</label>
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-gray-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
            }`}
          >
            <option value="all">All Areas</option>
            {availableAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Incident Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-gray-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
            }`}
          >
            <option value="all">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`text-sm ${
          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Showing {filteredCount} incidents
        </div>
        <button
          onClick={onDownloadCSV}
          className={`px-4 py-2 rounded border transition-colors flex items-center space-x-2 ${
            isDarkTheme
              ? 'bg-green-900 text-green-300 border-green-800 hover:bg-green-800'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
        >
          <span>📊</span>
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )
}

export default FilterSection