import api from '../utils/api';

const CART_KEY = 'uzamali_cart';

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existing = cart.find((item) => item._id === product._id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const updateQuantity = (id, delta) => {
  const cart = getCart().map((item) =>
    item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item._id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

export const getCouriers = async () => {
  const { data } = await api.get('/users/couriers');
  return data.couriers;
};
