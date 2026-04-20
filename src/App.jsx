import './App.css'
import SideMenu from './components/SideMenu'
import BodyCharts from './components/BodyCharts'
import { DataProvider } from './hooks/useSheetData'

function App() {
  return (
    <DataProvider>
      <div className="d-flex" style={{ minHeight: '100vh', background: '#f1f5f9' }}>
        <SideMenu />
        <BodyCharts />
      </div>
    </DataProvider>
  )
}

export default App
