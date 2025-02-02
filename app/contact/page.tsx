// app/contact/page.tsx
export default function ContactPage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6 text-teal-300">Contact Us</h1>
        <div className="max-w-md space-y-4 text-center">
          <p>
            We’d love to hear from you! For inquiries, suggestions, or feedback,
            feel free to reach out to any of the project’s core developers:
          </p>
          <ul className="space-y-2">
            <li className="text-teal-200">Syed Mashood — <span className="text-gray-300">example@example.com</span></li>
            <li className="text-teal-200">Ali Raza — <span className="text-gray-300">example@example.com</span></li>
            <li className="text-teal-200">Shahood Waseem — <span className="text-gray-300">example@example.com</span></li>
          </ul>
          <p>
            Whether you have a business proposal, a collaboration idea, or simply 
            want to say hello, our inboxes are open!
          </p>
        </div>
      </main>
    );
  }
  