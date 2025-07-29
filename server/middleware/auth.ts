import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../config/jwt';
import { User } from '../models/User';
import { isDatabaseConnected } from '../config/database';
import { mockUserService } from '../services/mockData';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    const user = isDatabaseConnected()
      ? await User.findById(decoded.userId).select('-password -otp')
      : await mockUserService.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
