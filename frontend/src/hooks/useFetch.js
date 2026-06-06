import { useState, useEffect, useCallback } from 'react'

/**
 * Generic data-fetching hook with loading/error states.
 * @param {Function} fetchFn - API function that returns a promise
 * @param {Array} deps - dependency array for re-fetching
 */
export function useFetch(fetchFn, deps = [], options = {}) {
  const [data, setData] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await fetchFn()
      if (response.data?.results !== undefined) {
        setData(response.data.results)
        setMeta({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        })
      } else {
        setData(response.data)
        setMeta(null)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch()
    
    if (options.pollInterval) {
      const interval = setInterval(() => refetch(true), options.pollInterval)
      return () => clearInterval(interval)
    }
  }, [refetch, options.pollInterval])

  return { data, meta, loading, error, refetch, setData }
}
