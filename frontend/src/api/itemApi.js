const API_URL = '/api/items';

const getToken = () => localStorage.getItem('token');

const getItems = async () => {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  return res.json();
};

const createItem = async (item) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(item),
  });
};

export default { getItems, createItem };
