import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 border border-primary/50 hover:shadow-primary/40 hover:scale-[1.02]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:border-primary/30 shadow-sm hover:scale-[1.02]',
  outline: 'border-2 border-primary/50 bg-card/80 text-foreground hover:bg-primary/10 hover:border-primary hover:scale-[1.02]',
  ghost: 'hover:bg-accent hover:text-accent-foreground'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
};

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export function Button({ variant = 'default', size = 'md', href, className, children, ...props }: Props) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 disabled:shadow-none active:scale-[0.98]',
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
