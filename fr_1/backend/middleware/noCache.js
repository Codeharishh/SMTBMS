// middleware/noCache.js
// Prevents browsers, CDNs, and proxies (e.g. Vercel's edge network if you're
// rewriting /api/* to your Render backend) from caching API responses.
// Without this, GET requests can return a stale 304 Not Modified even when
// the underlying data has genuinely changed — which is exactly what shows
// up as "notifications work in the DB but never appear on the live site."
const noCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
};

module.exports = noCache;