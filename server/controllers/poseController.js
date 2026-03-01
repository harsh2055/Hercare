// server/controllers/poseController.js
const ExercisePose = require('../models/ExercisePose');

// ── Seed data — 28 poses covering all phases + trimesters ────────────────────
// imageUrl uses Unsplash Source API for reliable yoga/exercise images.
// In production, swap these for your own hosted assets or a CDN.
const SEED_POSES = [

  // ══ MENSTRUAL PHASE (gentle, restorative) ════════════════════════════════
  {
    name: 'Child\'s Pose', sanskritName: 'Balasana', phase: 'menstrual', order: 1,
    intensity: 'gentle', duration: '1–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'A deeply restorative forward fold that releases tension in the lower back and hips, providing comfort during cramping.',
    benefits: ['Relieves cramps', 'Calms nervous system', 'Opens hips', 'Reduces fatigue'],
    safetyWarning: null,
  },
  {
    name: 'Supine Twist', sanskritName: 'Supta Matsyendrasana', phase: 'menstrual', order: 2,
    intensity: 'gentle', duration: '45 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'A gentle spinal rotation performed lying down. Massages the abdominal organs and eases lower back ache.',
    benefits: ['Eases back pain', 'Aids digestion', 'Releases spinal tension', 'Reduces bloating'],
    safetyWarning: null,
  },
  {
    name: 'Legs Up the Wall', sanskritName: 'Viparita Karani', phase: 'menstrual', order: 3,
    intensity: 'gentle', duration: '5–10 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    description: 'An inversive restorative pose that reduces water retention, eases fatigue, and calms the mind during menstruation.',
    benefits: ['Reduces swelling', 'Calms anxiety', 'Improves circulation', 'Eases fatigue'],
    safetyWarning: 'Avoid if experiencing very heavy flow. Some traditions recommend no inversions during menstruation.',
  },
  {
    name: 'Seated Forward Bend', sanskritName: 'Paschimottanasana', phase: 'menstrual', order: 4,
    intensity: 'gentle', duration: '1–2 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    description: 'A calming forward fold that stretches the hamstrings and lower back while stimulating the ovaries and uterus.',
    benefits: ['Stimulates uterus', 'Relieves headache', 'Calms mind', 'Stretches spine'],
    safetyWarning: null,
  },

  // ══ FOLLICULAR PHASE (building energy) ═══════════════════════════════════
  {
    name: 'Sun Salutation A', sanskritName: 'Surya Namaskar A', phase: 'follicular', order: 1,
    intensity: 'moderate', duration: '5–10 rounds',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
    description: 'A flowing sequence of 12 poses that builds heat, strength, and cardiovascular fitness as your energy rises post-period.',
    benefits: ['Builds strength', 'Increases energy', 'Improves flexibility', 'Cardiovascular health'],
    safetyWarning: null,
  },
  {
    name: 'Warrior I', sanskritName: 'Virabhadrasana I', phase: 'follicular', order: 2,
    intensity: 'moderate', duration: '45–60 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'A powerful standing pose that builds leg strength and opens the chest. Perfect for the energetic rise of the follicular phase.',
    benefits: ['Strengthens legs', 'Opens chest', 'Builds confidence', 'Improves focus'],
    safetyWarning: null,
  },
  {
    name: 'Triangle Pose', sanskritName: 'Trikonasana', phase: 'follicular', order: 3,
    intensity: 'moderate', duration: '30–45 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'Extends the sides of the body, stimulates the ovaries, and improves digestion during the follicular build phase.',
    benefits: ['Stimulates ovaries', 'Lengthens spine', 'Strengthens legs', 'Aids digestion'],
    safetyWarning: null,
  },
  {
    name: 'Plank Pose', sanskritName: 'Phalakasana', phase: 'follicular', order: 4,
    intensity: 'active', duration: '20–60 seconds',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    description: 'Core-strengthening pose that builds abdominal and arm strength. Excellent during the follicular phase when energy is climbing.',
    benefits: ['Core strength', 'Arms and shoulders', 'Posture improvement', 'Metabolic boost'],
    safetyWarning: null,
  },

  // ══ OVULATION PHASE (peak energy) ════════════════════════════════════════
  {
    name: 'Wheel Pose', sanskritName: 'Urdhva Dhanurasana', phase: 'ovulation', order: 1,
    intensity: 'active', duration: '20–30 seconds, 3 rounds',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    description: 'A deep backbend that opens the heart, stimulates the reproductive organs, and channels peak energy during ovulation.',
    benefits: ['Opens heart', 'Stimulates hormones', 'Full body strength', 'Boosts energy'],
    safetyWarning: null,
  },
  {
    name: 'Camel Pose', sanskritName: 'Ustrasana', phase: 'ovulation', order: 2,
    intensity: 'active', duration: '30–45 seconds',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
    description: 'A kneeling backbend that opens the front body, stimulates the thyroid and reproductive organs, and energises the body.',
    benefits: ['Opens chest', 'Stimulates thyroid', 'Hip flexor stretch', 'Increases vitality'],
    safetyWarning: null,
  },
  {
    name: 'Dancer\'s Pose', sanskritName: 'Natarajasana', phase: 'ovulation', order: 3,
    intensity: 'active', duration: '20–30 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'A graceful balancing backbend that requires focus and strength — ideal during peak-energy ovulation days.',
    benefits: ['Balance', 'Hip flexor opening', 'Concentration', 'Full body coordination'],
    safetyWarning: null,
  },
  {
    name: 'High Lunge', sanskritName: 'Ashta Chandrasana', phase: 'ovulation', order: 4,
    intensity: 'active', duration: '45 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'A powerful lunge that stretches the hip flexors, builds leg strength, and channels the full energy of ovulation.',
    benefits: ['Hip flexor stretch', 'Leg strength', 'Core activation', 'Builds heat'],
    safetyWarning: null,
  },

  // ══ LUTEAL PHASE (wind down) ══════════════════════════════════════════════
  {
    name: 'Pigeon Pose', sanskritName: 'Eka Pada Rajakapotasana', phase: 'luteal', order: 1,
    intensity: 'moderate', duration: '1–2 minutes each side',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    description: 'A deep hip opener that releases tension accumulated during the luteal phase and soothes PMS-related emotional heaviness.',
    benefits: ['Deep hip release', 'Reduces PMS tension', 'Emotional release', 'Sciatic relief'],
    safetyWarning: null,
  },
  {
    name: 'Yin Butterfly', sanskritName: 'Baddha Konasana (Yin)', phase: 'luteal', order: 2,
    intensity: 'gentle', duration: '3–5 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    description: 'A long-hold yin pose that stretches the inner thighs and groin while calming the nervous system ahead of menstruation.',
    benefits: ['Inner thigh stretch', 'Calms anxiety', 'Stimulates ovaries', 'Reduces PMS'],
    safetyWarning: null,
  },
  {
    name: 'Supported Bridge', sanskritName: 'Setu Bandha Sarvangasana', phase: 'luteal', order: 3,
    intensity: 'gentle', duration: '2–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
    description: 'Using a block under the sacrum, this restorative backbend opens the chest and relieves lower back tension in the pre-menstrual phase.',
    benefits: ['Lower back relief', 'Opens chest', 'Reduces anxiety', 'Hormone support'],
    safetyWarning: null,
  },
  {
    name: 'Cat–Cow Flow', sanskritName: 'Marjaryasana–Bitilasana', phase: 'luteal', order: 4,
    intensity: 'gentle', duration: '2–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'A rhythmic spinal mobilisation that eases lower back stiffness, aids digestion, and prepares the body for the coming period.',
    benefits: ['Spinal mobility', 'Eases bloating', 'Stress relief', 'Pelvic floor activation'],
    safetyWarning: null,
  },

  // ══ TRIMESTER 1 (first 12 weeks) ════════════════════════════════════════
  {
    name: 'Mountain Pose', sanskritName: 'Tadasana', phase: 'all', trimester: 1, order: 1,
    intensity: 'gentle', duration: '1–2 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'The foundation of all standing poses. Builds body awareness and teaches alignment during the subtle first trimester.',
    benefits: ['Posture awareness', 'Grounding', 'Breath awareness', 'Safe for all'],
    safetyWarning: null,
  },
  {
    name: 'Seated Cat–Cow', sanskritName: 'Chair Marjaryasana', phase: 'all', trimester: 1, order: 2,
    intensity: 'gentle', duration: '2–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
    description: 'Performed seated on a chair or edge of mat, this spinal wave is safe in early pregnancy and helps with nausea relief.',
    benefits: ['Reduces nausea', 'Spinal mobility', 'Pelvic floor awareness', 'Gentle energy'],
    safetyWarning: null,
  },
  {
    name: 'Warrior II (Modified)', sanskritName: 'Virabhadrasana II', phase: 'all', trimester: 1, order: 3,
    intensity: 'moderate', duration: '30 seconds each side',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    description: 'With a slightly wider stance than usual, this standing pose builds strength and stamina for the months ahead.',
    benefits: ['Leg strength', 'Hip opening', 'Stamina building', 'Builds confidence'],
    safetyWarning: null,
  },

  // ══ TRIMESTER 2 (weeks 13–27) ════════════════════════════════════════════
  {
    name: 'Goddess Pose', sanskritName: 'Utkata Konasana', phase: 'all', trimester: 2, order: 1,
    intensity: 'moderate', duration: '30–60 seconds',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'A wide-legged squat that opens the hips and strengthens the pelvic floor — essential preparation for the second trimester.',
    benefits: ['Pelvic floor strength', 'Hip opening', 'Inner thigh strength', 'Birth preparation'],
    safetyWarning: null,
  },
  {
    name: 'Side-Lying Savasana', sanskritName: 'Parsva Savasana', phase: 'all', trimester: 2, order: 2,
    intensity: 'gentle', duration: '5–15 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    description: 'Deep rest on the left side improves circulation to the placenta and helps with the fatigue common in the second trimester.',
    benefits: ['Deep rest', 'Improves circulation', 'Reduces swelling', 'Stress relief'],
    safetyWarning: '⚠ Always rest on your LEFT side — this optimises blood flow to the baby and avoids compressing the vena cava.',
  },
  {
    name: 'Supported Wide-Angle', sanskritName: 'Upavistha Konasana', phase: 'all', trimester: 2, order: 3,
    intensity: 'gentle', duration: '1–2 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'A seated wide-leg stretch using a bolster or folded blanket to support the growing belly while stretching the inner thighs.',
    benefits: ['Inner thigh flexibility', 'Reduces sciatic pain', 'Hip opening', 'Pelvis preparation'],
    safetyWarning: null,
  },
  {
    name: 'Butterfly (Seated)', sanskritName: 'Baddha Konasana', phase: 'all', trimester: 2, order: 4,
    intensity: 'gentle', duration: '2–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    description: 'Sit tall with soles of feet together. Opens the groin and hips comfortably around the growing bump.',
    benefits: ['Groin flexibility', 'Pelvic opening', 'Calms anxiety', 'Hip joint health'],
    safetyWarning: null,
  },

  // ══ TRIMESTER 3 (weeks 28–40) ════════════════════════════════════════════
  {
    name: 'Supported Squat', sanskritName: 'Malasana (Supported)', phase: 'all', trimester: 3, order: 1,
    intensity: 'moderate', duration: '30–60 seconds',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
    description: 'Using a wall or chair for support, this deep squat opens the pelvis wide and is one of the most important poses for birth preparation.',
    benefits: ['Pelvic opening', 'Birth preparation', 'Leg strength', 'Gravity-assisted'],
    safetyWarning: '⚠ Do not hold unsupported. Use a wall, chair, or partner. Avoid if baby is breech — consult your midwife first.',
  },
  {
    name: 'Cat–Cow on All Fours', sanskritName: 'Marjaryasana–Bitilasana', phase: 'all', trimester: 3, order: 2,
    intensity: 'gentle', duration: '3–5 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    description: 'On hands and knees, this rhythmic movement relieves the lower back pressure of the third trimester and helps the baby into an optimal position.',
    benefits: ['Lower back relief', 'Optimal baby position', 'Pelvic mobility', 'Stress relief'],
    safetyWarning: null,
  },
  {
    name: 'Pelvic Tilts', sanskritName: 'Kati Chakrasana Prep', phase: 'all', trimester: 3, order: 3,
    intensity: 'gentle', duration: '2–3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    description: 'Standing with back against a wall, gently tuck and release the pelvis. Strengthens the core and relieves late-pregnancy backache.',
    benefits: ['Core strength', 'Back pain relief', 'Pelvic awareness', 'Posture support'],
    safetyWarning: null,
  },
  {
    name: 'Legs-Up Wall (Modified)', sanskritName: 'Viparita Karani (Modified)', phase: 'all', trimester: 3, order: 4,
    intensity: 'gentle', duration: '5–10 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    description: 'Resting at 45° against the wall with knees bent — not fully inverted. Relieves swollen ankles and exhaustion in the final weeks.',
    benefits: ['Reduces ankle swelling', 'Relieves exhaustion', 'Calms nervous system', 'Improves circulation'],
    safetyWarning: '⚠ Do NOT use a full inversion (90°). Keep knees bent and body at 45°. Stop if you feel dizzy or short of breath.',
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
const seedPoses = async (req, res) => {
  try {
    const count = await ExercisePose.countDocuments();
    if (count > 0) {
      return res.json({ message: `Poses already seeded (${count} poses in DB).` });
    }
    const docs = await ExercisePose.insertMany(SEED_POSES);
    res.status(201).json({ message: `Seeded ${docs.length} poses successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/poses  ───────────────────────────────────────────────────────────
// Query params:
//   ?phase=menstrual|follicular|ovulation|luteal|all
//   ?trimester=1|2|3        (returns pregnancy-specific poses for that trimester)
const getPoses = async (req, res) => {
  try {
    const { phase, trimester } = req.query;
    const filter = { isActive: true };

    if (trimester) {
      // Pregnancy mode — return poses for that trimester (trimester field set)
      filter.trimester = parseInt(trimester);
    } else if (phase) {
      // Cycle mode — return poses for the requested phase
      filter.phase = phase;
      filter.trimester = null; // exclude pregnancy poses
    }

    const poses = await ExercisePose.find(filter).sort({ order: 1 });
    res.json(poses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/poses/:id  ───────────────────────────────────────────────────────
const getPoseById = async (req, res) => {
  try {
    const pose = await ExercisePose.findById(req.params.id);
    if (!pose) return res.status(404).json({ message: 'Pose not found.' });
    res.json(pose);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/poses  (admin only) ─────────────────────────────────────────────
const createPose = async (req, res) => {
  try {
    const pose = await ExercisePose.create(req.body);
    res.status(201).json(pose);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── PUT /api/poses/:id  (admin only) ─────────────────────────────────────────
const updatePose = async (req, res) => {
  try {
    const pose = await ExercisePose.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pose) return res.status(404).json({ message: 'Pose not found.' });
    res.json(pose);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── DELETE /api/poses/:id  (admin only) ──────────────────────────────────────
const deletePose = async (req, res) => {
  try {
    const pose = await ExercisePose.findByIdAndDelete(req.params.id);
    if (!pose) return res.status(404).json({ message: 'Pose not found.' });
    res.json({ message: 'Pose deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { seedPoses, getPoses, getPoseById, createPose, updatePose, deletePose };