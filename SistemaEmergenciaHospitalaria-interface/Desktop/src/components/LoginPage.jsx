import { useState } from 'react'
import { Activity, LogIn, ChevronDown, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const { usuarios, loading } = useAuth()
  const [selectedCedula, setSelectedCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const selectedUser = usuarios.find((u) => u.cedula === selectedCedula)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCedula) {
      setError('Seleccione un usuario')
      return
    }
    if (!password) {
      setError('Ingrese su contraseña')
      return
    }

    setError('')
    const ok = await onLogin(selectedCedula, password)
    if (!ok) {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <Activity size={32} className="login__logo" />
          <h1 className="login__title">Genesis Emergency System</h1>
          <p className="login__subtitle">Hospital Francisco Moscoso Puello</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">SELECCIONE SU USUARIO <span style={{ color: '#ef4444' }}>*</span></label>
            <div className="login__select-wrapper">
              <select
                className="login__select"
                value={selectedCedula}
                onChange={(e) => {
                  setSelectedCedula(e.target.value)
                  setError('')
                }}
              >
                <option value="">— Seleccione un usuario —</option>
                {usuarios.map((u) => (
                  <option key={u.cedula} value={u.cedula}>
                    {u.nombre} · {u.rol}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="login__select-icon" />
            </div>
          </div>

          {selectedUser && (
            <div className="login__selected-user">
              <div className="login__user-avatar-sm">{selectedUser.avatar}</div>
              <div>
                <div className="login__user-name-sm">{selectedUser.nombre}</div>
                <div className="login__user-role-sm">{selectedUser.rol}</div>
              </div>
            </div>
          )}

          <div className="login__field">
            <label className="login__label">CONTRASEÑA <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="password"
              className="login__input"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoFocus
            />
          </div>

          {error && <p className="login__error">{error}</p>}

          <button
            type="submit"
            className="login__btn"
            disabled={!selectedCedula || !password || loading}
          >
            {loading ? <Loader size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
