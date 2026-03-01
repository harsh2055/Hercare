// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  firebaseUid: { type: String },
  dietaryPreference: {
    type: String,
    enum: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian'],
    default: 'vegetarian'
  },
  allergies: [{ type: String }],
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  dateOfBirth: { type: Date },
  // ✅ ADDED: role field — was missing, causing admin panel to never show
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // ✅ ADDED: isActive field — was missing, admin queries were broken
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ ADDED: lastLogin — used in admin dashboard
  lastLogin: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);