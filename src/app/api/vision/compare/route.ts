import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 600));

  const compareData = {
    metrics: [
      { id: 'm1', name: 'CNN Custom', accuracy: 95.2, inferenceTime: 15, size: 25, params: 10, color: '#1A73E8' },
      { id: 'm2', name: 'MobileNet', accuracy: 93.8, inferenceTime: 10, size: 18, params: 6.5, color: '#C5221F' },
      { id: 'm3', name: 'ResNet', accuracy: 96.1, inferenceTime: 22, size: 45, params: 25, color: '#188038' },
    ],
    trends: [
      {
        epoch: 10,
        'CNN Custom': { accuracy: 60, loss: 0.6 },
        'MobileNet': { accuracy: 55, loss: 0.7 },
        'ResNet': { accuracy: 65, loss: 0.5 }
      },
      {
        epoch: 20,
        'CNN Custom': { accuracy: 80, loss: 0.3 },
        'MobileNet': { accuracy: 75, loss: 0.4 },
        'ResNet': { accuracy: 85, loss: 0.25 }
      },
      {
        epoch: 30,
        'CNN Custom': { accuracy: 92, loss: 0.15 },
        'MobileNet': { accuracy: 88, loss: 0.2 },
        'ResNet': { accuracy: 94, loss: 0.1 }
      },
      {
        epoch: 40,
        'CNN Custom': { accuracy: 95.2, loss: 0.08 },
        'MobileNet': { accuracy: 93.8, loss: 0.12 },
        'ResNet': { accuracy: 96.1, loss: 0.05 }
      }
    ],
    confusionMatrix: {
      labels: ['Circle', 'Square', 'Triangle', 'Polygon', 'Star', 'Cross'],
      matrix: [
        [95, 1, 0, 2, 1, 1],
        [2, 93, 1, 3, 0, 1],
        [1, 2, 96, 0, 1, 0],
        [3, 2, 0, 91, 2, 2],
        [1, 0, 1, 1, 94, 3],
        [1, 2, 1, 3, 2, 91]
      ]
    }
  };

  return NextResponse.json(compareData);
}
