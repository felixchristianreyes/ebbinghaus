import axios from 'axios'

const API_BASE_URL = (
  (import.meta as any)?.env?.VITE_API_URL as string | undefined
) || 'http://localhost:8000'

export const http = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api/v1`,
})


