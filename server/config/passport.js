const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
// const keys = require('../config/keys');
const jwt = require("jsonwebtoken");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = keys.secretOrKey;
opts.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then((user) => {
        //   console.log("jwt user", user);
        //   console.log("decoded", jwt.decode(user.activeJWT));

          if (user && user._id.equals(jwt.decode(user.activeJWT).id)) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log("JwtStrategy error from passport.js config: ", err));
    })
  );
};
