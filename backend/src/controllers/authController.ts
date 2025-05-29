import { Request, Response } from 'express';
import UserModel, { IUser } from '../models/User';
import { generateToken } from '../utils/jwtHelper';
import { AuthRequest } from '../middlewares/authMiddleware';

// Common signup logic
const signup = async (req: Request, res: Response, role: 'vendor' | 'deliveryPartner') => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Please provide email, password, and name' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new UserModel({ email, password, name, role });
    await user.save();
    
    // Don't send password back, even hashed. Mongoose toJSON should handle this.
    const userResponse = user.toJSON(); 

    res.status(201).json({
      message: `${role} registered successfully`,
      user: userResponse,
      token: generateToken(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// Common login logic
const login = async (req: Request, res: Response, role: 'vendor' | 'deliveryPartner') => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await UserModel.findOne({ email, role }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or user not found for this role' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const userResponse = user.toJSON();

    res.status(200).json({
      message: 'Logged in successfully',
      user: userResponse,
      token: generateToken(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const vendorSignup = (req: Request, res: Response) => signup(req, res, 'vendor');
export const vendorLogin = (req: Request, res: Response) => login(req, res, 'vendor');
export const deliveryPartnerSignup = (req: Request, res: Response) => signup(req, res, 'deliveryPartner');
export const deliveryPartnerLogin = (req: Request, res: Response) => login(req, res, 'deliveryPartner');

export const getMe = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    // req.user is already populated by protect middleware and password excluded by model's toJSON
    res.status(200).json({ user: req.user });
};