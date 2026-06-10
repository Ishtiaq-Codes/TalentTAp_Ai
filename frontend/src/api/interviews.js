import client from './client';

export const interviewsApi = {
  startInterview: async (data) => {
    const response = await client.post('/interviews/start/', data);
    return response.data;
  },

  getInterview: async (id) => {
    const response = await client.get(`/interviews/${id}/`);
    return response.data;
  },

  submitAnswer: async (id, questionId, data) => {
    const response = await client.post(`/interviews/${id}/submit-answer/${questionId}/`, data);
    return response.data;
  },

  flagCheating: async (id, flagType) => {
    const response = await client.post(`/interviews/${id}/flag-cheating/`, { flag_type: flagType });
    return response.data;
  },

  completeInterview: async (id) => {
    const response = await client.post(`/interviews/${id}/complete/`);
    return response.data;
  }
};
