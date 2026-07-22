import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Listing from '../models/Listing.js';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import { stkPush, b2cPayout } from '../services/mpesa.js';
import crypto from 'crypto';

const RATE_PER_KM = 50;

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
};

import { calculateCourierFee } from './deliveries.js';

const router = Router();

router.post('/', protect, async (req, res) => {
  try {
    const { listingId, quantity, deliveryMethod, vehicleType = 'motorcycle', expectedDeliveryDate, pickupAddress, deliveryAddress } = req.body;

    if (!listingId || !quantity || !deliveryMethod) {
      return res.status(400).json({ message: 'listingId, quantity, and deliveryMethod are required' });
    }
    if (!['courier', 'pickup'].includes(deliveryMethod)) {
      return res.status(400).json({ message: 'deliveryMethod must be courier or pickup' });
    }
    if (deliveryMethod === 'courier' && (!pickupAddress || !deliveryAddress)) {
      return res.status(400).json({ message: 'pickupAddress and deliveryAddress required for courier delivery' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ message: 'Listing is not active' });
    if (listing.farmer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot order your own listing' });
    }
    if (quantity > listing.quantity) {
      return res.status(400).json({ message: `Only ${listing.quantity} ${listing.unit} available` });
    }

    const totalPrice = listing.price * quantity;
    let courierFee = 0;
    let deliveryDistance = 0;

    if (deliveryMethod === 'courier') {
      const farmer = await User.findById(listing.farmer).select('location');
      const farmerLoc = farmer?.location;
      const buyerLoc = req.user.location;

      if (farmerLoc?.lat && farmerLoc?.lng && buyerLoc?.lat && buyerLoc?.lng) {
        deliveryDistance = Math.max(1, Math.round(getDistance(farmerLoc.lat, farmerLoc.lng, buyerLoc.lat, buyerLoc.lng) * 10) / 10);
      } else {
        deliveryDistance = 15; // default estimate
      }
      courierFee = calculateCourierFee(deliveryDistance, vehicleType);
    }

    const order = await Order.create({
      buyer: req.user._id,
      farmer: listing.farmer,
      listing: listing._id,
      quantity,
      totalPrice,
      deliveryMethod,
      vehicleType,
      deliveryDistance,
      status: 'pending',
      expectedDeliveryDate: expectedDeliveryDate || null,
      courierFee,
    });

    if (deliveryMethod === 'courier') {
      await Delivery.create({
        order: order._id,
        courier: null,
        pickupAddress,
        deliveryAddress,
        status: 'pending',
        vehicleType,
        deliveryDistance,
        deliveryFee: courierFee,
      });
    }

    try {
      const buyerPhone = req.user.phone;
      await stkPush(buyerPhone, totalPrice, order._id.toString());

      const isMock = process.env.MPESA_MOCK !== 'false';
      if (isMock) {
        order.status = 'confirmed';
        order.escrowStatus = 'held';
        order.mpesaCallbackConfirmed = true;
        order.paymentRef = `MOCK-${order._id}`;
        await order.save();

        listing.quantity -= quantity;
        if (listing.quantity <= 0) {
          listing.status = 'sold';
        }
        await listing.save();
      }

      const populated = await Order.findById(order._id)
        .populate('listing', 'title price unit images')
        .populate('farmer', 'name phone');

      return res.status(201).json({ order: populated });
    } catch (err) {
      await Order.findByIdAndDelete(order._id);
      if (deliveryMethod === 'courier') {
        await Delivery.findOneAndDelete({ order: order._id });
      }
      return res.status(502).json({ message: 'Payment initiation failed', error: err.message });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let orders;
    const user = req.user;

    if (user.role === 'admin') {
      orders = await Order.find({}).sort('-createdAt');
    } else if (user.role === 'farmer') {
      orders = await Order.find({ farmer: user._id }).sort('-createdAt');
    } else if (user.role === 'courier') {
      orders = await Order.find({
        deliveryMethod: 'courier',
        $or: [{ courier: user._id }, { courier: null }],
      }).sort('-createdAt');
    } else {
      orders = await Order.find({ buyer: user._id }).sort('-createdAt');
    }

    const populated = await Order.populate(orders, [
      { path: 'listing', select: 'title name price unit images location' },
      { path: 'farmer', select: 'name phone location' },
      { path: 'buyer', select: 'name phone location' },
      { path: 'courier', select: 'name phone' },
    ]);

    return res.json({ orders: populated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listing', 'title price unit images location')
      .populate('farmer', 'name phone location')
      .populate('buyer', 'name phone location')
      .populate('courier', 'name phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const user = req.user;
    const isAdmin = user.role === 'admin';
    const isBuyer = order.buyer._id.toString() === user._id.toString();
    const isFarmer = order.farmer._id.toString() === user._id.toString();
    const isCourier = order.courier && order.courier._id.toString() === user._id.toString();

    if (!isAdmin && !isBuyer && !isFarmer && !isCourier) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let delivery = null;
    if (order.deliveryMethod === 'courier') {
      delivery = await Delivery.findOne({ order: order._id })
        .populate('courier', 'name phone');
    }

    return res.json({ order, delivery });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/report', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isFarmer = order.farmer.toString() === req.user._id.toString();
    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ message: 'Only the buyer or farmer can report a dispute' });
    }

    if (order.escrowStatus !== 'held') {
      return res.status(400).json({ message: 'Only orders with held escrow can be disputed' });
    }

    order.escrowStatus = 'disputed';
    await order.save();

    return res.json({ message: 'Dispute reported. Escrow frozen.', order });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/confirm-receipt', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryMethod !== 'pickup') {
      return res.status(400).json({ message: 'This endpoint is for pickup orders only' });
    }
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can confirm receipt' });
    }

    const { deliveryGps } = req.body;
    if (!deliveryGps || deliveryGps.lat == null || deliveryGps.lng == null) {
      return res.status(400).json({ message: 'deliveryGps with lat and lng is required' });
    }

    order.deliveryGps = { lat: deliveryGps.lat, lng: deliveryGps.lng, timestamp: new Date() };
    order.escrowStatus = 'released';
    await order.save();

    try {
      const farmer = await order.populate('farmer', 'phone name');
      const farmerAmount = order.totalPrice * (1 - order.commissionPercent / 100) - order.courierFee;
      await b2cPayout(farmer.farmer.phone, farmerAmount, order._id.toString(), 'BusinessPayment');
    } catch (payoutErr) {
      console.error('B2C payout failed:', payoutErr.message);
    }

    return res.json({ message: 'Receipt confirmed. Escrow released.', order });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
