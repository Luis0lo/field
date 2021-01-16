const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/fields');
  }
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash('success', 'Welcome to Fields!');
        res.redirect('/fields');
      });
    } catch (e) {
      req.flash('error', `${e.message}.`, 'Try again!');
      res.redirect('register');
    }
  })
);

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/fields');
  }
  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/fields';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'See you later!');
  res.redirect('/fields');
});
module.exports = router;
