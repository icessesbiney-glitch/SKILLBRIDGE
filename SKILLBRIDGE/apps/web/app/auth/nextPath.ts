export function getSafeNextPath(search: string, fallback = '/dashboard') {
  const nextValue = new URLSearchParams(search).get('next');

  if (!nextValue || !nextValue.startsWith('/') || nextValue.startsWith('//')) {
    return fallback;
  }

  return nextValue;
}
