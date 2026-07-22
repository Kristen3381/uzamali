import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { sendOtp } from '../services/sms.js';
import { b2cPayout } from '../services/mpesa.js';
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

export const VEHICLE_RATES = {
  motorcycle: { ratePerKm: 40, minFee: 150, label: 'Motorcycle / Boda-Boda', capacity: 'Up to 50 kg' },
  tuk_tuk: { ratePerKm: 70, minFee: 300, label: 'Tuk-Tuk / Small Van', capacity: '50 – 300 kg' },
  pickup: { ratePerKm: 120, minFee: 600, label: 'Pickup Truck (1-Ton)', capacity: '300 – 1,000 kg' },
  truck: { ratePerKm: 200, minFee: 1500, label: 'Large Lorry (5-Ton+)', capacity: 'Over 1,000 kg' },
};

export const calculateCourierFee = (distance, vehicleType = 'motorcycle') => {
  const config = VEHICLE_RATES[vehicleType] || VEHICLE_RATES.motorcycle;
  const rawFee = Math.round(distance * config.ratePerKm);
  return Math.max(config.minFee, rawFee);
};

const router = Router();

router.post('/estimate', protect, async (req, res) => {
  try {
    const { listingId, vehicleType = 'motorcycle' } = req.body;
    if (!listingId) return res.status(400).json({ message: 'listingId is required' });

    const listing = await Listing.findById(listingId).populate('farmer', 'location');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const farmerLoc = listing.farmer?.location;
    const buyerLoc = req.user.location;

    let distance = 15; // default fallback distance if missing GPS
    if (farmerLoc?.lat && farmerLoc?.lng && buyerLoc?.lat && buyerLoc?.lng) {
      distance = getDistance(farmerLoc.lat, farmerLoc.lng, buyerLoc.lat, buyerLoc.lng);
    }

    const roundedDist = Math.max(1, Math.round(distance * 10) / 10);
    const selectedFee = calculateCourierFee(roundedDist, vehicleType);

    // Build breakdown for all vehicle options
    const vehicles = {};
    for (const [vKey, vConfig] of Object.entries(VEHICLE_RATES)) {
      vehicles[vKey] = {
        ...vConfig,
        fee: calculateCourierFee(roundedDist, vKey),
      };
    }

    res.json({ 
      distance: roundedDist, 
      fee: selectedFee, 
      vehicleType,
      vehicles,
      note: (!farmerLoc?.lat || !buyerLoc?.lat) ? 'Estimated distance (standard route)' : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

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
      return res.status(400).json({ message: 'Device GPS coordinates are required for pickup verification' });
    }

    const order = await Order.findById(delivery.order).populate('farmer', 'location name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Geofence area check against farmer location
    const farmerLoc = order.farmer?.location;
    if (farmerLoc?.lat && farmerLoc?.lng) {
      const distFromFarm = getDistance(pickupGps.lat, pickupGps.lng, farmerLoc.lat, farmerLoc.lng);
      if (distFromFarm > 25) {
        return res.status(400).json({ 
          message: `Pickup Area Verification Failed: Your device location is ${distFromFarm} km away from ${order.farmer?.name || 'the farm'}'s location. Please confirm when you arrive at the pickup area.` 
        });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    order.deliveryOtp = otp;
    order.pickupGps = { lat: pickupGps.lat, lng: pickupGps.lng, timestamp: new Date() };
    await order.save();

    delivery.status = 'in-transit';
    await delivery.save();

    const buyer = await order.populate('buyer', 'phone name');
    await sendOtp(buyer.buyer.phone, otp);

    return res.json({ message: 'Pickup GPS area verified! OTP sent to buyer.', delivery, otp });
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
      return res.status(400).json({ message: 'Device GPS coordinates are required for delivery area verification' });
    }

    const order = await Order.findById(delivery.order).populate('buyer', 'location name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP entered' });
    }

    // Geofence area check against buyer delivery location
    const buyerLoc = order.buyer?.location;
    if (buyerLoc?.lat && buyerLoc?.lng) {
      const distFromBuyer = getDistance(deliveryGps.lat, deliveryGps.lng, buyerLoc.lat, buyerLoc.lng);
      if (distFromBuyer > 25) {
        return res.status(400).json({ 
          message: `Delivery Area Verification Failed: Your device location is ${distFromBuyer} km away from ${order.buyer?.name || 'the buyer'}'s delivery area.` 
        });
      }
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
