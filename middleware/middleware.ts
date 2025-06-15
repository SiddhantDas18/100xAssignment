import JWST from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.SECRET;

if (!secret) {
    throw new Error('JWT Secret is not defined in environment variables');
}

export default function Middleware(req: NextRequest) {
    // Skip middleware for public routes
    if (req.nextUrl.pathname.startsWith('/api/signin') || 
        req.nextUrl.pathname.startsWith('/api/signup')) {
        return NextResponse.next();
    }

    const token = req.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
        const decoded = JWST.verify(token, secret as JWST.Secret) as unknown as { id: string; role: string };
        
        // Check for admin routes
        if (req.nextUrl.pathname.startsWith('/admin') || 
            req.nextUrl.pathname.startsWith('/api/admin')) {
            if (decoded.role.toLowerCase() !== 'admin') {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
            }
        }

        const response = NextResponse.next();
        response.headers.set('x-user-id', `${decoded.role}:${decoded.id}`);
        
        return response;
    } catch (e) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/:path*',
        // Exclude specific public API routes from middleware
        '/api/getCourse',
        '/api/categories'
    ]
}