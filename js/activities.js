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
];

const TEAMS = {
  'Team A': {
    name: 'Ankle-Biting Chihuahuas',
    members: ['Elton Puglisi', 'Aron Stansfeld', 'Elijah Lavigne', 'Torrey Froese', 'Merrick Masales'],
  },
  'Team B': {
    name: 'I Thought They Said Rum',
    members: ['Nikki Watson', 'Ron Parrish', 'Heidi McLellan', 'Todd Dempsey', 'Rina Marceles'],
  },
  'Team C': {
    name: 'Brute Force Five (BFF)',
    members: ['Omid Basti', 'Rick Temple', 'Garrett Smith', 'Abner Chinchilla', 'Mali Lombard'],
  },
  'Team D': {
    name: 'Un-Rigged',
    members: ['Colm Murphy', 'Dylan Both', 'Ammar Shoaib', 'Brandon Johnson', 'Ahmed Elsaadawy'],
  },
  'Team E': {
    name: 'Soreplay',
    members: ['Gary Ghag', 'Creigh Sullivan', 'Jay Simpson', 'Shari Quiring', 'Vitaly Galitsky'],
  },
};

/** Google Apps Script endpoint (existing JIJ form backend) */
const FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwS25oS1rtOx7QjP-613ouJP1CQ8pKuhki-jzo2qdrgqy_gAL0rZblM0YgjtQf9S1Oq/exec';

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
