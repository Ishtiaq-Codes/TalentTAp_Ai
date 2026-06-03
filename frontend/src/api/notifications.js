import client from './client'

export const notificationsAPI = {
  list: () => client.get('/notifications/'),
  getUnreadCount: () => client.get('/notifications/unread-count/'),
  markAsRead: (id) => client.post(`/notifications/${id}/read/`),
  markAllAsRead: () => client.post('/notifications/read-all/'),
}
