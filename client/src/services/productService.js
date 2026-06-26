import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const imageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data.products;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
};

export const createProduct = async (formData) => {
  const { data } = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.product;
};
