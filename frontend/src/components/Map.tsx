import useProjection, { Projection } from '../hooks/useProjection'

import React, { useRef, useEffect, useState } from 'react'
import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import ProjectionSelector from './ProjectionSelector'

import { transform } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import { userFormData } from './Form'
import VectorSource from 'ol/source/Vector'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Text from 'ol/style/Text'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import iconUrl from '../../public/pin.png'

interface MapComponentProps {
  projection: Projection
  onclickHangler: (lat: number, lng: number) => void
  formData: userFormData
}

const MapComponent: React.FC<MapComponentProps> = ({ projection, onclickHangler, formData }) => {
  const { projection: mapProjection, changeProjection: changeMapProjection } = useProjection('Меркатор')
  const mapElement = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [vectorSource] = useState(new VectorSource())
  const point1Feature = useRef(new Feature())
  const point2Feature = useRef(new Feature())

  const updateOrAddFeature = (feature: Feature, coordinates: Coordinate, labelText: string) => {
    const existingFeatures = vectorSource.getFeatures()
    if (!existingFeatures.includes(feature)) {
      vectorSource.addFeature(feature)
    }

    feature.setGeometry(new Point(coordinates))

    // Create custom style with an icon and text
    const style = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: iconUrl,
        scale: 0.8,
      }),
      text: new Text({
        text: labelText,
        font: '20px Arial',
        offsetY: -37, // Offset text vertically above the icon
        fill: new Fill({ color: '#ffffff' }),
        stroke: new Stroke({ color: '#000000', width: 2 }),
      }),
    })

    feature.setStyle(style)
  }

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

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      })

      mapRef.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        view: view,
      })
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
      }
    }
  }, [mapProjection, vectorSource])

  useEffect(() => {
    const coordinates1 = transform([formData.point1_lng, formData.point1_lat], projection.EPSG, mapProjection.EPSG)
    const coordinates2 = transform([formData.point2_lng, formData.point2_lat], projection.EPSG, mapProjection.EPSG)

    updateOrAddFeature(point1Feature.current, coordinates1, '1')
    updateOrAddFeature(point2Feature.current, coordinates2, '2')
  }, [formData, projection, mapProjection])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('click', (event) => {
        console.log(event.coordinate, mapProjection.name, '->', projection.name)
        const coordinate = transform(event.coordinate, mapProjection.EPSG, projection.EPSG)
        onclickHangler(coordinate[0], coordinate[1])
      })
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
