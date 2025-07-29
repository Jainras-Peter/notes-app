import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { User } from '../models/User';
import { generateToken } from '../config/jwt';
import { isDatabaseConnected } from '../config/database';
import { mockUserService } from '../services/mockData';
import { generateOTP, storeOTP, verifyOTP as verifyOTPService, sendOTPEmail, clearOTP, debugOTP } from '../services/otpService';
import { AuthResponse, SignUpRequest, SignInRequest, OTPRequest, VerifyOTPRequest, OTPResponse } from '@shared/api';

export const signupWithOTP: RequestHandler = async (req, res) => {
  try {
    const { email, otp, name, dateOfBirth }: { email: string; otp: string; name: string; dateOfBirth: string } = req.body;

    // Validation
    if (!email || !otp || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and name are required'
      } as AuthResponse);
    }

    // Verify OTP first
    const verification = verifyOTPService(email, otp);
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message
      } as AuthResponse);
    }

    // Check if user already exists
    const existingUser = isDatabaseConnected() 
      ? await User.findOne({ email })
      : await mockUserService.findOne({ email });
      
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      } as AuthResponse);
    }

    // Create user (no password needed for OTP-based signup)
    const userData = {
      email,
      name,
      dateOfBirth,
      isEmailVerified: true, // Since OTP was verified
    };

    const user = isDatabaseConnected()
      ? await new User(userData).save()
      : await (await mockUserService.create(userData)).save();

    // Generate token
    const token = generateToken(user._id.toString());

    const response: AuthResponse = {
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
};

export const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name }: SignUpRequest = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      } as AuthResponse);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      } as AuthResponse);
    }

    // Check if user already exists
    const existingUser = isDatabaseConnected() 
      ? await User.findOne({ email })
      : await mockUserService.findOne({ email });
      
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      } as AuthResponse);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      name,
      isEmailVerified: true, // For now, we'll set this to true
    };

    const user = isDatabaseConnected()
      ? await new User(userData).save()
      : await (await mockUserService.create(userData)).save();

    // Generate token
    const token = generateToken(user._id.toString());

    const response: AuthResponse = {
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
};

export const signin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: SignInRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as AuthResponse);
    }

    // Find user
    const user = isDatabaseConnected()
      ? await User.findOne({ email })
      : await mockUserService.findOne({ email });
      
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse);
    }

    // Generate token
    const token = generateToken(user._id.toString());

    const response: AuthResponse = {
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
};

export const sendOTP: RequestHandler = async (req, res) => {
  try {
    const { email }: OTPRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      } as OTPResponse);
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Send OTP via email (mock implementation)
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      return res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        otpSent: true
      } as OTPResponse);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      } as OTPResponse);
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as OTPResponse);
  }
};

export const verifyOTP: RequestHandler = async (req, res) => {
  try {
    const { email, otp }: VerifyOTPRequest = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      } as AuthResponse);
    }

    // Verify OTP
    const verification = verifyOTPService(email, otp);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message
      } as AuthResponse);
    }

    // Find user for signin
    const existingUser = isDatabaseConnected() 
      ? await User.findOne({ email })
      : await mockUserService.findOne({ email });

    if (existingUser) {
      // Sign in existing user
      const token = generateToken(existingUser._id.toString());

      return res.json({
        success: true,
        message: 'Signed in successfully',
        token,
        user: {
          id: existingUser._id.toString(),
          email: existingUser.email,
          name: existingUser.name,
          createdAt: existingUser.createdAt.toISOString(),
          updatedAt: existingUser.updatedAt.toISOString(),
        }
      } as AuthResponse);
    } else {
      // For signin, user must exist
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      } as AuthResponse);
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
};

export const clearOTPForEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    clearOTP(email);
    debugOTP(email);

    res.json({ success: true, message: 'OTP cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error clearing OTP' });
  }
};

export const googleAuth: RequestHandler = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallback: RequestHandler = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/signin?error=oauth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/signin?error=oauth_cancelled`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id.toString());

      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      // Redirect to frontend with token and user data
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
      const redirectUrl = `${clientUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/signin?error=token_failed`);
    }
  })(req, res, next);
};
