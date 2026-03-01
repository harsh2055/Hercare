// server/controllers/pregnancyController.js
const Pregnancy = require('../models/Pregnancy');

const weeklyGuidance = {
  1: { baby: 'A fertilized egg begins dividing', mom: 'Start taking folic acid 400mcg daily', size: 'Poppy seed' },
  4: { baby: 'Embryo forms, neural tube developing', mom: 'Fatigue and breast tenderness common', size: 'Poppyseed' },
  6: { baby: 'Heart beating, arm and leg buds forming', mom: 'Morning sickness may begin', size: 'Lentil' },
  8: { baby: 'All major organs forming, fingers visible', mom: 'Nausea peaks, stay hydrated', size: 'Kidney bean' },
  10: { baby: 'Officially a fetus! Organs functional', mom: 'First prenatal visit due', size: 'Strawberry' },
  12: { baby: 'Reflexes developing, can make fists', mom: 'First trimester screening', size: 'Lime' },
  16: { baby: 'Can hear sounds, eyes moving', mom: 'Energy returning, bump visible', size: 'Avocado' },
  20: { baby: 'Halfway! Swallowing, skin forming', mom: 'Anatomy scan this week', size: 'Banana' },
  24: { baby: 'Viability milestone, responding to sound', mom: 'Glucose tolerance test due', size: 'Corn' },
  28: { baby: 'Eyes open, brain developing rapidly', mom: 'Third trimester begins, more frequent visits', size: 'Eggplant' },
  32: { baby: 'Practicing breathing movements', mom: 'Braxton Hicks contractions normal', size: 'Squash' },
  36: { baby: 'Full term in 4 weeks, head may engage', mom: 'Weekly checkups begin', size: 'Honeydew melon' },
  40: { baby: 'Full term! Ready to meet you', mom: 'Watch for labor signs', size: 'Watermelon' }
};

const getWeekGuidance = (week) => {
  const weeks = Object.keys(weeklyGuidance).map(Number).sort((a, b) => a - b);
  const closest = weeks.reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);
  return weeklyGuidance[closest];
};

const createPregnancy = async (req, res) => {
  try {
    const { dueDate, lastMenstrualPeriod } = req.body;

    // Deactivate previous pregnancies
    await Pregnancy.updateMany({ userId: req.user._id }, { isActive: false });

    const pregnancy = await Pregnancy.create({
      userId: req.user._id,
      dueDate,
      lastMenstrualPeriod
    });

    const guidance = getWeekGuidance(pregnancy.currentWeek);
    res.status(201).json({ ...pregnancy.toObject(), guidance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPregnancy = async (req, res) => {
  try {
    const pregnancy = await Pregnancy.findOne({ userId: req.user._id, isActive: true });
    if (!pregnancy) return res.status(404).json({ message: 'No active pregnancy found' });

    // Recalculate current week
    const today = new Date();
    const conceptionDate = new Date(pregnancy.dueDate);
    conceptionDate.setDate(conceptionDate.getDate() - 280);
    const diffDays = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
    pregnancy.currentWeek = Math.max(1, Math.min(42, Math.floor(diffDays / 7)));
    if (pregnancy.currentWeek <= 12) pregnancy.trimester = 1;
    else if (pregnancy.currentWeek <= 27) pregnancy.trimester = 2;
    else pregnancy.trimester = 3;
    await pregnancy.save();

    const guidance = getWeekGuidance(pregnancy.currentWeek);
    res.json({ ...pregnancy.toObject(), guidance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePregnancy = async (req, res) => {
  try {
    const pregnancy = await Pregnancy.findOne({ userId: req.user._id, isActive: true });
    if (!pregnancy) return res.status(404).json({ message: 'No active pregnancy found' });

    Object.assign(pregnancy, req.body);
    await pregnancy.save();
    res.json(pregnancy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPregnancy, getPregnancy, updatePregnancy };
