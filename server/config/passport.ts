import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { isDatabaseConnected } from './database';
import { mockUserService, updateMockUser } from '../services/mockData';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/google/callback';

export const configurePassport = () => {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user already exists
      let user = isDatabaseConnected() 
        ? await User.findOne({ $or: [{ email }, { googleId: profile.id }] })
        : await mockUserService.findOne({ email }) || await mockUserService.findOne({ googleId: profile.id });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          if (isDatabaseConnected()) {
            user.googleId = profile.id;
            await user.save();
          } else {
            // Update mock user
            updateMockUser(email, { googleId: profile.id });
          }
        }
        return done(null, user);
      }

      // Create new user
      const userData = {
        email,
        name,
        googleId: profile.id,
        isEmailVerified: true, // Google emails are pre-verified
      };

      const newUser = isDatabaseConnected()
        ? await new User(userData).save()
        : await (await mockUserService.create(userData)).save();

      return done(null, newUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id || user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = isDatabaseConnected()
        ? await User.findById(id)
        : await mockUserService.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
