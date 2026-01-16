const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/room-extensions`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getExtensionRequestsForGuest = async () => {
  try {
    const res = await fetch(`${API_URL}/guest/requests`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch extension requests');
    }
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error('Error fetching extension requests:', err);
    throw err;
  }
};

const createExtensionRequest = async (data) => {
  try {
    const res = await fetch(`${API_URL}/guest/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create extension request');
    }
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error('Error creating extension request:', err);
    throw err;
  }
};

export default {
  getExtensionRequestsForGuest,
  createExtensionRequest
};

