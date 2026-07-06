export function formatTime(date) {
  return date.toLocaleTimeString('es-DO', { hour12: false })
}

export function formatDate(date) {
  return date
    .toLocaleDateString('es-DO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '')
}

export function formatDateShort(date) {
  return date
    .toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
}

export function getCurrentTime() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function estimateAge(fechaNacimiento) {
  if (!fechaNacimiento) return null
  const parts = fechaNacimiento.split('/')
  if (parts.length !== 3) return null
  const year = parseInt(parts[2])
  if (isNaN(year)) return null
  return `~${new Date().getFullYear() - year} años`
}
