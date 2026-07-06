import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'
import RegistroPage from './components/RegistroPage'
import ConsultaPage from './components/ConsultaPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function LoginGate() {
  const { user, login } = useAuth()

  if (user) {
    return <Navigate to="/inicio" replace />
  }

  return <LoginPage onLogin={login} />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <HomePage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/registro"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <RegistroPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consulta"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ConsultaPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
