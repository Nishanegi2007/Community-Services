const Announcement = require('../models/announcement');

function validText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function validDate(value) {
  // Dates are optional when an announcement is published immediately and has no expiry.
  if (value === undefined || value === null || value === '') return true;
  return !Number.isNaN(Date.parse(value));
}

async function listPublished(req, res) {
  const now = new Date();
  const announcements = await Announcement.find({
    published: true,
    publishAt: { $lte: now },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).sort({ publishAt: -1 });
  res.json({ announcements });
}

async function listAll(req, res) {
  res.json({ announcements: await Announcement.find().sort({ createdAt: -1 }) });
}

async function create(req, res) {
  const { title, message, publishAt, expiresAt, published = true } = req.body || {};
  if (!validText(title, 120) || !validText(message, 3000) || !validDate(publishAt) || !validDate(expiresAt) || typeof published !== 'boolean') {
    return res.status(400).json({ message: 'Enter a title and message, with valid dates and publish status.' });
  }
  const announcement = await Announcement.create({
    title: title.trim(), message: message.trim(),
    publishAt: publishAt || new Date(), expiresAt: expiresAt || null, published,
  });
  res.status(201).json({ announcement });
}

async function update(req, res) {
  const updates = {};
  const body = req.body || {};
  if ('title' in body) {
    if (!validText(body.title, 120)) return res.status(400).json({ message: 'Title must be between 1 and 120 characters.' });
    updates.title = body.title.trim();
  }
  if ('message' in body) {
    if (!validText(body.message, 3000)) return res.status(400).json({ message: 'Message must be between 1 and 3000 characters.' });
    updates.message = body.message.trim();
  }
  if ('publishAt' in body) {
    if (!validDate(body.publishAt)) return res.status(400).json({ message: 'Publish date is invalid.' });
    updates.publishAt = body.publishAt || new Date();
  }
  if ('expiresAt' in body) {
    if (!validDate(body.expiresAt)) return res.status(400).json({ message: 'Expiry date is invalid.' });
    updates.expiresAt = body.expiresAt || null;
  }
  if ('published' in body) {
    if (typeof body.published !== 'boolean') return res.status(400).json({ message: 'Publish status must be true or false.' });
    updates.published = body.published;
  }
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
  res.json({ announcement });
}

async function remove(req, res) {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
  res.json({ message: 'Announcement deleted.' });
}

module.exports = { listPublished, listAll, create, update, remove };
