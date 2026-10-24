require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const connectDB = require('../db/db');

async function seedAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!name || name.length > 80 || !email || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password ||
      Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (12–72 bytes) in backend/.env.');
  }

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('An account already exists for ADMIN_EMAIL. Admin seeding did not change its password.');
  }

  await User.create({ name, email, password: await bcrypt.hash(password, 12), role: 'admin' });
  console.log(`Admin account created for ${email}.`);
}

seedAdmin()
  .catch((error) => {
    console.error('Unable to seed admin:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
