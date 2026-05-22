/**
 * PageBackground
 * 
 * Shared animated ambient background used across every page.
 * Renders 2–3 floating blurred orbs whose color adapts to the page theme,
 * paired with the cyber-grid pattern inherited from the parent's className.
 *
 * Usage:
 *   <PageBackground primary="hsl(270,85%,65%)" secondary="hsl(185,95%,48%)" />
 *
 * For pages with a single strongly themed color (writeups, platform views):
 *   <PageBackground primary={theme.accentColor} />
 */

interface PageBackgroundProps {
  /** Main accent color – drives the large centered blob. CSS color string e.g. hsl(...) */
  primary: string;
  /** Optional secondary accent – drives the corner blob. Defaults to a cyan tint. */
  secondary?: string;
  /** Optional tertiary accent for a third blob. */
  tertiary?: string;
  /** Layout variant: 'centered' = one big centered blob, 'scattered' = three off-center blobs */
  variant?: 'centered' | 'scattered';
}

export default function PageBackground({
  primary,
  secondary = 'hsl(185,95%,48%)',
  tertiary,
  variant = 'scattered',
}: PageBackgroundProps) {
  if (variant === 'centered') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Center – large primary blob */}
        <div
          className="absolute top-[8%] left-[50%] -translate-x-[50%] w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.018]"
          style={{
            backgroundColor: primary,
            animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite, float-blob-1 25s ease-in-out infinite',
          }}
        />
        {/* Bottom-right secondary blob */}
        <div
          className="absolute bottom-[10%] right-[8%] w-[450px] h-[450px] rounded-full blur-[180px] opacity-[0.012]"
          style={{
            backgroundColor: secondary,
            animation: 'pulse 17s cubic-bezier(0.4, 0, 0.6, 1) infinite, float-blob-2 32s ease-in-out infinite',
          }}
        />
      </div>
    );
  }

  // 'scattered' variant — three off-center blobs that fill the page height nicely
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top-left primary blob */}
      <div
        className="absolute top-[8%] left-[8%] w-[520px] h-[520px] rounded-full blur-[190px] opacity-[0.016]"
        style={{
          backgroundColor: primary,
          animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite, float-blob-1 25s ease-in-out infinite',
        }}
      />
      {/* Bottom-right secondary blob */}
      <div
        className="absolute bottom-[15%] right-[8%] w-[580px] h-[580px] rounded-full blur-[190px] opacity-[0.012]"
        style={{
          backgroundColor: secondary,
          animation: 'pulse 16s cubic-bezier(0.4, 0, 0.6, 1) infinite, float-blob-2 30s ease-in-out infinite',
        }}
      />
      {/* Optional tertiary mid-page blob */}
      {tertiary && (
        <div
          className="absolute top-[50%] left-[55%] w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.009]"
          style={{
            backgroundColor: tertiary,
            animation: 'pulse 20s cubic-bezier(0.4, 0, 0.6, 1) infinite, float-blob-1 35s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
