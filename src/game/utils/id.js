/**
 * Crea un id aleatorio.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function getRandomId(prefix) {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(36)
    .padStart(8, 0)
  return `${prefix}-${id}`
}

export default {
  getRandomId
}
