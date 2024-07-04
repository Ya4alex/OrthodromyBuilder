import { useState } from 'react'

export interface Projection {
  name: 'WGS84' | 'СК-42' | 'Меркатор'
  EPSG: 'EPSG:4326' | 'EPSG:4284' | 'EPSG:3857'
}

export const ProjectionsDict: { [key: string]: Projection } = {
  WGS84: { name: 'WGS84', EPSG: 'EPSG:4326' },
  'СК-42': { name: 'СК-42', EPSG: 'EPSG:4284' },
  Меркатор: { name: 'Меркатор', EPSG: 'EPSG:3857' },
}

const useProjection = (initialProjection: keyof typeof ProjectionsDict) => {
  const [projection, setProjection] = useState<Projection>(ProjectionsDict[initialProjection])

  const changeProjection = (newProjection: keyof typeof ProjectionsDict) => {
    setProjection(ProjectionsDict[newProjection])
  }

  return { projection, changeProjection }
}

export default useProjection
