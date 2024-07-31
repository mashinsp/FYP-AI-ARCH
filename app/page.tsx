import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/public/sketchlogo.png";
import mainFigure from "@/public/figuremain.jpeg";
import { LoginButton } from "@/components/auth/login-button";

export default function Home() {

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

  return (
    <>
      <nav className="w-full p-4 flex justify-center items-center fixed top-0 left-0">
        <div className="flex items-center">
          <Image src={logo} alt="AI-ARCH Logo" width={50} height={50} className="mr-2" />
          <span className="text-2xl font-bold text-teal-300">AI-ARCH</span>
        </div>
      </nav>
      <main className="h-screen flex flex-col items-center justify-center text-white pt-16 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900">
        <div className="max-w-7xl w-full h-full flex justify-between items-center px-4 mx-4">
          <div className="flex flex-col justify-center max-w-xl">
            <h1 className="text-5xl font-bold mb-4 text-teal-300">AI-ARCH: Enhancing Building Design from the Ground Up</h1>
            <p className="text-lg mb-6">
            We have developed an advanced tool that allows users to create architectural designs simply by writing a prompt. This innovative system interprets user input and generates detailed architectural plans, accommodating specific requirements and stylistic preferences.
            </p>
            <LoginButton>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded w-full">
               Sign In
              </Button>
            </LoginButton>
          </div>
          <div>
            <Image src={mainFigure} alt="Main Figure" width={500}  className="rounded-lg" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 text-gray-500">
          {getCurrentMonthNameAndDate()}
        </div>
      </main>
    </>
  );
}
