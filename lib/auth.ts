import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const secret = process.env.SECRET;
    if (!secret) {
      throw new Error('JWT Secret is not defined');
    }
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function isAdmin(token: string): boolean {
  try {
    const secret = process.env.SECRET;
    if (!secret) return false;
    
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded.role.toLowerCase() === 'admin';
  } catch {
    return false;
  }
}