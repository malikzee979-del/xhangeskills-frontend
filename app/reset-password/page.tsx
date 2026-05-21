'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './content';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
