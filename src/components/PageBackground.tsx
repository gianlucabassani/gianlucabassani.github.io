import type { CSSProperties } from 'react';

interface PageBackgroundProps {
  primary: string;
  secondary?: string;
  tertiary?: string;
  variant?: 'centered' | 'scattered';
}

/** Viewport-sized gradients avoid page-height drift and expensive animated blur. */
export default function PageBackground({
  primary,
  secondary = 'hsl(185,95%,48%)',
  tertiary,
  variant = 'scattered',
}: PageBackgroundProps) {
  return <div aria-hidden="true" className={`page-ambient page-ambient-${variant}`} style={{
    '--ambient-primary': primary,
    '--ambient-secondary': secondary,
    '--ambient-tertiary': tertiary || primary,
  } as CSSProperties} />;
}
