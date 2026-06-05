import client from './client'

export const applicationsAPI = {
  list: (params) => client.get('/applications/', { params }),
  apply: (data) => client.post('/applications/apply/', data),
  update: (id, data) => client.patch(`/applications/${id}/`, data),
  delete: (id) => client.delete(`/applications/${id}/`),
  updateStatus: (id, status) => client.patch(`/applications/${id}/status/`, { status }),
  getShortlists: () => client.get('/applications/shortlists/'),
  addToShortlist: (data) => client.post('/applications/shortlists/', data),
  removeFromShortlist: (id) => client.delete(`/applications/shortlists/${id}/`),
  toggleShortlist: (data) => client.post('/applications/shortlists/toggle/', data),
}
