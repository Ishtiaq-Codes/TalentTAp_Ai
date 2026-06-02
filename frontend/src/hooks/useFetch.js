import { useState, useEffect, useCallback } from 'react'

/**
 * Generic data-fetching hook with loading/error states.
 * @param {Function} fetchFn - API function that returns a promise
 * @param {Array} deps - dependency array for re-fetching
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn()
      setData(response.data?.results ?? response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, error, refetch, setData }
}
