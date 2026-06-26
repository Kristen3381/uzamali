import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { category, search, sort } = _req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { location: regex },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);
    res.json({ products });
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { name, category, description, price, unit, quantity, harvestDate, location, sustainable } = req.body;

    const images = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const product = await Product.create({
      name,
      category,
      description,
      price: Number(price),
      unit,
      quantity: Number(quantity),
      harvestDate,
      location,
      sustainable: sustainable === 'true',
      images,
      seller: req.user._id,
      sellerName: req.user.name,
    });

    res.status(201).json({ product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
});

export default router;
