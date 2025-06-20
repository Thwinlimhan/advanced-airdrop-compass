const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length); // Remove 'Bearer '
    
    if (!process.env.JWT_SECRET) {
      console.error('Auth Middleware: JWT_SECRET is not defined. Cannot verify token.');
      return res.status(500).json({ message: 'Authentication configuration error on server.' });
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ensure decoded object contains userId and email as expected from token signing
        if (!decoded.userId || !decoded.email) {
          console.error('Auth Middleware: Decoded token is missing userId or email.');
          return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        }
        req.user = { id: decoded.userId, email: decoded.email }; // Attach user info
        console.log('Auth Middleware: Token verified, user attached:', req.user.id);
        next();
      } catch (error) {
        console.error('Auth Middleware: Error verifying token:', error.name, error.message);
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: `Unauthorized: Invalid token (${error.message})`});
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
    } else {
      console.log('Auth Middleware: No token provided after Bearer scheme.');
      res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }
  } else {
    console.log('Auth Middleware: Authorization header missing or not Bearer type.');
    res.status(401).json({ message: 'Unauthorized: Authorization header missing or not Bearer type' });
  }
};

module.exports = authMiddleware;