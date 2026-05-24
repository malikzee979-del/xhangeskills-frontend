'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '@/services/authApi';

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('code');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.resetPassword(token!, formData.password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
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
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="auth-title mb-2 text-3xl font-bold">Reset Password</h1>
            <p className="auth-sub">Enter your new password below</p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                <div>
                  <p className="auth-title font-semibold">Password reset successful!</p>
                  <p className="auth-sub mt-1 text-sm">Redirecting you to login...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/15 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                  <p className="text-sm text-red-100">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="auth-title mb-2 block text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="auth-sub pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="auth-field py-3 pl-10 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-sub absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="auth-sub mt-2 text-xs">
                    At least 8 characters, including uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="auth-title mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="auth-sub pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="auth-field py-3 pl-10 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-sub absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Reset Button */}
                <button type="submit" disabled={isLoading || !token} className="btn btn-primary mt-6 w-full py-3 px-4">
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <p className="auth-sub mt-6 text-center">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-accent-2 transition hover:opacity-90">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
