import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

const JWT_SECRET = 'restaurant-reservation-secret-key-2024'

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' })
  }
  next()
}
