import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock Authentication Logic - Accept any credentials for now
    if (email && password) {
      // Mock successful login
      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: '1',
            email: email,
            name: email.split('@')[0],
            avatar: null,
          },
          token: 'mock-jwt-token-12345',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
