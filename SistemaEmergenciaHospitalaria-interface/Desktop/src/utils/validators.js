const AREA_CODES = ['809', '829', '849']

export function validateCedula(cedula) {
  if (!cedula) return 'Campo obligatorio'

  const limpio = cedula.replace(/[^0-9]/g, '')
  if (limpio.length !== 11) return 'La cédula debe tener 11 dígitos'

  return null
}

export function formatCedula(value) {
  const nums = value.replace(/[^0-9]/g, '').slice(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3)}`
  return `${nums.slice(0, 3)}-${nums.slice(3, 10)}-${nums.slice(10)}`
}

export function validatePhone(phone) {
  if (!phone) return null

  const nums = phone.replace(/[^0-9]/g, '')
  if (nums.length !== 10) return 'El teléfono debe tener 10 dígitos'

  const areaCode = nums.slice(0, 3)
  if (!AREA_CODES.includes(areaCode)) return `Código de área inválido (${AREA_CODES.join(', ')})`

  return null
}

export function formatPhone(value) {
  const nums = value.replace(/[^0-9]/g, '').slice(0, 10)
  if (nums.length <= 3) return nums
  if (nums.length <= 6) return `(${nums.slice(0, 3)}) ${nums.slice(3)}`
  return `(${nums.slice(0, 3)}) ${nums.slice(3, 6)}-${nums.slice(6)}`
}

export function formatCedulaDisplay(cedula) {
  if (!cedula) return ''
  const nums = cedula.replace(/[^0-9]/g, '')
  if (nums.length < 11) return cedula
  return `${nums.slice(0, 3)}-${nums.slice(3, 10)}-${nums.slice(10)}`
}
