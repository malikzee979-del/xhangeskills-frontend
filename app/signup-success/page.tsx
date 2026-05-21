'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-indigo-200 text-base leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-white font-semibold text-lg mb-6 break-all">{email}</p>

          {/* Instructions */}
          <div className="bg-white/10 rounded-xl p-5 mb-8 text-left space-y-3">
            {[
              'Open the email from XchangeSkills',
              'Click the "Verify Email Address" button',
              'You\'ll be logged in automatically',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-indigo-100 text-sm">{step}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="text-indigo-300 text-sm mb-8">
            The link expires in <strong className="text-white">24 hours</strong>.
            Check your spam folder if you don't see it.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="block w-full py-3 px-4 bg-white/10 border border-white/20 text-white/80 font-medium rounded-lg hover:bg-white/20 transition text-sm"
            >
              Wrong email? Sign up again
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-indigo-400 text-sm">
          <p>Didn't get the email? Check your spam folder first.</p>
        </div>
      </div>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense>
      <SignupSuccessContent />
    </Suspense>
  );
}
