import client from './client'

/**
 * Shared streaming fetch utility.
 * Reads a ReadableStream from a fetch response and calls `onChunk` for each decoded text chunk.
 *
 * @param {string} path - API path (appended to client's baseURL)
 * @param {Object} options
 * @param {string} [options.method='GET']
 * @param {Object} [options.body] - JSON body for POST requests
 * @param {boolean} [options.auth=true] - whether to attach the JWT bearer token
 * @param {Function} onChunk - callback receiving each decoded text chunk
 */
export async function streamFetch(path, { method = 'GET', body, auth = true } = {}, onChunk) {
  const baseURL = client.defaults.baseURL || '/api/v1'
  const token = auth ? localStorage.getItem('access_token') : null

  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) throw new Error(`Streaming API error: ${response.statusText}`)

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let done = false
  while (!done) {
    const { value, done: doneReading } = await reader.read()
    done = doneReading
    if (value) {
      onChunk(decoder.decode(value, { stream: true }))
    }
  }
}
