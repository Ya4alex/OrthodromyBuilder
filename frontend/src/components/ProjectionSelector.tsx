import React from 'react'
import { Projection, ProjectionsDict } from '../hooks/useProjection'

interface ProjectionSelectorProps extends React.HTMLAttributes<HTMLSelectElement> {
  name?: string
  projection: Projection
  changeProjection: (newProjection: keyof typeof ProjectionsDict) => void
  className?: string
}

const ProjectionSelector: React.FC<ProjectionSelectorProps> = ({
  className,
  projection,
  changeProjection,
  name,
  ...props
}) => {
  const handleProjectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjection = event.target.value as keyof typeof ProjectionsDict
    changeProjection(newProjection)
  }

  return (
    <select
      className={`${className} projection-selector`}
      value={projection.name}
      onChange={handleProjectionChange}
      {...props}>
      {Object.keys(ProjectionsDict).map((key) => (
        <option key={`${name}-${key}`} value={key}>
          {ProjectionsDict[key as keyof typeof ProjectionsDict].name}
        </option>
      ))}
    </select>
  )
}

export default ProjectionSelector
