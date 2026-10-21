import { api, getApi } from '~/config/axiosClient'
import type { NotificationItem, UnreadNotificationCount } from './notification.type'

export const getMyNotifications = () =>
  getApi<NotificationItem[]>('/notifications/me', { limit: 100 })

export const getUnreadNotificationCount = () =>
  getApi<UnreadNotificationCount>('/notifications/me/unread-count')

export const markNotificationAsRead = (id: number) =>
  api.patch(`/notifications/${id}/read`)

export const markAllNotificationsAsRead = () =>
  api.patch('/notifications/me/read-all')
