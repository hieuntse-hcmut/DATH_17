import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accessTokenStorage } from '~/config/accessTokenStorage'

import { getMe, login, logout } from './auth.api'


export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!accessTokenStorage.getAccessToken(),
    retry: false,
  })

export const useLogin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  })
}

export const useLogout = () => {
  const qc = useQueryClient()
  return () => {
    logout()
    qc.clear()
  }
}