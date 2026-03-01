// client/src/utils/dateUtils.js

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const daysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const daysSince = (date) => {
  if (!date) return null;
  const diff = new Date() - new Date(date);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const getCurrentCycleDay = (lastPeriodDate) => {
  if (!lastPeriodDate) return null;
  return daysSince(lastPeriodDate) + 1;
};

export const getCyclePhase = (cycleDay, cycleLength = 28) => {
  if (!cycleDay) return 'unknown';
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
};

export const phaseColors = {
  menstrual: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', emoji: '🌑' },
  follicular: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', emoji: '🌒' },
  ovulation: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', emoji: '🌕' },
  luteal: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', emoji: '🌖' },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', emoji: '🌙' },
};

export const phaseNames = {
  menstrual: 'Menstrual Phase',
  follicular: 'Follicular Phase',
  ovulation: 'Ovulation Phase',
  luteal: 'Luteal Phase',
};
