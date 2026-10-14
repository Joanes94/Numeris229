import React from "react";
import Link from "next/link";

/**
 * Logo sobre et institutionnel pour Numeris229.
 * Design épuré, intemporel, sans effets superflus.
 */
export default function Logo({ size = "md", withText = true, className = "" }) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emblème sobre : Livre ouvert / Textes juridiques */}
      <div
        className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-emerald-800 text-white shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
          <path d="M6 14h6" />
        </svg>
      </div>

      {/* Texte sobre */}
      {withText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white tracking-tight">
            <span className={textSizes[size]}>Numeris</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">229</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            Droit & Numérique du Bénin
          </span>
        </div>
      )}
    </Link>
  );
}
