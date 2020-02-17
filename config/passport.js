const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("./keys");

// Create Strategy options
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      //Find user by id
      User.findById(jwt_payload.id)
        .then(user => {
          //If user exists, return done function with the user
          if (user) {
            return done(null, user);
          }
          //In other case, return false
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
