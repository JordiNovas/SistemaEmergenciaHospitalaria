import { User } from 'lucide-react'
import Calendar from './Calendar'
import { bloodTypes, sexOptions } from '../data/constants'
import { formatCedula, formatPhone } from '../utils/validators'

export default function PersonalDataForm({ formData, errors, onFieldChange }) {
  return (
    <div className="card">
      <h2 className="card__header">
        <User size={18} className="card__header-icon" />
        DATOS PERSONALES
      </h2>
      <div className="card__body">
        <div className={`form-group${errors.nombre ? ' form-group--error' : ''}`}>
          <label className="form-label">
            NOMBRE COMPLETO <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Nombre(s) Apellido Apellido"
            value={formData.nombre}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="field-error">{errors.nombre}</span>}
        </div>

        <div className={`form-group${errors.cedula ? ' form-group--error' : ''}`}>
          <label className="form-label">
            NÚMERO DE CÉDULA <span className="required">*</span>
            <span className="form-label-hint">000-0000000-0</span>
          </label>
          <input
            type="text"
            placeholder="000-0000000-0"
            value={formData.cedula}
            onChange={(e) => onFieldChange('cedula', formatCedula(e.target.value))}
            maxLength={12}
          />
          {errors.cedula && <span className="field-error">{errors.cedula}</span>}
        </div>

        <div className={`form-group${errors.fechaNacimiento ? ' form-group--error' : ''}`}>
          <label className="form-label">
            FECHA DE NACIMIENTO <span className="required">*</span>
          </label>
          <Calendar
            value={formData.fechaNacimiento}
            onSelect={(v) => onFieldChange('fechaNacimiento', v)}
          />
          {errors.fechaNacimiento && (
            <span className="field-error">{errors.fechaNacimiento}</span>
          )}
        </div>

        <div className="form-row">
          <div className={`form-group form-group--half${errors.tipoSangre ? ' form-group--error' : ''}`}>
            <label className="form-label">TIPO DE SANGRE <span className="required">*</span></label>
            <select
              value={formData.tipoSangre}
              onChange={(e) => onFieldChange('tipoSangre', e.target.value)}
            >
              {bloodTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.tipoSangre && <span className="field-error">{errors.tipoSangre}</span>}
          </div>
          <div className={`form-group form-group--half${errors.sexo ? ' form-group--error' : ''}`}>
            <label className="form-label">SEXO <span className="required">*</span></label>
            <select
              value={formData.sexo}
              onChange={(e) => onFieldChange('sexo', e.target.value)}
            >
              {sexOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.sexo && <span className="field-error">{errors.sexo}</span>}
          </div>
        </div>

        <div className={`form-group${errors.telefono ? ' form-group--error' : ''}`}>
          <label className="form-label">
            TELÉFONO DE CONTACTO <span className="required">*</span>
            <span className="form-label-hint">(809) 000-0000</span>
          </label>
          <input
            type="text"
            placeholder="(809) 000-0000"
            value={formData.telefono}
            onChange={(e) => onFieldChange('telefono', formatPhone(e.target.value))}
            maxLength={14}
          />
          {errors.telefono && <span className="field-error">{errors.telefono}</span>}
        </div>
      </div>
    </div>
  )
}
