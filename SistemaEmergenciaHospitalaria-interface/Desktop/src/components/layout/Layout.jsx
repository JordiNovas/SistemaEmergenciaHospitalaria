import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  LogOut,
  Activity,
  Clock,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatTime, formatDate } from '../../utils/formatters'
import DataService from '../../services/api'
import HelpButton from '../HelpButton'
import Toast from '../Toast'
import './Layout.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [clock, setClock] = useState(new Date())
  const [toast, setToast] = useState(null)
  const [flujo, setFlujo] = useState({ enEspera: 0, enAtencion: 0, atendidos: 0 })

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function cargarFlujo() {
      try {
        const res = await DataService.obtenerConsultasDelDia('')
        const list = res?.data || []
        const arr = Array.isArray(list) ? list : []
        setFlujo({
          enEspera: arr.filter((c) => {
            const e = (c.estado || c.Estado || '').toLowerCase()
            return e === 'en espera' || e === 'pendiente'
          }).length,
          enAtencion: arr.filter((c) => {
            const e = (c.estado || c.Estado || '').toLowerCase()
            return e === 'en atencion' || e === 'en_atencion'
          }).length,
          atendidos: arr.filter((c) => {
            const e = (c.estado || c.Estado || '').toLowerCase()
            return e === 'atendido'
          }).length,
        })
      } catch {
        // ignore
      }
    }
    cargarFlujo()
    const interval = setInterval(cargarFlujo, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      const isFormField =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT'

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector(
          '.subbar-search-input, [data-search-input]',
        )
        if (searchInput) {
          searchInput.focus()
        } else {
          navigate('/registro')
          setTimeout(() => {
            const input = document.querySelector('.subbar-search-input')
            if (input) input.focus()
          }, 100)
        }
      }

      if (e.key === 'Escape') {
        setToast(null)
      }

      if (e.altKey && !isFormField) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            navigate('/inicio')
            break
          case '2':
            e.preventDefault()
            navigate('/registro')
            break
          case '3':
            e.preventDefault()
            navigate('/consulta')
            break
          case 'l':
          case 'L':
            e.preventDefault()
            logout()
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, logout])

  const navItems = [
    { path: '/inicio', label: 'Inicio', icon: LayoutDashboard, shortcut: 'Alt+1' },
    { path: '/registro', label: 'Registro', icon: UserPlus, shortcut: 'Alt+2' },
    { path: '/consulta', label: 'Consulta', icon: Stethoscope, shortcut: 'Alt+3' },
  ]

  return (
    <div className="app">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <header className="topbar">
        <div className="topbar-left">
          <Activity size={20} className="topbar-icon" />
          <span className="topbar-title">GENESIS EMERGENCY SYSTEM</span>
          <span className="topbar-sep">·</span>
          <span className="topbar-subtitle">HOSPITAL FRANCISCO MOSCOSO PUELLO</span>
        </div>

        <nav className="topbar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={`topbar-nav-btn${isActive ? ' topbar-nav-btn--active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.shortcut}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="topbar-right">
          <span className="topbar-clock">
            <Clock size={14} className="topbar-clock-icon" />
            {formatTime(clock)}
            <span className="topbar-date">{formatDate(clock)}</span>
          </span>
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.avatar || 'U'}</div>
            <div className="topbar-user-info">
              <span className="topbar-name">{user?.nombre || 'Usuario'}</span>
              <span className="topbar-role">{user?.rol || ''}</span>
            </div>
            <button className="topbar-logout" onClick={logout} title="Cerrar sesión (Alt+L)">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="app__content">{children}</main>

      <footer className="footer">
        <div className="footer-left">
          <Activity size={14} style={{ color: '#94a3b8' }} />
          <span className="footer-text">Genesis Emergency System v1.0</span>
          <span className="footer-divider" />
          <span className="footer-text">{formatTime(clock)}</span>
          <span className="footer-divider" />
          <span className="footer-flow">
            <Clock size={13} className="footer-flow-icon" style={{ color: '#eab308' }} />
            <span>{flujo.enEspera}</span>
          </span>
          <span className="footer-flow">
            <ClipboardList size={13} className="footer-flow-icon" style={{ color: '#ea580c' }} />
            <span>{flujo.enAtencion}</span>
          </span>
          <span className="footer-flow">
            <CheckCircle2 size={13} className="footer-flow-icon" style={{ color: '#16a34a' }} />
            <span>{flujo.atendidos}</span>
          </span>
        </div>
        <div className="footer-right">
          <span className="footer-text" style={{ color: '#94a3b8' }}>
            {user?.nombre || ''}
          </span>
        </div>
      </footer>

      <HelpButton />
    </div>
  )
}
