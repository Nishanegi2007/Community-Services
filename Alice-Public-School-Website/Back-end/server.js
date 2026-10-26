
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : true
}));

app.use(express.json({ limit: '1mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Admission schema: MongoDB only
const admissionSchema = new mongoose.Schema({
  studentName: {
    type: String, required: true, trim: true, maxlength: 120
  },
  parentName: {
    type: String, required: true, trim: true, maxlength: 120
  },
  phone: {
    type: String, required: true, trim: true, maxlength: 30
  },
  email: {
    type: String, required: true, trim: true,
    lowercase: true, maxlength: 200
  },
  classApplying: {
    type: String, required: true, trim: true, maxlength: 40
  },
  message: {
    type: String, trim: true, maxlength: 2000, default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Follow-up', 'Converted'],
    default: 'New'
  }
}, { timestamps: true });

const contentSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, maxlength: 180
  },
  date: { type: String, default: '' },
  description: { type: String, default: '', maxlength: 5000 },
  message: { type: String, default: '', maxlength: 5000 },
  category: { type: String, default: 'General' },
  venue: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  published: { type: Boolean, default: true }
}, { timestamps: true });

const gallerySchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, maxlength: 180
  },
  description: { type: String, default: '', maxlength: 2000 },
  images: [{ type: String }],
  published: { type: Boolean, default: true }
}, { timestamps: true });

const Admission = mongoose.model('Admission', admissionSchema);
const Event = mongoose.model('Event', contentSchema);
const News = mongoose.model('News', contentSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);

// Image upload configuration
const imageTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      cb(
        null,
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${imageTypes[file.mimetype] || ''}`
      );
    }
  }),
  fileFilter: (req, file, cb) => {
    if (imageTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, or WebP images are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 20
  }
});

const imageUrl = (req, file) =>
  `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// Admin login
app.post('/api/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body || {};
    const submittedId = String(userId || email || '').trim();

    if (
      !process.env.ADMIN_USER_ID ||
      !process.env.ADMIN_PASSWORD_HASH ||
      !process.env.JWT_SECRET
    ) {
      return res.status(503).json({
        error: 'Admin login is not configured. Check backend environment variables.'
      });
    }

    const idMatches =
      submittedId.toLowerCase() === process.env.ADMIN_USER_ID.toLowerCase();

    const passwordMatches = await bcrypt.compare(
      String(password || ''),
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!idMatches || !passwordMatches) {
      return res.status(401).json({
        error: 'Invalid User ID or password'
      });
    }

    const token = jwt.sign(
      { sub: submittedId, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h', issuer: 'alice-school' }
    );

    res.json({ token, userId: submittedId });
  } catch (e) {
    res.status(500).json({ error: 'Unable to sign in' });
  }
});

// Protect admin routes
function checkAdmin(req, res, next) {
  try {
    const token = (req.headers.authorization || '')
      .replace(/^Bearer\s+/i, '');

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'alice-school'
    });

    if (payload.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({
      error: 'Please log in again'
    });
  }
}

// Public admission form: save enquiries in MongoDB only
app.post('/api/admissions', async (req, res) => {
  const body = req.body || {};

  const required = [
    'studentName',
    'parentName',
    'phone',
    'email',
    'classApplying'
  ];

  if (required.some(k => !String(body[k] || '').trim())) {
    return res.status(400).json({
      error: 'Please fill all required fields'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    return res.status(400).json({
      error: 'Please enter a valid email address'
    });
  }

  if (String(body.phone).replace(/\D/g, '').length < 7) {
    return res.status(400).json({
      error: 'Please enter a valid phone number'
    });
  }

  try {
    await Admission.create({
      studentName: body.studentName,
      parentName: body.parentName,
      phone: body.phone,
      email: body.email,
      classApplying: body.classApplying,
      message: body.message || ''
    });

    res.status(201).json({
      message: 'Enquiry received'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: 'Could not save your enquiry. Please try again.'
    });
  }
});

// Public content routes
app.get('/api/events', async (req, res, next) => {
  try {
    res.json(
      await Event.find({ published: true })
        .sort({ createdAt: -1 })
        .lean()
    );
  } catch (e) {
    next(e);
  }
});

app.get('/api/announcements', async (req, res, next) => {
  try {
    const announcements = await News.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    res.json(
      announcements.map(n => ({
        ...n,
        message: n.message || n.description
      }))
    );
  } catch (e) {
    next(e);
  }
});

app.get('/api/news', async (req, res, next) => {
  try {
    res.json(
      await News.find({ published: true })
        .sort({ createdAt: -1 })
        .lean()
    );
  } catch (e) {
    next(e);
  }
});

app.get('/api/gallery', async (req, res, next) => {
  try {
    res.json(
      await Gallery.find({ published: true })
        .sort({ createdAt: -1 })
        .lean()
    );
  } catch (e) {
    next(e);
  }
});

// Admin: admissions
app.get('/api/admin/admissions', checkAdmin, async (req, res, next) => {
  try {
    const rows = await Admission.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      rows: rows.map(r => ({
        ...r,
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleString('en-IN')
          : ''
      }))
    });
  } catch (e) {
    next(e);
  }
});

