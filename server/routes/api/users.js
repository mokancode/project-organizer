const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const ObjectId = require("mongoose").Types.ObjectId;

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const isEmpty = require("../../validation/is-empty");
const sendMail = require("../../services/MailjetMailer");

// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register a user and send account activation email unless user signed up with Google OAuth.
// @access Public
router.post("/register", (req, res) => {
  var errors = {},
    isValid;

  const { isGoogleAccount } = req.body;

  if (!isGoogleAccount) {
    const { errors: _errors, isValid: _isValid } = validateRegisterInput(req.body);
    errors = _errors;
    isValid = _isValid;

    // Check validation
    if (isValid === false) {
      return res.status(400).json({ errors });
    }
  }

  // return res.json("register");

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email is already taken";
      return res.status(400).json(errors);
    } else {
      User.findOne({ username: req.body.username }).then((user) => {
        if (user) {
          errors.username = "Username taken";
          return res.status(400).json(errors);
        } else {
          var userProperties = {
            username: req.body.username,
            email: req.body.email,
          };
          if (!isGoogleAccount) {
            userProperties.password = req.body.password;
          } else userProperties.isGoogleAccount = true;

          const newUser = new User(userProperties);

          if (!isGoogleAccount) {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((createdUser) => {
                    // Create JWT payload
                    const payload = {
                      id: createdUser.id,
                      username: createdUser.username,
                    };

                    // console.log("creating jwt token");
                    // Sign the token
                    try {
                      return jwt.sign(
                        payload,
                        process.env.JWT_SECRET,
                        // { expiresIn: "1d" },
                        (err, token) => {
                          console.log("token error");
                          errors.registration = "Registration failed";
                          if (!isEmpty(err)) return res.status(500).json(errors);
                          else {
                            try {
                              // console.log("generating templateParams");
                              // Send activation email
                              var templateParams = {
                                recipient_email: req.body.email,
                                recipient_name: req.body.username,
                                app_name: "Project Organizer",
                                activationURL: `https://project-organizer-mokancode.herokuapp.com/confirm/${token}`,
                                templateID: 2926318,
                                subject: `Activate your Project Organizer account`,
                              };

                              var mPromise = function (templateParams) {
                                sendMail(templateParams)
                                  .then(
                                    function (fulfilled) {
                                      console.log("mail sent:", fulfilled);
                                      return res.json({
                                        success: "Registration successful, please check your email to activate your account",
                                      });
                                    }.bind(this)
                                  )
                                  .catch(
                                    function (error) {
                                      console.log("error: ", error);
                                      errors.registration =
                                        "User created but an account verification email could not be sent due to server error." +
                                        " Try requesting it again later";
                                      return res.status(400).json(errors);
                                    }.bind(this)
                                  );
                              }.bind(this);
                              mPromise(templateParams);
                            } catch (err) {
                              console.log("registration sendmail error: ", err);
                            }

                            // createdUser.activeJWT = token;
                            // return createdUser.save().then((userWithJWT) => {
                            //   return res.json({
                            //     success: true,
                            //     token: `Bearer ${token}`,
                            //   });
                            // });
                          }
                        }
                      );
                    } catch (err) {
                      console.log("jwt sign error:", err);
                    }
                  })
                  .catch((err) => {
                    errors.registration = "Server error";
                    errors.err = err;
                    return res.status(500).json(errors);
                    // console.log("registration/bcrypt err: ", err);
                  });
              }); // hash
            }); // bcrypt genSalt
          } else {
            // console.log("creating new gmail user");

            newUser
              .save()
              .then((createdUser) => {
                // Create JWT payload
                const payload = {
                  id: createdUser.id,
                  username: createdUser.username,
                };

                // console.log("gmail user created");

                // Sign the token
                return jwt.sign(
                  payload,
                  process.env.JWT_SECRET,
                  // { expiresIn: "1d" },
                  (err, token) => {
                    errors.registration = "Registration failed";
                    if (!isEmpty(err)) return res.status(500).json(errors);
                    else {
                      // console.log("sending over bearer token");

                      createdUser.activeJWT = token;
                      return createdUser.save().then((userWithJWT) => {
                        return res.json({
                          success: true,
                          token: `Bearer ${token}`,
                        });
                      });
                    }
                  }
                );
              })
              .catch((err) => {
                errors.registration = "Server error";
                return res.status(500).json(errors);
                // console.log("registration/bcrypt err: ", err);
              });
          }
        } // else user not found,
      }); // then create user
    } // else email not found
  });
}); // post register

// @route POST api/users/login
// @desc Login User / Return JWT Token
// @access Public
router.post("/login", (req, res) => {

  const { isGoogleAccount } = req.body;

  var errors = {},
    isValid;

  if (!isGoogleAccount) {
    const { errors: _errors, isValid: _isValid } = validateLoginInput(req.body);
    errors = _errors;
    isValid = _isValid;

    // Check validation
    if (isValid === false) {
      return res.status(400).json(errors);
    }
  }
  const { username, password } = req.body;

  User.findOne({ username }).then((user) => {
    if (!user) {
      errors.login = "User not found";
      return res.status(404).json(errors);
    }
    if (user.verified !== true && !user.isGoogleAccount) {
      errors.login = "Account not yet activated. Please check your email.";
      return res.status(404).json(errors);
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
    };

    if (isGoogleAccount) {
      var userNotes = user.notes ? JSON.parse(user.notes) : null;

      // Sign the token
      return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        // { expiresIn: "1d" },
        (err, token) => {
          user.activeJWT = token;
          return user.save().then((saved) => {
            return res.json({
              success: true,
              token: `Bearer ${token}`,
              notes: userNotes,
            });
          });
        }
      );
    }
    // Check for password
    else
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          // User matched

          var userNotes = user.notes ? JSON.parse(user.notes) : null;

          // Sign the token
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            // { expiresIn: "1d" },
            (err, token) => {
              user.activeJWT = token;
              return user.save().then((saved) => {
                return res.json({
                  success: true,
                  token: `Bearer ${token}`,
                  notes: userNotes,
                });
              });
            }
          );
        } // if isMatch
        else {
          errors.login = "Incorrect login";
          return res.status(400).json(errors);
        } // else not isMatch
      }); // then isMatch
  }); // then user
}); // login route

