import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Order from '../models/Order.js';

const router = Router();

router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const userId = req.user._id.toString();
    const isParticipant =
      req.user.role === 'courier' ||
      req.user.role === 'admin' ||
      userId === order.buyer?.toString() ||
      userId === order.farmer?.toString() ||
      (order.courier && userId === order.courier.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this order' });
    }

    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'name role')
      .sort('createdAt');

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:orderId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message text is required' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const userId = req.user._id.toString();
    const isParticipant =
      req.user.role === 'courier' ||
      req.user.role === 'admin' ||
      userId === order.buyer?.toString() ||
      userId === order.farmer?.toString() ||
      (order.courier && userId === order.courier.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this order' });
    }

    const message = await Message.create({
      order: req.params.orderId,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await message.populate('sender', 'name role');

    req.app.get('io')?.to(`order_${req.params.orderId}`).emit('newMessage', populated);

    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
