import React, { useState, useEffect } from 'react'
import { useSheetData } from '../hooks/useSheetData'

const TEMAS = [
  { value: 'geral', label: 'Geral' },
  { value: 'desempenho', label: 'Desempenho' },
  { value: 'habitos', label: 'Hábitos de Estudo' },
  { value: 'perfil', label: 'Perfil dos Estudantes' },
  { value: 'emocional', label: 'Problemas emocionais' },
  { value: 'ajuda', label: 'Busca por ajuda' },
]

const CORES = [
  { value: 'default', label: 'Padrão' },
  { value: 'Tritanopia', label: 'Tritanopia' },
  { value: 'Deuteranopia', label: 'Deuteranopia' },
  { value: 'Protanopia', label: 'Protanopia' },
]

function SideMenu() {
  const {
    tema, setTema,
    cores, setCores,
    filtros, aplicarFiltros, limparFiltros,
    opcoes, data, rawData
  } = useSheetData()

  const [localFiltros, setLocalFiltros] = useState({ ...filtros })
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isMobile || !mobileOpen) return
    const handler = (e) => {
      if (!e.target.closest('#side-menu-panel') && !e.target.closest('#mobile-menu-trigger')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile, mobileOpen])

  const temFiltroAtivo = Object.values(filtros).some(v => v !== '')

  function handleAplicar() {
    aplicarFiltros(localFiltros)
    setFiltroAberto(false)
    if (isMobile) setMobileOpen(false)
  }

  function handleLimpar() {
    const vazio = { idade: '', curso: '', trabalho: '', semestre: '', desempenho: '' }
    setLocalFiltros(vazio)
    limparFiltros()
    setFiltroAberto(false)
  }

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          id="mobile-menu-trigger"
          onClick={() => setMobileOpen(o => !o)}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 1100,
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
          }} />
        )}

        <div id="side-menu-panel" style={{
          position: 'fixed', top: 0, left: 0, zIndex: 1060,
          width: 260, height: '100dvh',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          padding: '70px 16px 24px',
          boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
          overflowY: 'auto',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <MenuContent
            tema={tema} setTema={(v) => { setTema(v); setMobileOpen(false) }}
            cores={cores} setCores={setCores}
            filtros={filtros} localFiltros={localFiltros} setLocalFiltros={setLocalFiltros}
            filtroAberto={filtroAberto} setFiltroAberto={setFiltroAberto}
            temFiltroAtivo={temFiltroAtivo}
            handleAplicar={handleAplicar} handleLimpar={handleLimpar}
            opcoes={opcoes} data={data} rawData={rawData}
          />
        </div>
      </>
    )
  }

  // ── Desktop ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: collapsed ? '60px' : '240px',
      minWidth: collapsed ? '60px' : '240px',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: collapsed ? '16px 8px' : '24px 16px',
      boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
      transition: 'width 0.25s ease, min-width 0.25s ease, padding 0.25s ease',
      flexShrink: 0,
    }}>

      {/* Toggle — no topo, pill com gradiente e seta */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expandir' : 'Recolher'}
        style={{
          alignSelf: collapsed ? 'center' : 'flex-end',
          marginBottom: 16,
          width: collapsed ? 36 : 68,
          height: 28,
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.3,
          transition: 'all 0.25s ease',
          flexShrink: 0,
          padding: '0 8px',
        }}
      >
        {/* Seta SVG que vira */}
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
          }}
        >
          <polyline
            points="3,2 8,6 3,10"
            fill="none" stroke="white"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        {!collapsed && <span>Menu</span>}
      </button>

      {!collapsed && (
        <MenuContent
          tema={tema} setTema={setTema}
          cores={cores} setCores={setCores}
          filtros={filtros} localFiltros={localFiltros} setLocalFiltros={setLocalFiltros}
          filtroAberto={filtroAberto} setFiltroAberto={setFiltroAberto}
          temFiltroAtivo={temFiltroAtivo}
          handleAplicar={handleAplicar} handleLimpar={handleLimpar}
          opcoes={opcoes} data={data} rawData={rawData}
        />
      )}

      {/* Ícone mínimo colapsado */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📊</div>
          {TEMAS.map(t => (
            <button key={t.value} onClick={() => setTema(t.value)} title={t.label} style={{
              width: 8, height: 8, borderRadius: '50%', padding: 0, border: 'none',
              background: tema === t.value ? '#6366f1' : '#334155',
              cursor: 'pointer', transition: 'background 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Conteúdo compartilhado ────────────────────────────────────────────────────
function MenuContent({
  tema, setTema, cores, setCores,
  filtros, localFiltros, setLocalFiltros,
  filtroAberto, setFiltroAberto,
  temFiltroAtivo, handleAplicar, handleLimpar,
  opcoes, data, rawData,
}) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>📊</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Saúde Mental</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Bem-estar Acadêmico</div>
          </div>
        </div>
        <div style={{
          marginTop: 14, background: '#1e293b', borderRadius: 8,
          padding: '8px 12px', border: '1px solid #334155',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#94a3b8', fontSize: 11 }}>Respostas</span>
          <span style={{ color: '#6366f1', fontWeight: 700 }}>
            {Object.values(filtros).some(v => v !== '') ? `${data.length} / ${rawData.length}` : rawData.length}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Tema</p>
        {TEMAS.map(t => (
          <button key={t.value} onClick={() => setTema(t.value)} style={{
            width: '100%',
            background: tema === t.value ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'transparent',
            border: 'none', padding: 8, textAlign: 'left',
            color: tema === t.value ? '#fff' : '#94a3b8',
            cursor: 'pointer', borderRadius: 6,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#64748b', fontSize: 11 }}>Cores</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {CORES.map(c => (
            <button key={c.value} onClick={() => setCores(c.value)} style={{
              background: cores === c.value ? '#334155' : 'transparent',
              border: '1px solid #334155', color: '#94a3b8',
              fontSize: 11, padding: 6, borderRadius: 6,
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
          Filtros {temFiltroAtivo && <span style={{ color: '#f59e0b', marginLeft: 4 }}>●</span>}
        </p>
        <button onClick={() => setFiltroAberto(o => !o)} style={{
          width: '100%', background: filtroAberto ? '#334155' : '#1e293b',
          border: '1px solid #334155', borderRadius: 8, padding: '8px 12px',
          color: '#e2e8f0', fontSize: 13, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>⚙️ Filtrar dados</span>
          <span style={{ transform: filtroAberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </button>

        {filtroAberto && (
          <div style={{
            marginTop: 8, background: '#1e293b', borderRadius: 8,
            border: '1px solid #334155', padding: '12px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              { key: 'idade', label: 'Todas Idades', items: opcoes.idades },
              { key: 'curso', label: 'Todos Cursos', items: opcoes.cursos },
              { key: 'trabalho', label: 'Trabalho', items: opcoes.trabalhos },
              { key: 'semestre', label: 'Semestre', items: opcoes.semestres },
              { key: 'desempenho', label: 'Desempenho', items: opcoes.desempenho },
            ].map(({ key, label, items }) => (
              <select key={key} value={localFiltros[key]}
                onChange={e => setLocalFiltros(p => ({ ...p, [key]: e.target.value }))}
                style={selectStyle}>
                <option value="">{label}</option>
                {items.map(v => <option key={v}>{v}</option>)}
              </select>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={handleAplicar} style={{
                flex: 1, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: 6, padding: '7px 0',
                color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Aplicar</button>
              <button onClick={handleLimpar} style={{
                flex: 1, background: '#334155', border: 'none', borderRadius: 6,
                padding: '7px 0', color: '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Limpar</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const selectStyle = {
  width: '100%', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 6, padding: '6px 8px', color: '#e2e8f0', fontSize: 12, outline: 'none',
}

export default SideMenu