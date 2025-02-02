// app/auth/login/loading.tsx
export default function Loading() {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/80">
        <div className="animate-spin border-4 border-teal-500 border-t-transparent rounded-full w-12 h-12"></div>
      </div>
    );
  }
  