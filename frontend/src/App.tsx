import './App.css'
import MapComponent, { OrthodromyParams } from './components/Map'
import useProjection, { ProjectionsDict } from './hooks/useProjection'
import OrhodromyForm, { userFormData } from './components/Form'
import { useState } from 'react'
import { transform } from 'ol/proj'
import axios from 'axios'

interface RequestData {
  point1: string
  point2: string
  cs: string
  count: number
}

function App() {
  const { projection, changeProjection } = useProjection('WGS84')
  const [formData, setFormData] = useState<userFormData>({
    point1_lng: 0,
    point1_lat: 0,
    point2_lng: 0,
    point2_lat: 0,
    count: 30,
  })
  const [currentPoint, setCurrentPoint] = useState<null | 'point1' | 'point2'>(null)
  const [orthodromy, setOrthodromy] = useState<OrthodromyParams>({ line: [], EPSG: projection.EPSG })

  const handleMapClick = (lng: number, lat: number) => {
    setCurrentPoint((current) => {
      if (current) {
        setFormData((prevData) => ({
          ...prevData,
          [`${current}_lng`]: lng,
          [`${current}_lat`]: lat,
        }))
        return null // Сбрасываем режим после установки точки
      }
      return current
    })
  }

  const changeProjectionWithTrans = (newProjection: keyof typeof ProjectionsDict) => {
    const newEPSG = ProjectionsDict[newProjection].EPSG
    if (newEPSG === projection.EPSG) return
    changeProjection((prevProjection) => {
      setFormData((pd) => {
        const p1 =
          pd.point1_lng && pd.point1_lat
            ? transform([pd.point1_lng, pd.point1_lat], prevProjection.EPSG, newEPSG)
            : [pd.point1_lng, pd.point1_lat]
        const p2 =
          pd.point2_lng && pd.point2_lat
            ? transform([pd.point2_lng, pd.point2_lat], prevProjection.EPSG, newEPSG)
            : [pd.point2_lng, pd.point2_lat]

        console.log(p1, p2)

        return { ...pd, point1_lng: p1[0], point1_lat: p1[1], point2_lng: p2[0], point2_lat: p2[1] }
      })
      return newProjection
    })

    setCurrentPoint(null)
  }

  const handleFormSubmit = async (form: userFormData, projEPSG: string) => {
    const queryParams = {
      point1: `POINT(${form.point1_lng} ${form.point1_lat})`,
      point2: `POINT(${form.point2_lng} ${form.point2_lat})`,
      cs: projEPSG,
      count: form.count,
    } as RequestData
    try {
      const response = await axios.get<string>('/api/orthodromy', { params: queryParams })

      const unstring = response.data.replace('LINESTRING(', '').replace(')', '').split(', ')
      let nodes = unstring.map((coordinate) => {
        return coordinate.split(' ').map((x) => parseFloat(x))
      }) as [number, number][]

      let fly180 = Math.abs(nodes[0][0] - nodes[nodes.length - 1][0]) > 180
      if (fly180) {
        console.log('fly180', fly180)
        console.log(nodes)
        nodes = nodes.map((node) => {
          if (node[0] > 0) return node
          return [node[0] + 360, node[1]]
        })
        console.log(nodes)
      }
      setOrthodromy(() => ({
        line: nodes,
        EPSG: projEPSG,
      }))
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error)
    }
  }

  return (
    <>
      <div>
        <h1>Building orthodromy</h1>

        <OrhodromyForm
          formData={formData}
          setFormData={setFormData}
          projection={projection}
          changeProjection={changeProjectionWithTrans}
          currentPoint={currentPoint}
          setCurrentPoint={setCurrentPoint}
          handleFormSubmit={handleFormSubmit}
        />
      </div>
      <MapComponent
        projection={projection}
        onclickHangler={handleMapClick}
        formData={formData}
        orthodromy={orthodromy}
      />
    </>
  )
}

export default App
