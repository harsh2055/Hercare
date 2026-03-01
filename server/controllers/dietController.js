const DietPlan = require('../models/DietPlan');

// GET /api/diet
// Query params: phase, trimester, dietaryPreference (or preference)
exports.getDietPlan = async (req, res) => {
  try {
    const { phase, trimester, dietaryPreference, preference } = req.query;
    const pref = dietaryPreference || preference || 'vegetarian';

    let query = { dietaryPreference: pref };

    if (trimester) {
      query.trimester = parseInt(trimester);
    } else if (phase) {
      query.phase = phase;
    }

    let plan = await DietPlan.findOne(query);

    // Fallback 1: same phase, any preference
    if (!plan && phase) {
      plan = await DietPlan.findOne({ phase });
    }

    // Fallback 2: same preference, menstrual phase
    if (!plan) {
      plan = await DietPlan.findOne({ dietaryPreference: pref });
    }

    // Fallback 3: anything at all
    if (!plan) {
      plan = await DietPlan.findOne({});
    }

    if (!plan) {
      return res.status(404).json({ message: 'No diet plan found. Please seed the database.' });
    }

    res.json(plan);
  } catch (err) {
    console.error('getDietPlan error:', err);
    res.status(500).json({ message: 'Server error fetching diet plan' });
  }
};
