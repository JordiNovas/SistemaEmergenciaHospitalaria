import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import './HelpButton.css'

export default function HelpButton() {
  const [open, setOpen] = useState(false)

  const shortcuts = [
    { key: 'Alt+1', desc: 'Ir a Inicio' },
    { key: 'Alt+2', desc: 'Ir a Registro' },
    { key: 'Alt+3', desc: 'Ir a Consulta' },
    { key: '⌘K', desc: 'Buscar paciente' },
    { key: 'Esc', desc: 'Cerrar ventanas / notificaciones' },
    { key: 'Alt+L', desc: 'Cerrar sesión' },
  ]

  return (
    <div className="help">
      <div className="help__btn" onClick={() => setOpen((v) => !v)}>
        <HelpCircle size={20} />
      </div>
      {open && (
        <div className="help__tooltip">
          <h4 className="help__title">Atajos de teclado</h4>
          {shortcuts.map((s) => (
            <div key={s.key} className="help__row">
              <kbd>{s.key}</kbd> {s.desc}
            </div>
          ))}
          <div className="help__sep" />
          <div className="help__row">
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Los campos con <span className="required">*</span> son obligatorios
            </span>
          </div>
          <div className="help__sep" />
          <div className="help__row">
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Cédula: 000-0000000-0 · Tel: (809) 000-0000
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
