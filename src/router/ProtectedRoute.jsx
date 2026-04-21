import { Navigate } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('caldero_user') || 'null')
  const hasCompletedOnboarding = user?.hasCompletedOnboarding || false

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return children
}