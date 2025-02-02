// app/features/page.tsx
export default function FeaturesPage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6 text-teal-300">Features</h1>
        <div className="max-w-2xl space-y-4">
          <p>
            Our AI-ARCH platform uses cutting-edge Generative Adversarial Networks (GANs)
            to produce realistic floor plan layouts. We combine “HouseGAN” technology with 
            a graph-based node/edge approach to ensure your designs have architectural 
            consistency and logical room connections.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>GAN-powered floor plan generation</li>
            <li>Graph-based logic for nodes and edges</li>
            <li>Automatic placement of rooms and hallways</li>
            <li>Real-time visual feedback</li>
          </ul>
          <p>
            Whether you’re an architect, interior designer, or AI enthusiast, our system
            can help you rapidly prototype and iterate on building layouts.
          </p>
        </div>
      </main>
    );
  }
  