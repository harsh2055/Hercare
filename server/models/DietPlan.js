const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dietaryPreference: {
    type: String,
    enum: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian'],
    required: true,
  },
  phase: {
    type: String,
    enum: ['menstrual', 'follicular', 'ovulation', 'luteal', ''],
    default: '',
  },
  trimester: { type: Number, enum: [1, 2, 3, null], default: null },
  description: { type: String },
  meals: {
    Breakfast: [String],
    'Mid-Morning Snack': [String],
    Lunch: [String],
    'Evening Snack': [String],
    Dinner: [String],
  },
  nutrients: { type: Map, of: String },
  tips: [String],
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', DietPlanSchema);
