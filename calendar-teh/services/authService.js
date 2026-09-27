/**
 * Authentication and Security Service
 * Implements password hashing via crypto (scrypt/PBKDF2), JWT token generation,
 * session validation, and password reset token handling.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teh-calendar-secret-jwt-key-2026-vibrant-african-power';
const JWT_EXPIRES_IN = '7d';

/**
 * Hashes a plaintext password with a unique salt using crypto.scryptSync
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a stored salt:hash string
 */
function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Generates a signed JWT session token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'User'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies and decodes a JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Generates an expiring password reset token
 */
function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  // Expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

/**
 * Express middleware to require authentication on protected routes
 */
function requireAuth(storage) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.query && req.query.auth_token) {
      token = req.query.auth_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    }

    const user = storage.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    // Attach user to request (omit password_hash)
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  };
}

/**
 * Optional auth middleware for endpoints that can work for both public and logged-in users
 */
function optionalAuth(storage) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.query && req.query.auth_token) {
      token = req.query.auth_token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = storage.getUserById(decoded.id);
        if (user) {
          const { password_hash, ...safeUser } = user;
          req.user = safeUser;
        }
      }
    }
    next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateResetToken,
  requireAuth,
  optionalAuth
};
