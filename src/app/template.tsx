'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function Template({ children }: Props) {
  return (
    <div className="min-h-full animate-page-fade-in">
      {children}
    </div>
  );
}
