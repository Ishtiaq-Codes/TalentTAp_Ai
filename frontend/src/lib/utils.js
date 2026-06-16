import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_BASE } from './constants'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count > 0) return `${count}${label} ago`
  }
  return 'just now'
}

export function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export function getMatchColor(score) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Extract base host from API_BASE if it's an absolute URL, otherwise default to current origin
  const baseURL = API_BASE.startsWith('http') ? API_BASE.split('/api')[0] : window.location.origin;
  // If in dev and API_BASE is relative, assume backend runs on 8000
  const isDev = window.location.hostname === 'localhost' && !API_BASE.startsWith('http');
  const host = isDev ? 'http://localhost:8000' : baseURL;
  
  return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
}
