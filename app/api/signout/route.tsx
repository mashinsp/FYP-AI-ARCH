// app/api/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/auth'; // or from 'next-auth', depending on your setup

export async function POST(request: NextRequest) {
  try {
    // disable NextAuth's default server-side redirect
    await signOut({ redirect: false });

    // handle your own redirect or JSON response
    // e.g., redirect user to /login or home
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
