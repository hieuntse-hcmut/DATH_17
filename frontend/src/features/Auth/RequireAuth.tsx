import { Navigate, Outlet } from 'react-router'
import { accessTokenStorage } from '~/config/accessTokenStorage'

export default function RequireAuth() {
  return accessTokenStorage.getAccessToken() ? <Outlet /> : <Navigate to="/login" replace />
}