app.patch(
  '/api/admin/admissions/:id/status',
  checkAdmin,
  async (req, res, next) => {
    try {
      const allowed = [
        'New',
        'Contacted',
        'Follow-up',
        'Converted'
      ];

      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({
          error: 'Invalid enquiry status'
        });
      }

      const r = await Admission.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (!r) {
        return res.status(404).json({
          error: 'Enquiry not found'
        });
      }

      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

// Admin: events
app.get('/api/admin/events', checkAdmin, async (req, res, next) => {
  try {
    res.json(
      await Event.find().sort({ createdAt: -1 }).lean()
    );
  } catch (e) {
    next(e);
  }
});

app.post(
  '/api/admin/events',
  checkAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const item = await Event.create({
        title: req.body.title,
        date: req.body.date || '',
        description: req.body.description || '',
        venue: req.body.venue || '',
        imageUrl: req.file ? imageUrl(req, req.file) : '',
        published: req.body.published !== 'false'
      });

      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  '/api/admin/events/:id',
  checkAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      const patch = {
        title: req.body.title,
        date: req.body.date,
        description: req.body.description,
        venue: req.body.venue,
        published: req.body.published === 'true'
      };

      if (req.file) {
        patch.imageUrl = imageUrl(req, req.file);
      }

      Object.keys(patch).forEach(k => {
        if (patch[k] === undefined) delete patch[k];
      });

      const item = await Event.findByIdAndUpdate(
        req.params.id,
        patch,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  '/api/admin/events/:id',
  checkAdmin,
  async (req, res, next) => {
    try {
      const item = await Event.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ message: 'Event deleted' });
    } catch (e) {
      next(e);
    }
  }
);

// Admin: announcements and news
app.get(
  '/api/admin/announcements',
  checkAdmin,
  async (req, res, next) => {
    try {
      res.json(
        await News.find().sort({ createdAt: -1 }).lean()
      );
    } catch (e) {
      next(e);
    }
  }
);

app.post(
  '/api/admin/announcements',
  checkAdmin,
  async (req, res, next) => {
    try {
      if (!String(req.body.title || '').trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const item = await News.create({
        title: req.body.title,
        message: req.body.message || '',
        description: req.body.message || '',
        category: req.body.category || 'General',
        published:
          req.body.published !== false &&
          req.body.published !== 'false'
      });

      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  '/api/admin/announcements/:id',
  checkAdmin,
  async (req, res, next) => {
    try {
      const patch = {
        title: req.body.title,
        message: req.body.message,
        description: req.body.message,
        category: req.body.category,
        published:
          req.body.published === true ||
          req.body.published === 'true'
      };

      Object.keys(patch).forEach(k => {
        if (patch[k] === undefined) delete patch[k];
      });

      const item = await News.findByIdAndUpdate(
        req.params.id,
        patch,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          error: 'News item not found'
        });
      }

      res.json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  '/api/admin/announcements/:id',
  checkAdmin,
  async (req, res, next) => {
    try {
      const item = await News.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({
          error: 'News item not found'
        });
      }

      res.json({ message: 'News item deleted' });
    } catch (e) {
      next(e);
    }
  }
);

// Admin: gallery
app.get('/api/admin/gallery', checkAdmin, async (req, res, next) => {
  try {
    res.json(
      await Gallery.find().sort({ createdAt: -1 }).lean()
    );
  } catch (e) {
    next(e);
  }
});

app.post(
  '/api/admin/gallery',
  checkAdmin,
  upload.array('images', 20),
  async (req, res, next) => {
    try {
      if (!String(req.body.title || '').trim()) {
        return res.status(400).json({
          error: 'Gallery title is required'
        });
      }

      const item = await Gallery.create({
        title: req.body.title,
        description: req.body.description || '',
        images: (req.files || []).map(f => imageUrl(req, f)),
        published: req.body.published !== 'false'
      });

      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  '/api/admin/gallery/:id',
  checkAdmin,
  upload.array('images', 20),
  async (req, res, next) => {
    try {
      const item = await Gallery.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ error: 'Gallery not found' });
      }

      if (req.body.title !== undefined) {
        item.title = req.body.title;
      }

      if (req.body.description !== undefined) {
        item.description = req.body.description;
      }

      if (req.body.published !== undefined) {
        item.published = req.body.published === 'true';
      }

      if (req.files?.length) {
        item.images.push(...req.files.map(f => imageUrl(req, f)));
      }

      await item.save();
      res.json(item);
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  '/api/admin/gallery/:id',
  checkAdmin,
  async (req, res, next) => {
    try {
      const item = await Gallery.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ error: 'Gallery not found' });
      }

      res.json({ message: 'Gallery deleted' });
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  '/api/admin/gallery/:id/images/:imageIndex',
  checkAdmin,
  async (req, res, next) => {
    try {
      const item = await Gallery.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ error: 'Gallery not found' });
      }

      const i = Number(req.params.imageIndex);

      if (!Number.isInteger(i) || i < 0 || i >= item.images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
      }

      item.images.splice(i, 1);
      await item.save();
      res.json(item);
    } catch (e) {
      next(e);
    }
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid record ID' });
  }

  res.status(400).json({
    error: err.message || 'Request failed'
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Add it to backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Alice Public School API running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
