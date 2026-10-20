"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Composant de saisie de mot de passe avec bouton d'affichage / masquage.
 */
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  autoComplete,
  className = "",
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        disabled={disabled}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
        tabIndex={-1}
        title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? (
          <EyeOff className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
