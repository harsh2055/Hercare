const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ADD THIS EXACT LINE RIGHT HERE:
app.use(express.json()); 

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow localhost and any vercel.app domain
        if (origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/cycle',     require('./routes/cycle'));
app.use('/api/pregnancy', require('./routes/pregnancy'));
app.use('/api/diet',      require('./routes/diet'));
app.use('/api/reminder',  require('./routes/reminder'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/symptoms',  require('./routes/symptom'));   // ← NEW
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/poses',     require('./routes/pose')); 

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HerCare API is running' });
});

// ── One-time migration: add role/isActive to legacy users ─────────────────
app.post('/api/migrate-users', async (req, res) => {
  try {
    const User   = require('./models/User');
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user', isActive: true } }
    );
    res.json({ message: `Migration complete. Fixed ${result.modifiedCount} users.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── One-time admin seed ───────────────────────────────────────────────────
app.post('/api/seed-admin', async (req, res) => {
  try {
    const User  = require('./models/User');
    const { email, password, name } = req.body;
    const count = await User.countDocuments({ role: 'admin' });
    if (count > 0)
      return res.status(400).json({ message: 'Admin already exists.' });
    const admin = await User.create({ name: name || 'Admin', email, password, role: 'admin' });
    res.json({ message: 'First admin created', email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
