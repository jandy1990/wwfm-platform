'use client'

import { useState } from 'react'

interface ArenaData {
  arena_name: string
  total_seconds: number
  percentage: number
  color: string
}

interface ArenaTimePieChartProps {
  data: ArenaData[]
  formatTime: (seconds: number) => string
  size?: number
}

export function ArenaTimePieChart({ data, formatTime, size = 240 }: ArenaTimePieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">No data to display</p>
        </div>
      </div>
    )
  }

  const radius = size / 2 - 20
  const centerX = size / 2
  const centerY = size / 2

  // Create pie slices
  let currentAngle = -90 // Start from top
  const slices = data.map((item, index) => {
    const sliceAngle = (item.percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0
    
    // Label position (middle of slice)
    const labelAngle = startAngle + sliceAngle / 2
    const labelAngleRad = (labelAngle * Math.PI) / 180
    const labelRadius = radius * 0.7
    const labelX = centerX + labelRadius * Math.cos(labelAngleRad)
    const labelY = centerY + labelRadius * Math.sin(labelAngleRad)
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    currentAngle = endAngle
    
    return {
      ...item,
      pathData,
      labelX,
      labelY,
      index
    }
  })

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-sm"
        >
          {slices.map((slice) => (
            <g key={slice.arena_name}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-all duration-200 ${
                  hoveredSlice === slice.arena_name 
                    ? 'filter brightness-110 drop-shadow-md' 
                    : 'hover:filter hover:brightness-105'
                }`}
                onMouseEnter={() => setHoveredSlice(slice.arena_name)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              
              {/* Show percentage on slice if >= 10% */}
              {slice.percentage >= 10 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-sm font-medium pointer-events-none drop-shadow-sm"
                >
                  {slice.percentage}%
                </text>
              )}
            </g>
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoveredSlice && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm font-medium max-w-32 text-center">
              <div className="font-semibold">{hoveredSlice}</div>
              <div className="text-xs opacity-90">
                {formatTime(data.find(d => d.arena_name === hoveredSlice)?.total_seconds || 0)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {data.map((item) => (
          <div 
            key={item.arena_name}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
              hoveredSlice === item.arena_name 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            onMouseEnter={() => setHoveredSlice(item.arena_name)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.arena_name}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {formatTime(item.total_seconds)} ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}