import { useState } from 'react'

export interface OrthodrObject {
  name?: string
  nodes: [number, number][] // узлы
  color: string
}


interface addOrthodromy {
  lineString: string
  color: string
}

const useOrthodromy = () => {
  const [orthodromies, setOrthodromies] = useState<OrthodrObject[]>([])

  const addOrthodromy = ({ lineString, color }: addOrthodromy) => {
    const unstring = lineString.replace('LINESTRING(', '').replace(')', '').split(', ')
    const nodes = unstring.map((coordinate) => {
      const [lng, lat] = coordinate.split(' ')
      return [parseFloat(lat), parseFloat(lng)]
    }) as [number, number][]

    console.log(nodes)

    const newOrthodromy: OrthodrObject = {
      nodes,
      color,
    }

    setOrthodromies((prevCoordinates) => [...prevCoordinates, newOrthodromy])
  }

  const removeCoordinate = (index: number) => {
    setOrthodromies((prevCoordinates) => prevCoordinates.filter((_, i) => i !== index))
  }

  return { orthodromies, addOrthodromy, removeCoordinate }
}

export default useOrthodromy
