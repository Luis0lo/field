const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/fields');
  }
  res.render('users/register');
};

module.exports.register = async (req, res) => {
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
};
module.exports.renderLogin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/fields');
  }
  res.render('users/login');
};

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/fields';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'See you later!');
  res.redirect('/fields');
};
