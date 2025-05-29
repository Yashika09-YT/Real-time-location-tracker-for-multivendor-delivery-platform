import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtHelper';
import UserModel, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = verifyToken(token) as { id: string; role: string };
            
            if (!decoded) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
            
            const user = await UserModel.findById(decoded.id).select('-password').lean() as IUser | null;
            req.user = user ?? undefined;

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (roles: Array<IUser['role']>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
        }
        next();
    };
};
