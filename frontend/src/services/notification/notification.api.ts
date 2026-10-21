import { api, getApi } from '~/config/axiosClient'
import type { NotificationItem } from './notification.type'

export const getMyNotifications = (unreadOnly: boolean) =>
  getApi<NotificationItem[]>('/notifications/me', { unreadOnly, limit: 50 })

export const markNotificationAsRead = (id: number) =>
  api.patch(`/notifications/${id}/read`)

export const markAllNotificationsAsRead = () =>
  api.patch('/notifications/me/read-all')
