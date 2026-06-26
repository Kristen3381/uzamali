import { Router } from 'express';
import BuyerPreference from '../models/BuyerPreference.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    let prefs = await BuyerPreference.findOne({ buyer: req.user._id });
    if (!prefs) {
      prefs = await BuyerPreference.create({ buyer: req.user._id });
    }
    res.json({ preferences: prefs });
  } catch {
    res.status(500).json({ message: 'Failed to fetch preferences' });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    const { preferredCategories, preferredUses, notificationRadius } = req.body;

    const prefs = await BuyerPreference.findOneAndUpdate(
      { buyer: req.user._id },
      {
        $set: {
          ...(preferredCategories && { preferredCategories }),
          ...(preferredUses && { preferredUses }),
          ...(notificationRadius && { notificationRadius }),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ preferences: prefs });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

export default router;
