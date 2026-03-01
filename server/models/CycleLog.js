// server/models/CycleLog.js
const mongoose = require('mongoose');

// ── Shared symptom type enum (all categories) ─────────────────────────────
// Used here for inline symptoms on a cycle log entry
const SYMPTOM_TYPES = [
  // ── General ──────────────────────────────────────────────────────────────
  'sleep_disruption',
  'acne_sensitivity',
  'mood_fluctuation',
  'fatigue',
  'food_craving',
  'cognitive_focus',
  'skin_changes',
  // ── Menstrual Cycle ───────────────────────────────────────────────────────
  'cramping',
  'diarrhea',
  'headache',
  'bloating',
  'breast_soreness',
  'low_back_pain',
  // ── Pregnancy ─────────────────────────────────────────────────────────────
  'energy_depletion',
  'constipation',
  'shortness_of_breath',
  'dizziness',
  'back_pain',
  'weight_gain',
  'heartburn',
  'missed_period',
  'breast_changes',
  'varicose_veins',
  'implantation_bleeding',
  'darkening_of_areola',
  // ── Legacy (kept for backwards-compatibility) ─────────────────────────────
  'nausea',
  'mood_swings',
  'spotting',
  'breast_tenderness',
  'backache',
  'other',
];

const cycleLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastPeriodDate: { type: Date, required: true },
  cycleLength:  { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 },
  flow: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
  notes: { type: String },

  symptoms: [{
    date:     { type: Date, default: Date.now },
    type:     { type: String, enum: SYMPTOM_TYPES },
    category: {
      type: String,
      enum: ['general', 'menstrual', 'pregnancy'],
      default: 'menstrual',
    },
    severity: { type: Number, min: 1, max: 5 },
    notes:    { type: String },
  }],

  predictedNextDate: { type: Date },
  ovulationDate:     { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Calculate predictions before save
cycleLogSchema.pre('save', function (next) {
  const nextPeriod = new Date(this.lastPeriodDate);
  nextPeriod.setDate(nextPeriod.getDate() + this.cycleLength);
  this.predictedNextDate = nextPeriod;

  const ovulation = new Date(nextPeriod);
  ovulation.setDate(ovulation.getDate() - 14);
  this.ovulationDate = ovulation;

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CycleLog', cycleLogSchema);
module.exports.SYMPTOM_TYPES = SYMPTOM_TYPES;