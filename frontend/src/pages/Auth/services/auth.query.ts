import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router";

import { login, register, logout } from './auth.api'


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
    // TODO
    onSuccess: (username) => {
      qc.setQueryData(['me'], username)
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  return () => {
    logout()
    qc.clear()
    void navigate("/login");
  }
}