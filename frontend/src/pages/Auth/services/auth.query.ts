import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accessTokenStorage } from '~/config/accessTokenStorage'
import { useNavigate } from "react-router";

import { login, logout } from './auth.api'


// export const useMe = () =>
//   useQuery({
//     queryKey: ['me'],
//     queryFn: getMe,
//     enabled: !!accessTokenStorage.getAccessToken(),
//     retry: false,
//   })

export const useLogin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (username) => {
      localStorage.setItem('username', username)
      qc.setQueryData(['me'], username)
    },
  })
}

export const useLogout = () => {
  const qc = useQueryClient()
  return () => {
    logout()
    qc.clear()
  }
}