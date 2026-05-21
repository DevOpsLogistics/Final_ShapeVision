import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Mock Registration Logic
    // In a real app, check if user exists, hash password, save to DB
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: Math.random().toString(36).substring(7),
          name: name,
          email: email,
        },
        token: 'mock-jwt-token-new-user',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
