import client from './client'

export const candidatesAPI = {
  getProfile: () => client.get('/candidates/profile/'),
  updateProfile: (data) => client.put('/candidates/profile/', data),
  uploadResume: (file) => {
    const form = new FormData()
    form.append('resume', file)
    return client.patch('/candidates/resume/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getSkills: () => client.get('/candidates/skills/'),
  addSkill: (data) => client.post('/candidates/skills/', data),
  deleteSkill: (id) => client.delete(`/candidates/skills/${id}/`),
  getExperience: () => client.get('/candidates/experience/'),
  addExperience: (data) => client.post('/candidates/experience/', data),
  updateExperience: (id, data) => client.put(`/candidates/experience/${id}/`, data),
  deleteExperience: (id) => client.delete(`/candidates/experience/${id}/`),
  search: (params) => client.get('/candidates/search/', { params }),
  getPublicProfile: (id) => client.get(`/candidates/${id}/`),
}
