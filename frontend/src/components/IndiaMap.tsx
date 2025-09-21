import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Issue } from '../types'

interface IndiaMapProps {
  issues: Issue[]
  onLocationClick: (location: string) => void
  currentLevel: 'country' | 'state' | 'city'
}

const IndiaMap: React.FC<IndiaMapProps> = ({ issues, onLocationClick, currentLevel }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const projection = d3.geoMercator()
      .center([78.9629, 20.5937])
      .scale(dimensions.width * 1.2)
      .translate([dimensions.width / 2, dimensions.height / 2])

    const indiaOutline = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[68.162, 6.747], [97.403, 6.747], [97.403, 35.674], [68.162, 35.674], [68.162, 6.747]]]
      }
    }

    const path = d3.geoPath().projection(projection)

    svg.append('path')
      .datum(indiaOutline)
      .attr('d', path as any)
      .attr('fill', '#1a1a1a')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)

    const issueGroups = svg.selectAll('.issue')
      .data(issues)
      .enter()
      .append('g')
      .attr('class', 'issue')
      .attr('transform', d => {
        const coords = projection([d.location.lng, d.location.lat])
        return coords ? `translate(${coords[0]}, ${coords[1]})` : ''
      })

    const sizeScale = d3.scaleLinear()
      .domain([0, 10])
      .range([10, 30])

    issueGroups.append('circle')
      .attr('r', d => sizeScale(d.age_days % 10))
      .attr('fill', d => {
        const colors = {
          critical: '#FF0000',
          high: '#FF6600',
          medium: '#FFAA00',
          low: '#00AA00'
        }
        return colors[d.severity] || '#666'
      })
      .attr('opacity', 0.7)
      .attr('class', d => d.trend === 'worsening' ? 'animate-pulse' : '')
      .on('click', (event, d) => onLocationClick(d.location.name))

    issueGroups.append('circle')
      .attr('r', d => sizeScale(d.age_days % 10) + 2)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => {
        const radius = sizeScale(d.age_days % 10) + 2
        const circumference = 2 * Math.PI * radius
        return `${circumference * d.progress} ${circumference * (1 - d.progress)}`
      })
      .attr('opacity', 0.8)

    const iconMap = {
      legal: '⚖️',
      health: '🏥',
      infrastructure: '🚧',
      crime: '🚨',
      governance: '🏛️'
    }

    issueGroups.append('text')
      .text(d => iconMap[d.category] || '📍')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '12px')
      .attr('pointer-events', 'none')

  }, [issues, dimensions, onLocationClick])

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 bg-black"
    />
  )
}

export default IndiaMap