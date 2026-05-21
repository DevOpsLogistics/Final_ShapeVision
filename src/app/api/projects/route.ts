import { NextResponse } from 'next/server';

// Mock database for projects
const mockProjects = [
  {
    id: '1',
    title: 'Bài tập Hình thang cân #1',
    type: '2D Drawing',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Phân tích ảnh 12/05',
    type: '3D Model',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Bản vẽ tay Luyện tập',
    type: 'Hand-drawn',
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export async function GET(request: Request) {
  // Return the list of projects
  return NextResponse.json(
    { projects: mockProjects },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type } = body;

    // Create a new project
    const newProject = {
      id: Math.random().toString(36).substring(7),
      title: title || 'New Workspace',
      type: type || '2D Drawing',
      updatedAt: new Date().toISOString(),
    };

    mockProjects.unshift(newProject);

    return NextResponse.json(
      { message: 'Project created successfully', project: newProject },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
