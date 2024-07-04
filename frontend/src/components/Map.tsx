import useProjection, { Projection } from '../hooks/useProjection'

import React, { useRef, useEffect } from 'react'
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import ProjectionSelector from './ProjectionSelector'

import { transform } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'

interface MapComponentProps {
  projection: Projection
  // orthodromies: OrthodrObject[]
  onclickHangler: (lat: number, lng: number) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ projection, onclickHangler }) => {
  const { projection: mapProjection, changeProjection: changeMapProjection } = useProjection('Меркатор')
  const mapElement = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (mapElement.current) {
      const oldView = mapRef.current?.getView()

      const view = new View({
        projection: mapProjection.EPSG,
        center: oldView
          ? transform(oldView.getCenter() as Coordinate, oldView?.getProjection(), mapProjection.EPSG)
          : [0, 0],
        zoom: oldView ? oldView.getZoom() : 3.7,
      })

      mapRef.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: view,
      })

      // Click event handling
      mapRef.current.on('click', (event) => {
        console.log(mapProjection.name, '->', projection.name)
        console.log(event.coordinate)
        const coordinate = transform(event.coordinate, mapProjection.EPSG, projection.EPSG)
        onclickHangler(coordinate[0], coordinate[1])
      })
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
      }
    }
  }, [mapProjection, projection])

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div ref={mapElement} style={{ width: '100%', height: '100vh' }}></div>
      <ProjectionSelector
        style={{ position: 'absolute', top: 10, right: 10 }}
        name='MapProjection'
        projection={mapProjection}
        changeProjection={changeMapProjection}></ProjectionSelector>
    </div>
  )
}

export default MapComponent
