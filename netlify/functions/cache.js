// In-memory cache (works per Netlify function instance)
const cache = new Map();

const TTL = 30 * 1000; // 30 seconds

export function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCache(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + TTL,
  });
}

export function clearCache(key) {
  cache.delete(key);
}
