import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { accessTokenStorage } from '~/config/accessTokenStorage'
import { resetProgressCache } from '~/pages/CourseDetail/services/progress.api'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(() => {
    navigate('/login', { replace: true })
    accessTokenStorage.clearAccessToken()
    void queryClient.cancelQueries()
    queryClient.clear()
    resetProgressCache()
  }, [navigate, queryClient])
}