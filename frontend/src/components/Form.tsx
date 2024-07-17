import './Form.css'
import React from 'react'
import { Projection, ProjectionsDict } from '../hooks/useProjection'
import ProjectionSelector from './ProjectionSelector'

export interface userFormData {
  point1_lat: number
  point1_lng: number
  point2_lat: number
  point2_lng: number
  count: number
}

interface OrhodromyFormProps {
  formData: userFormData
  setFormData: (oldData: userFormData) => void
  projection: Projection
  changeProjection: (newProjection: keyof typeof ProjectionsDict) => void
  currentPoint: null | 'point1' | 'point2'
  setCurrentPoint: (point: 'point1' | 'point2' | null) => void
  handleFormSubmit: (formData: userFormData, projESPG: string) => void
}

const OrhodromyForm: React.FC<OrhodromyFormProps> = ({
  formData,
  setFormData,
  projection,
  changeProjection,
  currentPoint,
  setCurrentPoint,
  handleFormSubmit,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleFormSubmit(formData, projection.EPSG)
  }

  return (
    <form onSubmit={handleSubmit} className='orhodromy-form'>
      <label>
        <h4>Projection:</h4>
        <ProjectionSelector name='main' projection={projection} changeProjection={changeProjection} />
      </label>
      <p></p>
      <label>
        <button
          type='button'
          className={` ${
            currentPoint == 'point1' ? 'orhodromy-form-button-picker-active' : ''
          } orhodromy-form-button-picker`}
          onClick={() => setCurrentPoint('point1')}>
          📍
        </button>
        <h4 className=''>Point1:</h4>
      </label>
      <p>
        <label>
          <span>lat:</span>
          <input type='number' name='point1_lat' value={formData.point1_lat} onChange={handleChange} required />
        </label>
        <label>
          <span>lng:</span>
          <input type='number' name='point1_lng' value={formData.point1_lng} onChange={handleChange} required />
        </label>
      </p>

      <label>
        <button
          type='button'
          className={` ${
            currentPoint == 'point2' ? 'orhodromy-form-button-picker-active' : ''
          } orhodromy-form-button-picker`}
          onClick={() => setCurrentPoint('point2')}>
          📍
        </button>
        <h4>Point2:</h4>
      </label>
      <p>
        <label>
          <span>lat1:</span>
          <input type='number' name='point2_lat' value={formData.point2_lat} onChange={handleChange} required />
        </label>
        <label>
          <span>lng:</span>
          <input type='number' name='point2_lng' value={formData.point2_lng} onChange={handleChange} required />
        </label>
      </p>
      <h4>Params:</h4>
      <p>
        <label>
          <span style={{ minWidth: '3em' }}>nodes:</span>
          <input type='number' name='count' value={formData.count} onChange={handleChange} required />
        </label>
      </p>
      <button type='submit'>Submit</button>
    </form>
  )
}

export default OrhodromyForm
