import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';
import BuyerPreference from '../models/BuyerPreference.js';
import { protect } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images allowed')),
});

const router = Router();

const categoryUseMap = {
  'fresh': ['for-sale', 'discounted-sale', 'group-sell'],
  'surplus': ['discounted-sale', 'group-sell', 'animal-feed', 'heavy-discount-resale'],
  'agro-waste': ['animal-feed', 'composting-biogas', 'heavy-discount-resale'],
};

const frontendCategoryToBackend = {
  'Vegetables': 'fresh',
  'Fruits': 'fresh',
  'Grains': 'surplus',
  'Legumes': 'surplus',
  'Tubers': 'fresh',
  'Dairy': 'fresh',
  'Agro-waste': 'agro-waste',
  'Other': 'fresh',
};

const matchBuyers = async (listing) => {
  try {
    const prefs = await BuyerPreference.find({
      preferredCategories: listing.category,
      preferredUses: listing.suggestedUse,
    }).populate('buyer', 'name phone location');

    if (prefs.length === 0) return;

    const { default: User } = await import('../models/User.js');
    const farmer = await User.findById(listing.farmer);

    prefs.forEach((p) => {
      const buyerLoc = p.buyer?.location;
      const farmerLoc = farmer?.location;
      let withinRadius = true;

      if (buyerLoc?.lat && buyerLoc?.lng && farmerLoc?.lat && farmerLoc?.lng) {
        const R = 6371;
        const dLat = ((farmerLoc.lat - buyerLoc.lat) * Math.PI) / 180;
        const dLng = ((farmerLoc.lng - buyerLoc.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((buyerLoc.lat * Math.PI) / 180) *
            Math.cos((farmerLoc.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist > p.notificationRadius) withinRadius = false;
      }

      if (withinRadius) {
        console.log(
          `[MATCH] Listing "${listing.title}" (${listing.category}/${listing.suggestedUse}) ` +
            `matched buyer ${p.buyer?.name || p.buyer?._id}`
        );
      }
    });
  } catch (err) {
    console.error('[MATCH] Error:', err.message);
  }
};

router.get('/market', async (req, res) => {
  try {
    const { category, suggestedUse, search, sort } = req.query;
    const filter = { status: 'active' };

    if (category) {
      filter.category = frontendCategoryToBackend[category] || category;
    }
    if (suggestedUse) filter.suggestedUse = suggestedUse;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    let sortOption = {};
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const listings = await Listing.find(filter).sort(sortOption).populate('farmer', 'name location sellerTrustLevel');
    res.json({ products: listings });
  } catch {
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, suggestedUse, search, sort } = req.query;
    const filter = { status: 'active' };

    if (category) {
      const backendCat = frontendCategoryToBackend[category] || category;
      filter.category = backendCat;
    }
    if (suggestedUse) filter.suggestedUse = suggestedUse;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    let sortOption = {};
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const listings = await Listing.find(filter).sort(sortOption).populate('farmer', 'name location sellerTrustLevel');
    res.json({ products: listings });
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/mine', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ products: listings });
  } catch {
    res.status(500).json({ message: 'Failed to fetch your listings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('farmer', 'name location sellerTrustLevel');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ product: listing });
  } catch {
    res.status(500).json({ message: 'Failed to fetch listing' });
  }
});

router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { name, title, description, category, suggestedUse, price, unit, quantity, harvestDate, location, sustainable } = req.body;

    const resolvedTitle = name || title;
    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const backendCategory = frontendCategoryToBackend[category] || category;
    if (!backendCategory || !['fresh', 'surplus', 'agro-waste'].includes(backendCategory)) {
      return res.status(400).json({ message: 'Category must be one of: Vegetables, Fruits, Grains, Legumes, Tubers, Dairy, Agro-waste, or Other' });
    }

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const resolvedSuggestedUse = suggestedUse || categoryUseMap[backendCategory][0];
    if (!categoryUseMap[backendCategory]?.includes(resolvedSuggestedUse)) {
      return res.status(400).json({
        message: `Suggested use "${resolvedSuggestedUse}" is not valid for category "${category}".`,
      });
    }

    const listing = await Listing.create({
      farmer: req.user._id,
      title: resolvedTitle,
      description,
      category: backendCategory,
      suggestedUse: resolvedSuggestedUse,
      price: Number(price),
      unit,
      quantity: Number(quantity),
      harvestDate: harvestDate || undefined,
      location,
      images,
      sustainable: sustainable === 'true' || sustainable === true,
    });

    matchBuyers(listing);

    res.status(201).json({ product: listing });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

router.patch('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fieldMap = {
      name: 'title',
      title: 'title',
      category: 'category',
      suggestedUse: 'suggestedUse',
      price: 'price',
      unit: 'unit',
      quantity: 'quantity',
      harvestDate: 'harvestDate',
      location: 'location',
      status: 'status',
      sustainable: 'sustainable',
    };
    Object.entries(fieldMap).forEach(([frontendField, backendField]) => {
      if (req.body[frontendField] !== undefined) {
        if (frontendField === 'name') {
          listing.title = req.body.name;
        } else if (frontendField === 'category') {
          listing.category = frontendCategoryToBackend[req.body.category] || req.body.category;
        } else if (frontendField === 'status') {
          listing.status = req.body.status === 'available' ? 'active' : req.body.status;
        } else {
          listing[backendField] = req.body[frontendField];
        }
      }
    });

    if (req.files?.length) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      const keep = req.body.keepImages ? JSON.parse(req.body.keepImages) : [];
      listing.images = [...keep, ...newImages];
    }

    await listing.save();
    res.json({ product: listing });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

export default router;
