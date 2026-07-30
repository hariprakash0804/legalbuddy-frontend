"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect cleanly to /chat for guest & user access
    router.push('/chat');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F6F7F9]">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-3 border-[#0B5850] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono font-medium text-[#2C3752] tracking-wider uppercase">Loading LegalBuddy AI Engine...</p>
      </div>
    </div>
  );
}
