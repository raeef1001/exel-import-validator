import ExcelImporter from './components/ExcelImporter'
import './App.css'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Excel Importer</h1>
      <ExcelImporter />
    </div>
  )
}

export default App