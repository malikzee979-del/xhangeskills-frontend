'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '@/services/authApi';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-scene">
      <span className="auth-blob" aria-hidden="true" />
      <span className="auth-grain" aria-hidden="true" />

      <div className="auth-card reveal">
        <div className="auth-panel">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="brand-mark mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="auth-title mb-2 text-3xl font-bold">Reset Password</h1>
            <p className="auth-sub">We&apos;ll send you a link to reset your password</p>
          </div>

          {!submitted ? (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/15 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                  <p className="text-sm text-red-100">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="auth-title mb-2 block text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="auth-sub pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="auth-field py-3 pl-10 pr-4"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary mt-6 w-full py-3 px-4">
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="brand-mark mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="auth-title mb-2 text-2xl font-bold">Check Your Email</h2>
              <p className="auth-sub mb-6">
                We&apos;ve sent a password reset link to <strong className="auth-title">{email}</strong>
              </p>
              <p className="auth-sub mb-6 text-sm">
                Follow the link in the email to reset your password. The link expires in 1 hour.
              </p>
            </div>
          )}

          {/* Back to login */}
          <Link href="/login" className="auth-sub mt-6 flex items-center justify-center gap-2 transition hover:opacity-90">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
