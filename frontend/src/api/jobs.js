import client from './client'

export const jobsAPI = {
  list: (params) => client.get('/jobs/', { params }),
  listPublic: (params) => client.get('/jobs/public/', { params }),
  get: (id) => client.get(`/jobs/${id}/`),
  create: (data) => client.post('/jobs/', data),
  update: (id, data) => client.put(`/jobs/${id}/`, data),
  delete: (id) => client.delete(`/jobs/${id}/`),
  updateStatus: (id, status) => client.patch(`/jobs/${id}/status/`, { status }),
  repost: (id) => client.post(`/jobs/${id}/repost/`),
  optimize: (data) => client.post('/jobs/optimize/', data),
  
  optimizeStream: async (data, onChunk) => {
    // Determine the base URL from the client configuration
    const baseURL = client.defaults.baseURL || 'http://localhost:8000/api';
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${baseURL}/jobs/optimize/?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Streaming API error: ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    }
  }
}
