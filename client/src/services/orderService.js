import api from '../utils/api';

export const getMyOrders = async () => {
  const { data } = await api.get('/orders');
  return data.orders;
};
