import { User } from '../types';

// Use relative path to leverage Vite proxy, or env var for production
// We use optional chaining (?.) to prevent crashing if import.meta.env is undefined
const API_URL = (import.meta as any)?.env?.VITE_API_URL || '/api';

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet or backend connection.');
        }
        throw error;
    }
};

export const authService = {
  login: async (email: string, password?: string): Promise<User> => {
    const pwd = password || 'password123';
    
    // Note: Mock credentials removed to enforce backend connection.
    // Please sign up or check MongoDB for valid users.

    try {
        const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pwd }) 
        });
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`Server Error: ${text.substring(0, 50)}...`);
        }

        if (!response.ok) {
             throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
    } catch (error) {
        console.error("Auth Error", error);
        throw error;
    }
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
      try {
          const response = await fetchWithTimeout(`${API_URL}/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
          });
  
          const text = await response.text();
          let data;
          try {
              data = JSON.parse(text);
          } catch {
               throw new Error(`Server Error: ${text.substring(0, 50)}...`);
          }

          if (!response.ok) {
               throw new Error(data.message || 'Signup failed');
          }
  
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          return data.user;
      } catch (error) {
          console.error("Registration Error", error);
          throw error;
      }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }
};