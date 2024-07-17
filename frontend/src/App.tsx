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
    point1_lat: 37,
    point1_lng: 55,
    point2_lat: -82,
    point2_lng: 23,
    count: 100,
  })
  const [currentPoint, setCurrentPoint] = useState<null | 'point1' | 'point2'>(null)
  const [orthodromy, setOrthodromy] = useState<OrthodromyParams>({ line: [], EPSG: projection.EPSG })

  const handleMapClick = ( lat: number, lng: number,) => {
    setCurrentPoint((current) => {
      if (current) {
        setFormData((prevData) => ({
          ...prevData,
          [`${current}_lat`]: lat,
          [`${current}_lng`]: lng,
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
          pd.point1_lat && pd.point1_lng
            ? transform([pd.point1_lat, pd.point1_lng], prevProjection.EPSG, newEPSG)
            : [pd.point1_lat, pd.point1_lng]
        const p2 =
          pd.point2_lat && pd.point2_lng
            ? transform([pd.point2_lat, pd.point2_lng], prevProjection.EPSG, newEPSG)
            : [pd.point2_lat, pd.point2_lng]

        return { ...pd, point1_lat: p1[0], point1_lng: p1[1], point2_lat: p2[0], point2_lng: p2[1] }
      })
      return newProjection
    })

    setCurrentPoint(null)
  }

  const handleFormSubmit = async (form: userFormData, projEPSG: string) => {
    const queryParams = {
      point1: `POINT(${form.point1_lat} ${form.point1_lng})`,
      point2: `POINT(${form.point2_lat} ${form.point2_lng})`,
      cs: projEPSG,
      count: form.count,
    } as RequestData
    try {
      const response = await axios.get<string>('/api/orthodromy', { params: queryParams })

      const unstring = response.data.replace('LINESTRING(', '').replace(')', '').split(', ')
      let nodes = unstring.map((coordinate) => {
        return coordinate.split(' ').map((x) => parseFloat(x))
      }) as [number, number][]

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
