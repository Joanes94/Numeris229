"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  UserCheck,
  ShoppingBag,
  Cpu,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function UseCases() {
  const { t } = useLanguage();

  const domaines = [
    {
      livre: "Livre V / Book V",
      titre: t("use.d1.titre"),
      description: t("use.d1.desc"),
      exemples: [
        t("use.d1.q1"),
        t("use.d1.q2"),
      ],
      icon: UserCheck,
    },
    {
      livre: "Livre VI / Book VI",
      titre: t("use.d2.titre"),
      description: t("use.d2.desc"),
      exemples: [
        t("use.d2.q1"),
        t("use.d2.q2"),
      ],
      icon: ShieldAlert,
    },
    {
      livre: "Livre III / Book III",
      titre: t("use.d3.titre"),
      description: t("use.d3.desc"),
      exemples: [
        t("use.d3.q1"),
        t("use.d3.q2"),
      ],
      icon: ShoppingBag,
    },
    {
      livre: "Livre IV / Book IV",
      titre: t("use.d4.titre"),
      description: t("use.d4.desc"),
      exemples: [
        t("use.d4.q1"),
        t("use.d4.q2"),
      ],
      icon: Cpu,
    },
  ];

  return (
    <section id="thematiques" className="py-20 lg:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Titre de section */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <span>{t("use.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("use.titrePrincipal")}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t("use.sousTitrePrincipal")}
          </p>
        </div>

        {/* Grille des 4 domaines phares */}
        <div className="mt-14 grid md:grid-cols-2 gap-6 sm:gap-8">
          {domaines.map((domaine, index) => {
            const Icon = domaine.icon;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {domaine.livre}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {domaine.titre}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {domaine.description}
                  </p>

                  {/* Exemples de questions posées */}
                  <div className="mt-6 space-y-2 border-t border-slate-200/80 dark:border-slate-800 pt-4">
                    <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t("use.questionsTraitees")}</span>
                    </div>
                    {domaine.exemples.map((ex, exIndex) => (
                      <div
                        key={exIndex}
                        className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                      >
                        <span>« {ex} »</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bannière d'appel pour tester */}
        <div className="mt-16 rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {t("use.ctaTitre")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t("use.ctaDesc")}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/consultation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <span>{t("use.ctaBtnChat")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explorer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
              >
                <span>{t("use.ctaBtnLoi")}</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
