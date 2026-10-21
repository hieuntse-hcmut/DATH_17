import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notification.api'

const notificationsQueryKey = ['notifications'] as const

export const useGetMyNotifications = (enabled: boolean) =>
  useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getMyNotifications,
    enabled,
  })

export const useGetUnreadNotificationCount = (enabled: boolean) =>
  useQuery({
    queryKey: [...notificationsQueryKey, 'unread-count'],
    queryFn: getUnreadNotificationCount,
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
