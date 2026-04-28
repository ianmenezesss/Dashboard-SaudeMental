import React, { useMemo } from 'react'
import { useSheetData } from '../../hooks/useSheetData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, Cell, LabelList
} from 'recharts'

const COLOR_PALETTES = {
  default:      ['#4F46E5','#06B6D4','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'],
  Tritanopia:   ['#D55E00','#E69F00','#009E73','#56B4E9','#CC79A7','#F0E442'],
  Deuteranopia: ['#0072B2','#D55E00','#009E73','#F0E442','#CC79A7','#56B4E9'],
  Protanopia:   ['#0072B2','#009E73','#56B4E9','#F0E442','#E69F00','#CC79A7'],
}

function sortByOrder(arr, orderList) {
  if (!orderList) return arr
  return [...arr].sort((a, b) => {
    const ia = orderList.indexOf(a)
    const ib = orderList.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    return -1
  })
}

function StackedBarChart({
  question,
  questionB,
  title,
  titleSize,
  eixoX,
  eixoY,
  isMain,
  orderX,
  orderY,
  typsF,
  typsB,
}) {
  const { data, loading, cores, keyMap } = useSheetData()
  const COLORS = COLOR_PALETTES[cores] || COLOR_PALETTES.default

  const realKey  = keyMap[question]  ?? question
  const realKeyB = keyMap[questionB] ?? questionB
  const totalRespostas = data.length

  const { chartData, keys } = useMemo(() => {
    // Conta ocorrências: para cada valor de X, quantos de cada Y
    const grouped = {}
    const keySet = new Set()

    data.forEach(item => {
      const x = (item[realKey]  || '').trim()
      const y = (item[realKeyB] || '').trim()
      if (!x || !y) return
      if (!grouped[x]) grouped[x] = { name: x, _total: 0 }
      grouped[x][y] = (grouped[x][y] || 0) + 1
      grouped[x]._total += 1
      keySet.add(y)
    })

    const sortedKeys  = sortByOrder([...keySet], orderY)
    const sortedNames = sortByOrder(Object.keys(grouped), orderX)

    // Converte para porcentagem
    const chartData = sortedNames.map(name => {
      const row = grouped[name]
      const total = row._total || 1
      const entry = { name }
      sortedKeys.forEach(k => {
        entry[k] = parseFloat(((row[k] || 0) / total * 100).toFixed(1))
      })
      entry._total = row._total
      return entry
    })

    return { chartData, keys: sortedKeys }
  }, [data, realKey, realKeyB, orderX, orderY])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const row = chartData.find(d => d.name === label)
    return (
      <div style={{
        background: '#fff', padding: '10px', border: '1px solid #ddd',
        borderRadius: '8px', fontSize: 12, color: '#000',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        maxWidth: 220,
      }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700 }}>
          {eixoX ? `${eixoX}: ` : ''}{label}
        </p>
        <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 11 }}>
          Total: {row?._total ?? 0} alunos
        </p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '1px 0', color: p.fill }}>
            {`${typsF ?? ''} ${p.dataKey} ${typsB ?? ''}: ${p.value}%`}
          </p>
        ))}
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
      <h3 style={{
        textAlign: 'center', color: 'black',
        fontSize: titleSize, margin: '0 0 4px', flexShrink: 0,
      }}>
        {title}
      </h3>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />

            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: Math.max(9, titleSize - 10) }}
              label={isMain ? {
                value: eixoY || 'Proporção (%)',
                position: 'insideBottom',
                dy: 12,
                style: { fontSize: Math.max(9, titleSize - 10), fill: '#374151', fontWeight: 500 },
              } : undefined}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: Math.max(9, titleSize - 10) }}
              label={isMain && eixoX ? {
                value: eixoX,
                angle: -90,
                position: 'insideLeft',
                dx: -10,
                style: { fontSize: Math.max(9, titleSize - 10), fill: '#374151', fontWeight: 500 },
              } : undefined}
            />

            {isMain && <Tooltip content={<CustomTooltip />} />}

            {isMain && (
              <Legend
                wrapperStyle={{ fontSize: Math.max(10, titleSize - 8) }}
                formatter={value => `${typsF ?? ''} ${value} ${typsB ?? ''}`}
              />
            )}

            {keys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={COLORS[i % COLORS.length]}
                radius={i === 0 ? [3, 0, 0, 3] : i === keys.length - 1 ? [0, 3, 3, 0] : [0, 0, 0, 0]}
              >
                {isMain && (
                  <LabelList
                    dataKey={key}
                    position="center"
                    style={{ fill: '#fff', fontSize: Math.max(8, titleSize - 12), fontWeight: 700 }}
                    formatter={v => v >= 8 ? `${v}%` : ''}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StackedBarChart
