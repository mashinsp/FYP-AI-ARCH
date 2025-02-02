// app/about/page.tsx
export default function AboutPage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6 text-teal-300">About Us</h1>
        <div className="max-w-xl space-y-4 leading-relaxed">
          <p>
            AI-ARCH is a collaborative project developed by three passionate 
            computer scientists:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Syed Mashood</li>
            <li>Ali Raza</li>
            <li>Shahood Waseem</li>
          </ul>
          <p>
            We believe in leveraging the power of Artificial Intelligence to 
            reshape architectural design and make the process more efficient 
            and accessible. By merging GAN-based models with graph logic, 
            AI-ARCH can generate unique floor plans with minimal user input.
          </p>
          <p>
            We hope our project inspires innovative workflows in architectural 
            design, bridging the gap between advanced AI research and practical 
            real-world applications.
          </p>
        </div>
      </main>
    );
  }
  