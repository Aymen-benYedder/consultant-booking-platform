const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'client'
      }).save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Mock endpoint for testing
if (process.env.NODE_ENV === 'test') {
  const router = require('express').Router();
  
  router.post('/auth/google/mock', async (req, res) => {
    try {
      const { profile } = req.body;
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          role: 'client'
        }).save();
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token, user });
    } catch (error) {
      console.error('Mock auth error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  module.exports = router;
} else {
  module.exports = {};
}