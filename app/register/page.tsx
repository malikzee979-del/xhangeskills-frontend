'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { formatErrorForDisplay } from '@/services/errorUtils';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep1 = (): string | null => {
    if (!formData.name.trim()) return 'Full name is required.';
    if (formData.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!formData.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Enter a valid email address.';
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(formData.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(formData.password)) return 'Password must contain at least one number.';
    if (!formData.confirmPassword) return 'Please confirm your password.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    if (!formData.agreedToTerms) return 'You must agree to the Terms & Conditions.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }

      try {
        setIsLoading(true);

        // Extract first and last name from full name
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        await authApi.signup({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
        });

        // Redirect to "check your email" page — no JWT until email is verified
        router.push(`/signup-success?email=${encodeURIComponent(formData.email)}`);
      } catch (err: any) {
        const displayError = formatErrorForDisplay(err, 'Registration failed. Please check your details and try again.');
        setError(displayError);
      } finally {
        setIsLoading(false);
      }
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
            <h1 className="auth-title mb-2 text-3xl font-bold">Join XchangeSkills</h1>
            <p className="auth-sub">Create your account and start exchanging skills</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition ${
                step >= 1 ? 'brand-mark text-on-accent' : 'bg-white/20 text-white/60'
              }`}
            >
              1
            </div>
            <div className={`h-1 flex-1 rounded transition ${step >= 2 ? 'brand-mark' : 'bg-white/20'}`} />
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition ${
                step >= 2 ? 'brand-mark text-on-accent' : 'bg-white/20 text-white/60'
              }`}
            >
              2
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/15 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="auth-title mb-2 block text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="auth-sub pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="auth-field py-3 pl-10 pr-4"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
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
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Password Field */}
                <div>
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-sub absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="auth-sub mt-2 text-xs">At least 8 characters with uppercase, lowercase, and numbers</p>
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-sub absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <label className="auth-sub flex cursor-pointer items-start transition hover:opacity-90">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded accent-[var(--accent)]"
                  />
                  <span className="ml-2 text-sm">
                    I agree to the{' '}
                    <Link href="#" className="text-accent-2 underline transition hover:opacity-90">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-accent-2 underline transition hover:opacity-90">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn flex-1 border border-white/30 bg-white/15 py-3 px-4 text-white hover:bg-white/25"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (step === 2 && !formData.agreedToTerms)}
                className={`btn btn-primary ${step === 2 ? 'flex-1' : 'w-full'} py-3 px-4`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : step === 1 ? (
                  'Continue'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="auth-sub mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent-2 transition hover:opacity-90">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="auth-sub mt-8 text-center text-sm">
          <p>Join thousands of skill exchangers worldwide</p>
        </div>
      </div>
    </div>
  );
}
