import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenData } from '../interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenData;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'shopapp_access_token_secret';
    
    try {
      const decoded = jwt.verify(token, secret) as ITokenData;
      
      // Thêm thông tin người dùng vào request
      req.user = decoded;
      next();
    } catch (jwtError) {
      if ((jwtError as Error).name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token đã hết hạn',
          expired: true
        });
      } else {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }
    }
  } catch (error) {
    return res.status(401).json({ message: 'Xác thực thất bại' });
  }
};

export const roleMiddleware = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng chưa được xác thực' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi xác thực quyền truy cập' });
    }
  };
}; 