import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { OrthodrObject } from '../hooks/useOrthodromy'


interface MapComponentProps {
    orthodromies: OrthodrObject[]
}

const MapComponent = ({ orthodromies }: MapComponentProps) => {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {orthodromies.map((orthodromy, index) => (
        <Polyline key={index} positions={orthodromy.nodes} color={orthodromy.color} />
      ))}
    </MapContainer>
  )
}

export default MapComponent
