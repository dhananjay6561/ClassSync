import axios from 'axios';

const api = axios.create({
  baseURL: 'https://classsync-2uzj.onrender.com', // Your backend server URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error is 401 and not on the login page, it could be an expired token
    if (error.response && error.response.status === 401) {
      // Here you could trigger a logout or token refresh
      // For now, we'll just log the error
      console.error("Authentication Error:", error.response.data);
      // To prevent loops, you might want to redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api; 

//This is the api for the backend