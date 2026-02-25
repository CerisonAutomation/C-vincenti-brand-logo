import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Animation variant - 'pulse' for subtle, 'wave' for more prominent, 'shimmer' for modern look
   */
  variant?: 'pulse' | 'wave' | 'shimmer';
  /**
   * Animation speed in seconds
   */
  speed?: number;
  /**
   * Respect user's reduced motion preference
   */
  respectReducedMotion?: boolean;
}

function Skeleton({
  className,
  variant = 'pulse',
  speed = 2,
  respectReducedMotion = true,
  ...props
}: SkeletonProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!respectReducedMotion) {
      setShouldAnimate(true);
      return;
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectReducedMotion]);

  const variantClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    shimmer: shouldAnimate ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent' : ''
  };

  const style = shouldAnimate && variant !== 'shimmer' ? {
    animationDuration: `${speed}s`
  } : undefined;

  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        shouldAnimate && variantClasses[variant],
        className
      )}
      style={style}
      role="presentation"
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
