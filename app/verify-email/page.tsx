'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { authApi } from '@/services/authApi';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found. Please use the link from your email.');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        // Auto-redirect to dashboard after 2.5s
        setTimeout(() => router.push('/dashboard'), 2500);
      })
      .catch((err: any) => {
        setStatus('error');
        setErrorMessage(
          err?.message ||
          'Verification failed. The link may have expired or already been used.'
        );
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 text-center">

          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Verifying your email…</h1>
              <p className="text-indigo-200 text-sm">Please wait while we confirm your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Email verified!</h1>
              <p className="text-indigo-200 text-sm mb-6">
                Your account is now active. Redirecting you to the dashboard…
              </p>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Verification failed</h1>
              <p className="text-red-200 text-sm mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg"
                >
                  Sign up again
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 bg-white/10 border border-white/20 text-white/80 font-medium rounded-lg hover:bg-white/20 transition text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
