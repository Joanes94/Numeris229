"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Filter,
  ArrowLeft,
  Scale,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Loader2,
  FileText,
  Copy,
  CheckCheck,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import AudioLecteur from "../../components/AudioLecteur";
import { useLanguage } from "../../components/LanguageContext";

export default function PageExplorer() {
  const router = useRouter();
  const { t } = useLanguage();

  const [articles, setArticles] = useState([]);
  const [livres, setLivres] = useState([]);
  const [livreSelectionne, setLivreSelectionne] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultats, setTotalResultats] = useState(0);
  const [chargement, setChargement] = useState(true);

  // Article sélectionné pour le modal de lecture
  const [articleSelectionne, setArticleSelectionne] = useState(null);
  const [copie, setCopie] = useState(false);

  // Charger la liste des livres au montage
  useEffect(() => {
    async function chargerLivres() {
      try {
        const res = await fetch("/api/articles?meta=livres");
        const data = await res.json();
        if (data.livres) {
          setLivres(data.livres);
        }
      } catch (err) {
        console.error("Erreur chargement livres :", err);
      }
    }
    chargerLivres();
  }, []);

  // Charger les articles avec filtres & pagination
  useEffect(() => {
    let actif = true;

    async function chargerArticles() {
      setChargement(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "15",
          ...(recherche.trim() ? { q: recherche.trim() } : {}),
          ...(livreSelectionne ? { livre: livreSelectionne } : {}),
        });

        const res = await fetch(`/api/articles?${params.toString()}`);
        const data = await res.json();

        if (actif) {
          setArticles(data.articles || []);
          setTotalPages(data.total_pages || 1);
          setTotalResultats(data.total || 0);
        }
      } catch (err) {
        console.error("Erreur chargement articles :", err);
      } finally {
        if (actif) setChargement(false);
      }
    }

    const timer = setTimeout(chargerArticles, 250);
    return () => {
      actif = false;
      clearTimeout(timer);
    };
  }, [recherche, livreSelectionne, page]);

  const handleCopierArticle = (art) => {
    const texteComplet = `Article ${art.numero} - ${art.titre || ""}\n${art.livre || ""}\n\n${art.texte}`;
    navigator.clipboard.writeText(texteComplet);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const interrogerAssistant = (art) => {
    router.push(`/consultation?question=Que+stipule+l'article+${art.numero}+du+Code+du+Numérique+?`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      
      {/* Barre supérieure institutionnelle */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:border-slate-800 hidden sm:block" />
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-2">
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

      {/* Bannière de recherche & en-tête */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <Scale className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t("exp.loiTitre")}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("exp.titre")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t("exp.sousTitre")}
          </p>

          {/* Formulaire de recherche et filtres */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
                placeholder={t("exp.recherche")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-colors"
              />
              {recherche && (
                <button
                  onClick={() => setRecherche("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={livreSelectionne}
              onChange={(e) => {
                setLivreSelectionne(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-colors shrink-0"
            >
              <option value="">{t("exp.tousLivres")}</option>
              {livres.map((l, i) => (
                <option key={i} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {totalResultats} {t("exp.article")}{totalResultats > 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Liste des Articles */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {chargement ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs">Chargement...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("exp.aucunResultat")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Essayez un autre mot-clé ou réinitialisez le filtre de sélection du Livre.
            </p>
            <button
              onClick={() => {
                setRecherche("");
                setLivreSelectionne("");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((art, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-emerald-700/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* En-tête de carte : Numéro & Livre */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs tracking-wide">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Article {art.numero}</span>
                    </span>

                    {art.livre && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {art.livre}
                      </span>
                    )}
                  </div>

                  {/* Titre si existant */}
                  {art.titre && (
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                      {art.titre}
                    </h2>
                  )}

                  {/* Extrait du texte de loi */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {art.texte}
                  </p>
                </div>

                {/* Actions sous l'article */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setArticleSelectionne(art)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>Lire le texte intégral</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <AudioLecteur texte={`Article ${art.numero}. ${art.titre || ""}. ${art.texte}`} />
                    <button
                      onClick={() => handleCopierArticle(art)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title={t("exp.copierArticle")}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => interrogerAssistant(art)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{t("exp.interrogerIa")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-3">
              {t("exp.page")} {page} {t("exp.sur")} {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Modal de lecture complète de l'article */}
      {articleSelectionne && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* En-tête du modal */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  Article {articleSelectionne.numero}
                </span>
                <span className="ml-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {articleSelectionne.livre}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AudioLecteur texte={`Article ${articleSelectionne.numero}. ${articleSelectionne.titre || ""}. ${articleSelectionne.texte}`} />
                <button
                  onClick={() => handleCopierArticle(articleSelectionne)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t("exp.copierArticle")}
                >
                  {copie ? (
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setArticleSelectionne(null)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t("exp.fermer")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corps du texte complet */}
            <div className="p-6 overflow-y-auto space-y-4">
              {articleSelectionne.titre && (
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {articleSelectionne.titre}
                </h3>
              )}

              {articleSelectionne.chapitre && (
                <div className="text-xs font-semibold text-slate-500">
                  {articleSelectionne.chapitre}
                </div>
              )}

              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-serif">
                {articleSelectionne.texte}
              </div>

              {articleSelectionne.modifie_par && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
                  <span className="font-bold">{t("exp.modifiePar")}</span> {articleSelectionne.modifie_par}
                </div>
              )}
            </div>

            {/* Pied du modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {t("exp.loiTitre")}
              </span>

              <button
                onClick={() => {
                  const art = articleSelectionne;
                  setArticleSelectionne(null);
                  interrogerAssistant(art);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("exp.poserQuestionIa")}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
