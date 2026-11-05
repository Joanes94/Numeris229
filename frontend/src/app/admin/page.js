"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Users,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Search,
  BookOpen,
  Clock,
  ArrowUpRight,
  Activity,
  ArrowLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../components/LanguageContext";
import {
  obtenirProfil,
  obtenirStatsAdmin,
  listerUtilisateursAdmin,
  modifierStatutUtilisateurAdmin,
  supprimerUtilisateurAdmin,
  listerSignalementsAdmin,
  traiterSignalementAdmin,
  obtenirInfoCorpusAdmin,
  reindexerCorpusAdmin,
} from "../../lib/api";

function ContenuPageAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const ongletParam = searchParams.get("onglet");

  const [utilisateur, setUtilisateur] = useState(null);
  const [estAdmin, setEstAdmin] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState(
    (ongletParam && ["vue_ensemble", "utilisateurs", "signalements", "corpus"].includes(ongletParam))
      ? ongletParam
      : "vue_ensemble"
  );

  // Données des onglets
  const [stats, setStats] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [corpusInfo, setCorpusInfo] = useState(null);

  // Filtres & pagination utilisateurs
  const [rechercheUser, setRechercheUser] = useState("");
  const [chargementAction, setChargementAction] = useState(false);
  const [messageSucces, setMessageSucces] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

  // Filtre signalements
  const [filtreStatutSig, setFiltreStatutSig] = useState("");

  // Réindexation corpus
  const [reindexEnCours, setReindexEnCours] = useState(false);

  // 1. Vérification de session et statut Administrateur
  useEffect(() => {
    async function verifierAcces() {
      try {
        const profil = await obtenirProfil();
        if (!profil || profil.role !== "admin") {
          setEstAdmin(false);
          setChargement(false);
          return;
        }
        setUtilisateur(profil);
        setEstAdmin(true);

        const cible = (ongletParam && ["vue_ensemble", "utilisateurs", "signalements", "corpus"].includes(ongletParam))
          ? ongletParam
          : "vue_ensemble";
        setOngletActif(cible);
        chargerDonneesOnglet(cible);
      } catch (err) {
        setEstAdmin(false);
      } finally {
        setChargement(false);
      }
    }
    verifierAcces();
  }, [ongletParam]);

  // 2. Chargement des données selon l'onglet
  async function chargerDonneesOnglet(onglet) {
    setMessageErreur("");
    try {
      if (onglet === "vue_ensemble") {
        const data = await obtenirStatsAdmin();
        setStats(data);
      } else if (onglet === "utilisateurs") {
        const data = await listerUtilisateursAdmin(1, 50, rechercheUser);
        setUtilisateurs(data);
      } else if (onglet === "signalements") {
        const data = await listerSignalementsAdmin(filtreStatutSig);
        setSignalements(data);
      } else if (onglet === "corpus") {
        const data = await obtenirInfoCorpusAdmin();
        setCorpusInfo(data);
      }
    } catch (err) {
      setMessageErreur(err.message || "Erreur de chargement des données");
    }
  }

  // Changement d'onglet
  function changerOnglet(onglet) {
    setOngletActif(onglet);
    chargerDonneesOnglet(onglet);
  }

  // Actions Utilisateurs
  async function changerStatutUser(userId, nouveauStatutActif) {
    setChargementAction(true);
    try {
      await modifierStatutUtilisateurAdmin(userId, { est_actif: nouveauStatutActif });
      setMessageSucces("Statut de l'utilisateur mis à jour.");
      chargerDonneesOnglet("utilisateurs");
    } catch (err) {
      setMessageErreur(err.message);
    } finally {
      setChargementAction(false);
    }
  }

  async function changerRoleUser(userId, nouveauRole) {
    setChargementAction(true);
    try {
      await modifierStatutUtilisateurAdmin(userId, { role: nouveauRole });
      setMessageSucces(`Rôle mis à jour vers : ${nouveauRole}`);
      chargerDonneesOnglet("utilisateurs");
    } catch (err) {
      setMessageErreur(err.message);
    } finally {
      setChargementAction(false);
    }
  }

  async function supprimerUser(userId, nom) {
    if (!confirm(`Supprimer définitivement le compte de ${nom} conformément au droit à l'effacement ?`)) {
      return;
    }
    setChargementAction(true);
    try {
      await supprimerUtilisateurAdmin(userId);
      setMessageSucces(`Compte de ${nom} supprimé.`);
      chargerDonneesOnglet("utilisateurs");
    } catch (err) {
      setMessageErreur(err.message);
    } finally {
      setChargementAction(false);
    }
  }

  // Actions Signalements
  async function traiterSignalement(id, statut, reponseAdmin = "") {
    try {
      await traiterSignalementAdmin(id, { statut, reponse_admin: reponseAdmin });
      setMessageSucces(`Signalement marqué comme : ${statut}`);
      chargerDonneesOnglet("signalements");
    } catch (err) {
      setMessageErreur(err.message);
    }
  }

  // Action Réindexation
  async function lancerReindexation() {
    if (!confirm("Voulez-vous recalculer tous les embeddings du corpus juridique ? Cette opération peut durer quelques instants.")) {
      return;
    }
    setReindexEnCours(true);
    setMessageSucces("");
    setMessageErreur("");
    try {
      const res = await reindexerCorpusAdmin();
      setMessageSucces(res.message);
      chargerDonneesOnglet("corpus");
    } catch (err) {
      setMessageErreur(err.message);
    } finally {
      setReindexEnCours(false);
    }
  }

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Activity className="w-8 h-8 animate-spin text-emerald-800" />
          <p className="text-sm font-medium">Vérification des droits d'administration...</p>
        </div>
      </div>
    );
  }

  if (!estAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Accès restreint</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Cette zone est réservée exclusivement aux administrateurs de la plateforme Numeris229.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barre supérieure d'administration */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Espace Administrateur
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 hidden md:inline">Connecté en tant que : <strong>{utilisateur?.nom_prenoms}</strong></span>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Espace Consultation</span>
            </Link>
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </Link>
          </div>
        </div>

        {/* Navigation des Onglets */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-1">
          <button
            onClick={() => changerOnglet("vue_ensemble")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              ongletActif === "vue_ensemble"
                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Vue d'ensemble & RAG</span>
          </button>

          <button
            onClick={() => changerOnglet("utilisateurs")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              ongletActif === "utilisateurs"
                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Utilisateurs (Livre V)</span>
          </button>

          <button
            onClick={() => changerOnglet("signalements")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              ongletActif === "signalements"
                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Signalements Juridiques</span>
          </button>

          <button
            onClick={() => changerOnglet("corpus")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              ongletActif === "corpus"
                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Corpus & Réindexation</span>
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Messages de retour */}
        {messageSucces && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{messageSucces}</span>
            </div>
            <button onClick={() => setMessageSucces("")} className="hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {messageErreur && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{messageErreur}</span>
            </div>
            <button onClick={() => setMessageErreur("")} className="hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 1 : VUE D'ENSEMBLE & MÉTRIQUES RAG                         */}
        {/* ================================================================= */}
        {ongletActif === "vue_ensemble" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tableau de bord de supervision RAG & Système
              </h2>
              <p className="text-xs text-slate-500">
                Observabilité en temps réel du pipeline juridique et de l'activité des citoyens.
              </p>
            </div>

            {/* Cartes de métriques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Citoyens Inscrits</span>
                  <Users className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.utilisateurs?.total || 0}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  {stats?.utilisateurs?.actifs || 0} comptes actifs
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Conversations RAG</span>
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.activite?.conversations || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {stats?.activite?.messages || 0} requêtes traitées
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Taux de Succès RAG</span>
                  <Activity className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.performance_rag?.taux_succes || 100}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Latence moy. : {stats?.performance_rag?.temps_moyen_ms || 0} ms
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Signalements Ouverts</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {stats?.activite?.signalements_ouverts || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  sur {stats?.activite?.signalements_total || 0} total
                </div>
              </div>
            </div>

            {/* Articles les plus demandés & Architecture */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  Articles les plus sollicités par les citoyens
                </h3>
                {stats?.performance_rag?.top_articles?.length > 0 ? (
                  <div className="space-y-2.5">
                    {stats.performance_rag.top_articles.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.article}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                          {item.frequence} consultations
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Aucune statistique de consultation enregistrée pour l'instant.
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-800" />
                  État de l'infrastructure
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Base de données</span>
                    <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      PostgreSQL (Neon.tech Cloud)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Chunks indexés</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {stats?.performance_rag?.chunks_corpus || 0} fragments
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Modèle Dense</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Solon 768-dim</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Modèle de Réponse (LLM)</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Ollama gemma3:1b</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 2 : GESTION DES UTILISATEURS (CONFORMITÉ LIVRE V)          */}
        {/* ================================================================= */}
        {ongletActif === "utilisateurs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Gestion des comptes utilisateurs
                </h2>
                <p className="text-xs text-slate-500">
                  Respect du Livre V (Protection des données à caractère personnel) & Contrôle des accès.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou email..."
                    value={rechercheUser}
                    onChange={(e) => setRechercheUser(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && chargerDonneesOnglet("utilisateurs")}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <button
                  onClick={() => chargerDonneesOnglet("utilisateurs")}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table des utilisateurs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nom & Prénoms</th>
                      <th className="px-4 py-3">Email & Téléphone</th>
                      <th className="px-4 py-3">Profession</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {utilisateurs.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">#{u.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {u.nom_prenoms}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div>{u.email}</div>
                          <div className="text-[10px] text-slate-400">{u.telephone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {u.profession} ({u.age} ans)
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role || "citoyen"}
                            onChange={(e) => changerRoleUser(u.id, e.target.value)}
                            disabled={chargementAction || u.id === utilisateur?.id}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                          >
                            <option value="citoyen">Citoyen</option>
                            <option value="juriste">Juriste</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.est_actif
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400"
                            }`}
                          >
                            {u.est_actif ? "Actif" : "Suspendu"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.id !== utilisateur?.id && (
                              <>
                                <button
                                  onClick={() => changerStatutUser(u.id, !u.est_actif)}
                                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                                    u.est_actif
                                      ? "border-amber-300 hover:bg-amber-50 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                                      : "border-emerald-300 hover:bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                                  }`}
                                  title={u.est_actif ? "Suspendre l'accès" : "Réactiver le compte"}
                                >
                                  {u.est_actif ? "Suspendre" : "Activer"}
                                </button>
                                <button
                                  onClick={() => supprimerUser(u.id, u.nom_prenoms)}
                                  className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                  title="Suppression définitive (Livre V)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 3 : GESTION DES SIGNALEMENTS JURIDIQUES                    */}
        {/* ================================================================= */}
        {ongletActif === "signalements" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Signalements & Retours de qualité juridique
                </h2>
                <p className="text-xs text-slate-500">
                  L'Administrateur agit en acteur secondaire pour valider et corriger les réponses du LLM.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filtreStatutSig}
                  onChange={(e) => {
                    setFiltreStatutSig(e.target.value);
                    chargerDonneesOnglet("signalements");
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="examine">Examiné</option>
                  <option value="resolu">Résolu</option>
                  <option value="rejete">Rejeté</option>
                </select>
                <button
                  onClick={() => chargerDonneesOnglet("signalements")}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {signalements.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold">Aucun signalement</h3>
                <p className="text-xs text-slate-500">Toutes les réponses de l'IA sont conformes et validées.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signalements.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-xs">#{s.id}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                          {s.motif}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(s.cree_le).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.statut === "en_attente"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : s.statut === "resolu"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {s.statut}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                      <div>
                        <strong className="text-slate-500 block mb-1">Question posée :</strong>
                        <p className="text-slate-800 dark:text-slate-200 italic font-serif">« {s.question} »</p>
                      </div>
                      <div>
                        <strong className="text-slate-500 block mb-1">Réponse générée par le RAG :</strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-3">{s.reponse}</p>
                      </div>
                    </div>

                    {s.commentaire && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                        <strong>Remarque de l'utilisateur :</strong> {s.commentaire}
                      </div>
                    )}

                    {/* Actions administrateur */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => traiterSignalement(s.id, "examine")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        Examiner
                      </button>
                      <button
                        onClick={() => traiterSignalement(s.id, "resolu", "Article ou chunk juridique mis à jour")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white"
                      >
                        Marquer comme Résolu
                      </button>
                      <button
                        onClick={() => traiterSignalement(s.id, "rejete", "Conforme au texte de loi")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 hover:bg-red-200 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 4 : GESTION DU CORPUS & RÉINDEXATION                      */}
        {/* ================================================================= */}
        {ongletActif === "corpus" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Base de Connaissances & Réindexation Vectorielle
              </h2>
              <p className="text-xs text-slate-500">
                Gérez le corpus juridique officiel et mettez à jour les représentations vectorielles Solon.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Corpus Officiel du Code du Numérique
                  </h3>
                  <p className="text-xs text-slate-500">
                    {corpusInfo?.textes_de_loi || "Code du Numérique (Loi N° 2017-20 / 2020-35)"}
                  </p>
                </div>

                <button
                  onClick={lancerReindexation}
                  disabled={reindexEnCours}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reindexEnCours ? "animate-spin" : ""}`} />
                  <span>{reindexEnCours ? "Réindexation en cours..." : "Relancer la réindexation"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-500 block mb-1">Nombre d'articles</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {corpusInfo?.nombre_articles || 600} articles
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-500 block mb-1">Fragments (Chunks)</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {corpusInfo?.nombre_chunks || 0} chunks
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-500 block mb-1">Taille embeddings</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {corpusInfo?.taille_embeddings_mo || 0} Mo
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-500 block mb-1">Modèle Dense</span>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate block">
                    Solon-embeddings-base
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PageAdmin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Activity className="w-8 h-8 animate-spin text-emerald-800" />
            <p className="text-sm font-medium">Chargement du tableau de bord...</p>
          </div>
        </div>
      }
    >
      <ContenuPageAdmin />
    </Suspense>
  );
}
