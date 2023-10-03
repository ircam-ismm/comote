const e = {};

// Nyquist normalised frequency is 1
export function hertzToNormalised(frequencyHertz, {
  sampleRate = 2,
} = {}) {
  return frequencyHertz * 2 / sampleRate;
}
Object.assign(e, {hertzToNormalised});

export function normalisedToHertz(frequencyNormalised, {
  sampleRate = 2,
} = {}) {
  return frequencyNormalised * sampleRate * 0.5;
}
Object.assign(e, {normalisedToHertz});

export default e;
