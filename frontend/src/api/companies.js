import client from './client'

export const companiesAPI = {
  getProfile: () => client.get('/companies/profile/'),
  updateProfile: (data) => {
    const payload = { ...data }
    delete payload.logo
    delete payload.banner_image
    return client.put('/companies/profile/', payload)
  },
  uploadImages: (logo, banner) => {
    const form = new FormData()
    if (logo) form.append('logo', logo)
    if (banner) form.append('banner_image', banner)
    return client.patch('/companies/profile/images/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  createCompany: (data) => client.post('/companies/create/', data),
  getRecruiters: () => client.get('/companies/recruiters/'),
  inviteRecruiter: (data) => client.post('/companies/recruiters/invite/', data),
  getPendingInvites: () => client.get('/companies/recruiters/invite/pending/'),
  getInvite: (token) => client.get(`/companies/recruiters/invite/${token}/`),
  revokeInvite: (id) => client.delete(`/companies/recruiters/invite/${id}/revoke/`),
  removeRecruiter: (id) => client.delete(`/companies/recruiters/${id}/`),
}
