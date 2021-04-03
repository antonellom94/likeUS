// this file check if the user is logged in or not
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).send("Not logged in");
  }
};

module.exports = isLoggedIn;
