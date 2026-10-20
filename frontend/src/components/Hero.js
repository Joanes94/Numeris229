"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {/* Badge sobre de référence légale */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-6">
        <span>{t("hero.badge")}</span>
      </div>

      {/* Titre clair et sans emphase excessive */}
      <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
        {t("hero.titre")}, <br className="hidden sm:inline" />
        <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{t("hero.sousTitre")}</span>
      </h1>

      {/* Sous-titre court et posé */}
      <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        {t("hero.description")}
      </p>

      {/* Actions principales */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/consultation"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t("hero.btnConsulter")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/explorer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors"
        >
          <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t("hero.btnExplorer")}</span>
        </Link>
      </div>

      {/* 3 points d'information sobres en bas de page */}
      <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-3 gap-6 text-left">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            {t("feat.ragTitle")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("feat.ragDesc")}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            {t("feat.audioTitle")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("feat.audioDesc")}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            {t("feat.localTitle")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("feat.localDesc")}
          </p>
        </div>
      </div>
    </section>
  );
}
