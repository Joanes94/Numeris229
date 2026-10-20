"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { traductions } from "../lib/translations";

const LanguageContext = createContext({
  langue: "fr",
  changerLangue: () => {},
  t: (cle) => cle,
  mounted: false,
});

export function LanguageProvider({ children }) {
  const [langue, setLangue] = useState("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const langueSauvegardee = localStorage.getItem("numeris_lang");
      if (langueSauvegardee && (langueSauvegardee === "fr" || langueSauvegardee === "en")) {
        setLangue(langueSauvegardee);
        document.documentElement.lang = langueSauvegardee;
      } else {
        // Détecter la langue du navigateur par défaut
        const langNav = navigator.language.startsWith("en") ? "en" : "fr";
        setLangue(langNav);
        document.documentElement.lang = langNav;
      }
    } catch {
      // Ignorer si localStorage indisponible
    }
    setMounted(true);
  }, []);

  const changerLangue = (nouvelleLangue) => {
    if (nouvelleLangue !== "fr" && nouvelleLangue !== "en") return;
    setLangue(nouvelleLangue);
    try {
      localStorage.setItem("numeris_lang", nouvelleLangue);
      document.documentElement.lang = nouvelleLangue;
    } catch (e) {
      console.warn("Impossible de sauvegarder la langue :", e);
    }
  };

  const t = (cle, fallback = "") => {
    const dicoCourant = traductions[langue] || traductions.fr;
    if (dicoCourant && dicoCourant[cle] !== undefined) {
      return dicoCourant[cle];
    }
    // Fallback en français si non traduit en anglais
    if (traductions.fr && traductions.fr[cle] !== undefined) {
      return traductions.fr[cle];
    }
    return fallback || cle;
  };

  return (
    <LanguageContext.Provider value={{ langue, changerLangue, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
