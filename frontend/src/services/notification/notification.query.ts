import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notification.api'

const notificationsQueryKey = ['notifications'] as const

export const useGetMyNotifications = (unreadOnly: boolean, enabled: boolean) =>
  useQuery({
    queryKey: [...notificationsQueryKey, { unreadOnly }],
    queryFn: () => getMyNotifications(unreadOnly),
    enabled,
  })

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  })
}
