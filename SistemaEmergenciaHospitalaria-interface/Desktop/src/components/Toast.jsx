import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`toast toast--${type}`}>
      {message}
    </div>
  )
}
