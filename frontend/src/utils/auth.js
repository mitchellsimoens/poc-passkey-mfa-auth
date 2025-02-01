import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3000';

// Function to refresh the access token
export const refreshAccessToken = async () => {
  try {
    const res = await fetch(`${API_URL}/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Ensures cookies (refreshToken) are sent
    });

    const data = await res.json();
    if (!data.success) {
      console.warn('Session expired, please log in again.');
      window.location.href = '/login'; // Redirect user to login
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/login'; // Redirect to login on failure
  }
};

// Automatically refresh token every 14 minutes (before the 15-min expiration)
export const startTokenRefreshInterval = () => {
  setInterval(
    () => {
      refreshAccessToken();
    },
    14 * 60 * 1000,
  ); // Refresh every 14 minutes
};

export const decodeToken = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    .split('=')[1];
  const decoded = jwtDecode(token);

  return decoded;
};
