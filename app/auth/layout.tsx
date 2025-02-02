const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-white">
        {children}
      </div>
    );
  };
  
  export default AuthLayout;
  