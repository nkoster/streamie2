import axios from 'axios';

const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;

  const portPart = port ? `:${port}` : '';
  if (hostname === 'localhost') {
    // Use the local server when running in development
    return 'http://localhost:8080';
  }
  return `${protocol}//${hostname}${portPart}`;
};

const API_BASE = getBaseUrl();

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
});

// Add an interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response, // Let successful responses pass through
  (error) => {
    if (error.response?.status === 401) {
      // Remove the token if it is no longer valid
      localStorage.removeItem('token');
      // Redirect the user to the login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string): Promise<string> => {
  const response = await apiClient.post('/auth', { username, password });
  return response.data.token;
};

export const updateStreamKey = async (
  token: string,
  payload: {
    streamkey_youtube: string;
    streamkey_twitch: string;
    streamkey_facebook: string;
    enable_youtube: boolean;
    enable_twitch: boolean;
    enable_facebook: boolean;
  }
): Promise<void> => {
  await apiClient.post('/update', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getConfig = async (token: string) => {
  const response = await apiClient.get('/getconf', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
