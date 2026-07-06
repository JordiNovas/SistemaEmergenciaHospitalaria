import { useState, useCallback } from 'react'
import { getCurrentTime } from '../utils/formatters'
import { validateCedula, validatePhone } from '../utils/validators'
import { bypassTriage } from '../data/constants'

function getInitialFormData() {
  return {
    nombre: '',
    cedula: '',
    fechaNacimiento: '',
    tipoSangre: 'Desconocido',
    sexo: '—',
    telefono: '',
    horaLlegada: getCurrentTime(),
    modoLlegada: 'Propios medios',
    triage: 'V',
    alergias: '',
    motivoConsulta: '',
    presionArterial: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    temperatura: '',
    saturacionO2: '',
    peso: '',
    talla: '',
    observaciones: '',
  }
}

export function useForm() {
  const [formData, setFormData] = useState(getInitialFormData)
  const [errors, setErrors] = useState({})

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (typeof value === 'string' && value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'Campo obligatorio'

    const cedError = validateCedula(formData.cedula)
    if (cedError) newErrors.cedula = cedError

    if (!formData.fechaNacimiento.trim()) newErrors.fechaNacimiento = 'Campo obligatorio'

    if (!formData.telefono.trim()) newErrors.telefono = 'Campo obligatorio'
    else {
      const telError = validatePhone(formData.telefono)
      if (telError) newErrors.telefono = telError
    }

    if (formData.tipoSangre === 'Desconocido') newErrors.tipoSangre = 'Seleccione un tipo de sangre'
    if (formData.sexo === '—') newErrors.sexo = 'Seleccione un sexo'
    if (!formData.horaLlegada.trim()) newErrors.horaLlegada = 'Campo obligatorio'
    if (!formData.modoLlegada.trim()) newErrors.modoLlegada = 'Campo obligatorio'
    if (!formData.motivoConsulta.trim()) newErrors.motivoConsulta = 'Campo obligatorio'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const validateConsulta = useCallback(() => {
    const newErrors = {}

    if (!formData.motivoConsulta.trim()) newErrors.motivoConsulta = 'Campo obligatorio'
    if (!formData.horaLlegada.trim()) newErrors.horaLlegada = 'Campo obligatorio'

    if (!bypassTriage(formData.triage)) {
      if (!formData.presionArterial.trim()) newErrors.presionArterial = 'Campo obligatorio'
      if (!formData.frecuenciaCardiaca) newErrors.frecuenciaCardiaca = 'Campo obligatorio'
      else if (isNaN(formData.frecuenciaCardiaca) || formData.frecuenciaCardiaca < 0 || formData.frecuenciaCardiaca > 300)
        newErrors.frecuenciaCardiaca = 'Valor inválido (0-300)'

      if (!formData.frecuenciaRespiratoria) newErrors.frecuenciaRespiratoria = 'Campo obligatorio'
      else if (isNaN(formData.frecuenciaRespiratoria) || formData.frecuenciaRespiratoria < 0 || formData.frecuenciaRespiratoria > 100)
        newErrors.frecuenciaRespiratoria = 'Valor inválido (0-100)'

      if (!formData.temperatura) newErrors.temperatura = 'Campo obligatorio'
      else if (isNaN(formData.temperatura) || formData.temperatura < 30 || formData.temperatura > 45)
        newErrors.temperatura = 'Valor inválido (30-45 °C)'

      if (!formData.saturacionO2) newErrors.saturacionO2 = 'Campo obligatorio'
      else if (isNaN(formData.saturacionO2) || formData.saturacionO2 < 0 || formData.saturacionO2 > 100)
        newErrors.saturacionO2 = 'Valor inválido (0-100%)'

      if (!formData.peso) newErrors.peso = 'Campo obligatorio'
      else if (isNaN(formData.peso) || formData.peso < 0 || formData.peso > 500)
        newErrors.peso = 'Valor inválido (0-500 kg)'

      if (!formData.talla) newErrors.talla = 'Campo obligatorio'
      else if (isNaN(formData.talla) || formData.talla < 0 || formData.talla > 3)
        newErrors.talla = 'Valor inválido (0-3 m)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData())
    setErrors({})
  }, [])

  const loadPatient = useCallback((p, prevFormData) => {
    setFormData({
      ...prevFormData,
      nombre: p.nombre,
      cedula: p.cedula,
      fechaNacimiento: p.fechaNac || prevFormData.fechaNacimiento,
      tipoSangre: p.sangre || prevFormData.tipoSangre,
      sexo: p.sexo || prevFormData.sexo,
      telefono: p.telefono || prevFormData.telefono,
    })
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0

  return {
    formData,
    errors,
    hasErrors,
    updateField,
    validate,
    validateConsulta,
    resetForm,
    loadPatient,
    setFormData,
  }
}
