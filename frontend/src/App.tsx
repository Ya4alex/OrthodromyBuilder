import './App.css'
import useOrthodromy from './hooks/useOrthodromy'
import MapComponent from './components/Map'

function App() {
  const { orthodromies, addOrthodromy, removeCoordinate } = useOrthodromy()
  return (
    <>
      <MapComponent orthodromies={orthodromies}></MapComponent>
    </>
  )
}

export default App
