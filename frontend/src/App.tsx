import './App.css'
import useOrthodromy from './hooks/useOrthodromy'
import MapComponent from './components/Map'
import { useState } from 'react'
import useProjection from './hooks/useProjection'
import ProjectionSelector from './components/ProjectionSelector'

function App() {
  const { projection, changeProjection } = useProjection('WGS84')

  const f = (lat: number, lng: number) => {
    console.log(lat, lng)
  }

  return (
    <>
      <div>
        <h1>Current Projection</h1>
        <p>Name: {projection.name}</p>
        <p>{projection.EPSG}</p>

        
        <ProjectionSelector name='main' projection={projection} changeProjection={changeProjection}></ProjectionSelector>
      </div>
      <MapComponent projection={projection} onclickHangler={(x1, x2) => console.log(x1, x2)} />
    </>
  )
}

export default App
