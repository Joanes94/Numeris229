"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { obtenirToken } from "../lib/api";
import { BookOpen, Sparkles, User } from "lucide-react";

export default function Navbar() {
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    const token = obtenirToken();
    setConnecte(!!token);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Navigation gauche */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/explorer"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explorateur de lois</span>
            </Link>
            <Link
              href="/a-propos"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
            >
              Cadre légal & RAG
            </Link>
            <a
              href="#thematiques"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
            >
              Domaines couverts
            </a>
            <a
              href="#fonctionnalites"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
            >
              Fonctionnalités
            </a>
          </nav>
        </div>

        {/* Liens d'accès direct & Toggle thème */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {connecte ? (
            <>
              <Link
                href="/profil"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Mon profil"
              >
                <User className="w-4 h-4" />
              </Link>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Espace consultation</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
