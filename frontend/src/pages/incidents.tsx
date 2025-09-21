import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Pagination from '../components/ui/Pagination'
import IncidentCard from '../components/ui/IncidentCard'
import FilterSection from '../components/ui/FilterSection'
import { useTheme } from '../components/ui/ThemeProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

const IncidentsPage: React.FC = () => {
  const router = useRouter()
  const { theme, toggleTheme, isDarkTheme } = useTheme()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [allIncidents, setAllIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filter, setFilter] = useState<string>('recent') // 'recent' or 'all'
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [availableAreas, setAvailableAreas] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  const itemsPerPage = 10

  // Utility function to normalize area names for consistent matching
  const normalizeAreaName = (area: string): string => {
    return area.trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, '') // Remove special characters except spaces
  }

  // Utility function to get proper case area name
  const getProperCaseArea = (area: string, availableAreas: string[]): string => {
    const normalized = normalizeAreaName(area)
    const found = availableAreas.find(a => normalizeAreaName(a) === normalized)
    return found || area
  }

  useEffect(() => {
    fetchIncidentData()
  }, [])

  const fetchIncidentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/bangalore/real-data`)
      const data = await response.json()

      // Collect all recent incidents
      const recentIncidents: Incident[] = []
      const areasSet = new Set<string>()
      const typesSet = new Set<string>()

      if (data.data?.crime_stats?.areas) {
        Object.entries(data.data.crime_stats.areas).forEach(([area, areaData]: [string, any]) => {
          // Add area to our areas set (normalized)
          const normalizedArea = getProperCaseArea(area, [area])
          areasSet.add(normalizedArea)

          if (areaData.recent_incidents) {
            areaData.recent_incidents.forEach((incident: Incident) => {
              const properArea = getProperCaseArea(area, [area])
              recentIncidents.push({
                ...incident,
                area: properArea
              })
              typesSet.add(incident.type)
            })
          }
        })
      }

      // Generate additional incidents for "this year" view
      const allYearIncidents = [...recentIncidents, ...generateAdditionalIncidents(Array.from(areasSet), Array.from(typesSet))]

      // Extract all unique areas and types from combined data
      const allAreas = new Set<string>()
      const allTypes = new Set<string>()

      allYearIncidents.forEach(incident => {
        if (incident.area) allAreas.add(incident.area)
        if (incident.type) allTypes.add(incident.type)
      })

      setAvailableAreas(Array.from(allAreas).sort())
      setAvailableTypes(Array.from(allTypes).sort())
      setIncidents(recentIncidents)
      setAllIncidents(allYearIncidents)
    } catch (error) {
      console.error('Error fetching incident data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAdditionalIncidents = (baseAreas: string[], baseTypes: string[]): Incident[] => {
    const additionalIncidents: Incident[] = []
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September']

    // Expand with additional Bangalore areas if we don't have enough from real data
    const expandedAreas = [...baseAreas]
    const additionalBangaloreAreas = [
      'BTM Layout', 'HSR Layout', 'Marathahalli', 'Banashankari', 'Rajajinagar', 'Malleshwaram',
      'JP Nagar', 'Bommanahalli', 'Yelahanka', 'RT Nagar', 'Vijayanagar', 'Basavanagudi',
      'Shivajinagar', 'Commercial Street', 'MG Road', 'Brigade Road', 'Cunningham Road',
      'Sadashivanagar', 'Banaswadi', 'KR Puram', 'Bellandur', 'Sarjapur', 'Kadugodi', 'Varthur',
      'Domlur', 'Frazer Town', 'CV Raman Nagar', 'Kalyan Nagar', 'HBR Layout', 'Kammanahalli'
    ]

    // Add areas that aren't already in the base areas
    additionalBangaloreAreas.forEach(area => {
      if (!expandedAreas.some(existing => normalizeAreaName(existing) === normalizeAreaName(area))) {
        expandedAreas.push(area)
      }
    })

    // Expand types if needed
    const expandedTypes = [...baseTypes]
    const additionalTypes = ['House break-in', 'Cyber fraud', 'Traffic violation', 'Public disturbance', 'Vandalism']
    additionalTypes.forEach(type => {
      if (!expandedTypes.includes(type)) {
        expandedTypes.push(type)
      }
    })

    // Generate sample incidents for earlier months of 2025
    // Realistic: ~2000-3000 incidents per year for a major city like Bangalore
    for (let i = 0; i < 2500; i++) { // Realistic yearly incident count
      const randomArea = expandedAreas[Math.floor(Math.random() * expandedAreas.length)]
      const randomType = expandedTypes[Math.floor(Math.random() * expandedTypes.length)]
      const randomMonth = months[Math.floor(Math.random() * months.length)]
      const randomDay = Math.floor(Math.random() * 28) + 1
      const randomStatus = ['Under investigation', 'Closed', 'Suspect identified', 'Referred to cyber crime'][Math.floor(Math.random() * 4)]

      // Generate consistent who/what based on status
      let whoDescription = ''
      let whatDescription = ''

      switch (randomStatus) {
        case 'Closed':
          whoDescription = `Case resolved, suspect ${Math.random() > 0.5 ? 'apprehended' : 'identified and prosecuted'}`
          whatDescription = `${randomType} case resolved in ${randomArea}`
          break
        case 'Suspect identified':
          whoDescription = `Suspect identified: ${['Male, age 25-30', 'Female, age 20-25', 'Male, age 30-35', 'Unknown person'][Math.floor(Math.random() * 4)]}`
          whatDescription = `${randomType} with suspect identification in ${randomArea}`
          break
        case 'Referred to cyber crime':
          whoDescription = `Digital forensics team investigating`
          whatDescription = `${randomType} referred to cyber crime division`
          break
        default: // Under investigation
          whoDescription = `Investigation ongoing, ${Math.random() > 0.5 ? 'CCTV being reviewed' : 'witnesses being questioned'}`
          whatDescription = `${randomType} under active investigation in ${randomArea}`
      }

      additionalIncidents.push({
        fir_number: `FIR ${String(Math.floor(Math.random() * 500) + 100).padStart(3, '0')}/2025`,
        type: randomType,
        what: whatDescription,
        when: `2025-${String(months.indexOf(randomMonth) + 1).padStart(2, '0')}-${String(randomDay).padStart(2, '0')} ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        who: whoDescription,
        officer: `SI ${['Rajesh Kumar', 'Priya Sharma', 'Mohan Das', 'Deepa Rao', 'Vinay Singh', 'Lakshmi Devi', 'Anita Singh', 'Suresh Kumar'][Math.floor(Math.random() * 8)]}`,
        status: randomStatus,
        area: randomArea
      })
    }

    return additionalIncidents.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  }

  const getFilteredIncidents = () => {
    let dataToFilter = filter === 'recent' ? incidents : allIncidents

    if (selectedArea !== 'all') {
      dataToFilter = dataToFilter.filter(incident =>
        normalizeAreaName(incident.area || '') === normalizeAreaName(selectedArea)
      )
    }

    if (selectedType !== 'all') {
      dataToFilter = dataToFilter.filter(incident =>
        incident.type?.toLowerCase().trim() === selectedType.toLowerCase().trim()
      )
    }

    return dataToFilter
  }

  const downloadFilteredCSV = () => {
    const filteredData = getFilteredIncidents()

    // CSV headers
    const headers = ['FIR Number', 'Type', 'Area', 'What', 'When', 'Who', 'Officer', 'Status']

    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...filteredData.map(incident => [
        `"${incident.fir_number}"`,
        `"${incident.type}"`,
        `"${incident.area}"`,
        `"${incident.what?.replace(/"/g, '""') || ''}"`, // Escape quotes
        `"${incident.when}"`,
        `"${incident.who?.replace(/"/g, '""') || ''}"`, // Escape quotes
        `"${incident.officer}"`,
        `"${incident.status}"`
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)

    // Generate filename with current filters and timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const areaFilter = selectedArea !== 'all' ? `_${selectedArea.replace(/\s+/g, '-')}` : ''
    const typeFilter = selectedType !== 'all' ? `_${selectedType.replace(/\s+/g, '-')}` : ''
    const timeFilter = filter === 'recent' ? '_recent' : '_2025'

    link.setAttribute('download', `bangalore-incidents-filtered${timeFilter}${areaFilter}${typeFilter}_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSourceData = () => {
    // Download actual source data from backend API
    const params = new URLSearchParams()
    if (selectedArea !== 'all') params.set('area', selectedArea)
    if (selectedType !== 'all') params.set('incident_type', selectedType)

    const queryString = params.toString()
    const url = `${API_URL}/api/bangalore/incidents/csv${queryString ? '?' + queryString : ''}`

    // Create a temporary link to trigger download
    const link = document.createElement('a')
    link.href = url
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllCivicData = () => {
    // Download comprehensive civic data from backend
    const url = `${API_URL}/api/bangalore/all-data/csv`

    const link = document.createElement('a')
    link.href = url
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadRawGovernmentData = () => {
    // Download actual raw JSON responses from government APIs
    const url = `${API_URL}/api/bangalore/raw-sources/json`

    const link = document.createElement('a')
    link.href = url
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCurrentPageIncidents = () => {
    const filteredIncidents = getFilteredIncidents()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredIncidents.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filteredIncidents = getFilteredIncidents()
    return Math.ceil(filteredIncidents.length / itemsPerPage)
  }



  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          <div className={`inline-block w-8 h-8 border-2 rounded-full animate-spin ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
               style={{ borderTopColor: 'transparent' }}></div>
          <p className={`mt-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 pb-4 sm:pb-8 lg:pb-4 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className="mb-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className={`transition-colors text-sm ${
                  isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ← Back
              </button>
              <h1 className="text-3xl font-light tracking-tight">Recent Incidents</h1>
            </div>
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
          <p className={`text-lg ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Crime reports and incident data for Bangalore
          </p>
          <div className={`mt-3 px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-amber-900/30 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`text-sm ${isDarkTheme ? 'text-amber-200' : 'text-amber-800'}`}>
              ⚠️ <strong>Sample Data:</strong> These are simulated incidents for demonstration. Real crime data requires police department API access.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Sidebar - Summary Stats */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className={`p-4 lg:p-6 rounded-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                <div className="flex flex-col space-y-2 mb-4">
                  <button
                    onClick={downloadSourceData}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors flex items-center space-x-1 ${
                      isDarkTheme
                        ? 'bg-green-900 text-green-300 border-green-800 hover:bg-green-800'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <span>📊</span>
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={downloadRawGovernmentData}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors flex items-center space-x-1 ${
                      isDarkTheme
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🔍</span>
                    <span>API Access Report</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isDarkTheme ? 'text-stone-200' : 'text-stone-800'
                  }`}>{getFilteredIncidents().length}</div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-stone-400' : 'text-stone-600'
                  }`}>Total Incidents</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isDarkTheme ? 'text-amber-300' : 'text-amber-700'
                  }`}>
                    {getFilteredIncidents().filter(i => i.status === 'Under investigation').length}
                  </div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-amber-400' : 'text-amber-600'
                  }`}>Under Investigation</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isDarkTheme ? 'text-green-300' : 'text-green-700'
                  }`}>
                    {getFilteredIncidents().filter(i => i.status === 'Closed').length}
                  </div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-green-400' : 'text-green-600'
                  }`}>Closed Cases</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isDarkTheme ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {getFilteredIncidents().filter(i => i.status === 'Suspect identified').length}
                  </div>
                  <div className={`text-xs ${
                    isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                  }`}>Suspects Identified</div>
                </div>
              </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

        {/* Filters */}
        <FilterSection
          filter={filter}
          selectedArea={selectedArea}
          selectedType={selectedType}
          availableAreas={availableAreas}
          availableTypes={availableTypes}
          isDarkTheme={isDarkTheme}
          filteredCount={getFilteredIncidents().length}
          onFilterChange={(newFilter) => {
            setFilter(newFilter)
            setCurrentPage(1)
          }}
          onAreaChange={(newArea) => {
            setSelectedArea(newArea)
            setCurrentPage(1)
          }}
          onTypeChange={(newType) => {
            setSelectedType(newType)
            setCurrentPage(1)
          }}
          onReset={() => {
            setFilter('recent')
            setSelectedArea('all')
            setSelectedType('all')
            setCurrentPage(1)
          }}
          onDownloadCSV={downloadFilteredCSV}
        />

        {/* Top Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages()}
          onPageChange={setCurrentPage}
          isDarkTheme={isDarkTheme}
          position="right"
          className="mb-4"
        />

        {/* Incidents List */}
        <div className="space-y-3 sm:space-y-4">
          {getCurrentPageIncidents().map((incident, index) => (
            <IncidentCard
              key={`${incident.fir_number}-${index}`}
              incident={incident}
              index={index}
              isDarkTheme={isDarkTheme}
            />
          ))}
        </div>

        {/* Bottom Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages()}
          onPageChange={setCurrentPage}
          isDarkTheme={isDarkTheme}
          position="right"
          className="mt-4 sm:mt-8 mb-6 sm:mb-4"
        />

        </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentsPage