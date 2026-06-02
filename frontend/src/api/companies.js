import client from './client'

export const companiesAPI = {
  getProfile: () => client.get('/companies/profile/'),
  updateProfile: (data) => client.put('/companies/profile/', data),
  createCompany: (data) => client.post('/companies/create/', data),
  getRecruiters: () => client.get('/companies/recruiters/'),
  inviteRecruiter: (data) => client.post('/companies/recruiters/invite/', data),
  removeRecruiter: (id) => client.delete(`/companies/recruiters/${id}/`),
}
