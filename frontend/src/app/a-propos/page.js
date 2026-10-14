import React from "react";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  BookOpen,
  Building2,
  FileCheck2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";

export const metadata = {
  title: "À propos & Cadre Juridique - Numeris229",
  description:
    "Comprendre le fonctionnement de Numeris229, le Code du Numérique de la République du Bénin (Loi N° 2017-20) et la technologie RAG souveraine.",
};

export default function PageAPropos() {
  const livres = [
    {
      num: "Livre Préliminaire",
      titre: "Dispositions Générales & Définitions",
      desc: "Fixe les termes clés du droit numérique béninois : données informatiques, opérateurs, chiffrement, services en ligne, etc.",
    },
    {
      num: "Livre I",
      titre: "Réseaux & Communications Électroniques",
      desc: "Régit l'accès aux réseaux, le service universel, les licences d'opérateurs, les fréquences et la régulation par l'ARCEP.",
    },
    {
      num: "Livre II",
      titre: "Outils Électroniques & Services de Confiance",
      desc: "Encadre l'écrit électronique, la valeur probante des documents numériques, l'horodatage, le cachet et la signature électronique.",
    },
    {
      num: "Livre III",
      titre: "Commerce Électronique",
      desc: "Définit les contrats en ligne, les obligations des sites marchands, les mentions obligatoires et la protection des cyber-consommateurs.",
    },
    {
      num: "Livre IV",
      titre: "Cybersécurité & Confiance Numérique",
      desc: "Supervision des infrastructures d'importance vitale, qualifications des prestataires de sécurité et attributions de l'ANSSI Bénin.",
    },
    {
      num: "Livre V",
      titre: "Protection des Données à Caractère Personnel",
      desc: "Droits des citoyens fichés, consentement, déclarations et autorisations obligatoires auprès de l'APDP Bénin, transferts transfrontaliers.",
    },
    {
      num: "Livre VI",
      titre: "Cybercriminalité & Répression Pénale",
      desc: "Sanctions des infractions informatiques, escroquerie par internet, diffamation en ligne, usurpation d'identité et compétence de la CRIET.",
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
              <span>Accueil</span>
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
              <span>Accéder à l'assistant</span>
            </Link>
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
            <span>République du Bénin</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cadre Légal & Mission de Numeris229
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Démocratiser l'accès au droit numérique et accompagner les citoyens, juristes, développeurs et entreprises béninoises dans la conformité légale.
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
                La Loi N° 2017-20 portant Code du Numérique
              </h2>
              <p className="text-xs text-slate-500">Adoptée par l'Assemblée Nationale du Bénin le 20 avril 2018</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Le Code du Numérique en République du Bénin constitue un socle législatif moderne et unifié regroupant l'ensemble des règles relatives aux communications électroniques, au commerce électronique, à la cybersécurité, aux données personnelles et à la répression de la cybercriminalité.
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Modifié par la <strong>Loi N° 2020-35 du 06 janvier 2021</strong>, il articule les missions des institutions clés comme l'<strong>APDP</strong> (Autorité de Protection des Données Personnelles), l'<strong>ARCEP</strong> (Autorité de Régulation des Communications Électroniques et de la Poste), l'<strong>ANSSI-Bénin</strong>, et le pôle judiciaire spécialisé de la <strong>CRIET</strong>.
          </p>
        </section>

        {/* Section 2 : Les 7 Livres du Code */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Structure des 7 Livres du Code du Numérique</span>
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
                Intelligence Artificielle & Recherche RAG Souveraine
              </h2>
              <p className="text-xs text-slate-500">Pipeline Retrieval-Augmented Generation avec ré-ordonnancement</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Pour éliminer tout risque d'hallucination ou d'approximation juridique, Numeris229 s'appuie sur une architecture <strong>RAG (Retrieval-Augmented Generation)</strong> :
          </p>

          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong>Indexation vectorielle ChromaDB :</strong> Les articles et chapitres de la loi sont découpés en fragments sémantiques et vectorisés avec des modèles d'embeddings spécialisés.
            </li>
            <li>
              <strong>Ré-ordonnancement sémantique (Reranker) :</strong> Lorsqu'une question est formulée, un algorithme de cross-encoder compare la requête avec les textes pertinents pour extraire les articles exacts.
            </li>
            <li>
              <strong>Génération conditionnée :</strong> Le modèle de langage rédige sa réponse en citant obligatoirement les livres et numéros d'articles de référence du droit béninois.
            </li>
          </ul>
        </section>

        {/* Section 4 : Avertissement & Non-responsabilité */}
        <section className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Avertissement Juridique & Clause de Non-responsabilité</span>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            Numeris229 est un système de recherche documentaire et d'assistance juridique automatisé. Bien que les réponses s'appuient sur les textes officiels de la République du Bénin, elles sont fournies à titre indicatif et éducatif.
          </p>

          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            L'utilisation de cette plateforme ne constitue en aucun cas une relation d'avocat à client et ne saurait se substituer aux conseils d'un avocat inscrit au Barreau du Bénin, aux avis officiels de l'APDP ou aux décisions des juridictions compétentes.
          </p>
        </section>

        {/* Bouton d'action final */}
        <div className="text-center pt-4">
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            <span>Démarrer une consultation</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
