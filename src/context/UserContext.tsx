"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { getCurrentUser, roommateConfig } from "@/lib/store";
import UserSelection from "@/components/UserSelection";

interface UserContextType {
  oderId: string | null;
  userName: string | null;
  userImage: string;
  userColor: string;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  oderId: null,
  userName: null,
  userImage: "/images/default.png",
  userColor: "bg-gray-500",
  isLoading: true,
});

export function useCurrentUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [oderId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSelection, setNeedsSelection] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!clerkLoaded) return;

      if (!user) {
        setIsLoading(false);
        return;
      }

      const dbUser = await getCurrentUser(user.id);

      if (dbUser) {
        setUserId(dbUser.oderId);
        setUserName(dbUser.name);
        setNeedsSelection(false);
      } else {
        setNeedsSelection(true);
      }

      setIsLoading(false);
    }

    loadUser();
  }, [user, clerkLoaded]);

  const handleSelectionComplete = async () => {
    if (!user) return;

    const dbUser = await getCurrentUser(user.id);
    if (dbUser) {
      setUserId(dbUser.oderId);
      setUserName(dbUser.name);
      setNeedsSelection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (needsSelection && user) {
    return <UserSelection onComplete={handleSelectionComplete} />;
  }

  const userImage = userName ? roommateConfig[userName]?.image || "/images/default.png" : "/images/default.png";
  const userColor = userName ? roommateConfig[userName]?.color || "bg-gray-500" : "bg-gray-500";

  return (
    <UserContext.Provider value={{ oderId, userName, userImage, userColor, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
