export const triageLevels = [
  { id: 'I', label: 'Resucitación', desc: 'Paro cardiorespiratorio', num: 1, nivel: 'Rojo' },
  { id: 'II', label: 'Emergencia', desc: 'Dolor torácico agudo', num: 2, nivel: 'Naranja' },
  { id: 'III', label: 'Urgente', desc: 'Fractura expuesta', num: 3, nivel: 'Amarillo' },
  { id: 'IV', label: 'Semi-urgente', desc: 'Infección menor', num: 4, nivel: 'Verde' },
  { id: 'V', label: 'No urgente', desc: 'Control rutinario', num: 5, nivel: 'Azul' },
]

export const alergiasOptions = [
  'Penicilina', 'Cefalosporinas', 'Sulfa', 'Aspirina',
  'AINEs (Ibuprofeno)', 'Anestésicos', 'Opioides',
  'Látex', 'Contrastes yodados', 'Ninguna conocida',
]

export const bloodTypes = [
  'Desconocido', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

export const sexOptions = ['—', 'Masculino', 'Femenino']

export const modoLlegadaOptions = [
  'Propios medios', 'Ambulancia', 'Transferido', 'Policía', 'Otro',
]

export const triageColors = {
  1: { bg: '#dc2626', color: '#ffffff' },
  2: { bg: '#ea580c', color: '#ffffff' },
  3: { bg: '#eab308', color: '#ffffff' },
  4: { bg: '#16a34a', color: '#ffffff' },
  5: { bg: '#2563eb', color: '#ffffff' },
}

export const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

export const consultaStatus = [
  { value: 'pendiente', label: 'Pendiente', color: '#eab308', bg: '#fefce8' },
  { value: 'en_atencion', label: 'En Atención', color: '#ea580c', bg: '#fff7ed' },
  { value: 'atendido', label: 'Atendido', color: '#16a34a', bg: '#f0fdf4' },
]

export const bypassTriage = (id) => id === 'I' || id === 'II'

export const signosVitalesFields = [
  { key: 'presionArterial', label: 'Presión Arterial (mmHg)', placeholder: '120/80', type: 'text', suffix: '' },
  { key: 'frecuenciaCardiaca', label: 'Frecuencia Cardíaca (lpm)', placeholder: '72', type: 'number', suffix: 'lpm' },
  { key: 'frecuenciaRespiratoria', label: 'Frecuencia Respiratoria (rpm)', placeholder: '16', type: 'number', suffix: 'rpm' },
  { key: 'temperatura', label: 'Temperatura (°C)', placeholder: '36.5', type: 'number', suffix: '°C', step: '0.1' },
  { key: 'saturacionO2', label: 'Saturación O2 (%)', placeholder: '98', type: 'number', suffix: '%' },
  { key: 'peso', label: 'Peso (kg)', placeholder: '70', type: 'number', suffix: 'kg', step: '0.1' },
  { key: 'talla', label: 'Talla (m)', placeholder: '1.70', type: 'number', suffix: 'm', step: '0.01' },
]
