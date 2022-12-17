/**
 *
 * @param {string} code - The code string returned from bundle()
 * @param {Record<string, unknown>} [globals] - Variables that should be accessible to the bundle when it runs
 * @returns {{ [key: string]: unknown }}
 */
function getBundle(code, globals = {}) {
  const fn = new Function(...Object.keys(globals), code);
  return fn(...Object.values(globals));
}

export { getBundle };
