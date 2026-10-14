import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Numeris229</span> — Plateforme documentaire sur la Loi N° 2017-20 portant Code du Numérique en République du Bénin.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/a-propos" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            À propos & Cadre Légal
          </Link>
          <Link href="/explorer" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Explorateur de lois
          </Link>
          <Link href="/consultation" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Consultation IA
          </Link>
          <Link href="/connexion" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Connexion
          </Link>
          <Link href="/inscription" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Inscription
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
