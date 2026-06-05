import client from './client'

export const authAPI = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  refreshToken: (refresh) => client.post('/auth/token/refresh/', { refresh }),
  getMe: () => client.get('/auth/me/'),
  updateMe: (data) => client.patch('/auth/me/', data),
  completeOnboarding: () => client.patch('/auth/me/onboard-complete/'),
  changePassword: (data) => client.post('/auth/change-password/', data),
  forgotPassword: (email) => client.post('/auth/forgot-password/', { email }),
  resetPassword: (uidb64, token, password) => client.post('/auth/reset-password/', { uidb64, token, password }),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return client.patch('/auth/avatar/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  acceptInvite: (token, password) => client.post('/auth/accept-invite/', { token, password }),

  // MFA
  loginMFA: (mfa_token, code) => client.post('/auth/login/mfa/', { mfa_token, code }),
  setupMFA: () => client.post('/auth/mfa/setup/'),
  verifyMFA: (code) => client.post('/auth/mfa/verify/', { code }),
  disableMFA: () => client.post('/auth/mfa/disable/'),
}
