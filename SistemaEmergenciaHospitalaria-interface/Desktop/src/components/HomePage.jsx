import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Clock,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Stethoscope,
  ChevronRight,
  Loader,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DataService from '../services/api'
import { triageColors } from '../data/constants'
import './HomePage.css'

const statusConfig = {
  pendiente: { label: 'En Espera', color: '#eab308', bg: '#fefce8', icon: Clock },
  en_atencion: { label: 'En Atención', color: '#ea580c', bg: '#fff7ed', icon: ClipboardList },
  atendido: { label: 'Atendido', color: '#16a34a', bg: '#f0fdf4', icon: TrendingUp },
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarConsultas()
    const interval = setInterval(cargarConsultas, 30000)
    return () => clearInterval(interval)
  }, [])

  async function cargarConsultas() {
    try {
      const res = await DataService.obtenerConsultasDelDia('')
      const list = res?.data || []
      setConsultas(Array.isArray(list) ? list : [])
    } catch {
      // sin backend — lista vacía
    } finally {
      setLoading(false)
    }
  }

  const enEspera = consultas.filter((c) => {
    const estado = (c.estado || c.Estado || '').toLowerCase()
    return estado === 'en espera' || estado === 'pendiente'
  })
  const enAtencion = consultas.filter((c) => {
    const estado = (c.estado || c.Estado || '').toLowerCase()
    return estado === 'en atencion' || estado === 'en_atencion'
  })
  const atendidos = consultas.filter((c) => {
    const estado = (c.estado || c.Estado || '').toLowerCase()
    return estado === 'atendido'
  })

  const resumen = {
    total: consultas.length,
    enEspera: enEspera.length,
    enAtencion: enAtencion.length,
    atendidos: atendidos.length,
  }

  const stats = [
    { label: 'Pacientes hoy', value: resumen.total, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'En espera', value: resumen.enEspera, icon: Clock, color: '#eab308', bg: '#fefce8' },
    { label: 'En atención', value: resumen.enAtencion, icon: ClipboardList, color: '#ea580c', bg: '#fff7ed' },
    { label: 'Atendidos hoy', value: resumen.atendidos, icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
  ]

  const actions = [
    {
      label: 'Registrar Paciente',
      desc: 'Ingrese un nuevo paciente al sistema',
      icon: UserPlus,
      path: '/registro',
      color: '#3b82f6',
    },
    {
      label: 'Nueva Consulta',
      desc: 'Registre una entrada clínica con triage',
      icon: Stethoscope,
      path: '/consulta',
      color: '#8b5cf6',
    },
  ]

  function getTriageColor(triageId) {
    if (!triageId) return '#6b7280'
    const triageMap = { Rojo: 1, Naranja: 2, Amarillo: 3, Verde: 4, Azul: 5, I: 1, II: 2, III: 3, IV: 4, V: 5 }
    const num = triageMap[triageId] || parseInt(triageId) || 5
    const level = triageColors[num]
    return level?.bg || '#6b7280'
  }

  function getTriageLabel(triageId) {
    const labelMap = { Rojo: 'I', Naranja: 'II', Amarillo: 'III', Verde: 'IV', Azul: 'V' }
    return labelMap[triageId] || triageId || '—'
  }

  function getStatusGroup(c) {
    const estado = (c.estado || c.Estado || '').toLowerCase()
    if (estado === 'en espera' || estado === 'pendiente') return 'pendiente'
    if (estado === 'en atencion' || estado === 'en_atencion') return 'en_atencion'
    if (estado === 'atendido') return 'atendido'
    return 'pendiente'
  }

  if (loading) {
    return (
      <div className="home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={32} className="spin" style={{ color: '#94a3b8' }} />
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home__welcome">
        <div>
          <h1 className="home__greeting">
            Bienvenido, <span className="home__greeting-name">{user?.nombre}</span>
          </h1>
          <p className="home__greeting-role">{user?.rol}</p>
        </div>
        <p className="home__date">
          {new Date().toLocaleDateString('es-DO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="home__stats">
        {stats.map((s) => (
          <div key={s.label} className="home__stat-card" style={{ background: s.bg, borderLeft: `4px solid ${s.color}` }}>
            <div className="home__stat-icon" style={{ color: s.color }}>
              <s.icon size={24} />
            </div>
            <div className="home__stat-info">
              <span className="home__stat-value">{s.value}</span>
              <span className="home__stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="home__actions">
        <h2 className="home__section-title">Acciones rápidas</h2>
        <div className="home__action-cards">
          {actions.map((a) => (
            <div
              key={a.label}
              className="home__action-card"
              onClick={() => navigate(a.path)}
            >
              <div className="home__action-icon" style={{ color: a.color, background: `${a.color}15` }}>
                <a.icon size={28} />
              </div>
              <div className="home__action-info">
                <h3>{a.label}</h3>
                <p>{a.desc}</p>
              </div>
              <ChevronRight size={20} className="home__action-arrow" />
            </div>
          ))}
        </div>
      </div>

      <div className="home__consultas">
        <div className="home__consultas-header">
          <h2 className="home__section-title">Pacientes de Hoy</h2>
          {consultas.length > 0 && (
            <span className="pl-badge">{consultas.length} en total</span>
          )}
        </div>

        {consultas.length === 0 ? (
          <div className="home__empty-consultas">
            <ClipboardList size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              No hay consultas registradas hoy
            </p>
            <button
              className="home__empty-action"
              onClick={() => navigate('/consulta')}
            >
              Registrar primera consulta <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="home__consultas-list">
            <div className="home__consultas-columns">
              {['pendiente', 'en_atencion', 'atendido'].map((status) => {
                const cfg = statusConfig[status]
                const items = status === 'pendiente' ? enEspera :
                  status === 'en_atencion' ? enAtencion : atendidos
                const Icon = cfg.icon
                return (
                  <div key={status} className="home__consultas-column" style={{ borderTopColor: cfg.color }}>
                    <div className="home__column-header" style={{ color: cfg.color }}>
                      <Icon size={16} />
                      <span>{cfg.label}</span>
                      <span className="home__column-count">{items.length}</span>
                    </div>
                    <div className="home__column-list">
                      {items.length === 0 ? (
                        <div className="home__column-empty">
                          <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>—</p>
                        </div>
                      ) : (
                        items.map((c, idx) => {
                          const triaje = c.nivelTriage || c.NivelTriage || 'V'
                          const triageColor = getTriageColor(triaje)
                          const nombrePac = c.pacienteNombre || c.PacienteNombre || ''
                          const motivo = c.motivoConsulta || c.MotivoConsulta || ''
                          const fechaHora = c.fechaHoraLlegada || c.FechaHoraLlegada || ''
                          return (
                            <div key={c.consultaID || c.ConsultaID || idx} className="home__consulta-card">
                              <div className="home__consulta-top">
                                <span
                                  className="home__triage-dot"
                                  style={{ backgroundColor: triageColor }}
                                >
                                  {getTriageLabel(triaje)}
                                </span>
                                <span className="home__consulta-name">{nombrePac}</span>
                              </div>
                              <div className="home__consulta-meta">
                                <span>{motivo?.slice(0, 60)}</span>
                              </div>
                              <div className="home__consulta-bottom">
                                <span className="home__consulta-time">{fechaHora}</span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
