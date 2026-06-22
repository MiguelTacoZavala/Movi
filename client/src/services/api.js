const TOKEN_KEY = 'movi_token'
const USER_KEY = 'movi_user'

const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser() {
    localStorage.removeItem(USER_KEY)
  },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' }
    const token = api.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const options = { method, headers }
    if (body !== undefined) {
      options.body = JSON.stringify(body)
    }

    const res = await fetch(`/api${path}`, options)
    const data = await res.json()

    if (!res.ok) {
      const err = new Error(data.error || 'Error de conexión')
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  },

  get(path) {
    return api.request('GET', path)
  },

  post(path, body) {
    return api.request('POST', path, body)
  },

  put(path, body) {
    return api.request('PUT', path, body)
  },

  del(path) {
    return api.request('DELETE', path)
  },

  patch(path, body) {
    return api.request('PATCH', path, body)
  },

  async uploadFile(path, fieldName, file) {
    const formData = new FormData()
    formData.append(fieldName, file)

    const token = api.getToken()
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || 'Error al subir archivo')
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  },

  async login(identifier, password) {
    const data = await api.post('/auth/login', { identifier, password })
    api.setToken(data.token)
    api.setUser(data.user)
    return data
  },

  async register(data) {
    const result = await api.post('/auth/register', data)
    api.setToken(result.token)
    api.setUser(result.user)
    return result
  },

  async me() {
    const data = await api.get('/auth/me')
    api.setUser(data.user)
    return data
  },

  async updateProfile(data) {
    const result = await api.put('/auth/profile', data)
    api.setUser(result.user)
    return result
  },

  async uploadProfilePhoto(file) {
    const result = await api.uploadFile('/upload/profile-photo', 'foto', file)
    const currentUser = api.getUser()
    if (currentUser && result.user) {
      api.setUser({ ...currentUser, fotoUrl: result.fotoUrl })
    }
    return result
  },

  async procesarPago(data) {
    return api.post('/pagos/procesar', data)
  },

  logout() {
    api.removeToken()
    api.removeUser()
  },
}

export default api
