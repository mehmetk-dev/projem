'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mobile?: boolean;
}

export function NavLink({ href, children, className, onClick, mobile }: NavLinkProps) {
  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn('text-2xl font-light tracking-tight', className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'hover:text-white transition-colors py-2 relative group scroll-smooth text-[13px] font-medium tracking-[0.2em] uppercase text-neutral-400',
        className
      )}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
