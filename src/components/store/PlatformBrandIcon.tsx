import React from 'react';
import { SocialPlatformId } from '../../types/rimphone';

interface PlatformBrandIconProps {
  platformId: SocialPlatformId;
  size?: 'sm' | 'md' | 'lg';
}

export const PlatformBrandIcon: React.FC<PlatformBrandIconProps> = ({
  platformId,
  size = 'md',
}) => {
  const containerSizes = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-xl',
  };

  const svgSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  switch (platformId) {
    case 'whatsapp':
      return (
        <span
          className={`${containerSizes[size]} bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 5.016L2 22l5.141-1.344c1.484.813 3.172 1.25 4.89 1.25 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.531.078-1.203.109-1.953-.125-.453-.141-1.047-.344-1.797-.672-3.156-1.359-5.219-4.547-5.375-4.75-.156-.203-1.281-1.703-1.281-3.25s.813-2.313 1.094-2.625c.281-.313.625-.391.828-.391.203 0 .406.016.594.016.188 0 .438-.078.688.531.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.328.391-.469.531-.156.156-.313.328-.141.625.172.297.766 1.266 1.641 2.047 1.125 1.016 2.078 1.328 2.375 1.484.297.156.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.406-.25.672-.156.266.094 1.703.813 2 .953.297.141.484.219.563.344.078.125.078.734-.172 1.438z" />
          </svg>
        </span>
      );

    case 'telegram':
      return (
        <span
          className={`${containerSizes[size]} bg-[#229ED9]/15 border border-[#229ED9]/40 text-[#38BDF8] inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M11.944 2A10 10 0 1 0 22 12.056 10 10 0 0 0 11.944 2Zm4.672 6.844-1.688 7.969c-.125.563-.453.703-.922.438l-2.547-1.875-1.234 1.188c-.141.141-.25.25-.516.25l.188-2.594 4.719-4.266c.203-.188-.047-.281-.313-.109L8.469 13.5l-2.516-.781c-.547-.172-.563-.547.109-.813l9.828-3.797c.453-.172.859.109.726.735Z" />
          </svg>
        </span>
      );

    case 'twitter':
      return (
        <span
          className={`${containerSizes[size]} bg-stone-100/10 border border-stone-400/40 text-white inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
      );

    case 'imo':
      return (
        <span
          className={`${containerSizes[size]} bg-amber-500/15 border border-amber-500/40 text-amber-400 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.75 1.45 5.21 3.74 6.82L4.5 22l4.82-2.41c.86.2 1.76.31 2.68.31 5.52 0 10-3.92 10-8.75S17.52 2 12 2zm-3.25 11.5h-1.5v-5h1.5v5zm-.75-5.75c-.48 0-.87-.39-.87-.87s.39-.88.87-.88.88.39.88.88-.39.87-.88.87zm7.25 5.75h-1.4v-2.7c0-.5-.2-.8-.65-.8-.38 0-.65.26-.65.8v2.7h-1.4v-2.7c0-.5-.2-.8-.65-.8-.38 0-.65.26-.65.8v2.7h-1.4v-5h1.35v.6c.3-.44.75-.72 1.35-.72.62 0 1.1.28 1.35.76.34-.48.85-.76 1.45-.76 1 0 1.7.65 1.7 1.82v3.3z" />
          </svg>
        </span>
      );

    case 'tiktok':
      return (
        <span
          className={`${containerSizes[size]} bg-rose-500/15 border border-rose-500/40 text-rose-400 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </span>
      );

    case 'instagram':
      return (
        <span
          className={`${containerSizes[size]} bg-orange-500/15 border border-orange-500/40 text-orange-400 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </span>
      );

    case 'facebook':
      return (
        <span
          className={`${containerSizes[size]} bg-blue-500/15 border border-blue-500/40 text-blue-400 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={svgSizes[size]}
          >
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
          </svg>
        </span>
      );
  }
};
