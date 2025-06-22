import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../constants';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Validate response structure to prevent null body issues
    if (!response || response.status === null || response.status === undefined) {
      console.error('Invalid response received:', response);
      throw new Error('Invalid response: missing status code');
    }
    
    // Ensure response has proper structure
    if (response.status >= 200 && response.status < 300) {
      // For successful responses, ensure data exists
      if (response.data === null || response.data === undefined) {
        // If no data but successful status, provide empty object
        response.data = {};
      }
    }
    
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    // Handle null status responses (which can cause the Chrome extension error)
    if (error.response && (error.response.status === null || error.response.status === undefined)) {
      console.error('Response with null status detected:', error.response);
      throw new Error('Server returned invalid response status');
    }
    
    // Handle responses with null bodies but valid status codes
    if (error.response && error.response.status && (error.response.data === null || error.response.data === undefined)) {
      console.warn('Response with null body but valid status:', error.response);
      // Create a proper error response
      const enhancedError = new Error(error.response.statusText || 'Request failed') as any;
      enhancedError.response = {
        ...error.response,
        data: { message: 'No response body available' }
      };
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export default api;
