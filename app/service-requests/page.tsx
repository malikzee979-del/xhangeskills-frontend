'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServiceRequestsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/requests'); }, [router]);
  return null;
}
