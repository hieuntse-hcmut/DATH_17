import { getApi, patchApi } from '~/config/axiosClient'
import type { NotificationItem } from './notification.type'

export const getMyNotifications = (unreadOnly: boolean) =>
  getApi<NotificationItem[]>('/notifications/me', { unreadOnly, limit: 50 })

export const markNotificationAsRead = (id: number) =>
  patchApi(`/notifications/${id}/read`)

export const markAllNotificationsAsRead = () =>
  patchApi('/notifications/me/read-all')
