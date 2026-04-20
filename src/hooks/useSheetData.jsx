import { useEffect, useState, useContext, createContext, useCallback, useMemo } from 'react'
import sheetsData from '../axios/config'

// ─── Context ────────────────────────────────────────────────────────────────
export const DataContext = createContext(null)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Dado um array de objetos (linhas da planilha), encontra a chave real
 * cuja string contenha `fragment` (case-insensitive).
 * Retorna a chave completa ou null.
 */
export function findKey(row, fragment) {
  if (!row || !fragment) return null
  const lower = fragment.toLowerCase()
  return Object.keys(row).find(k => k.toLowerCase().includes(lower)) ?? null
}

/**
 * Constrói um mapa { apelido → chave_real } a partir da primeira linha de dados.
 * Os apelidos são os mesmos usados em ChartsConfig (Q.*).
 * Se não encontrar, o apelido fica mapeado para null.
 */
function buildKeyMap(firstRow) {
  if (!firstRow) return {}

  // Fragmentos que identificam cada coluna — ajuste conforme os headers reais
  const fragments = {
    IDADE:        'Qual a sua idade',
    CURSO:        'Qual o seu curso',
    SEMESTRE:     'Qual é o seu semestre atual',
    TRABALHA:     'Você trabalha',
    ESTRESSE:     'Com que frequência você se sente estressado',
    ANSIEDADE_PZ: 'Com que frequência você sente ansiedade relacionada a prazos',
    SONO:         'Nos últimos 30 dias',
    BEM_ESTAR:    'Você sente que o estresse acadêmico afeta seu bem-estar',
    HORAS:        'Quantas horas por dia você dedica aos estudos',
    DEIXOU:       'Você já deixou de fazer alguma atividade',
    CARGA:        'Você sente que a carga de estudos é maior',
    TAREFAS:      'Com que frequência você sente que tem tarefas',
    MUDANCA:      'Nos últimos semestres',
    DESEMPENHO:   'Como você avalia seu desempenho',
    BUSCA_AJUDA1:  'Quando você enfrenta problemas emocionais',
    BUSCA_AJUDA2:  'Você sente que recebe suporte suficiente da instituição',
    SUPORTE:      'O que mais te impede de buscar ajuda quando precisa',
  }

  const map = {}
  for (const [alias, fragment] of Object.entries(fragments)) {
    map[alias] = findKey(firstRow, fragment)
  }
  return map
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function DataProvider({ children }) {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  // keyMap: { ALIAS → 'Texto real da coluna na planilha' }
  const [keyMap, setKeyMap] = useState({})

  const [filtros, setFiltros] = useState({ idade: '', curso: '', trabalho: '', semestre: '' })
  const [tema,    setTema]    = useState('geral')
  const [cores,   setCores]   = useState('default')
useEffect(() => {
  const load = async () => {
    try {
      setLoading(true)

      const rows = await sheetsData() // 👈 agora correto

      if (rows?.length) {
        setKeyMap(buildKeyMap(rows[0]))
      }

      setRawData(rows ?? [])

    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  load()
}, [])
  // ── Filtros dinâmicos (usa keyMap) ──────────────────────────────────────
  const data = useMemo(() => {
    const kIdade    = keyMap.IDADE
    const kCurso    = keyMap.CURSO
    const kTrabalha = keyMap.TRABALHA
    const kSemestre = keyMap.SEMESTRE
    const kDesempenho = keyMap.DESEMPENHO

    return rawData.filter(item => {
      if (filtros.idade    && kIdade    && (item[kIdade]    || '').trim() !== filtros.idade)    return false
      if (filtros.curso    && kCurso    && (item[kCurso]    || '').trim() !== filtros.curso)    return false
      if (filtros.trabalho && kTrabalha && (item[kTrabalha] || '').trim() !== filtros.trabalho) return false
      if (filtros.semestre && kSemestre && (item[kSemestre] || '').trim() !== filtros.semestre) return false
      if (filtros.desempenho && kDesempenho && (item[kDesempenho] || '').trim() !== filtros.desempenho) return false
      return true
    })
  }, [rawData, filtros, keyMap])

  // ── Opções dinâmicas para os selects ────────────────────────────────────
  const opcoes = useMemo(() => {
    const uniq = (alias) => {
      const k = keyMap[alias]
      if (!k) return []
      return [...new Set(rawData.map(i => (i[k] || '').trim()).filter(Boolean))].sort()
    }
    return {
      idades:    uniq('IDADE'),
      cursos:    uniq('CURSO'),
      trabalhos: uniq('TRABALHA'),
      semestres: uniq('SEMESTRE'),
      desempenho: uniq('DESEMPENHO'),
    }
  }, [rawData, keyMap])

  const aplicarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }))
  }, [])

  const limparFiltros = useCallback(() => {
    setFiltros({ idade: '', curso: '', trabalho: '', semestre: '' ,desempenho: ''})
  }, [])

  return (
    <DataContext.Provider value={{
      data, rawData, loading, error,
      keyMap,                // expõe o mapa para os gráficos usarem
      filtros, aplicarFiltros, limparFiltros,
      tema, setTema,
      cores, setCores,
      opcoes,
    }}>
      {children}
    </DataContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSheetData() {
  return useContext(DataContext)
}
