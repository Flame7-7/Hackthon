// backend/src/utils/usernameGenerator.js
const GHOST_NAMES = [
  'Wraith', 'Specter', 'Apparition', 'Phantom', 'Shadow', 'Spirit',
  'Eidolon', 'Fetch', 'Banshee', 'Poltergeist', 'Revenant', 'Ghoul'
];

const COLORS = [
  'Crimson', 'Shadow', 'Mystic', 'Ethereal', 'Spectral', 'Phantom',
  'Ghostly', 'Void', 'Silent', 'Whispering', 'Fading', 'Ephemeral'
];

const ACTIONS = [
  'Walker', 'Seeker', 'Wanderer', 'Drifter', 'Rover', 'Nomad',
  'Pilgrim', 'Voyager', 'Explorer', 'Adventurer', 'Traveler'
];

export const generateGhostUsername = () => {
  const name = GHOST_NAMES[Math.floor(Math.random() * GHOST_NAMES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const number = Math.floor(Math.random() * 9999);
  
  const patterns = [
    `${color}_${name}`,
    `${name}The${action}`,
    `${name}_${number}`,
    `${color}${action}`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
};

export const validateUsername = (username) => {
  // Allow alphanumeric, underscores, and spaces
  const pattern = /^[A-Za-z0-9 _]{3,30}$/;
  return pattern.test(username);
};