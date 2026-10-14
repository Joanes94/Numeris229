"use client";

import React from "react";
import {
  FileText,
  Search,
  History,
  Lock,
  Cpu,
  GraduationCap,
  Scale,
  CheckCircle2,
} from "lucide-react";

export default function Features() {
  const fonctionnalites = [
    {
      icon: Scale,
      titre: "Citations d'articles officielles",
      description:
        "Toutes les réponses indiquent précisément le livre et le numéro de l'article de référence. Vous obtenez la certitude juridique sans ambiguïté.",
      badge: "Zéro hallucination",
    },
    {
      icon: Search,
      titre: "Recherche par numéro ou par thème",
      description:
        "Demandez 'Que dit l'article 55 ?' ou formulez votre cas en français courant : Numeris229 identifie les textes applicables.",
      badge: "Recherche intelligente",
    },
    {
      icon: History,
      titre: "Conversations sauvegardées & organisées",
      description:
        "Conservez l'historique complet de vos recherches, renommez vos dossiers de consultation et supprimez-les en un clic comme sur ChatGPT.",
      badge: "Espace personnel",
    },
    {
      icon: Lock,
      titre: "Confidentialité & Sécurité totale",
      description:
        "Vos consultations restent privées. Chaque compte dispose d'un espace hermétique protégé par authentification chiffrée.",
      badge: "Chiffrement fort",
    },
    {
      icon: Cpu,
      titre: "Technologie RAG & IA souveraine",
      description:
        "Alimenté par un pipeline RAG (Retrieval-Augmented Generation) combinant embeddings vectoriels et modèles de ré-ordonnancement de pointe.",
      badge: "Haute performance",
    },
    {
      icon: GraduationCap,
      titre: "Vulgarisation & Pédagogie",
      description:
        "Idéal pour les citoyens désireux de connaître leurs droits numériques, ainsi que pour les professionnels soucieux de leur conformité légale.",
      badge: "Pour tous",
    },
  ];

  return (
    <section id="fonctionnalites" className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider">
            <span>Pourquoi Numeris229</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Une intelligence artificielle pensée pour la rigueur du droit béninois
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Conçu pour éliminer les approximations et rendre le Code du Numérique immédiatement exploitable par chacun.
          </p>
        </div>

        {/* Grille des 6 fonctionnalités */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {fonctionnalites.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Badge d'en-tête */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-400 group-hover:bg-emerald-800 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    {item.badge}
                  </span>
                </div>

                {/* Titre & Description */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {item.titre}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
