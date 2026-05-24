'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatErrorForDisplay } from '@/services/errorUtils';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, setError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const hasRedirectedRef = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect to dashboard only when already authenticated on page load
  useEffect(() => {
    if (isAuthenticated && !loading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === 'rememberMe') {
      setRememberMe(checked);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): string | null => {
    if (!formData.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Enter a valid email address.';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await login(formData.email, formData.password, rememberMe);
      // Redirect is handled by useEffect watching isAuthenticated state
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err, 'Login failed. Please check your credentials and try again.');
      setError(displayError);
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
            <div className="brand-mark mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
              <img src="/logo.jfif" alt="XchangeSkills" className="h-full w-full object-cover" />
            </div>
            <h1 className="auth-title mb-2 text-3xl font-bold">Welcome back</h1>
            <p className="auth-sub">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/15 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="auth-title mb-2 block text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="auth-sub pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="auth-field py-3 pl-10 pr-4"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="auth-title mb-2 block text-sm font-medium">
                Password
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-sub absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="auth-sub flex cursor-pointer items-center transition hover:opacity-90">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded accent-[var(--accent)]"
                  disabled={loading}
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link href="/forgot-password" className="auth-sub transition hover:opacity-90">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full py-3 px-4">
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="auth-sub mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-accent-2 transition hover:opacity-90">
              Sign up now
            </Link>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="auth-sub mt-8 text-center text-sm">
          <p>Secure authentication powered by XchangeSkills</p>
        </div>
      </div>
    </div>
  );
}
