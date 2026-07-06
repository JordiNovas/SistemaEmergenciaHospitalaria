import { AlertTriangle } from 'lucide-react'
import { triageLevels, triageColors } from '../data/constants'

const isEmergency = (id) => id === 'I' || id === 'II'

export default function TriageSelector({ value, onChange }) {
  return (
    <div>
      <div className="triage-selector">
        {triageLevels.map((t) => {
          const active = value === t.id
          const c = triageColors[t.num]
          const emergency = isEmergency(t.id)
          return (
            <div
              key={t.id}
              className={`triage-option${active ? ' triage-option--active' : ''}${emergency ? ' triage-option--emergency' : ''}`}
              style={
                active
                  ? { backgroundColor: c.bg, borderColor: c.bg, color: '#fff' }
                  : emergency
                    ? { borderColor: c.bg }
                    : undefined
              }
              onClick={() => onChange(t.id)}
            >
              <span
                className="triage-num"
                style={
                  active
                    ? { color: '#fff' }
                    : emergency
                      ? { color: c.bg }
                      : undefined
                }
              >
                {t.id}
              </span>
              <span
                className="triage-label"
                style={
                  active
                    ? { color: 'rgba(255,255,255,0.9)' }
                    : emergency
                      ? { color: c.bg, fontWeight: 700 }
                      : undefined
                }
              >
                {t.label}
              </span>
              {emergency && !active && (
                <span className="triage-emergency-dot" style={{ backgroundColor: c.bg }} />
              )}
            </div>
          )
        })}
      </div>

      {value && isEmergency(value) && (
        <div
          className="triage-bypass-banner"
          style={{
            backgroundColor:
              value === 'I' ? '#fef2f2' : '#fff7ed',
            borderColor:
              value === 'I' ? '#fecaca' : '#fed7aa',
          }}
        >
          <AlertTriangle
            size={16}
            style={{
              color: value === 'I' ? '#dc2626' : '#ea580c',
              flexShrink: 0,
            }}
          />
          <div>
            <strong style={{ color: value === 'I' ? '#991b1b' : '#9a3412' }}>
              {value === 'I' ? 'EMERGENCIA MÁXIMA — BYPASS ACTIVADO' : 'URGENCIA MAYOR — BYPASS ACTIVADO'}
            </strong>
            <p style={{ color: value === 'I' ? '#b91c1c' : '#c2410c', fontSize: '0.75rem', marginTop: '2px' }}>
              Clasificación por ojo clínico. Signos vitales omitidos.
              El paciente pasa al tope de la lista de atención inmediata.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
