"use client";

import React from "react";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Cpu,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import Footer from "../../components/Footer";
import { useLanguage } from "../../components/LanguageContext";

export default function PageAPropos() {
  const { t } = useLanguage();

  const livres = [
    {
      num: t("apropos.l0.num"),
      titre: t("apropos.l0.titre"),
      desc: t("apropos.l0.desc"),
    },
    {
      num: t("apropos.l1.num"),
      titre: t("apropos.l1.titre"),
      desc: t("apropos.l1.desc"),
    },
    {
      num: t("apropos.l2.num"),
      titre: t("apropos.l2.titre"),
      desc: t("apropos.l2.desc"),
    },
    {
      num: t("apropos.l3.num"),
      titre: t("apropos.l3.titre"),
      desc: t("apropos.l3.desc"),
    },
    {
      num: t("apropos.l4.num"),
      titre: t("apropos.l4.titre"),
      desc: t("apropos.l4.desc"),
    },
    {
      num: t("apropos.l5.num"),
      titre: t("apropos.l5.titre"),
      desc: t("apropos.l5.desc"),
    },
    {
      num: t("apropos.l6.num"),
      titre: t("apropos.l6.titre"),
      desc: t("apropos.l6.desc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      
      {/* Barre supérieure */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("nav.accueil")}</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("hero.btnConsulter")}</span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12">
        
        {/* En-tête */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>{t("apropos.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("apropos.titre")}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("apropos.sousTitre")}
          </p>
        </div>

        {/* Section 1 : La Loi N° 2017-20 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("apropos.loiTitre")}
              </h2>
              <p className="text-xs text-slate-500">{t("apropos.loiDate")}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("apropos.loiDesc1")}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("apropos.loiDesc2")}
          </p>
        </section>

        {/* Section 2 : Les 7 Livres du Code */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>{t("apropos.livresTitre")}</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {livres.map((livre, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {livre.num}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {livre.titre}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {livre.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 : Architecture Technique IA & RAG */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("apropos.ragTitre")}
              </h2>
              <p className="text-xs text-slate-500">{t("apropos.ragSousTitre")}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("apropos.ragIntro")}
          </p>

          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>{t("apropos.ragPoint1")}</li>
            <li>{t("apropos.ragPoint2")}</li>
            <li>{t("apropos.ragPoint3")}</li>
          </ul>
        </section>

        {/* Section 4 : Avertissement & Non-responsabilité */}
        <section className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t("apropos.avertissementTitre")}</span>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            {t("apropos.avertissementDesc1")}
          </p>

          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            {t("apropos.avertissementDesc2")}
          </p>
        </section>

        {/* Bouton d'action final */}
        <div className="text-center pt-4">
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            <span>{t("apropos.btnDemarrer")}</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
