import client from './client'

export const messagingAPI = {
  getConversations: () => client.get('/messages/conversations/'),
  startConversation: (data) => client.post('/messages/conversations/start/', data),
  getMessages: (id) => client.get(`/messages/conversations/${id}/`),
  sendMessage: (id, content) => client.post(`/messages/conversations/${id}/send/`, { content }),
  markRead: (id) => client.post(`/messages/conversations/${id}/read/`),
}
