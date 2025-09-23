const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
  message?: string
  user?: T
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'user' | 'admin'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

const fetchWithCredentials = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetchWithCredentials(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, data: any): Promise<ApiResponse<T>> {
  const res = await fetchWithCredentials(`${API_BASE}${path}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function apiPut<T>(path: string, data: any): Promise<ApiResponse<T>> {
  const res = await fetchWithCredentials(`${API_BASE}${path}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetchWithCredentials(`${API_BASE}${path}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

// Auth API functions
export async function login(credentials: LoginRequest): Promise<ApiResponse<User>> {
  return apiPost('/auth/login', credentials)
}

export async function register(userData: RegisterRequest): Promise<ApiResponse<User>> {
  return apiPost('/auth/register', userData)
}

export async function logout(): Promise<ApiResponse<null>> {
  return apiPost('/auth/logout', {})
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiGet('/auth/me')
}

// Reservation API functions
export async function cancelReservation(reservationId: string): Promise<ApiResponse<Reservation>> {
  return apiPut(`/reservations/${reservationId}/cancel`, {})
}

// Types
export interface Table {
  _id: string
  name: string
  capacity: number
  location: 'hall' | 'vip' | 'outdoor'
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  _id: string
  title: string
  price: number
  category: 'کباب' | 'خورش' | 'پیش‌غذا' | 'نوشیدنی'
  image?: string
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  _id: string
  table: Table
  name: string
  phone: string
  guests: number
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  item: MenuItem
  qty: number
}

export interface Order {
  _id: string
  reservation?: Reservation
  items: OrderItem[]
  total: number
  status: 'draft' | 'placed' | 'paid' | 'cancelled'
  customerName: string
  customerPhone: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

// Order API functions
export async function createOrder(orderData: {
  items: { item: string; quantity: number }[]
  customerName: string
  customerPhone: string
  notes?: string
}): Promise<ApiResponse<Order>> {
  return apiPost('/orders', orderData)
}

export async function getOrders(): Promise<ApiResponse<Order[]>> {
  return apiGet('/orders')
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<Order>> {
  return apiPut(`/orders/${orderId}/status`, { status })
}


