// components/TopMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const TEMPLATES = [
  { id: 0, name: '1-Bedroom Suite' },
  { id: 1, name: '2-Bedroom Suite' },
  { id: 2, name: '3-Bedroom Suite' },
];

interface UserData {
  name?: string;
  email?: string;
  image?: string | null;
}

interface SessionData {
  user?: UserData;
  expires?: string;
  error?: string;
}

interface TopMenuProps {
  onSelectTemplate: (id: number) => void;
}

export default function TopMenu({ onSelectTemplate }: TopMenuProps) {
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  // Fetch session from our new API route
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/getuser'); 
        // or '/api/session' depending on your code
        const data: SessionData = await res.json();
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setSession({ error: 'Failed to fetch session' });
      }
    }
    fetchSession();
  }, []);

  const handleSelect = (id: number) => {
    onSelectTemplate(id);
    setOpen(false);
  };

  // We'll show user avatar (if provided) or a fallback image
  const userName = session?.user?.name || 'Guest';
  const userImage = session?.user?.image || '/default-avatar.jpg';

  return (
    <div className="flex items-center h-14 bg-white shadow px-4 relative w-full">
      {/* Left side: Predefined Layouts */}
      <div className="flex items-center">
        <div className="relative">
          <Button
            variant="default"
            onClick={() => setOpen(!open)}
            className="mr-2"
          >
            Predefined Layouts
          </Button>
          {open && (
            <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded shadow">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleSelect(tmpl.id)}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Logo + Title */}
      <div className="flex-1 flex justify-center items-center">
        <img 
          src="/sketchlogo.png" 
          alt="logo" 
          className="h-8 mr-2 object-contain"
        />
        <h2 className="text-xl font-bold text-gray-700">AI-Arch</h2>
      </div>

      {/* Right side: User info */}
      <div className="flex items-center">
        {session && !session.error ? (
          <div className="relative">
            {/* Avatar + name */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setAvatarOpen(!avatarOpen)}
            >
              <img
                src={userImage}
                alt="User avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="text-sm text-gray-700 font-medium">
                {userName}
              </span>
            </div>

            {/* Avatar dropdown */}
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow z-10">
                <form method="post" action="/api/signout">
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-red-500">
            {session?.error || 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}