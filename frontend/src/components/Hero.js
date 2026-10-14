import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {/* Badge sobre de référence légale */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-6">
        <span>République du Bénin • Loi N° 2017-20</span>
      </div>

      {/* Titre clair et sans emphase excessive */}
      <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
        Le Code du Numérique, <br className="hidden sm:inline" />
        en toute simplicité.
      </h1>

      {/* Sous-titre court et posé */}
      <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Recherchez les articles de loi, vérifiez vos obligations légales et trouvez des réponses précises sur le cadre juridique du numérique au Bénin.
      </p>

      {/* Actions principales */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/inscription"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <span>Accéder au service</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/connexion"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors"
        >
          J'ai déjà un compte
        </Link>
      </div>

      {/* 3 points d'information sobres en bas de page */}
      <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-3 gap-6 text-left">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            Recherche par article
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Accédez directement aux articles par numéro ou en recherchant un mot-clé précis.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            Tous les domaines couverts
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Données personnelles, cybercriminalité, signature électronique, régulation et contrats.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            Dossiers organisés
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Conservez vos consultations, renommez vos recherches et retrouvez vos notes à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
}
