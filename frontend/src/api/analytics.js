import apiClient from './client'

export const analyticsAPI = {
  getRecruiterActivities: () => apiClient.get('/analytics/activities/'),
}
