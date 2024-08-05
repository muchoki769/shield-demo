function authUser(req, res, next) {
  if (req.user == null) {
    res.status(403);
    // return res.send("You need to sign in");
    req.flash("success_msg", "You need to sign in");
    return res.redirect("/users/login");
  }
  next();
}
function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      res.status(401);
      // return res.send("Not Allowed");
      req.flash("success_msg", "Not Allowed");
      return res.redirect("/users/dashboard");
    }
    next();
  };
}
module.exports = { authUser, authRole };
