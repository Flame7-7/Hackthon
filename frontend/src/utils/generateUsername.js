// frontend/src/utils/generateUsername.js
const adjectives = [
  'Ghost', 'Shadow', 'Mystic', 'Phantom', 'Echo', 'Silent', 'Swift', 'Clever',
  'Brave', 'Wise', 'Noble', 'Swift', 'Bright', 'Dark', 'Wild', 'Calm'
];

const nouns = [
  'Walker', 'Rider', 'Seeker', 'Wanderer', 'Dreamer', 'Hunter', 'Guardian',
  'Phoenix', 'Raven', 'Wolf', 'Owl', 'Falcon', 'Dragon', 'Knight'
];

export const generateUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;
  
  return `${adjective}_${noun}_${number}`;
};

export const validateUsername = (username) => {
  const pattern = /^[A-Za-z0-9_]{3,30}$/;
  return pattern.test(username);
};