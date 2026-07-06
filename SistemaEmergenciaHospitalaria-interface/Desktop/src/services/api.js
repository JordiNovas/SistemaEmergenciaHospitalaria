import { mapConsultaData, mapPacienteData } from '../utils/mappings'
import { pacientesData } from '../data/pacientes'
import {
  getConsultasDelDia,
  addConsulta,
  updateConsultaStatus,
} from '../data/consultas'
import { usuarios } from '../data/usuarios'

class DataError extends Error {
  constructor(message, source) {
    super(message)
    this.name = 'DataError'
    this.source = source
  }
}

const DEV_API = import.meta.env.VITE_API_URL || ''

function getBridge() {
  if (window.chrome?.webview?.hostObjects?.backend) {
    return window.chrome.webview.hostObjects.backend
  }
  return null
}

async function invoke(channel, ...args) {
  const bridge = getBridge()

    if (bridge) {
    try {
      const result = await bridge[channel](...args)
      if (typeof result === 'string') {
        try { return JSON.parse(result) }
        catch { throw new DataError('Respuesta inválida del backend', channel) }
      }
      return result
    } catch (err) {
      throw new DataError(err?.message || `Error en ${channel}`, channel)
    }
  }

  if (DEV_API) {
    const res = await fetch(`${DEV_API}/api/${channel}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args[0]),
    })
    if (!res.ok) throw new DataError(`HTTP ${res.status}`, channel)
    return res.json()
  }

  return mockBackend(channel, ...args)
}

function mockBackend(channel, ...args) {
  switch (channel) {
    case 'BuscarPaciente': {
      const termino = (args[0] || '').toLowerCase().trim()
      const list = pacientesData.filter(
        (p) => p.nombre.toLowerCase().includes(termino) || p.cedula.includes(termino),
      )
      return { success: true, data: list }
    }
    case 'RegistrarPaciente': {
      const p = JSON.parse(args[0])
      pacientesData.push({
        iniciales: (p.nombre || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        nombre: p.nombre || '',
        cedula: p.cedula || '',
        sangre: p.tipoSangre || '',
        edad: null,
        bgSangre: '#e0f2fe',
        colorSangre: '#0369a1',
        bgAvatar: '#e0f2fe',
        colorAvatar: '#0369a1',
        telefono: p.telefono || '',
        sexo: p.sexo || '',
        fechaNac: p.fechaNacimiento || '',
        alergias: p.alergias || '',
      })
      return { success: true, data: { pacienteId: pacientesData.length } }
    }
    case 'ObtenerPacientes': {
      return { success: true, data: pacientesData }
    }
    case 'RegistrarConsulta': {
      const c = JSON.parse(args[0])
      addConsulta(c)
      return { success: true }
    }
    case 'ObtenerConsultasDelDia': {
      const consultas = getConsultasDelDia()
      return { success: true, data: consultas }
    }
    case 'ActualizarStatusConsulta': {
      const [id, status] = args
      updateConsultaStatus(id, status)
      return { success: true }
    }
    case 'ValidarLogin': {
      const [cedula, password] = args
      const found = usuarios.find((u) => u.cedula === cedula && u.password === password)
      if (found) {
        return {
          success: true,
          usuario: { cedula: found.cedula, nombre: found.nombre, rol: found.rol },
        }
      }
      return { success: false, error: 'Credenciales inválidas' }
    }
    default:
      throw new DataError(`Canal no implementado: ${channel}`, channel)
  }
}

const DataService = {
  async buscarPaciente(termino) {
    return invoke('BuscarPaciente', termino)
  },

  async registrarPaciente(data) {
    return invoke('RegistrarPaciente', JSON.stringify(mapPacienteData(data)))
  },

  async obtenerPacientes() {
    return invoke('ObtenerPacientes')
  },

  async registrarConsulta(data) {
    return invoke('RegistrarConsulta', JSON.stringify(mapConsultaData(data)))
  },

  async obtenerConsultasDelDia(fecha) {
    return invoke('ObtenerConsultasDelDia', fecha || new Date().toISOString().slice(0, 10))
  },

  async actualizarStatusConsulta(id, status) {
    return invoke('ActualizarStatusConsulta', id, status)
  },

  async validarLogin(cedula, password) {
    return invoke('ValidarLogin', cedula, password)
  },
}

export { DataError, DataService }
export default DataService
