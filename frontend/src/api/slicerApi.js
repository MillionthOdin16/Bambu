import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 300000, // 5 minutes for slicing operations
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const sliceFile = async (fileId, settings) => {
  const response = await api.post('/slice', {
    fileId,
    settings,
  });

  return response.data;
};

export const getPrinters = async () => {
  const response = await api.get('/printers');
  return response.data;
};

export const downloadFile = (filename) => {
  return `${API_BASE_URL}/api/download/${filename}`;
};

export default api;
