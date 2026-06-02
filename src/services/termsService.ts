import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const getActiveTerms = async () => {
  const response = await axios.get(`${API_BASE}/terms/active`);
  return response.data;
};
