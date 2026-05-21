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
    setFormData(prev => ({
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
      if (err) { setError(err); return; }
      setStep(2);
    } else {
      const err = validateStep2();
      if (err) { setError(err); return; }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Registration Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-30 h-20 mb-4 shadow-lg">
              <img src="/logo.jfif" alt="Logo" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join XchangeSkills</h1>
            <p className="text-indigo-400">Create your account and start exchanging skills</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${step >= 1 ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white shadow-lg' : 'bg-white/20 text-white/60'}`}>
              1
            </div>
            <div className={`flex-1 h-1 rounded transition ${step >= 2 ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' : 'bg-white/20'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${step >= 2 ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white shadow-lg' : 'bg-white/20 text-white/60'}`}>
              2
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 auth-input">
            {step === 1 ? (
              <>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">At least 8 characters with uppercase, lowercase, and numbers</p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <label className="flex items-start text-white/80 hover:text-white cursor-pointer transition">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-1 rounded bg-white/20 border-white/30 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="ml-2 text-sm">
                    I agree to the <Link href="#" className="text-indigo-400 hover:text-indigo-300 underline">Terms & Conditions</Link> and{' '}
                    <Link href="#" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</Link>
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
                  className="flex-1 py-3 px-4 bg-white/20 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 transition duration-300"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (step === 2 && !formData.agreedToTerms)}
                className={`${step === 2 ? 'flex-1' : 'w-full'} py-3 px-4 bg-gradient-to-r from-indigo-400 to-indigo-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
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
          <p className="text-center mt-6 text-white/80">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="mt-8 text-center text-indigo-400 text-sm">
          <p>Join thousands of skill exchangers worldwide</p>
        </div>
      </div>
    </div>
  );
}
