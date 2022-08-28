function getBundle(code: string) {
  const fn = new Function(code);
  return fn();
}

export { getBundle };
