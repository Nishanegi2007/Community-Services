const crypto = require('node:crypto');
const GalleryPhoto = require('../models/galleryPhoto');
const { uploadImage, deleteImage } = require('../services/imagekit');

const imageSignatures = {
  'image/jpeg': (buffer) => buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8,
  'image/png': (buffer) => buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (buffer) => buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
};

async function listPublic(req, res) {
  res.json({ photos: await GalleryPhoto.find().sort({ createdAt: -1 }).select('-imageKitFileId -fileName') });
}

async function listAll(req, res) {
  res.json({ photos: await GalleryPhoto.find().sort({ createdAt: -1 }) });
}

async function upload(req, res) {
  if (!req.file || !imageSignatures[req.file.mimetype]?.(req.file.buffer)) {
    return res.status(400).json({ message: 'Choose a valid JPEG, PNG, or WebP image.' });
  }
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const category = typeof req.body.category === 'string' ? req.body.category.trim() : 'School Events';
  if (title.length > 120 || !category || category.length > 60) {
    return res.status(400).json({ message: 'Title must be at most 120 characters and category 1–60 characters.' });
  }

  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[req.file.mimetype];
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const image = await uploadImage(req.file.buffer, fileName);
  try {
    const photo = await GalleryPhoto.create({
      title, category, imageUrl: image.url, imageKitFileId: image.fileId, fileName,
    });
    res.status(201).json({ photo });
  } catch (error) {
    await deleteImage(image.fileId).catch(() => {});
    throw error;
  }
}

async function remove(req, res) {
  const photo = await GalleryPhoto.findById(req.params.id);
  if (!photo) return res.status(404).json({ message: 'Photo not found.' });
  await deleteImage(photo.imageKitFileId);
  await photo.deleteOne();
  res.json({ message: 'Photo deleted.' });
}

module.exports = { listPublic, listAll, upload, remove };
