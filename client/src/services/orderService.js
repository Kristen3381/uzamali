import api from '../utils/api';

const LOCAL_ORDERS_KEY = 'uzamali_orders';

const SAMPLE_INITIAL_ORDERS = [
  {
    _id: 'ord-892101',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    totalPrice: 4500,
    quantity: 100,
    deliveryMethod: 'courier',
    vehicleType: 'motorcycle',
    status: 'confirmed',
    escrowStatus: 'held',
    paymentRef: 'MPESA-NL89234X12',
    listing: {
      _id: 'prod-101',
      title: 'Fresh Red Tomatoes (Kinangop)',
      name: 'Fresh Red Tomatoes (Kinangop)',
      price: 45,
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'],
      location: 'Kinangop, Nyandarua'
    },
    farmer: {
      name: 'John Farmer',
      phone: '+254711111111',
      location: 'Kinangop'
    }
  },
  {
    _id: 'ord-892102',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    totalPrice: 1500,
    quantity: 10,
    deliveryMethod: 'pickup',
    vehicleType: 'pickup',
    status: 'confirmed',
    escrowStatus: 'released',
    paymentRef: 'MPESA-QK90123M45',
    listing: {
      _id: 'waste-1',
      title: 'Dry Maize Stalks & Husks',
      name: 'Dry Maize Stalks & Husks',
      price: 150,
      unit: 'bundle (40kg)',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400'],
      location: 'Nakuru, Rongai'
    },
    farmer: {
      name: 'Western Agro Co-op',
      phone: '+254722334455',
      location: 'Nakuru'
    }
  }
];

export const getLocalOrders = () => {
  try {
    const data = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read local orders', err);
  }
  return SAMPLE_INITIAL_ORDERS;
};

export const saveLocalOrder = (order) => {
  try {
    const existing = getLocalOrders();
    // Avoid duplicate order IDs
    const updated = [order, ...existing.filter(o => o._id !== order._id)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('uzamali_order_created', { detail: order }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save order locally', err);
    return [];
  }
};

export const getMyOrders = async () => {
  const local = getLocalOrders();
  try {
    const { data } = await api.get('/orders');
    if (data && data.orders && data.orders.length > 0) {
      // Merge server orders with local orders that aren't on server yet
      const serverIds = new Set(data.orders.map(o => o._id));
      const unsyncedLocal = local.filter(l => !serverIds.has(l._id));
      const merged = [...data.orders, ...unsyncedLocal];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Backend orders endpoint unavailable, serving persistent local orders', err);
  }
  return local;
};
