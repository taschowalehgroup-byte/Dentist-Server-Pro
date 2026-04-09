/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
}

// 404 handler
function notFound(req, res) {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler, notFound };
