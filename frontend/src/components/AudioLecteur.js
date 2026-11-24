"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Pause, Play, Square } from "lucide-react";
import { useLanguage } from "./LanguageContext";

/**
 * Nettoie le texte Markdown et développe les abréviations juridiques.
 */
function preparerTextePourAudio(texteBrut, estAnglais = false) {
  if (!texteBrut) return "";

  let texte = texteBrut
    // Nettoyer les balises Markdown et caractères de formatage
    .replace(/###?\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/•|\-|\*/g, ", ")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (estAnglais) {
    // Traduction / adaptation phonétique des termes juridiques français fréquents vers l'anglais
    texte = texte
      .replace(/\bSelon l'article\b/gi, "According to Article")
      .replace(/\bSelon les articles\b/gi, "According to Articles")
      .replace(/\bD'après l'article\b/gi, "Under Article")
      .replace(/\bdu Code du Numérique\b/gi, "of the Benin Digital Code")
      .replace(/\bCode du Numérique\b/gi, "Digital Code")
      .replace(/\bLivre préliminaire\b/gi, "Preliminary Book")
      .replace(/\bLivre I\b/gi, "Book One")
      .replace(/\bLivre II\b/gi, "Book Two")
      .replace(/\bLivre III\b/gi, "Book Three")
      .replace(/\bLivre IV\b/gi, "Book Four")
      .replace(/\bLivre V\b/gi, "Book Five")
      .replace(/\bLivre VI\b/gi, "Book Six")
      .replace(/\bArt\.\s*(\d+)/gi, "Article $1")
      .replace(/\bAl\.\s*(\d+)/gi, "paragraph $1")
      .replace(/\balinéa\s*(\d+)/gi, "paragraph $1")
      .replace(/\bN°\s*(\d+)/gi, "Number $1")
      .replace(/\best puni d'un emprisonnement de\b/gi, "shall be punished by imprisonment of")
      .replace(/\best punie d'un emprisonnement de\b/gi, "shall be punished by imprisonment of")
      .replace(/\bà une amende de\b/gi, "and a fine of")
      .replace(/\bmillions de francs CFA\b/gi, "million CFA francs")
      .replace(/\bfrancs CFA\b/gi, "CFA francs")
      .replace(/\bFCFA\b/gi, "CFA francs")
      .replace(/\btoute personne qui\b/gi, "any person who")
      .replace(/\bsans droit\b/gi, "without authorization")
      .replace(/\bdonnées à caractère personnel\b/gi, "personal data")
      .replace(/\bresponsable du traitement\b/gi, "data controller")
      .replace(/\bautorité de protection\b/gi, "data protection authority")
      .replace(/\bcybercriminalité\b/gi, "cybercrime");
  } else {
    // Abréviations juridiques françaises
    texte = texte
      .replace(/\bArt\.\s*(\d+)/gi, "Article $1")
      .replace(/\bAl\.\s*(\d+)/gi, "alinéa $1")
      .replace(/\bN°\s*(\d+)/gi, "numéro $1")
      .replace(/\bFCFA\b/gi, "francs CFA");
  }

  return texte;
}

export default function AudioLecteur({
  texte,
  className = "",
  compact = true,
  label = "",
}) {
  const { langue, t } = useLanguage();
  const [supporte, setSupporte] = useState(false);
  const [etat, setEtat] = useState("idle"); // "idle" | "playing" | "paused"
  const [voixDisponibles, setVoixDisponibles] = useState([]);
  const intervalResumeRef = useRef(null);

  /**
   * Arrête immédiatement la synthèse vocale et réinitialise l'état.
   */
  const arreterLecture = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Erreur arrêt synthèse vocale :", e);
      }
      setEtat("idle");
      if (intervalResumeRef.current) {
        clearInterval(intervalResumeRef.current);
        intervalResumeRef.current = null;
      }
    }
  }, []);

  /**
   * Sélectionne une voix authentique avec l'accent adéquat (US/UK ou FR).
   */
  const determinerLangueEtVoix = useCallback((texteNettoye) => {
    const liste = (typeof window !== "undefined" && window.speechSynthesis)
      ? window.speechSynthesis.getVoices()
      : voixDisponibles;

    const texteMin = texteNettoye.toLowerCase();
    const indicesEn = [
      "according", "law", "digital", "article", "the", "and", "shall", "code", "under",
      "punished", "fine", "rights", "republic of benin", "penalty", "data", "protection",
      "imprisonment", "offense", "cybercrime", "information"
    ];
    const indicesFr = [
      "selon", "loi", "numérique", "article", "les", "des", "dans", "pour", "est puni",
      "données", "république du bénin", "peine", "amende", "emprisonnement", "alinéa",
      "béninois", "disposition", "protection", "infraction"
    ];

    let scoreEn = 0;
    let scoreFr = 0;
    indicesEn.forEach(w => { if (texteMin.includes(w)) scoreEn++; });
    indicesFr.forEach(w => { if (texteMin.includes(w)) scoreFr++; });

    // Le Code du Numérique étant authentiquement en français,
    // on priorise toujours une lecture vocale française naturelle (fr-FR)
    // sans jamais imposer un accent anglais sur des réponses françaises.
    let estAnglais = (scoreEn > scoreFr && scoreFr === 0);

    if (estAnglais) {
      const preferenceNomsEn = [
        "google us english", "google uk english female", "google uk english male",
        "natural", "jenny", "guy", "aria", "david", "zira", "mark", "george", "susan", "hazel"
      ];

      const voixEn = liste.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));

      for (const pref of preferenceNomsEn) {
        const v = voixEn.find(item => item.name && item.name.toLowerCase().includes(pref));
        if (v) return { codeLangue: v.lang || "en-US", voix: v, estAnglais: true };
      }

      const vUs = voixEn.find(item => item.lang.toLowerCase().includes("en-us") || item.lang.toLowerCase().includes("en_us"));
      if (vUs) return { codeLangue: "en-US", voix: vUs, estAnglais: true };

      const vGb = voixEn.find(item => item.lang.toLowerCase().includes("en-gb") || item.lang.toLowerCase().includes("en_gb"));
      if (vGb) return { codeLangue: "en-GB", voix: vGb, estAnglais: true };

      if (voixEn.length > 0) return { codeLangue: voixEn[0].lang, voix: voixEn[0], estAnglais: true };

      return { codeLangue: "en-US", voix: null, estAnglais: true };
    } else {
      const preferenceNomsFr = [
        "google français", "natural", "hortense", "paul", "denise", "henri", "julie", "celine"
      ];

      const voixFr = liste.filter(v => v.lang && v.lang.toLowerCase().startsWith("fr"));

      for (const pref of preferenceNomsFr) {
        const v = voixFr.find(item => item.name && item.name.toLowerCase().includes(pref));
        if (v) return { codeLangue: v.lang || "fr-FR", voix: v, estAnglais: false };
      }

      if (voixFr.length > 0) return { codeLangue: voixFr[0].lang, voix: voixFr[0], estAnglais: false };

      return { codeLangue: "fr-FR", voix: null, estAnglais: false };
    }
  }, [langue, voixDisponibles]);

  const demarrerLecture = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (intervalResumeRef.current) clearInterval(intervalResumeRef.current);

    const { codeLangue, voix, estAnglais } = determinerLangueEtVoix(texte);
    const texteNettoye = preparerTextePourAudio(texte, estAnglais);
    if (!texteNettoye) return;

    const utterance = new SpeechSynthesisUtterance(texteNettoye);
    utterance.lang = codeLangue;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (voix) {
      utterance.voice = voix;
    }

    utterance.onstart = () => {
      setEtat("playing");
      intervalResumeRef.current = setInterval(() => {
        if (typeof window !== "undefined" && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 5000);
    };

    utterance.onend = () => {
      setEtat("idle");
      if (intervalResumeRef.current) clearInterval(intervalResumeRef.current);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("Synthèse vocale:", e);
      }
      setEtat("idle");
      if (intervalResumeRef.current) clearInterval(intervalResumeRef.current);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
      setEtat("playing");
    }, 60);
  }, [langue, texte, determinerLangueEtVoix]);

  const mettreEnPause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && etat === "playing") {
      window.speechSynthesis.pause();
      setEtat("paused");
      if (intervalResumeRef.current) clearInterval(intervalResumeRef.current);
    }
  }, [etat]);

  const reprendreLecture = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && etat === "paused") {
      window.speechSynthesis.resume();
      setEtat("playing");
    } else {
      demarrerLecture();
    }
  }, [etat, demarrerLecture]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupporte(true);

      const chargerVoix = () => {
        try {
          const liste = window.speechSynthesis.getVoices();
          if (liste && liste.length > 0) {
            setVoixDisponibles(liste);
          }
        } catch (e) {
          console.warn("Erreur chargement voix :", e);
        }
      };

      chargerVoix();
      window.speechSynthesis.onvoiceschanged = chargerVoix;
    }

    return () => {
      arreterLecture();
    };
  }, [arreterLecture]);

  // Arrêter l'audio si le texte ou la langue change
  useEffect(() => {
    if (etat !== "idle") {
      arreterLecture();
    }
  }, [texte, langue, etat, arreterLecture]);

  if (!supporte || !texte) {
    return null;
  }

  // État 1 : Inactif (bouton pour lancer l'écoute)
  if (etat === "idle") {
    return (
      <button
        onClick={demarrerLecture}
        type="button"
        title={t("audio.ecouter")}
        aria-label={t("audio.ecouter")}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ${className}`}
      >
        <Volume2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>{label || t("chat.ecouter")}</span>
      </button>
    );
  }

  // État 2 & 3 : En cours de lecture ou en Pause
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs shadow-sm ${className}`}
    >
      <span className="flex items-center gap-1 text-[11px] font-semibold pr-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="hidden sm:inline">
          {etat === "playing" ? t("chat.enLecture") : t("chat.pause")}
        </span>
      </span>

      {etat === "playing" ? (
        <button
          onClick={mettreEnPause}
          type="button"
          title={t("audio.pause")}
          className="p-1 rounded text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <Pause className="w-3 h-3" />
        </button>
      ) : (
        <button
          onClick={reprendreLecture}
          type="button"
          title={t("audio.reprendre")}
          className="p-1 rounded text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
        </button>
      )}

      <button
        onClick={arreterLecture}
        type="button"
        title={t("audio.arreter")}
        className="p-1 rounded text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
      >
        <Square className="w-3 h-3 fill-current" />
      </button>
    </div>
  );
}
