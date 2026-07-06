import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './layout/Layout'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}
