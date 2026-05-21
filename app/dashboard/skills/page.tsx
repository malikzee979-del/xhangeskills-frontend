'use client';

import { Suspense } from 'react';
import SkillsPageContent from './content';

export default function SkillsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-16"><div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>}>
      <SkillsPageContent />
    </Suspense>
  );
}

