import { Navigate } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

export default function RedirectIfAuth({ children }) {
  const user = JSON.parse(localStorage.getItem('caldero_user') || 'null')
  const hasCompletedOnboarding = user?.hasCompletedOnboarding || false

  if (user && hasCompletedOnboarding) {
    return <Navigate to={ROUTES.APP} replace />
  }

  if (user && !hasCompletedOnboarding) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return children
}