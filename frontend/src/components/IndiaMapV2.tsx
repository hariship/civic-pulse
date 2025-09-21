import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Issue } from '../types'

interface IndiaMapProps {
  issues: Issue[]
  onLocationClick: (location: string) => void
  currentLevel: 'country' | 'state' | 'city'
}

const IndiaMapV2: React.FC<IndiaMapProps> = ({ issues, onLocationClick, currentLevel }) => {
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

    // Map background
    svg.append('path')
      .datum(indiaOutline)
      .attr('d', path as any)
      .attr('fill', '#0a0a0a')
      .attr('stroke', '#222')
      .attr('stroke-width', 1)

    // Issue markers
    const issueGroups = svg.selectAll('.issue')
      .data(issues)
      .enter()
      .append('g')
      .attr('class', 'issue')
      .attr('transform', d => {
        const coords = projection([d.location.lng, d.location.lat])
        return coords ? `translate(${coords[0]}, ${coords[1]})` : ''
      })

    // Age-based size (older = bigger, factual metric)
    const ageScale = d3.scaleLinear()
      .domain([0, 365])  // 0 to 1 year
      .range([8, 25])
      .clamp(true)

    // Update frequency as opacity (more updates = more visible)
    const opacityScale = d3.scaleLinear()
      .domain([0, 10])  // number of updates
      .range([0.3, 0.9])
      .clamp(true)

    // Base circle - size by age
    issueGroups.append('circle')
      .attr('r', d => ageScale(d.age_days))
      .attr('fill', '#666')  // Neutral grey
      .attr('opacity', d => opacityScale(d.update_count || 1))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('click', (event, d) => onLocationClick(d.location.name))

    // Progress arc (factual completion status)
    issueGroups.each(function(d) {
      const radius = ageScale(d.age_days)
      const arc = d3.arc()
        .innerRadius(radius - 2)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(Math.PI * 2 * d.progress)

      d3.select(this).append('path')
        .attr('d', arc as any)
        .attr('fill', '#fff')
        .attr('opacity', 0.6)
    })

    // Category icons (factual, not priority)
    const iconMap = {
      legal: '⚖️',
      health: '🏥',
      infrastructure: '🏗️',
      crime: '🔍',
      governance: '📋',
      environment: '🌳',
      education: '📚'
    }

    issueGroups.append('text')
      .text(d => iconMap[d.category] || '•')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .attr('opacity', 0.8)

    // Days counter (top right of each issue)
    issueGroups.append('text')
      .text(d => d.age_days + 'd')
      .attr('x', d => ageScale(d.age_days) + 5)
      .attr('y', d => -ageScale(d.age_days))
      .attr('font-size', '8px')
      .attr('fill', '#888')
      .attr('text-anchor', 'start')

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

export default IndiaMapV2