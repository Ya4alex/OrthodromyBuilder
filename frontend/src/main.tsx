import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import * as olProj from 'ol/proj'

import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'

// Определение проекции EPSG:4284 (СК-42)
proj4.defs(
  'EPSG:4284',
  '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,-0.35,-0.79,-0.22 +no_defs +type=crs',
)
// Регистрация проекции в OpenLayers
register(proj4)

// Определение преобразования между СК-42 и WGS84
const sk42ToWGS84Transform = olProj.getTransform('EPSG:4284', 'EPSG:4326')
const wgs84ToSK42Transform = olProj.getTransform('EPSG:4326', 'EPSG:4284')

export { sk42ToWGS84Transform, wgs84ToSK42Transform }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
