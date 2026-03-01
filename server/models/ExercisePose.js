// server/models/ExercisePose.js
const mongoose = require('mongoose');

const exercisePoseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Which cycle phase this pose is suited for
    phase: {
      type: String,
      default: null
    },
    
    // Which trimester this pose is suited for
    trimester: {
      type: Number,
      default: null
    },
    // Remote image URL (Unsplash or similar) OR relative path under /public/poses/
    imageUrl: { type: String, default: '' },

    // Sanskrit name (optional, shown as subtitle)
    sanskritName: { type: String, default: '' },

    // Short description shown on card
    description: { type: String, required: true },

    // What the pose helps with — shown as chips
    benefits: [{ type: String }],

    // Intensity level for this phase
    intensity: {
      type: String,
      enum: ['gentle', 'moderate', 'active'],
      default: 'moderate',
    },

    // Duration guidance
    duration: { type: String, default: '30–60 seconds' },

    // Bold red safety warning (null if none)
    safetyWarning: { type: String, default: null },

    // Sort order within a phase
    order: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

exercisePoseSchema.index({ phase: 1, order: 1 });
exercisePoseSchema.index({ trimester: 1 });

module.exports = mongoose.model('ExercisePose', exercisePoseSchema);