import axios from 'axios';

// Set the base URL to point directly to the server
axios.defaults.baseURL = 'http://localhost:5000';

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  response => response,
  error => {
    // Log all errors for debugging
    console.error('Axios Error:', error);
    
    // Add custom error handling here if needed
    
    return Promise.reject(error);
  }
);

export default axios; 