// // In-memory OTP storage for development
// // In production, use Redis or database
// const otpStorage = new Map<string, { otp: string; expires: Date; attempts: number }>();

// export const generateOTP = (): string => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// export const storeOTP = (email: string, otp: string, expiresInMinutes: number = 10) => {
//   const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
//   otpStorage.set(email.toLowerCase(), {
//     otp,
//     expires,
//     attempts: 0
//   });
  
//   // Clean up expired OTPs
//   setTimeout(() => {
//     otpStorage.delete(email.toLowerCase());
//   }, expiresInMinutes * 60 * 1000);
  
//   console.log(`📧 OTP for ${email}: ${otp} (expires at ${expires.toLocaleTimeString()})`);
// };

// export const verifyOTP = (email: string, inputOTP: string): { valid: boolean; message: string } => {
//   const stored = otpStorage.get(email.toLowerCase());

//   console.log(`🔍 Verifying OTP for ${email}:`);
//   console.log(`   Input OTP: "${inputOTP}"`);
//   console.log(`   Stored: ${stored ? JSON.stringify(stored) : 'null'}`);

//   if (!stored) {
//     return { valid: false, message: 'No OTP found or OTP expired' };
//   }

//   if (stored.expires < new Date()) {
//     console.log(`❌ OTP expired for ${email}`);
//     otpStorage.delete(email.toLowerCase());
//     return { valid: false, message: 'OTP has expired' };
//   }

//   stored.attempts++;

//   if (stored.attempts > 3) {
//     console.log(`❌ Too many attempts for ${email}`);
//     otpStorage.delete(email.toLowerCase());
//     return { valid: false, message: 'Too many invalid attempts' };
//   }

//   if (stored.otp !== inputOTP) {
//     console.log(`❌ OTP mismatch for ${email}: expected "${stored.otp}", got "${inputOTP}"`);
//     return { valid: false, message: 'Invalid OTP' };
//   }

//   // OTP is valid, remove it
//   console.log(`✅ OTP verified successfully for ${email}`);
//   otpStorage.delete(email.toLowerCase());
//   return { valid: true, message: 'OTP verified successfully' };
// };

// export const hasValidOTP = (email: string): boolean => {
//   const stored = otpStorage.get(email.toLowerCase());
//   return stored ? stored.expires > new Date() : false;
// };

// export const clearOTP = (email: string): void => {
//   console.log(`🗑️ Clearing OTP for ${email}`);
//   otpStorage.delete(email.toLowerCase());
// };

// export const debugOTP = (email: string): void => {
//   const stored = otpStorage.get(email.toLowerCase());
//   console.log(`🔍 Debug OTP for ${email}:`, stored);
// };

// // Mock email sending function
// export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
//   // TODO: Integrate with actual email service (Nodemailer, SendGrid, etc.)
//   console.log(`📧 Sending OTP email to ${email}: ${otp}`);
  
//   // Simulate email sending delay
//   await new Promise(resolve => setTimeout(resolve, 500));
  
//   return true; // Always success for development
// };


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const otpStorage = new Map<string, { otp: string; expires: Date; attempts: number }>();

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in memory with expiration
export const storeOTP = (email: string, otp: string, expiresInMinutes: number = 10) => {
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  otpStorage.set(email.toLowerCase(), { otp, expires, attempts: 0 });

  setTimeout(() => {
    otpStorage.delete(email.toLowerCase());
  }, expiresInMinutes * 60 * 1000);

  console.log(`📧 OTP for ${email}: ${otp} (expires at ${expires.toLocaleTimeString()})`);
};

// Verify OTP with attempt limit
export const verifyOTP = (email: string, inputOTP: string): { valid: boolean; message: string } => {
  const stored = otpStorage.get(email.toLowerCase());

  if (!stored) return { valid: false, message: 'No OTP found or OTP expired' };
  if (stored.expires < new Date()) {
    otpStorage.delete(email.toLowerCase());
    return { valid: false, message: 'OTP has expired' };
  }

  stored.attempts++;
  if (stored.attempts > 3) {
    otpStorage.delete(email.toLowerCase());
    return { valid: false, message: 'Too many invalid attempts' };
  }

  if (stored.otp !== inputOTP) return { valid: false, message: 'Invalid OTP' };

  otpStorage.delete(email.toLowerCase());
  return { valid: true, message: 'OTP verified successfully' };
};

// Send OTP via Gmail
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Note App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🔐 OTP Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="background: #eee; padding: 10px; border-radius: 6px; display: inline-block;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${email}`, error);
    return false;
  }
};

// Helper to check if an OTP exists and is valid
export const hasValidOTP = (email: string): boolean => {
  const stored = otpStorage.get(email.toLowerCase());
  return stored ? stored.expires > new Date() : false;
};

// Clear OTP manually
export const clearOTP = (email: string): void => {
  otpStorage.delete(email.toLowerCase());
};

// Debug function
export const debugOTP = (email: string): void => {
  const stored = otpStorage.get(email.toLowerCase());
  console.log(`🔍 Debug OTP for ${email}:`, stored);
};












