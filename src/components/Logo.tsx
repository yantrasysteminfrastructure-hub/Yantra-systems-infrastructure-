/**
 * The original Yantra logo, unaltered. Its lettering is dark, so it sits on a light
 * #FAF8F3 plate wherever the background is dark, keeping it legible without recolouring it.
 */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={`logo-plate logo-plate--${size}`}>
      <picture>
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt="Yantra Systems & Infrastructure" width={471} height={160} decoding="async" />
      </picture>
    </span>
  );
}
