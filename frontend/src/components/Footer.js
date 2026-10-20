"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Numeris229</span> — {t("footer.desc")}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/a-propos" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            {t("nav.aPropos")}
          </Link>
          <Link href="/explorer" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            {t("nav.explorer")}
          </Link>
          <Link href="/consultation" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            {t("nav.consultation")}
          </Link>
          <Link href="/connexion" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {t("nav.connexion")}
          </Link>
          <Link href="/inscription" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {t("nav.inscription")}
          </Link>
          <span>© {new Date().getFullYear()} {t("footer.droits")}</span>
        </div>
      </div>
    </footer>
  );
}