// @route GET api/confirm:token
// @desc Confirm verification email
// @access Public
router.get("/confirm/:token", (req, res) => {
  var { token } = req.params;

  // const { user: { id } } = jwt.verify(token, keys.secretOrKey);
  // const { id } = jwt.verify(token, keys.secretOrKey);
  const { id } = jwt.verify(token, process.env.JWT_SECRET);

  // return User.findOne({ _id: id }).then(user => {
  //     return res.json(user);
  // }).catch(err => { return res.status(500).json(err) });

  var errors = {};

  return User.findById(id)
    .then((user) => {
      if (!user) {
        errors.verified = "User not found";
        return res.status(400).json(errors);
      }

      if (user.verified === true) {
        // console.log("already verified");
        errors.verified = "Account is already activated";
        return res.status(400).json(errors);
      }

      user.verified = true;
      user
        .save()
        .then((savedUser) => {
          return res.json({ success: "Account activated" });
          // return res.json(savedUser);
        })
        .catch((err) => {
          errors.verified = "Unable to activate account";
          return res.status(500).json(errors);
        });
    })
    .catch((err) => {
      return res.json(err);
    });
});

// @route POST api/uploadnotes
// @desc Upload notes
// @access Private
router.post("/uploadnotes", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { notes } = req.body;
  var errors = {};
  // User.findOne({ username }).exec((err, user) => {
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      // console.log("500 fail");
      errors.uploadnotes = "Server failed to upload notes";
      return res.status(500).json({ errors });
    }

    if (!user) {
      // console.log("user not found");
      errors.uploadnotes = "User not found";
      return res.status(404).json(errors);
    }

    if (isEmpty(user.notes) && !isEmpty(notes)) {
      // console.log("new notes");
      user.notes = JSON.stringify(notes);
      user
        .save()
        .then((savedUser) => {
          // console.log("new notes saved");
          return res.json("Notes uploaded");
          // return res.json(savedUser);
        })
        .catch((err) => {
          // console.log("error uploading new notes");
          errors.verified = "Unable to upload notes";
          return res.status(500).json(errors);
        });
    } else if (user.notes !== JSON.stringify(notes)) {
      // console.log("uploading notes");
      user.notes = JSON.stringify(notes);
      user
        .save()
        .then((savedUser) => {
          // console.log("uploaded notes");
          return res.json("Notes uploaded");
          // return res.json(savedUser);
        })
        .catch((err) => {
          // console.log("error uploading notes");
          errors.verified = "Unable to upload notes";
          return res.status(500).json(errors);
        });
    } else if (user.notes === JSON.stringify(notes) || (isEmpty(user.notes) && isEmpty(notes))) {
      // console.log("no changes to notes");
      errors.uploadnotes = "No changes were made to notes";
      // return res.status(204).json({ errors });
      return res.status(403).json({ errors });
    }
  });
});

// @route GET api/users/getnotes:id
// @desc Get notes
// @access Private
router.get("/getnotes/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  // console.log("get notes");

  var errors = {};

  User.findById(req.params.id)
    .select("notes")
    .then((user) => {
      if (user && !user._id.equals(req.user._id)) {
        // console.log("user found but request from unauthorized user", user._id, req.user._id, user._id.equals(req.user._id));
        errors.getnotes = "Unauthorized";
        return res.status(403).json({ errors });
      }

      if (user && user._id.equals(req.user._id)) {
        try {
          // console.log("fetching parsed notes");
          if (isEmpty(user.notes)) {
            // console.log("no notes found");
            errors.getnotes = "Empty notepad";
            return res.status(404).json({ errors });
          }
          var parsedNotes = JSON.parse(user.notes);
          return res.json(parsedNotes);
        } catch (err) {
          // console.log("err: ", err);
        }
      } else {
        // console.log("user not found");
        errors.getnotes = "User not found";
        return res.status(404).json({ errors });
      }
    })
    .catch((err) => {
      // console.log("500 server error");
      errors.getnotes = "Unable to load notes (server error)";
      return res.status(500).json({ errors: err });
      // return res.status(500).json({ errors: err });
    });
});

// @route POST api/users/logout
// @desc Delete activeJWT
// @access Private
router.post("/logout", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.findById(req.body.id)
    .then((user) => {
      var errors = {};
      if (user && !user._id.equals(req.user._id)) {
        errors.logout = "Unauthorized";
        console.log("Unauthorized");
        return res.status(401).json({ errors });
      }

      if (!user) {
        errors.logout = "User not found";
        return res.status(404).json({ errors });
      }
      user.activeJWT = null;
      user.save().then((saved) => {
        return res.json("Token deleted");
      });
    })
    .catch((err) => {
      errors.logout = "Server error";
      return res.status(500).json({ errors });
    });
});

module.exports = router;
