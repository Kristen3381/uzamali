import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';
import { sendOtp } from '../services/sms.js';
import { b2cPayout } from '../services/mpesa.js';
import crypto from 'crypto';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    let deliveries;

    if (user.role === 'admin') {
      deliveries = await Delivery.find({}).sort('-createdAt');
    } else if (user.role === 'courier') {
      deliveries = await Delivery.find({
        $or: [{ courier: user._id }, { courier: null, status: 'pending' }],
      }).sort('-createdAt');
    } else if (user.role === 'farmer') {
      const orders = await Order.find({ farmer: user._id, deliveryMethod: 'courier' }).select('_id');
      const orderIds = orders.map((o) => o._id);
      deliveries = await Delivery.find({ order: { $in: orderIds } }).sort('-createdAt');
    } else {
      const orders = await Order.find({ buyer: user._id, deliveryMethod: 'courier' }).select('_id');
      const orderIds = orders.map((o) => o._id);
      deliveries = await Delivery.find({ order: { $in: orderIds } }).sort('-createdAt');
    }

    const populated = await Delivery.populate(deliveries, [
      { path: 'order', populate: [
        { path: 'listing', select: 'title price unit images location' },
        { path: 'farmer', select: 'name phone' },
        { path: 'buyer', select: 'name phone' },
      ]},
      { path: 'courier', select: 'name phone' },
    ]);

    return res.json({ deliveries: populated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/accept', protect, async (req, res) => {
  try {
    if (req.user.role !== 'courier') {
      return res.status(403).json({ message: 'Only couriers can accept deliveries' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.status !== 'pending') {
      return res.status(400).json({ message: 'Delivery is not available for acceptance' });
    }
    if (delivery.courier) {
      return res.status(400).json({ message: 'Delivery already assigned to a courier' });
    }

    delivery.courier = req.user._id;
    delivery.acceptedAt = new Date();
    delivery.status = 'pending';
    await delivery.save();

    const order = await Order.findById(delivery.order);
    if (order) {
      order.courier = req.user._id;
      await order.save();
    }

    const populated = await Delivery.populate(delivery, [
      { path: 'order', populate: [
        { path: 'listing', select: 'title price unit images location' },
        { path: 'farmer', select: 'name phone' },
        { path: 'buyer', select: 'name phone' },
      ]},
      { path: 'courier', select: 'name phone' },
    ]);

    return res.json({ message: 'Delivery accepted', delivery: populated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/pickup', protect, async (req, res) => {
  try {
    if (req.user.role !== 'courier') {
      return res.status(403).json({ message: 'Only couriers can mark pickup' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.courier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This delivery is not assigned to you' });
    }
    if (delivery.status !== 'pending') {
      return res.status(400).json({ message: 'Delivery already in transit or delivered' });
    }

    const { pickupGps } = req.body;
    if (!pickupGps || pickupGps.lat == null || pickupGps.lng == null) {
      return res.status(400).json({ message: 'pickupGps with lat and lng is required' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const order = await Order.findById(delivery.order);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryOtp = otp;
    order.pickupGps = { lat: pickupGps.lat, lng: pickupGps.lng, timestamp: new Date() };
    await order.save();

    delivery.status = 'in-transit';
    await delivery.save();

    const buyer = await order.populate('buyer', 'phone name');
    await sendOtp(buyer.buyer.phone, otp);

    return res.json({ message: 'Pickup confirmed. OTP sent to buyer.', delivery, otp });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/confirm', protect, async (req, res) => {
  try {
    if (req.user.role !== 'courier') {
      return res.status(403).json({ message: 'Only couriers can confirm delivery' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.courier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This delivery is not assigned to you' });
    }
    if (delivery.status !== 'in-transit') {
      return res.status(400).json({ message: 'Delivery must be in transit to confirm' });
    }

    const { otp, deliveryGps } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    if (!deliveryGps || deliveryGps.lat == null || deliveryGps.lng == null) {
      return res.status(400).json({ message: 'deliveryGps with lat and lng is required' });
    }

    const order = await Order.findById(delivery.order);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    order.deliveryGps = { lat: deliveryGps.lat, lng: deliveryGps.lng, timestamp: new Date() };
    order.escrowStatus = 'released';
    order.deliveryOtp = null;
    await order.save();

    delivery.status = 'delivered';
    delivery.deliveredAt = new Date();
    await delivery.save();

    try {
      const farmer = await order.populate('farmer', 'phone name');
      const farmerAmount = order.totalPrice * (1 - order.commissionPercent / 100) - order.courierFee;
      await b2cPayout(farmer.farmer.phone, farmerAmount, order._id.toString(), 'BusinessPayment');

      if (order.courierFee > 0) {
        const courier = await order.populate('courier', 'phone name');
        await b2cPayout(courier.courier.phone, order.courierFee, `${order._id}-courier`, 'BusinessPayment');
      }
    } catch (payoutErr) {
      console.error('B2C payout failed:', payoutErr.message);
    }

    return res.json({ message: 'Delivery confirmed. Escrow released and payouts initiated.', order, delivery });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
