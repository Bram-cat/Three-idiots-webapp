"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";
import Navigation from "@/components/Navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <UserProvider>
          <Navigation />
          <main className="pt-4 pb-20 md:pt-20 md:pb-4 px-4 max-w-4xl mx-auto">
            {children}
          </main>
        </UserProvider>
      </SignedIn>
    </>
  );
}
