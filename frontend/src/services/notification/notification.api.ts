import { getApi, patchApi } from '~/config/axiosClient'
import type { NotificationItem, UnreadNotificationCount } from './notification.type'

export const getMyNotifications = () =>
  getApi<NotificationItem[]>('/notifications/me', { limit: 100 })

export const getUnreadNotificationCount = () =>
  getApi<UnreadNotificationCount>('/notifications/me/unread-count')

export const markNotificationAsRead = (id: number) =>
  patchApi(`/notifications/${id}/read`)

export const markAllNotificationsAsRead = () =>
  patchApi('/notifications/me/read-all')
