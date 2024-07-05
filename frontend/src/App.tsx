import './App.css'
import MapComponent from './components/Map'
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

interface ResponseData {
  res: string
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

  const handleFormSubmit = async (formData: userFormData) => {
    const queryParams = {
      point1: `POINT(${formData.point1_lng} ${formData.point1_lat})`,
      point2: `POINT(${formData.point2_lng},${formData.point2_lat})`,
      cs: projection.EPSG,
      count: formData.count,
    } as RequestData
    try {
      const response = await axios.get<ResponseData>('/api/login', { params: queryParams })

      console.log('Ответ от сервера:', response.data)
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error)
    }
  }

  return (
    <>
      <div>
        <h1>Building orthodromy</h1>
        <p>Name: {projection.name}</p>
        <p>{projection.EPSG}</p>

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
      <MapComponent projection={projection} onclickHangler={handleMapClick} formData={formData} />
    </>
  )
}

export default App
