import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Listing from '../models/Listing.js';

const router = Router();

router.post('/mpesa-callback', async (req, res) => {
  try {
    const { Body } = req.body;
    if (!Body?.stkCallback) {
      return res.status(400).json({ message: 'Invalid callback structure' });
    }

    const { ResultCode, ResultDesc, MerchantRequestID, CallbackMetadata } = Body.stkCallback;

    if (ResultCode !== 0) {
      console.error('[MPESA CALLBACK] Failed:', ResultDesc);
      return res.json({ ResultCode: 0, ResultDesc: 'Received' });
    }

    const metadata = {};
    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        metadata[item.Name] = item.Value;
      }
    }

    const orderRef = MerchantRequestID || '';

    let order = null;

    if (orderRef.startsWith('AGRICYCLE-')) {
      const idPart = orderRef.replace('AGRICYCLE-', '');
      if (mongoose.Types.ObjectId.isValid(idPart)) {
        order = await Order.findById(idPart);
      }
    }

    if (!order && mongoose.Types.ObjectId.isValid(orderRef)) {
      order = await Order.findById(orderRef);
    }

    if (!order) {
      order = await Order.findOne({ paymentRef: orderRef });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found for callback' });
    }

    order.status = 'confirmed';
    order.escrowStatus = 'held';
    order.mpesaCallbackConfirmed = true;
    order.paymentRef = metadata.TransactionId || orderRef;
    await order.save();

    const listing = await Listing.findById(order.listing);
    if (listing) {
      listing.quantity -= order.quantity;
      if (listing.quantity <= 0) listing.status = 'sold';
      await listing.save();
    }

    console.log(`[MPESA CALLBACK] Payment confirmed for order ${order._id}: KES ${order.totalPrice}`);
    return res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('[MPESA CALLBACK] Error:', err.message);
    return res.status(500).json({ message: 'Callback error', error: err.message });
  }
});

export default router;
