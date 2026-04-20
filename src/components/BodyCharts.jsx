import React, { useState, useMemo,useEffect } from 'react'
import { useSheetData } from '../hooks/useSheetData'
import PieChartConfig from './Charts/PieChartConfig'
import BarChartConfig from './Charts/BarChart'
import ScatterChartConfig from './Charts/ScatterChartConfig'
import HeatmapChart from './Charts/HeatmapChart'
import RadarChartConfig from './Charts/RadarChartConfig'
import LineChartConfig from './Charts/LineChartConfig'
import ChartsConfig from './Charts/Config/ChartsConfig'

const chartMap = {
  pie:     PieChartConfig,
  donnut:  PieChartConfig,
  bar:     BarChartConfig,
  scatter: ScatterChartConfig,
  heatmap: HeatmapChart,
  radar:   RadarChartConfig,
  line:    LineChartConfig,
}

function RenderChart(chart, titleSize, isMain = false) {
  const Component = chartMap[chart.type]
  if (!Component) return null
  return (
    <Component
      question={chart.question}
      questionB={chart.questionB}
      title={chart.title}
      titleSize={titleSize}
      type={chart.type}
      questionX={chart.questionX}
      questionY={chart.questionY}
      groupBy={chart.groupBy}
      axes={chart.axes}
      eixoX={chart.eixoX}
      eixoY={chart.eixoY}
      suffix={chart.suffix}
      isMain={isMain}
      order={chart.order}
      orderX={chart.orderX}
      orderY={chart.orderY}
      typsF={chart.typsF || ""}
      typsB={chart.typsB || ""}
    />
  )
}

function BodyCharts() {
  const { tema } = useSheetData()
  
 

  const filtered = useMemo(() => {
    const cat = tema || 'geral'
    return ChartsConfig.filter(c => c.categories.includes(cat))
  }, [tema])

  const [isMobile, setIsMobile] = useState(false)
  const [order, setOrder] = useState([])
  const [page, setPage] = useState(0)
const pageSize = 5

const displayCharts = useMemo(() => {
  const base =
    order.length === filtered.length &&
    order.every(id => filtered.some(c => c.id === id))
      ? order.map(id => filtered.find(c => c.id === id))
      : filtered

  const start = page * pageSize
  return base.slice(start, start + pageSize)
}, [filtered, order, page,])

  function bringToFront(index) {
  const globalIndex = page * pageSize + index

  const newOrder = [...order]

  const [item] = newOrder.splice(globalIndex, 1)
  newOrder.unshift(item)

  setOrder(newOrder)
}

  useEffect(() => {
  if (filtered.length > 0) {
    setOrder(filtered.map(c => c.id))
  }

}, [filtered])
useEffect(() => {
  setPage(0)


},[tema])
 useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 968)
  }

  handleResize() // seta valor inicial

  window.addEventListener("resize", handleResize)

  return () => {
    window.removeEventListener("resize", handleResize)
  }
}, [])


  return (
    <div className="container-fluid py-3 px-3" style={{ flex: 1, overflowY: 'auto' }}>

      {displayCharts.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>Nenhum gráfico para este tema.</p>
        </div>
      )}

      {displayCharts.length > 0 && (
        <div className="row g-3 align-items-stretch">
          <div className="col-12 col-lg-8">
            <div className="rounded shadow p-3 chart-box big" style={{ background: '#fff' }}>
              {RenderChart(displayCharts[0], 22, !isMobile)}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="row g-3">
              {[3, 4].map(i => displayCharts[i] && (
                <div key={displayCharts[i].id} className="col-12">
                  <div className="rounded shadow p-3 chart-box-m"
                    style={{ background: '#fff', cursor: 'pointer' }}
                    onClick={() => bringToFront(i)}>
                    {RenderChart(displayCharts[i], 14, false)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {displayCharts.length > 1 && (
        <div className="row g-3 mt-0">
          {[1, 2].map(i => displayCharts[i] && (
            <div key={displayCharts[i].id} className="col-12 col-lg-6">
              <div className="rounded shadow p-3 chart-box"
                style={{ background: '#fff', cursor: 'pointer' }}
                onClick={() => bringToFront(i)}>
                {RenderChart(displayCharts[i], 17, false)}
              </div>
            </div>
          ))}
        </div>
      )}

   {filtered.length > pageSize && (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    marginTop: 15
  }}>
    <button
      onClick={() => setPage(p => Math.max(p - 1, 0))}
      disabled={page === 0}
    >
      {"<"}
    </button>

    <button
      onClick={() =>
        setPage(p => {
          const maxPage = Math.floor((filtered.length - 1) / pageSize)
          return Math.min(p + 1, maxPage)
        })
      }
      disabled={(page + 1) * pageSize >= filtered.length}
    >
      {">"}
    </button>
  </div>
)}
    </div>
  )
}

export default BodyCharts