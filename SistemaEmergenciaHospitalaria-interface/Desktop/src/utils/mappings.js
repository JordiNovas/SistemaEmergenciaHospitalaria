export const modoLlegadaToBackend = {
  'Propios medios': 'Por pie propio',
  'Ambulancia': 'Ambulancia',
  'Transferido': 'Traido por otros',
  'Policía': 'Otro',
  'Otro': 'Otro',
}

export const triageToBackend = {
  'I': 'Rojo',
  'II': 'Naranja',
  'III': 'Amarillo',
  'IV': 'Verde',
  'V': 'Azul',
}

export const statusToBackend = {
  'pendiente': 'En espera',
  'en_atencion': 'En atencion',
  'atendido': 'Atendido',
}

export function mapConsultaData(data) {
  return {
    ...data,
    modoLlegada: modoLlegadaToBackend[data.modoLlegada] || data.modoLlegada,
    triage: triageToBackend[data.triage] || data.triage,
    status: statusToBackend[data.status] || data.status,
  }
}

export function mapPacienteData(data) {
  return data
}
