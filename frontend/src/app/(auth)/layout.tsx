"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'vendor') {
        router.push('/vendor/dashboard');
      } else if (user.role === 'deliveryPartner') {
        router.push('/delivery/dashboard');
      } else {
        router.push('/'); 
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }
  
  if (isAuthenticated && user) {
    return <div className="flex justify-center items-center h-screen"><p>Redirecting...</p></div>;
  }

  return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">{children}</div>;
}