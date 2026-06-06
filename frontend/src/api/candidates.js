import client from './client'

export const candidatesAPI = {
  getProfile: () => client.get('/candidates/profile/'),
  updateProfile: (data) => {
    const payload = { ...data }
    delete payload.avatar
    delete payload.banner_image
    delete payload.resume
    return client.put('/candidates/profile/', payload)
  },
  uploadResume: (file) => {
    const form = new FormData()
    form.append('resume', file)
    return client.patch('/candidates/resume/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  uploadBanner: (file) => {
    const form = new FormData()
    form.append('banner_image', file)
    return client.patch('/candidates/banner/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getSkills: () => client.get('/candidates/skills/'),
  addSkill: (data) => client.post('/candidates/skills/', data),
  deleteSkill: (id) => client.delete(`/candidates/skills/${id}/`),
  getExperience: () => client.get('/candidates/experience/'),
  addExperience: (data) => client.post('/candidates/experience/', data),
  updateExperience: (id, data) => client.put(`/candidates/experience/${id}/`, data),
  deleteExperience: (id) => client.delete(`/candidates/experience/${id}/`),
  getEducation: () => client.get('/candidates/education/'),
  addEducation: (data) => client.post('/candidates/education/', data),
  updateEducation: (id, data) => client.put(`/candidates/education/${id}/`, data),
  deleteEducation: (id) => client.delete(`/candidates/education/${id}/`),
  getCertifications: () => client.get('/candidates/certifications/'),
  addCertification: (data) => client.post('/candidates/certifications/', data),
  updateCertification: (id, data) => client.put(`/candidates/certifications/${id}/`, data),
  deleteCertification: (id) => client.delete(`/candidates/certifications/${id}/`),
  search: (params) => client.get('/candidates/top/', { params }),
  getPublicProfile: (id, params) => client.get(`/candidates/${id}/`, { params }),
  getOutreachDraft: (id, params) => client.get(`/candidates/${id}/outreach-draft/`, { params }),
  getInterviewQuestions: (id, params) => client.get(`/candidates/${id}/interview-questions/`, { params }),

  generateOutreachStream: async (id, params, onChunk) => {
    const baseURL = client.defaults.baseURL || 'http://localhost:8000/api';
    const token = localStorage.getItem('access_token');
    const queryString = params?.job_id ? `&job_id=${params.job_id}` : '';
    
    const response = await fetch(`${baseURL}/candidates/${id}/outreach-draft/?stream=true${queryString}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) throw new Error(`Streaming API error: ${response.statusText}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        onChunk(decoder.decode(value, { stream: true }));
      }
    }
  },

  generateInterviewPrepStream: async (id, params, onChunk) => {
    const baseURL = client.defaults.baseURL || 'http://localhost:8000/api';
    const token = localStorage.getItem('access_token');
    const queryString = params?.job_id ? `&job_id=${params.job_id}` : '';
    
    const response = await fetch(`${baseURL}/candidates/${id}/interview-questions/?stream=true${queryString}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) throw new Error(`Streaming API error: ${response.statusText}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        onChunk(decoder.decode(value, { stream: true }));
      }
    }
  },

  generateCoverLetterStream: async (jobId, onChunk) => {
    const baseURL = client.defaults.baseURL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('access_token');
    
    // We assume backend handles the stream query param via fetch
    const response = await fetch(`${baseURL}/candidates/cover-letter/?job_id=${jobId}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) throw new Error(`Streaming API error: ${response.statusText}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        onChunk(decoder.decode(value, { stream: true }));
      }
    }
  }
}
