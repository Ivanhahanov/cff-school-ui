import React, { Suspense } from 'react'

import { ChallengesList, ChallengesFilters } from '@/features/challenges';
export default function ChallengesPage({ searchParams }: { searchParams: any }) {
  return (
    <div className="flex flex-col font-mono mx-auto max-w-7xl px-4">
      <ChallengesFilters>
        <Suspense 
          fallback={<div className="py-20 text-center text-primary animate-pulse font-mono text-xs uppercase tracking-widest">[...] Accessing sector database...</div>}
        >
          <ChallengesList searchParams={searchParams} />
        </Suspense>
      </ChallengesFilters>
    </div>
  )
}