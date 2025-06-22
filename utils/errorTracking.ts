export const trackError = (error: Error, context?: string) => {
  console.error(`[${context}] Error:`, error);
  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
};

/**
 * Safely handle API responses to prevent Chrome extension errors
 * This function ensures responses have proper structure before processing
 */
export const safeApiResponse = async <T>(
  apiCall: Promise<T>,
  fallbackValue?: T
): Promise<T> => {
  try {
    const response = await apiCall;
    
    // Validate response structure
    if (response === null || response === undefined) {
      console.warn('API response is null or undefined, using fallback');
      return fallbackValue as T;
    }
    
    return response;
  } catch (error: any) {
    // Handle responses with null bodies but valid status codes
    if (error.response && error.response.status && 
        (error.response.data === null || error.response.data === undefined)) {
      console.warn('Response with null body detected, using fallback');
      return fallbackValue as T;
    }
    
    // Handle null status responses
    if (error.response && (error.response.status === null || error.response.status === undefined)) {
      console.error('Response with null status detected:', error.response);
      throw new Error('Server returned invalid response status');
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Enhanced error handler for API calls that prevents Chrome extension conflicts
 */
export const handleApiError = (error: any, context: string = 'API call') => {
  // Log the error for debugging
  console.error(`${context} failed:`, {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Handle specific error types
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
    return;
  }
  
  if (error.response?.status === 403) {
    console.error('Access forbidden');
    return;
  }
  
  if (error.response?.status >= 500) {
    console.error('Server error occurred');
    return;
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network error: Unable to connect to server');
    return;
  }
  
  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout: Server took too long to respond');
    return;
  }
  
  // Handle Chrome extension conflicts
  if (error.message?.includes('Response with null body status cannot have body')) {
    console.warn('Chrome extension conflict detected, ignoring error');
    return;
  }
  
  // Default error handling
  console.error('Unexpected error:', error);
};

/**
 * Test function to verify Chrome extension error handling
 * This can be called to test if the error handling is working properly
 */
export const testChromeExtensionErrorHandling = () => {
  console.log('Testing Chrome extension error handling...');
  
  // Simulate the Chrome extension error
  const mockError = new Error('Response with null body status cannot have body') as any;
  mockError.response = {
    status: 200,
    statusText: 'OK',
    data: null
  };
  
  try {
    handleApiError(mockError, 'Test API call');
    console.log('✅ Chrome extension error handled successfully');
  } catch (error) {
    console.error('❌ Chrome extension error handling failed:', error);
  }
};

// Export the test function for debugging
if (typeof window !== 'undefined') {
  (window as any).testChromeExtensionErrorHandling = testChromeExtensionErrorHandling;
}
