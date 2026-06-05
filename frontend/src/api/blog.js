import client from './client'
import axios from 'axios'
import { API_BASE } from '@/lib/constants'

// Public blog API — no auth required, uses plain axios for unauthenticated requests
const publicClient = axios.create({ baseURL: API_BASE })

export const blogAPI = {
  getCategories: () => publicClient.get('/blog/categories/'),
  getPosts: (params = {}) => publicClient.get('/blog/posts/', { params }),
  getPost: (slug) => publicClient.get(`/blog/posts/${slug}/`),
  getFeatured: () => publicClient.get('/blog/featured/'),
}
