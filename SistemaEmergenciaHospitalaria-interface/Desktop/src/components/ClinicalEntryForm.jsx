import { Clock, FileText, Heart, Activity } from 'lucide-react'
import TriageSelector from './TriageSelector'
import { modoLlegadaOptions, signosVitalesFields, alergiasOptions, bypassTriage } from '../data/constants'

export default function ClinicalEntryForm({
  formData,
  errors,
  onFieldChange,
}) {
  const bypass = bypassTriage(formData.triage)

  return (
    <>
      <div className="card">
        <h2 className="card__header">
          <FileText size={18} className="card__header-icon" />
          ENTRADA CLÍNICA
        </h2>
        <div className="card__body">
          <div className="form-row">
            <div className={`form-group form-group--half${errors.horaLlegada ? ' form-group--error' : ''}`}>
              <label className="form-label">
                HORA DE LLEGADA <span className="required">*</span>
              </label>
              <div className="input-group">
                <input
                  type="time"
                  value={formData.horaLlegada}
                  onChange={(e) => onFieldChange('horaLlegada', e.target.value)}
                />
                <span className="input-group__icon">
                  <Clock size={16} />
                </span>
              </div>
              {errors.horaLlegada && <span className="field-error">{errors.horaLlegada}</span>}
            </div>
            <div className={`form-group form-group--half${errors.modoLlegada ? ' form-group--error' : ''}`}>
              <label className="form-label">MODO DE LLEGADA <span className="required">*</span></label>
              <select
                value={formData.modoLlegada}
                onChange={(e) => onFieldChange('modoLlegada', e.target.value)}
              >
                {modoLlegadaOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.modoLlegada && <span className="field-error">{errors.modoLlegada}</span>}
            </div>
          </div>

          <div className={`form-group${errors.triage ? ' form-group--error' : ''}`}>
            <label className="form-label">
              NIVEL DE TRIAGE <span className="required">*</span>
            </label>
            <TriageSelector
              value={formData.triage}
              onChange={(v) => onFieldChange('triage', v)}
            />
            {errors.triage && <span className="field-error">{errors.triage}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">ALERGIAS CONOCIDAS</label>
            <div className="alergias-grid">
              {alergiasOptions.map((alergia) => {
                const seleccionadas = formData.alergias ? formData.alergias.split(', ') : []
                const activa = seleccionadas.includes(alergia)
                return (
                  <label key={alergia} className={`alergia-checkbox${activa ? ' alergia-checkbox--active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={activa}
                      onChange={() => {
                        const nuevas = activa
                          ? seleccionadas.filter((a) => a !== alergia)
                          : [...seleccionadas, alergia]
                        onFieldChange('alergias', nuevas.join(', '))
                      }}
                    />
                    <span>{alergia}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div
            className={`form-group form-group--textarea${errors.motivoConsulta ? ' form-group--error' : ''}`}
          >
            <label className="form-label">
              MOTIVO DE CONSULTA <span className="required">*</span>
            </label>
            <textarea
              placeholder="Síntomas principales, tiempo de evolución, antecedentes relevantes..."
              maxLength={1000}
              value={formData.motivoConsulta}
              onChange={(e) => onFieldChange('motivoConsulta', e.target.value)}
            />
            <span className="char-counter">
              {formData.motivoConsulta.length}/1000
            </span>
            {errors.motivoConsulta && (
              <span className="field-error">{errors.motivoConsulta}</span>
            )}
          </div>
        </div>
      </div>

      {bypass ? (
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', padding: '2rem' }}>
            <Activity size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
              Signos Vitales Omitidos
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Nivel de triage {formData.triage === 'I' ? 'I (Rojo)' : 'II (Naranja)'} — clasificación por ojo clínico.
              El paciente pasa directamente a atención prioritaria.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="card__header">
            <Heart size={18} className="card__header-icon" />
            SIGNOS VITALES
          </h2>
          <div className="card__body">
            <div className="vital-signs-grid">
              {signosVitalesFields.map((field) => (
                <div key={field.key} className={`vital-sign${errors[field.key] ? ' vital-sign--error' : ''}`}>
                  <label className="vital-sign__label">{field.label} <span style={{ color: '#ef4444' }}>*</span></label>
                  <div className="vital-sign__input-wrapper">
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      step={field.step}
                      min="0"
                    />
                    {field.suffix && (
                      <span className="vital-sign__suffix">{field.suffix}</span>
                    )}
                  </div>
                  {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">OBSERVACIONES</label>
              <textarea
                placeholder="Notas adicionales sobre el estado del paciente..."
                maxLength={500}
                value={formData.observaciones}
                onChange={(e) => onFieldChange('observaciones', e.target.value)}
                style={{ height: '80px' }}
              />
              <span className="char-counter">
                {formData.observaciones.length}/500
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
