const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expect Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
// This middleware checks for a JWT token in the Authorization header.
// If the token is valid, it decodes it and attaches the user information to the request object.
// If the token is missing or invalid, it responds with a 401 Unauthorized status.
// This is used to protect routes that require authentication.
// It ensures that only authenticated users can access certain routes in the application.
// It uses the `jsonwebtoken` library to verify the token and extract user information.