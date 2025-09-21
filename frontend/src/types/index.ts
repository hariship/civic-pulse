export interface Issue {
  id: string
  type: 'news' | 'legal' | 'crime' | 'infrastructure'
  category: string
  title: string
  location: {
    name: string
    lat: number
    lng: number
    level?: string
  }
  severity: 'critical' | 'high' | 'medium' | 'low'
  progress: number
  trend: 'worsening' | 'stable' | 'improving'
  age_days: number
  last_updated: string
  update_count?: number
  status?: string
  metadata?: Record<string, any>
}

export interface LocationSummary {
  location_id: string
  total_issues: number
  critical_issues: number
  active_issues: number
  resolved_issues: number
  categories: Record<string, number>
}

export interface Region {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  type: 'country' | 'state' | 'city' | 'district'
  parent?: string
}