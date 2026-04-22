"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always go to chat — guests can use it without login
    router.push('/chat');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
    </div>
  );
}
