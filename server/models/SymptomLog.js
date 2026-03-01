// server/models/SymptomLog.js
const mongoose = require('mongoose');
const { SYMPTOM_TYPES } = require('./CycleLog');

// ── Human-readable metadata for every symptom ────────────────────────────
// category: which tab the symptom appears under in the UI
// label: display name shown to the user
// description: short clinical note shown as a tooltip / helper
const SYMPTOM_META = {
  // General
  sleep_disruption:     { category: 'general',   label: 'Trouble Sleeping',          description: 'Difficulty falling or staying asleep' },
  acne_sensitivity:     { category: 'general',   label: 'Acne & Skin Sensitivity',   description: 'Hormonal breakouts or reactive skin' },
  mood_fluctuation:     { category: 'general',   label: 'Irritability / Mood Swings',description: 'Emotional changes tied to hormone shifts' },
  fatigue:              { category: 'general',   label: 'Fatigue',                   description: 'Persistent low energy or tiredness' },
  food_craving:         { category: 'general',   label: 'Food Cravings',             description: 'Increased hunger or specific food urges' },
  cognitive_focus:      { category: 'general',   label: 'Difficulty Concentrating',  description: 'Brain fog or reduced mental clarity' },
  skin_changes:         { category: 'general',   label: 'Skin Changes',              description: 'Dryness, oiliness, or texture changes' },
  // Menstrual
  cramping:             { category: 'menstrual', label: 'Cramping',                  description: 'Lower abdominal period cramps' },
  diarrhea:             { category: 'menstrual', label: 'Diarrhea',                  description: 'Digestive tract speedup common during period' },
  headache:             { category: 'menstrual', label: 'Headache',                  description: 'Hormonal headaches or migraines' },
  bloating:             { category: 'menstrual', label: 'Bloating',                  description: 'Water retention and abdominal fullness' },
  breast_soreness:      { category: 'menstrual', label: 'Breast Soreness',           description: 'Tenderness in breast tissue' },
  low_back_pain:        { category: 'menstrual', label: 'Low Back Pain',             description: 'Radiating ache in lumbar region' },
  // Pregnancy
  energy_depletion:     { category: 'pregnancy', label: 'Fatigue / Energy Depletion',description: 'Pregnancy-related exhaustion' },
  constipation:         { category: 'pregnancy', label: 'Constipation',              description: 'Slowed digestion due to progesterone' },
  shortness_of_breath:  { category: 'pregnancy', label: 'Shortness of Breath',       description: 'Increased oxygen demand from growing baby' },
  dizziness:            { category: 'pregnancy', label: 'Dizziness',                 description: 'Blood pressure / blood sugar fluctuations' },
  back_pain:            { category: 'pregnancy', label: 'Back Pain',                 description: 'Postural strain from shifted center of gravity' },
  weight_gain:          { category: 'pregnancy', label: 'Weight Gain',               description: 'Expected body growth during pregnancy' },
  heartburn:            { category: 'pregnancy', label: 'Heartburn',                 description: 'Acid reflux caused by uterine pressure' },
  missed_period:        { category: 'pregnancy', label: 'Missed Period',             description: 'Early pregnancy sign' },
  breast_changes:       { category: 'pregnancy', label: 'Breast Changes',            description: 'Fullness, darkening, or tenderness' },
  varicose_veins:       { category: 'pregnancy', label: 'Varicose Veins',            description: 'Increased blood volume affecting veins' },
  implantation_bleeding:{ category: 'pregnancy', label: 'Implantation Bleeding',     description: 'Light spotting 6–12 days after conception' },
  darkening_of_areola:  { category: 'pregnancy', label: 'Darkening of Areola',       description: 'Hormonal pigmentation change' },
  // Legacy
  nausea:               { category: 'pregnancy', label: 'Nausea',                    description: 'Morning sickness or general queasiness' },
  mood_swings:          { category: 'general',   label: 'Mood Swings',               description: 'Rapid emotional changes' },
  spotting:             { category: 'menstrual', label: 'Spotting',                  description: 'Light bleeding outside normal period' },
  breast_tenderness:    { category: 'menstrual', label: 'Breast Tenderness',         description: 'Sensitivity before or during period' },
  backache:             { category: 'general',   label: 'Backache',                  description: 'General back discomfort' },
  other:                { category: 'general',   label: 'Other',                     description: 'Any symptom not listed above' },
};

const symptomEntrySchema = new mongoose.Schema({
  type:     { type: String, enum: SYMPTOM_TYPES, required: true },
  category: { type: String, enum: ['general', 'menstrual', 'pregnancy'], required: true },
  severity: { type: Number, min: 1, max: 5, required: true },
  notes:    { type: String, trim: true, maxlength: 500 },
});

const symptomLogSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:     { type: Date, required: true, default: Date.now },
    symptoms: { type: [symptomEntrySchema], validate: v => v.length > 0 },
    mood:     { type: Number, min: 1, max: 5 },   // optional overall mood score
    energy:   { type: Number, min: 1, max: 5 },   // optional overall energy score
    notes:    { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Compound index: one log per user per calendar day
symptomLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
module.exports.SYMPTOM_META = SYMPTOM_META;
module.exports.SYMPTOM_TYPES = SYMPTOM_TYPES;