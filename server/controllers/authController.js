// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ Helper so every response always includes role — never undefined
const userResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  language: user.language || 'en',
  dietaryPreference: user.dietaryPreference || 'vegetarian',
  allergies: user.allergies || [],
  role: user.role || 'user',          // ✅ always present
  isActive: user.isActive !== false,  // ✅ always present
  token,
});

const register = async (req, res) => {
  try {
    const { name, email, password, dietaryPreference, language } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, dietaryPreference, language });
    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.json(userResponse(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({
    ...req.user.toObject(),
    role: req.user.role || 'user',
    isActive: req.user.isActive !== false,
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, dietaryPreference, allergies, language, dateOfBirth } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, dietaryPreference, allergies, language, dateOfBirth },
      { new: true, runValidators: true }
    ).select('-password');
    // ✅ role is now included because it's in the schema
    res.json({
      ...user.toObject(),
      role: user.role || 'user',
      isActive: user.isActive !== false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const firebaseAuth = async (req, res) => {
  try {
    const { firebaseUid, name, email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, firebaseUid });
    }

    res.json(userResponse(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, deleteAccount, firebaseAuth };