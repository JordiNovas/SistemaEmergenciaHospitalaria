import { useState, useRef } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useClickOutside } from '../hooks/useClickOutside'
import { months, dayNames } from '../data/constants'
import { daysInMonth, firstDayOfMonth } from '../utils/formatters'
import './Calendar.css'

const YEAR_RANGE = 20

export default function Calendar({ value, onSelect }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const totalDays = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)
  const today = new Date()
  const currentYear = today.getFullYear()

  function handleSelect(day) {
    const selected = new Date(year, month, day)
    const formatted = selected.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    onSelect(formatted)
    setOpen(false)
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1))
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1))
  }

  function prevYear() {
    setViewDate(new Date(year - 1, month))
  }

  function nextYear() {
    setViewDate(new Date(year + 1, month))
  }

  function onYearChange(e) {
    const y = parseInt(e.target.value)
    setViewDate(new Date(y, month))
  }

  function isSelected(day) {
    if (!value) return false
    const parts = value.split('/')
    return (
      parts.length === 3 &&
      parseInt(parts[0]) === day &&
      parseInt(parts[1]) - 1 === month &&
      parseInt(parts[2]) === year
    )
  }

  const years = []
  for (let y = currentYear - YEAR_RANGE; y <= currentYear + 10; y++) {
    years.push(y)
  }

  const days = []
  for (let i = 0; i < startDay; i++) {
    days.push(<span key={`e-${i}`} className="cal-day cal-day--empty" />)
  }
  for (let d = 1; d <= totalDays; d++) {
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    days.push(
      <span
        key={d}
        className={`cal-day${isToday ? ' cal-day--today' : ''}${isSelected(d) ? ' cal-day--selected' : ''}`}
        onClick={() => handleSelect(d)}
      >
        {d}
      </span>,
    )
  }

  return (
    <div className="cal-wrapper" ref={ref}>
      <input
        type="text"
        placeholder="dd / mm / aaaa"
        className="cal-input"
        value={value}
        readOnly
        onFocus={() => setOpen(true)}
      />
      <span className="cal-trigger" onClick={() => setOpen((v) => !v)}>
        <CalendarIcon size={18} />
      </span>
      {open && (
        <div className="cal-popup">
          <div className="cal-header">
            <button className="cal-nav" onClick={prevYear} type="button" title="Año anterior">
              <ChevronsLeft size={14} />
            </button>
            <button className="cal-nav" onClick={prevMonth} type="button" title="Mes anterior">
              <ChevronLeft size={14} />
            </button>
            <div className="cal-title-group">
              <span className="cal-title-month">{months[month]}</span>
              <select
                className="cal-year-select"
                value={year}
                onChange={onYearChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button className="cal-nav" onClick={nextMonth} type="button" title="Mes siguiente">
              <ChevronRight size={14} />
            </button>
            <button className="cal-nav" onClick={nextYear} type="button" title="Año siguiente">
              <ChevronsRight size={14} />
            </button>
          </div>
          <div className="cal-weekdays">
            {dayNames.map((d) => (
              <span key={d} className="cal-weekday">
                {d}
              </span>
            ))}
          </div>
          <div className="cal-days">{days}</div>
        </div>
      )}
    </div>
  )
}
