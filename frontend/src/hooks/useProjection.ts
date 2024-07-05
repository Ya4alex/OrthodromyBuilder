import { transform } from 'ol/proj'
import { useState } from 'react'

export const DEGREE_HALH_P = 180
export const METRIC_HALF_P = 20037508.34

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

export const transformLine = (line: [number, number][], src: string, dst: string) => {
  if (line.length === 0) return []
  let nodes = line.map((coordinate) => transform(coordinate, src, dst))
  console.log(nodes)

  let halfP = DEGREE_HALH_P
  if (dst == 'EPSG:3857') {
    halfP = METRIC_HALF_P
  }

  let fly180 = Math.abs(nodes[0][0] - nodes[nodes.length - 1][0]) > halfP
  if (fly180) {
    console.log('fly180', fly180)
    console.log(nodes)
    nodes = nodes.map((node) => {
      if (node[0] > 0) return node
      return [node[0] + halfP * 2, node[1]]
    })
    console.log(nodes)
  }
  return nodes
}
