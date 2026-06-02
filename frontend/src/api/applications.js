import client from './client'

export const applicationsAPI = {
  list: (params) => client.get('/applications/', { params }),
  apply: (data) => client.post('/applications/apply/', data),
  updateStatus: (id, status) => client.patch(`/applications/${id}/status/`, { status }),
  getShortlists: () => client.get('/applications/shortlists/'),
  addToShortlist: (data) => client.post('/applications/shortlists/', data),
  removeFromShortlist: (id) => client.delete(`/applications/shortlists/${id}/`),
}
