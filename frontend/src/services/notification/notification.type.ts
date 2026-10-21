export interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  readAt?: string
}
