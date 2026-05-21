import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { message: 'Image data is required' },
        { status: 400 }
      );
    }

    try {
      // Forward request to Python FastAPI Backend
      const response = await fetch('http://127.0.0.1:8000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 })
      });

      if (!response.ok) {
        throw new Error(`Python backend returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data, { status: 200 });

    } catch (err: any) {
      console.error("Failed to fetch from Python backend:", err);
      // Fallback response if python server is not running
      return NextResponse.json(
        { 
          message: 'Lỗi kết nối tới Backend AI Python. Vui lòng đảm bảo server đang chạy ở port 8000.', 
          detections: [] 
        },
        { status: 503 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
