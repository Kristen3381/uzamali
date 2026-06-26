import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Listing from '../models/Listing.js';
import Delivery from '../models/Delivery.js';
import { stkPush, b2cPayout } from '../services/mpesa.js';
import crypto from 'crypto';

const router = Router();

router.post('/', protect, async (req, res) => {
  try {
    const { listingId, quantity, deliveryMethod, expectedDeliveryDate, pickupAddress, deliveryAddress } = req.body;

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

    const order = await Order.create({
      buyer: req.user._id,
      farmer: listing.farmer,
      listing: listing._id,
      quantity,
      totalPrice,
      deliveryMethod,
      status: 'pending',
      expectedDeliveryDate: expectedDeliveryDate || null,
    });

    if (deliveryMethod === 'courier') {
      await Delivery.create({
        order: order._id,
        courier: null,
        pickupAddress,
        deliveryAddress,
        status: 'pending',
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
    } else {
      orders = await Order.find({ buyer: user._id }).sort('-createdAt');
    }

    const populated = await Order.populate(orders, [
      { path: 'listing', select: 'title price unit images' },
      { path: 'farmer', select: 'name phone' },
      { path: 'buyer', select: 'name phone' },
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
