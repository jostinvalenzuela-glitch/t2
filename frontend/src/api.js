const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
export async function request(path, options = {}) {
  let response
  try {
    response = await fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba que el backend esté iniciado e inténtalo nuevamente.')
  }
  if (response.status === 204) return null
  const data = await response.json()
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(' · ') : data.message || `Error del servidor (${response.status})`)
  return data
}
