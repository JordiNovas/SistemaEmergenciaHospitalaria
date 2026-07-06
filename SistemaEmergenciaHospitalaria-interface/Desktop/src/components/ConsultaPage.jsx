import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Stethoscope,
  History,
  X,
  Heart,
  Activity,
  AlertTriangle,
  Loader,
} from 'lucide-react'
import DataService from '../services/api'
import { triageColors, bypassTriage } from '../data/constants'
import { useForm } from '../hooks/useForm'
import ClinicalEntryForm from './ClinicalEntryForm'

export default function ConsultaPage() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    updateField,
    validateConsulta,
    resetForm,
    loadPatient,
  } = useForm()

  const [searchTerm, setSearchTerm] = useState('')
  const [pacientes, setPacientes] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [detalleConsulta, setDetalleConsulta] = useState(null)
  const [consultasDelDia, setConsultasDelDia] = useState([])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setPacientes([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await DataService.buscarPaciente(searchTerm)
        const list = res?.data || []
        setPacientes(Array.isArray(list) ? list : [])
      } catch {
        setPacientes([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    cargarConsultas()
  }, [])

  async function cargarConsultas() {
    try {
      const res = await DataService.obtenerConsultasDelDia('')
      const list = res?.data || []
      setConsultasDelDia(Array.isArray(list) ? list : [])
    } catch {
      // fallback a mock
    }
  }

  const consultasPrevias = selectedPaciente
    ? consultasDelDia.filter((c) => {
        const ced = c.pacienteCedula || c.PacienteCedula || ''
        return ced === selectedPaciente.cedula || ced === selectedPaciente.Cedula
      })
    : []

  const bypass = bypassTriage(formData.triage)

  function handleSelectPatient(p) {
    setSelectedPaciente(p)
    setSaved(false)
    setApiError('')
    loadPatient({
      nombre: p.nombreCompleto || p.NombreCompleto || '',
      cedula: p.cedula || p.Cedula || '',
      fechaNac: p.fechaNacimiento || p.FechaNacimiento || '',
      sangre: p.tipoSangre || p.TipoSangre || '',
      sexo: p.sexo || p.Sexo || '',
      telefono: p.telefonoContacto || p.TelefonoContacto || '',
    }, formData)
  }

  async function handleSave() {
    if (!selectedPaciente) return
    if (!validateConsulta()) return

    setSaving(true)
    setApiError('')
    try {
      const payload = {
        pacienteCedula: selectedPaciente.cedula || selectedPaciente.Cedula,
        pacienteNombre: selectedPaciente.nombre || selectedPaciente.NombreCompleto,
        ...formData,
        signosVitalesBypass: bypass,
      }
      const res = await DataService.registrarConsulta(payload)
      if (res?.success) {
        setSaved(true)
        setSelectedPaciente(null)
        resetForm()
        cargarConsultas()
      } else {
        setApiError(res?.error || 'Error al registrar consulta')
      }
    } catch (err) {
      setApiError(err?.message || 'Error de conexión con el backend')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setSelectedPaciente(null)
    resetForm()
  }

  function getTriageBg(triageId) {
    if (!triageId) return '#6b7280'
    const triageMap = { Rojo: 1, Naranja: 2, Amarillo: 3, Verde: 4, Azul: 5, I: 1, II: 2, III: 3, IV: 4, V: 5 }
    const num = triageMap[triageId] || parseInt(triageId) || 5
    return triageColors[num]?.bg || '#6b7280'
  }

  const termino = searchTerm.toLowerCase().trim()

  return (
    <div className="app__layout">
      <aside className="pl">
        <div className="pl-header">
          <h3 className="pl-title">SELECCIONAR PACIENTE</h3>
        </div>
        <div style={{ padding: '0.75rem 1rem' }}>
          <div className="subbar-search" style={{ width: '100%' }}>
            <Search size={15} className="subbar-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="subbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        {!selectedPaciente && (
          <p style={{ padding: '0 1rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
            Seleccione un paciente para iniciar la consulta
          </p>
        )}
        <div className="pl-list">
          {searching ? (
            <div className="pl-empty">
              <Loader size={24} className="spin" />
              <p>Buscando...</p>
            </div>
          ) : pacientes.length > 0 ? (
            pacientes.map((p, idx) => {
              const nombre = p.nombreCompleto || p.NombreCompleto || ''
              const cedula = p.cedula || p.Cedula || ''
              const iniciales = nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '--'
              return (
                <div
                  key={cedula || idx}
                  className={`pl-item${selectedPaciente?.cedula === cedula ? ' pl-item--active' : ''}`}
                  onClick={() => handleSelectPatient(p)}
                >
                  <div className="pl-avatar" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {iniciales}
                  </div>
                  <div className="pl-info">
                    <p className="pl-name">{nombre}</p>
                    <p className="pl-id">{cedula}</p>
                  </div>
                </div>
              )
            })
          ) : termino ? (
            <div className="pl-empty">
              <Search size={36} className="pl-empty-icon" />
              <p>No se encontraron pacientes</p>
            </div>
          ) : (
            <div className="pl-empty">
              <Search size={36} className="pl-empty-icon" />
              <p>Escriba para buscar pacientes</p>
            </div>
          )}
        </div>
      </aside>

      <main className="app__main">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="btn-back" onClick={() => navigate('/inicio')}>
            ← Volver al inicio
          </button>
        </div>

        {saved && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
              Consulta registrada exitosamente
            </p>
          </div>
        )}

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>{apiError}</p>
          </div>
        )}

        {selectedPaciente ? (
          <><div className="app__grid--single">
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600, marginBottom: '4px' }}>
                Consulta para: {selectedPaciente.nombreCompleto || selectedPaciente.NombreCompleto || selectedPaciente.nombre}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {selectedPaciente.cedula || selectedPaciente.Cedula}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ClinicalEntryForm
                formData={formData}
                errors={errors}
                onFieldChange={updateField}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="footer-btn footer-btn--cancel" onClick={handleCancel}>
                  Cancelar
                </button>
                <button className="footer-btn footer-btn--save" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader size={16} className="spin" /> : <Stethoscope size={16} />}
                  {saving ? 'Guardando...' : bypass ? 'Registrar Emergencia' : 'Registrar Consulta'}
                </button>
              </div>
            </div>

            {consultasPrevias.length > 0 && (
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2 className="card__header">
                  <History size={18} className="card__header-icon" />
                  HISTORIAL DE CONSULTAS ({consultasPrevias.length})
                </h2>
                <div className="card__body" style={{ padding: '0.5rem 1rem 1rem' }}>
                  {consultasPrevias.map((c, i) => {
                    const triaje = c.nivelTriage || c.NivelTriage || c.triage || 'V'
                    return (
                      <div
                        key={c.consultaID || c.ConsultaID || c.id || i}
                        onClick={() => setDetalleConsulta(c)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '0.75rem 0',
                          borderBottom: i < consultasPrevias.length - 1 ? '1px solid #f1f5f9' : 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: getTriageBg(triaje),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {triaje}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                            {c.motivoConsulta || c.MotivoConsulta || ''}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            {c.fechaHoraLlegada || c.FechaHoraLlegada || ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {detalleConsulta && (
            <div className="modal-overlay" onClick={() => setDetalleConsulta(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                  <h3 className="modal__title">
                    <History size={16} />
                    Detalle de Consulta
                  </h3>
                  <button className="modal__close" onClick={() => setDetalleConsulta(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="modal__body">
                  <div className="modal__section">
                    <span className="modal__label">Motivo de Consulta</span>
                    <span className="modal__value" style={{ whiteSpace: 'pre-wrap' }}>{detalleConsulta.motivoConsulta || detalleConsulta.MotivoConsulta}</span>
                  </div>
                  <div className="modal__section">
                    <span className="modal__label">Fecha / Hora</span>
                    <span className="modal__value">{detalleConsulta.fechaHoraLlegada || detalleConsulta.FechaHoraLlegada}</span>
                  </div>
                  <div className="modal__section">
                    <span className="modal__label">Modo de Llegada</span>
                    <span className="modal__value">{detalleConsulta.modoLlegada || detalleConsulta.ModoLlegada}</span>
                  </div>
                  <div className="modal__section">
                    <span className="modal__label">Triage</span>
                    <span className="modal__value">{detalleConsulta.nivelTriage || detalleConsulta.NivelTriage || detalleConsulta.triage}</span>
                  </div>
                  <div className="modal__section">
                    <span className="modal__label">Estado</span>
                    <span className="modal__value">{detalleConsulta.estado || detalleConsulta.Estado}</span>
                  </div>
                  <div className="modal__section">
                    <span className="modal__label">
                      <Heart size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Signos Vitales
                    </span>
                    <div className="modal__vitals-grid">
                      <div className="modal__vital-item">
                        <span className="modal__vital-label">PA</span>
                        <span className="modal__vital-value">{detalleConsulta.presionArterial || detalleConsulta.PresionArterial || '—'}</span>
                      </div>
                      <div className="modal__vital-item">
                        <span className="modal__vital-label">FC</span>
                        <span className="modal__vital-value">{detalleConsulta.frecuenciaCardiaca || detalleConsulta.FrecuenciaCardiaca || '—'} <small>lpm</small></span>
                      </div>
                      <div className="modal__vital-item">
                        <span className="modal__vital-label">FR</span>
                        <span className="modal__vital-value">{detalleConsulta.frecuenciaRespiratoria || detalleConsulta.FrecuenciaRespiratoria || '—'} <small>rpm</small></span>
                      </div>
                      <div className="modal__vital-item">
                        <span className="modal__vital-label">Temp</span>
                        <span className="modal__vital-value">{detalleConsulta.temperatura || detalleConsulta.Temperatura || '—'} <small>°C</small></span>
                      </div>
                      <div className="modal__vital-item">
                        <span className="modal__vital-label">SpO2</span>
                        <span className="modal__vital-value">{detalleConsulta.saturacionOxigeno || detalleConsulta.SaturacionOxigeno || '—'} <small>%</small></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="app__grid--single">
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <Search size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#cbd5e1' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                Seleccione un paciente
              </h3>
              <p style={{ fontSize: '0.85rem' }}>
                Busque un paciente en el panel lateral para iniciar una consulta
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
