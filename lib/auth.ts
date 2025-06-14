import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  // Add any other properties you expect in your decoded token
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    // Replace 'YOUR_SECRET_KEY' with your actual JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
} 