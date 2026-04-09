/**
 * Auth Middleware
 * Checks for a logged-in user via the X-User header (set by the frontend after login).
 * Public routes (login) are always allowed through.
 */

const PUBLIC_ROUTES = ['/api/auth/login'];

module.exports = function authMiddleware(req, res, next) {
  // Always allow public routes and preflight requests
  if (req.method === 'OPTIONS' || PUBLIC_ROUTES.includes(req.path)) {
    return next();
  }

  // Read user identity passed from the frontend after login
  const userHeader = req.headers['x-user'];
  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
    } catch {
      req.user = null;
    }
  }

  // To enforce auth, uncomment the block below:
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  // }

  next();
};
