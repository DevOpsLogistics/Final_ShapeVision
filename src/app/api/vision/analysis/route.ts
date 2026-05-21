import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing

  return NextResponse.json({
    metrics: {
      precision: 94.5,
      recall: 92.1,
      f1Score: 93.3,
      iou: 88.7
    },
    layers: [
      { id: 1, name: 'Conv2D_1', filters: 64, activation: 'ReLU', size: '224x224' },
      { id: 2, name: 'MaxPool_1', poolSize: '2x2', stride: 2, size: '112x112' },
      { id: 3, name: 'Conv2D_2', filters: 128, activation: 'ReLU', size: '112x112' },
      { id: 4, name: 'MaxPool_2', poolSize: '2x2', stride: 2, size: '56x56' },
      { id: 5, name: 'Dense_1', units: 512, activation: 'ReLU', size: '1x1' },
      { id: 6, name: 'Output', units: 4, activation: 'Softmax', size: '1x1' },
    ],
    featuresMap: [
      '/mock-feature-1.png',
      '/mock-feature-2.png',
      '/mock-feature-3.png',
    ]
  });
}
