const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.expertId = decoded.expertId;
    req.expertEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

module.exports = authMiddleware;
