const passport = require("passport");
const twitterStrategy = require("passport-twitter").Strategy;

const keys = require("../config/keys");

passport.serializeUser((user, done) => {
  console.log(user); // printing user info
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new twitterStrategy(
    {
      consumerKey: keys.twitterAPIKey,
      consumerSecret: keys.twitterAPISecretKey,
      callbackURL: "http://localhost:3000/auth/twitter/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
