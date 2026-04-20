import React, { useMemo } from 'react'
import { useSheetData } from '../../hooks/useSheetData'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const SCORE_MAP = {
  'Nunca': 0, 'Raramente': 1, 'Às vezes': 2, 'Frequentemente': 3, 'Sempre': 4,
  'Não': 0, 'Sim': 4,
  'Ruim': 0, 'Regular': 1, 'Bom': 3, 'Ótimo': 4,
  'Nada': 0, 'Pouco': 1, 'Moderadamente': 2, 'Muito': 4,
}

const COLOR_PALETTES = {
  default:      ['#4F46E5','#EF4444','#10B981','#F59E0B','#8B5CF6'],
  Tritanopia:   ['#D55E00','#E69F00','#009E73','#56B4E9','#CC79A7','#F0E442'],
  Deuteranopia: ['#0072B2','#D55E00','#009E73','#F0E442','#CC79A7','#56B4E9'],
  Protanopia:   ['#0072B2','#009E73','#56B4E9','#F0E442','#E69F00','#CC79A7'],
}

const sortByOrder = (arr, order) => {
  return arr.sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

function RadarChartConfig({ groupBy, axes, title, titleSize, isMain, order }) {
  const { data, loading, cores, keyMap } = useSheetData()
  const COLORS = COLOR_PALETTES[cores] || COLOR_PALETTES.default

  const realGroupBy = keyMap[groupBy] ?? groupBy

  const resolvedAxes = axes.map(ax => ({
    ...ax,
    realKey: keyMap[ax.question] ?? ax.question,
  }))

  const { chartData, groups } = useMemo(() => {
    const totals = {}, counts = {}
    const groupSet = new Set()

    data.forEach(item => {
      const group = (item[realGroupBy] || '').trim()
      if (!group) return
      groupSet.add(group)
      if (!totals[group]) totals[group] = {}
      if (!counts[group]) counts[group] = {}

      resolvedAxes.forEach(({ realKey, label }) => {
        const raw = (item[realKey] || '').trim()
        const score = SCORE_MAP[raw] ?? parseFloat(raw)
        if (isNaN(score)) return
        totals[group][label] = (totals[group][label] || 0) + score
        counts[group][label] = (counts[group][label] || 0) + 1
      })
    })

    const groupArr = [...groupSet]
    const formatted = resolvedAxes.map(({ label }) => {
      const entry = { subject: label }
      groupArr.forEach(g => {
        entry[g] = parseFloat(((totals[g]?.[label] || 0) / (counts[g]?.[label] || 1)).toFixed(2))
      })
      return entry
    })

    return { chartData: formatted, groups: groupArr , groupsOrdered: sortByOrder(groupArr, order) }
  }, [data, realGroupBy, resolvedAxes, order])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: 12, color: '#000' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ margin: 0, color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ textAlign: 'center', color: 'black', fontSize: titleSize, margin: '0 0 4px' }}>{title}</h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: Math.max(9, titleSize - 10) }} />
            <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 9 }} />
            {isMain && <Tooltip content={<CustomTooltip />} />}
            {isMain && <Legend wrapperStyle={{ fontSize: titleSize - 8 }} />}
            {groups.map((g, i) => (
              <Radar key={g} name={g} dataKey={g}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.2} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RadarChartConfig