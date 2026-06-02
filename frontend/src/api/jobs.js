import client from './client'

export const jobsAPI = {
  list: (params) => client.get('/jobs/', { params }),
  listPublic: (params) => client.get('/jobs/public/', { params }),
  get: (id) => client.get(`/jobs/${id}/`),
  create: (data) => client.post('/jobs/', data),
  update: (id, data) => client.put(`/jobs/${id}/`, data),
  updateStatus: (id, status) => client.patch(`/jobs/${id}/status/`, { status }),
}
