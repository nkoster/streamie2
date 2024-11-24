import axios from 'axios';

const API_BASE = 'http://localhost:8080'; // Backend URL

export const login = async (username: string, password: string): Promise<string> => {
  const response = await axios.post(`${API_BASE}/auth`, { username, password });
  return response.data.token; // Return JWT-token
};

export const updateStreamKey = async (token: string, streamKey: string): Promise<void> => {
  await axios.post(
    `${API_BASE}/update`,
    { streamkey: streamKey },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
