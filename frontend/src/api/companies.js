import client from './client'

export const companiesAPI = {
  // Company profile
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

  // Dashboard analytics (NEW)
  getDashboard: () => client.get('/companies/dashboard/'),

  // Recruiter management
  getRecruiters: () => client.get('/companies/recruiters/'),
  inviteRecruiter: (data) => client.post('/companies/recruiters/invite/', data),
  getPendingInvites: () => client.get('/companies/recruiters/invite/pending/'),
  getInvite: (token) => client.get(`/companies/recruiters/invite/${token}/`),
  revokeInvite: (id) => client.delete(`/companies/recruiters/invite/${id}/revoke/`),
  removeRecruiter: (id) => client.delete(`/companies/recruiters/${id}/`),
  updateRecruiterStatus: (id, is_active) => client.patch(`/companies/recruiters/${id}/status/`, { is_active }),  // NEW

  // Talent Pools (NEW)
  getPools: () => client.get('/companies/pools/'),
  createPool: (data) => client.post('/companies/pools/', data),
  updatePool: (id, data) => client.patch(`/companies/pools/${id}/`, data),
  deletePool: (id) => client.delete(`/companies/pools/${id}/`),
  getPoolMembers: (id) => client.get(`/companies/pools/${id}/members/`),
  addPoolMember: (poolId, candidateId, notes = '') =>
    client.post(`/companies/pools/${poolId}/members/`, { candidate: candidateId, notes }),
  removePoolMember: (poolId, candidateId) =>
    client.delete(`/companies/pools/${poolId}/members/${candidateId}/`),
}
