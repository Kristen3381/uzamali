import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.get('/disputes', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ escrowStatus: 'disputed' })
      .populate('listing', 'title price')
      .populate('farmer', 'name phone')
      .populate('buyer', 'name phone')
      .sort('-updatedAt');
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/disputes/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['released', 'refunded'].includes(action)) {
      return res.status(400).json({ message: 'action must be "released" or "refunded"' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.escrowStatus !== 'disputed') {
      return res.status(400).json({ message: 'Only disputed orders can be resolved' });
    }

    order.escrowStatus = action;
    await order.save();

    return res.json({ message: `Order ${action} successfully`, order });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
