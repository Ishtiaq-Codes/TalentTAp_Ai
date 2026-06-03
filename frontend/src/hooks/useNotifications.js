import { useState, useEffect, useCallback } from 'react'
import { notificationsAPI } from '@/api/notifications'
import { useAuth } from '@/contexts/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await notificationsAPI.getUnreadCount()
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count', err)
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await notificationsAPI.list()
      setNotifications(res.data.results || res.data || [])
      // Sync unread count based on fetched list
      const unread = (res.data.results || res.data || []).filter(n => !n.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  // Poll for unread count every 10 seconds
  useEffect(() => {
    if (!user) return

    fetchUnreadCount() // Initial fetch
    const interval = setInterval(fetchUnreadCount, 10000)

    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  return {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
