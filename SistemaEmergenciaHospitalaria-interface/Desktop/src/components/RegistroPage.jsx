import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, CheckCircle, Loader } from 'lucide-react'
import DataService from '../services/api'
import { useForm } from '../hooks/useForm'
import PersonalDataForm from './PersonalDataForm'

export default function RegistroPage() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    updateField,
    validate,
    resetForm,
    loadPatient,
  } = useForm()

  const [search, setSearch] = useState('')
  const [pacientes, setPacientes] = useState([])
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (!search.trim()) {
      setPacientes([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await DataService.buscarPaciente(search)
        const list = res?.data || []
        setPacientes(Array.isArray(list) ? list : [])
      } catch {
        setPacientes([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

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

  function handleNewPatient() {
    setSelectedPaciente(null)
    setSaved(false)
    setApiError('')
    resetForm()
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setApiError('')
    try {
      const res = await DataService.registrarPaciente(formData)
      if (res?.success) {
        setSaved(true)
      } else {
        setApiError(res?.error || 'Error al registrar paciente')
      }
    } catch (err) {
      setApiError(err?.message || 'Error de conexión con el backend')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (formData.nombre || formData.cedula || formData.fechaNacimiento || formData.motivoConsulta) {
      if (!window.confirm('¿Está seguro de cancelar? Los datos ingresados se perderán.'))
        return
    }
    handleNewPatient()
  }

  const termino = search.toLowerCase().trim()

  return (
    <div className="app__layout">
      <aside className="pl">
        <div className="pl-header">
          <div>
            <h3 className="pl-title">PACIENTES</h3>
            <p className="pl-subtitle">{pacientes.length} en sistema</p>
          </div>
          <span className="pl-badge">
            Hoy:{' '}
            {new Date().toLocaleDateString('es-DO', {
              day: '2-digit',
              month: 'short',
            }).replace('.', '')}
          </span>
        </div>
        <div style={{ padding: '0.5rem 1rem' }}>
          <div className="subbar-search" style={{ width: '100%' }}>
            <Search size={15} className="subbar-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="subbar-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
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
              <p className="pl-empty-hint">Intente con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="pl-empty">
              <Search size={36} className="pl-empty-icon" />
              <p>Escriba para buscar pacientes</p>
            </div>
          )}
        </div>
        <div className="pl-footer">
          <button className="pl-new-btn" onClick={handleNewPatient}>
            <UserPlus size={16} />
            Nuevo paciente sin registro
          </button>
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
              <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Paciente registrado exitosamente
            </p>
          </div>
        )}

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>{apiError}</p>
          </div>
        )}

        <div className="app__grid--single">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <PersonalDataForm
              formData={formData}
              errors={errors}
              onFieldChange={updateField}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0 0 1rem' }}>
              <button className="footer-btn footer-btn--cancel" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="footer-btn footer-btn--save" onClick={handleSave} disabled={saving}>
                {saving ? <Loader size={16} className="spin" /> : <UserPlus size={16} />}
                {saving ? 'Guardando...' : 'Registrar Paciente'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
