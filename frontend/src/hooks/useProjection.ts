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

export type ProjectionChangeArg =
  | keyof typeof ProjectionsDict
  | ((prevProjection: Projection) => keyof typeof ProjectionsDict)

const useProjection = (initialProjection: keyof typeof ProjectionsDict) => {
  const [projection, setProjection] = useState<Projection>(ProjectionsDict[initialProjection])

  const changeProjection = (arg: ProjectionChangeArg) => {
    const newProjectionKey = typeof arg === 'function' ? arg(projection) : arg
    const newProjection = ProjectionsDict[newProjectionKey]

    if (newProjection.name === projection.name) {
      return
    }

    setProjection(newProjection)
  }

  return { projection, changeProjection }
}

export default useProjection
