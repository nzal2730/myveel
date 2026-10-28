import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, mobile, password } = req.body;
      if (!name || !email || !mobile || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      const result = await AuthService.register({ name, email, mobile, password });
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email and phone number.',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { target, type } = req.body;
      if (!target || !type) {
        return res.status(400).json({ success: false, message: 'Target and type are required.' });
      }

      const rawOtp = await AuthService.createOtp(target, type);
      return res.json({
        success: true,
        message: 'OTP sent successfully.',
        devOtp: process.env.NODE_ENV === 'development' ? rawOtp : undefined,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { target, type, otp } = req.body;
      if (!target || !type || !otp) {
        return res.status(400).json({ success: false, message: 'Target, type, and OTP code are required.' });
      }

      const result = await AuthService.verifyOtp(target, type, otp);
      return res.json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Email/Mobile and password are required.' });
      }

      const result = await AuthService.login(identifier, password);
      return res.json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (err: any) {
      return res.status(401).json({ success: false, message: err.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { target } = req.body;
      if (!target) {
        return res.status(400).json({ success: false, message: 'Email or Mobile is required.' });
      }

      const result = await AuthService.forgotPassword(target);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { target, otp, newPassword } = req.body;
      if (!target || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Target, OTP, and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      const result = await AuthService.resetPassword(target, otp, newPassword);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getMe(req: any, res: Response) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      return res.json({ success: true, data: user });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }
}

