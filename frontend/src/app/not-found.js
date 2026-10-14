import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Home, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size="md" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-7 h-7" />
          </div>

          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
            Erreur 404
          </span>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Page introuvable
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            La ressource que vous recherchez n'existe pas ou a été déplacée dans une autre section du Code du Numérique.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>

            <Link
              href="/consultation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Consultation IA</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
