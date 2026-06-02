import client from './client'

export const authAPI = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  refreshToken: (refresh) => client.post('/auth/token/refresh/', { refresh }),
  getMe: () => client.get('/auth/me/'),
  updateMe: (data) => client.patch('/auth/me/', data),
  changePassword: (data) => client.post('/auth/change-password/', data),
  forgotPassword: (email) => client.post('/auth/forgot-password/', { email }),
  acceptInvite: (token, password) => client.post('/auth/accept-invite/', { token, password }),
}
