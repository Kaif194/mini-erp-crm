import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthUser } from '../types/express';

export const generateToken = (user: AuthUser): string => {
  const options: SignOptions = {
    expiresIn: '1d',
  };
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    options
  );
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, config.jwtSecret) as AuthUser;
};

