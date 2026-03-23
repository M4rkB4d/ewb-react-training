// TODO: Implement Exercise 1 — Secure API Client with Token Refresh
// See guide B03 for requirements | Run: npm run test:exercises:05
import axios from 'axios';
// TODO: Configure with baseURL, withCredentials: true, 30s timeout
// TODO: Add request interceptor (Authorization, X-Request-ID, X-Timestamp)
// TODO: Add response interceptor (401 refresh with mutex)
export const apiClient = axios.create();
