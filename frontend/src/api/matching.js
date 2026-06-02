import client from './client'

export const matchingAPI = {
  runForJob: (jobId) => client.post(`/matching/jobs/${jobId}/run/`),
  getJobResults: (jobId, params) => client.get(`/matching/jobs/${jobId}/results/`, { params }),
  getCandidateMatches: (params) => client.get('/matching/candidates/me/', { params }),
}
