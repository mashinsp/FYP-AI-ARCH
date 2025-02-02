"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/public/sketchlogo.png";
import mainFigure from "@/public/hero.svg";
import { LoginButton } from "@/components/auth/login-button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  function getCurrentMonthNameAndDate() {
    const date = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${monthName} ${day}, ${year}`;
  }

  // Custom sign-in handler that triggers a fade-out effect before redirecting.
  const handleSignIn = () => {
    setTransitioning(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 300); // 300ms delay for the fade-out animation.
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="w-full p-4 flex justify-between items-center fixed top-0 left-0 z-50 bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-md">
        <div className="flex items-center">
          <Image src={logo} alt="AI-ARCH Logo" width={50} height={50} className="mr-2" />
          <span className="text-2xl font-bold text-teal-300">AI-ARCH</span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
        <Link href="/features" className="text-gray-300 hover:text-teal-300 transition-colors">
  Features
</Link>
<Link href="/about" className="text-gray-300 hover:text-teal-300 transition-colors">
  About
</Link>
<Link href="/contact" className="text-gray-300 hover:text-teal-300 transition-colors">
  Contact
</Link>        </div>
      </nav>

      {/* Hero Section with Fade-Out Transition */}
      <main
        className={`min-h-screen flex flex-col items-center justify-center relative pt-20 bg-cover bg-center transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: "url('/background.svg')" }}
      >
        {/* Dark gradient overlay for improved readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 opacity-80"></div>

        <div className="relative max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between px-8 py-12">
          {/* Left Section: Headline, Description & Buttons */}
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-teal-300 drop-shadow-lg">
              AI-ARCH: Redefining Architectural Design
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              Transform your building designs with our AI-powered platform. 
              Create, innovate, and revolutionize architecture with a graph.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <LoginButton onClick={handleSignIn}>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105">
                  Sign In
                </Button>
              </LoginButton>
              <Link href="/about">
              <Button className="bg-transparent border border-teal-300 hover:bg-teal-300 hover:text-gray-900 py-3 px-6 rounded-lg transition-colors">
                Learn More
              </Button>
              </Link>
            </div>
          </div>

          {/* Right Section: Main Figure */}
          <div className="mt-8 lg:mt-0 flex-shrink-0">
            <Image 
              src={mainFigure} 
              alt="Main Figure" 
              width={500} 
              height={500} 
              className="rounded-xl shadow-2xl transition-transform duration-200 hover:scale-105"
            />
          </div>
        </div>

        {/* Footer with Date and Copyright */}
        <div className="absolute bottom-4 left-4 text-gray-400 text-sm">
          {getCurrentMonthNameAndDate()}
        </div>
        <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
          © {new Date().getFullYear()} AI-ARCH. All rights reserved.
        </div>
      </main>
    </>
  );
}
