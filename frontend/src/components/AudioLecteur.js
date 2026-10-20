"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, Square } from "lucide-react";
import { useLanguage } from "./LanguageContext";

/**
 * Nettoie le texte Markdown pour une élocution fluide et naturelle en synthèse vocale.
 */
function preparerTextePourAudio(texteBrut) {
  if (!texteBrut) return "";

  return (
    texteBrut
      // Nettoyer les balises Markdown et caractères de style
      .replace(/###?\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_{1,2}(.*?)_{1,2}/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      // Améliorer la lecture des abréviations juridiques béninoises et françaises
      .replace(/\bArt\.\s*(\d+)/gi, "Article $1")
      .replace(/\bAl\.\s*(\d+)/gi, "alinéa $1")
      .replace(/\bN°\s*(\d+)/gi, "numéro $1")
      .replace(/•|\-|\*/g, ", ")
      // Éviter les doubles espaces et retours à la ligne brusques
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
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
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Vérifier le support du navigateur pour la synthèse vocale
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
      // Nettoyage : arrêter la lecture si le composant est démonté
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Arrêter l'audio si le texte ou la langue change
  useEffect(() => {
    if (etat !== "idle" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setEtat("idle");
    }
  }, [texte, langue]);

  if (!supporte || !texte) {
    return null;
  }

  const determinerLangueEtVoix = (texteNettoye) => {
    const liste = voixDisponibles.length > 0 ? voixDisponibles : (typeof window !== "undefined" ? window.speechSynthesis.getVoices() : []);
    
    // Détecter si le texte est en anglais ou français
    const texteMin = texteNettoye.toLowerCase();
    const indicesEn = ["according", "law", "digital", "article", "the", "and", "shall", "code", "under", "states that"];
    const indicesFr = ["selon", "loi", "numérique", "article", "les", "des", "dans", "pour", "est puni", "données"];
    
    let scoreEn = 0;
    let scoreFr = 0;
    indicesEn.forEach(w => { if (texteMin.includes(w)) scoreEn++; });
    indicesFr.forEach(w => { if (texteMin.includes(w)) scoreFr++; });

    // Si la langue sélectionnée par l'utilisateur est l'anglais, forcer en priorité la voix anglaise
    const estAnglais = (langue === "en" || scoreEn > scoreFr);
    const codeLangue = estAnglais ? "en-US" : "fr-FR";
    const prefix = estAnglais ? "en" : "fr";
    const motCle = estAnglais ? "english" : "french";

    // 1. Chercher d'abord une voix correspondant au code de langue (ex: en-US, en_US, en-GB, fr-FR)
    let voix = liste.find((v) => {
      if (!v || !v.lang) return false;
      const l = v.lang.replace("_", "-").toLowerCase();
      return l === codeLangue.toLowerCase() || l.startsWith(prefix);
    });

    // 2. Si non trouvée, chercher par nom de voix (ex: "Microsoft David - English", "Google US English", "Hortense")
    if (!voix) {
      voix = liste.find((v) => {
        if (!v || !v.name) return false;
        const n = v.name.toLowerCase();
        return n.includes(motCle) || (estAnglais ? (n.includes("us") || n.includes("uk")) : (n.includes("francais") || n.includes("français")));
      });
    }

    // 3. Fallback sur la première voix disponible si aucune spécifique trouvée
    if (!voix && liste.length > 0) {
      voix = liste[0];
    }

    return { codeLangue, voix };
  };

  const demarrerLecture = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Arrêter toute lecture précédente
    window.speechSynthesis.cancel();

    const texteNettoye = preparerTextePourAudio(texte);
    if (!texteNettoye) return;

    const utterance = new SpeechSynthesisUtterance(texteNettoye);
    utteranceRef.current = utterance;

    const { codeLangue, voix } = determinerLangueEtVoix(texteNettoye);
    utterance.lang = codeLangue;
    utterance.rate = 1.0; // vitesse naturelle
    utterance.pitch = 1.0;

    if (voix) {
      utterance.voice = voix;
    }

    utterance.onstart = () => {
      setEtat("playing");
    };

    utterance.onend = () => {
      setEtat("idle");
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("Erreur de synthèse vocale :", e);
      }
      setEtat("idle");
    };

    window.speechSynthesis.speak(utterance);
    setEtat("playing");
  };

  const mettreEnPause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis && etat === "playing") {
      window.speechSynthesis.pause();
      setEtat("paused");
    }
  };

  const reprendreLecture = () => {
    if (typeof window !== "undefined" && window.speechSynthesis && etat === "paused") {
      window.speechSynthesis.resume();
      setEtat("playing");
    } else {
      demarrerLecture();
    }
  };

  const arreterLecture = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setEtat("idle");
    }
  };

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

  // État 2 & 3 : En cours de lecture ou en Pause (avec contrôles Play / Pause / Stop)
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs shadow-sm ${className}`}
    >
      {/* Indicateur visuel sonore */}
      <span className="flex items-center gap-1 text-[11px] font-semibold pr-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="hidden sm:inline">
          {etat === "playing" ? t("chat.enLecture") : t("chat.pause")}
        </span>
      </span>

      {/* Bouton Pause / Reprendre */}
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

      {/* Bouton Arrêter */}
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
