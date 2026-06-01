/** Jacked in June 2026 — activity point values (per hour unless noted) */
const ACTIVITIES = [
  {
    id: 'walking',
    name: 'Walking',
    icon: '🚶',
    category: 'cardio',
    pointsPerHour: 5,
    inputType: 'duration-or-steps',
    stepsPerBlock: 4000,
    pointsPerStepsBlock: 5,
    description: '1 hour OR 4,000 steps = 5 pts',
  },
  {
    id: 'running',
    name: 'Running',
    icon: '🏃',
    category: 'cardio',
    pointsPerHour: 10,
    inputType: 'duration',
    description: '1 hour = 10 pts',
  },
  {
    id: 'biking',
    name: 'Biking',
    icon: '🚴',
    category: 'cardio',
    pointsPerHour: 8,
    inputType: 'duration',
    description: '1 hour = 8 pts',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: '🏊',
    category: 'other',
    pointsPerHour: 10,
    inputType: 'duration',
    description: '1 hour = 10 pts',
  },
  {
    id: 'strength',
    name: 'Strength Training',
    icon: '🏋️',
    category: 'other',
    pointsPerHour: 8,
    inputType: 'duration',
    description: '1 hour = 8 pts',
  },
  {
    id: 'yoga',
    name: 'Yoga / Stretching',
    icon: '🧘',
    category: 'other',
    pointsPerHour: 5,
    inputType: 'duration',
    description: '1 hour = 5 pts',
  },
  {
    id: 'dancing',
    name: 'Dancing',
    icon: '💃',
    category: 'other',
    pointsPerHour: 6,
    inputType: 'duration',
    description: '1 hour = 6 pts',
  },
  {
    id: 'fitness-class',
    name: 'Fitness Class',
    icon: '🔥',
    category: 'other',
    pointsPerHour: 8,
    inputType: 'duration',
    description: 'Zumba, HIIT, etc. — 1 hour = 8 pts',
  },
  {
    id: 'squash',
    name: 'Squash',
    icon: '🎾',
    category: 'other',
    pointsPerHour: 9,
    inputType: 'duration',
    description: '1 hour = 9 pts',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    category: 'other',
    pointsPerHour: 8,
    inputType: 'duration',
    description: '1 hour = 8 pts',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    category: 'other',
    pointsPerHour: 9,
    inputType: 'duration',
    description: '1 hour = 9 pts',
  },
  {
    id: 'golf',
    name: 'Golf (Walking)',
    icon: '⛳',
    category: 'other',
    pointsPerHour: 6,
    inputType: 'duration',
    description: '1 hour = 6 pts',
  },
  {
    id: 'stationary-bike',
    name: 'Stationary Bike',
    icon: '🚲',
    category: 'other',
    pointsPerHour: 7,
    inputType: 'duration',
    description: '1 hour = 7 pts',
  },
  {
    id: 'table-sports',
    name: 'Table Sports',
    icon: '🏓',
    category: 'other',
    pointsPerHour: 5,
    inputType: 'duration',
    description: '1 hour = 5 pts',
  },
  {
    id: 'hiking',
    name: 'Hiking',
    icon: '🥾',
    category: 'other',
    pointsPerHour: 6,
    inputType: 'duration',
    description: '1 hour = 6 pts',
  },
  {
    id: 'cardio-equipment',
    name: 'Cardio Equipment',
    icon: '🏃‍♂️',
    category: 'other',
    pointsPerHour: 7,
    inputType: 'duration',
    description: 'Elliptical, StairMaster, Rowing, etc. — 1 hour = 7 pts',
  },
];

/** Teams — Jacked in June 2026 official rosters */
const TEAMS = {
  'Team A': {
    name: 'Team A',
    members: [
      'Torrey Froese',
      'Ariel Liang',
      'Vitaly Galitsky',
      'Han Xu',
      'Edward Guo',
      'Robert Smith',
      'Dale Goudy',
    ],
  },
  'Team B': {
    name: 'Team B',
    members: [
      'Ammar Shoaib',
      'Jay Simpson',
      'Creigh Sullivan',
      'Mark Evans',
      'Shari Quiring',
      'Quinn Mudge',
      'Peyman Kanzehle',
    ],
  },
  'Team C': {
    name: 'Team C',
    members: [
      'Rina Marceles',
      'Heidi McLellan',
      'Nikki Watson',
      'Milton Cordova',
      'Todd Dempsey',
      'Aron Stansfeld',
      'Brandon Johnson',
    ],
  },
  'Team D': {
    name: 'Team D',
    members: [
      'Omid Basti',
      'Mali Lombard',
      'Colm Murphy',
      'Gary Ghag',
      'Aileen Wei',
      'Abdollah Kashkooli',
      'Ahmed Elsaadawy',
    ],
  },
  'Team E': {
    name: 'Team E',
    members: [
      'Garrett Smith',
      'Rick Temple',
      'Abner Chinchilla',
      'AJ Martens',
      'Brent Behm',
      'Jianchao Lai',
      'Stephane Chaland',
    ],
  },
};

/**
 * Submission backend — configured in js/config.js
 * See docs/microsoft-setup.md for OneDrive / SharePoint setup.
 */

function getActivityById(id) {
  return ACTIVITIES.find((a) => a.id === id);
}

function calculatePoints(activityId, minutes, steps) {
  const activity = getActivityById(activityId);
  if (!activity) return 0;

  if (activity.inputType === 'duration-or-steps') {
    const fromTime = minutes > 0 ? (minutes / 60) * activity.pointsPerHour : 0;
    const fromSteps =
      steps > 0 ? (steps / activity.stepsPerBlock) * activity.pointsPerStepsBlock : 0;
    return Math.round(Math.max(fromTime, fromSteps) * 100) / 100;
  }

  return Math.round((minutes / 60) * activity.pointsPerHour * 100) / 100;
}

function formatPoints(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
