import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

export default function Divider({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('my-4 flex items-center', className)}>
      <span className="h-px grow bg-foreground/10" />
      {children ? <h2 className="mx-4 font-medium text-base text-foreground/45 tracking-wide">{children}</h2> : null}
      <span className="h-px grow bg-foreground/10" />
    </div>
  );
}
