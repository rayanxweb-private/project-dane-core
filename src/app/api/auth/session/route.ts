import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authentication Payload Token' }, { status: 400 });
    }

    // Set operational expiration to 5 days standard enterprise rolling cycles
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'SESSION_INITIALIZATION_SUCCESSFUL' }, { status: 200 });

    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Session Authorization Lifecycle Failure', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ status: 'SESSION_DESTRUCTION_SUCCESSFUL' }, { status: 200 });
  response.cookies.set('__session', '', { maxAge: 0, path: '/' });
  return response;
}
