import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('No autorizado');
  }
  
  return user;
}

