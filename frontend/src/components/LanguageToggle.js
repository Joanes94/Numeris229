"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle({ className = "", compact = false }) {
  const { langue, changerLangue, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-transparent ${className}`} />
    );
  }

  const toggleLangue = () => {
    changerLangue(langue === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={toggleLangue}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm ${className}`}
      title={langue === "fr" ? "Switch to English" : "Passer en Français"}
      aria-label="Changer de langue"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
      <span className="tracking-wide">
        {langue === "fr" ? "FR" : "EN"}
      </span>
      {!compact && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-0.5">
          {langue === "fr" ? "EN" : "FR"}
        </span>
      )}
    </button>
  );
}
