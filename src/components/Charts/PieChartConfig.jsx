import React, { useState, useMemo } from 'react'
import { useSheetData } from '../../hooks/useSheetData'
import {
  PieChart, Pie, Tooltip, Cell, Legend, Sector, ResponsiveContainer
} from 'recharts'

const COLOR_PALETTES = {
  default:      ['#4F46E5','#DC2626','#16A34A','#F59E0B','#7C3AED','#0D9488','#EA580C','#4B5563','#DB2777','#65A30D','#0891B2','#BE123C','#9333EA','#CA8A04'],
  Tritanopia:   ['#D55E00','#E69F00','#009E73','#56B4E9','#CC79A7','#F0E442'],
  Deuteranopia: ['#0072B2','#D55E00','#009E73','#F0E442','#CC79A7','#56B4E9'],
  Protanopia:   ['#0072B2','#009E73','#56B4E9','#F0E442','#E69F00','#CC79A7'],
}

const ITEMS_PER_PAGE = 6

function PieChartConfig({ question, title, titleSize, type, isMain, order ,typsF,typsB}) {
  const { data, loading, cores, keyMap } = useSheetData()
  const [activeIndex, setActiveIndex] = useState(null)
  const [page, setPage] = useState(0)

  const donut = type === 'donnut' ? '30%' : undefined
  const COLORS = COLOR_PALETTES[cores] || COLOR_PALETTES.default

  const realKey = keyMap[question] ?? question

  const chartData = useMemo(() => {
    const counts = {}
    data.forEach(item => {
      const value = (item[realKey] || '').trim()
      if (!value) return
      counts[value] = (counts[value] || 0) + 1
    })

    const entries = Object.entries(counts).map(([name, value]) => ({ name, value }))

    if (order) {
      return entries.sort((a, b) => {
        const ia = order.indexOf(a.name)
        const ib = order.indexOf(b.name)
        if (ia === -1 && ib === -1) return b.value - a.value
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
    }

    return entries.sort((a, b) => b.value - a.value)
  }, [data, realKey, order])

  const totalOpcoes = chartData.length
  const totalPages  = Math.ceil(totalOpcoes / ITEMS_PER_PAGE)
  const start       = page * ITEMS_PER_PAGE
  const paginated   = chartData.slice(start, start + ITEMS_PER_PAGE)
  const hasPrev     = page > 0
  const hasNext     = page < totalPages - 1

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent < 0.04) return null
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: Math.max(8, titleSize / Math.sqrt(Math.max(totalOpcoes, 1))), fontWeight: 700, pointerEvents: 'none' }}>
        {(percent * 100).toFixed(0)}%
      </text>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const total = chartData.reduce((a, i) => a + i.value, 0)
    const { name, value } = payload[0]
    return (
      <div style={{
        background: '#fff', padding: '10px', border: '1px solid #ddd',
        borderRadius: '8px', color: '#000', fontSize: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{`
            ${typsF} ${name} ${typsB}`}</p>
        <p style={{ margin: 0 }}>Total de alunos: {value}</p>
        <p style={{ margin: 0 }}>{((value / total) * 100).toFixed(1)}%</p>
      </div>
    )
  }

  const CustomLegend = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {paginated.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 10, height: 10, flexShrink: 0,
            backgroundColor: COLORS[(start + i) % COLORS.length],
            borderRadius: 2,
          }} />
          <span style={{
            color: '#1e293b',
            fontSize: Math.max(10, titleSize - 8),
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {`${typsF} ${entry.name} ${typsB}`}
          </span>
        </div>
      ))}
      {(hasPrev || hasNext) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {hasPrev && (
            <span onClick={() => setPage(p => p - 1)}
              style={{ cursor: 'pointer', fontSize: 16, color: '#6366f1', userSelect: 'none', lineHeight: 1 }}>
              ↑
            </span>
          )}
          {hasNext && (
            <span onClick={() => setPage(p => p + 1)}
              style={{ cursor: 'pointer', fontSize: 16, color: '#6366f1', userSelect: 'none', lineHeight: 1 }}>
              ↓
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
      Carregando...
    </div>
  )

  if (!realKey) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444', fontSize: 12 }}>
      Coluna não encontrada: {question}
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ textAlign: 'center', color: 'black', fontSize: titleSize, margin: '0 0 4px' }}>{title}</h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} dataKey="value" nameKey="name"
              outerRadius="80%" innerRadius={donut}
              activeIndex={activeIndex} animationDuration={400}
              label={renderLabel} labelLine={false}
              activeShape={(props) => <g><Sector {...props} outerRadius={props.outerRadius + 8} /></g>}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            {isMain && <Tooltip content={<CustomTooltip />} />}
            {isMain && (
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                content={<CustomLegend />}
                wrapperStyle={{
                  background: '#fff', padding: '8px', borderRadius: 8,
                  boxShadow: '0 0 6px rgba(0,0,0,0.08)',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PieChartConfig