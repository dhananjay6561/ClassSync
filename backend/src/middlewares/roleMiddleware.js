const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};

module.exports = permit;
// This middleware checks if the user's role is allowed to access the route.
// If the user's role is not in the allowed roles, it responds with a 403 Forbidden status.
// If the role is allowed, it calls the next middleware or route handler.
// This is used to restrict access to certain routes based on user roles.       
// It allows for role-based access control in the application.
// It can be used in combination with the authentication middleware to ensure that only authenticated users with the correct roles can access specific routes.