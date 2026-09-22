export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.user?.role)) {
      return res.status(403).json({
        message: "Forbidden: don't have permission",
      });
    }
    next();
  };
};