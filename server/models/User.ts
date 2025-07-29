import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  isEmailVerified: boolean;
  otp?: {
    code: string;
    expires: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expires: Date,
  },
}, {
  timestamps: true,
});

// Index for OTP cleanup
UserSchema.index({ 'otp.expires': 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model<IUser>('User', UserSchema);
