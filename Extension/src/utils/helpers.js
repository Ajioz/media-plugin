/**
 * Returns a promise that resolves after a random delay between min and max.
 * @param {number} min - Minimum delay in milliseconds.
 * @param {number} max - Maximum delay in milliseconds.
 * @returns {Promise<number>} - Resolves with the actual delay value.
 */

async function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return delay;
}

function selectRandomElement(elements) {
  return elements[Math.floor(Math.random() * elements.length)];
}

module.exports = {
  selectRandomElement,
  randomDelay,
};
