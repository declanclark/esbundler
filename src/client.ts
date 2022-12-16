function getBundle(code: string, globals: Record<string, unknown> = {}) {
  const fn = new Function(...Object.keys(globals), code);
  return fn(...Object.values(globals));
}

export { getBundle };
