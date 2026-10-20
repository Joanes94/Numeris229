"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Send,
  Loader2,
  Scale,
  Copy,
  CheckCheck,
  Menu,
  User,
  LogOut,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import AudioLecteur from "../../components/AudioLecteur";
import { useLanguage } from "../../components/LanguageContext";
import {
  obtenirProfil,
  listerConversations,
  creerConversation,
  obtenirConversation,
  poserQuestionConversation,
  renommerConversation,
  supprimerConversation,
  supprimerToken,
} from "../../lib/api";

function ContenuConsultation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, langue } = useLanguage();
  const questionUrl = searchParams.get("question") || "";

  // États principaux
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargementInitial, setChargementInitial] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [conversationActiveId, setConversationActiveId] = useState(null);
  const [conversationActive, setConversationActive] = useState(null);
  const [chargementConversation, setChargementConversation] = useState(false);

  // État de saisie & envoi
  const [questionTexte, setQuestionTexte] = useState("");
  const [chargementEnvoi, setChargementEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  // Interface & Sidebar
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const [idEnEdition, setIdEnEdition] = useState(null);
  const [titreEnEdition, setTitreEnEdition] = useState("");
  const [idEnSuppression, setIdEnSuppression] = useState(null);

  // Sources dépliées & Copie
  const [sourcesDepliees, setSourcesDepliees] = useState({});
  const [copieIndex, setCopieIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Suggestions de questions pour démarrer
  const suggestionsJuridiques = [
    {
      titre: t("sug.s1.titre"),
      texte: t("sug.s1.texte"),
      livre: t("sug.s1.livre"),
    },
    {
      titre: t("sug.s2.titre"),
      texte: t("sug.s2.texte"),
      livre: t("sug.s2.livre"),
    },
    {
      titre: t("sug.s3.titre"),
      texte: t("sug.s3.texte"),
      livre: t("sug.s3.livre"),
    },
    {
      titre: t("sug.s4.titre"),
      texte: t("sug.s4.texte"),
      livre: t("sug.s4.livre"),
    },
  ];

  // 1. Vérification de l'authentification et chargement initial
  useEffect(() => {
    async function initialiser() {
      try {
        const profil = await obtenirProfil();
        if (!profil) {
          router.push("/connexion");
          return;
        }
        setUtilisateur(profil);

        // Charger l'historique des conversations
        const liste = await listerConversations();
        setConversations(liste);

        if (liste.length > 0) {
          await chargerConversation(liste[0].id);
        } else {
          // Si aucune conversation existante, on en crée une nouvelle
          await handleNouvelleConversation(false);
        }
      } catch (err) {
        console.error("Erreur initialisation :", err);
        router.push("/connexion");
      } finally {
        setChargementInitial(false);
      }
    }

    initialiser();
  }, [router]);

  // Pré-remplissage éventuel de la question depuis l'URL (ex: depuis l'explorateur de lois)
  useEffect(() => {
    if (questionUrl) {
      setQuestionTexte(questionUrl);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [questionUrl]);

  // Scroll automatique en bas lors de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationActive?.messages, chargementEnvoi]);

  // Ajustement automatique de la hauteur du textarea
  const ajusterHauteurTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    ajusterHauteurTextarea();
  }, [questionTexte]);

  // Charger une conversation spécifique
  const chargerConversation = async (idConv) => {
    setErreur("");
    setChargementConversation(true);
    setConversationActiveId(idConv);

    try {
      const details = await obtenirConversation(idConv);
      setConversationActive(details);
    } catch (err) {
      setErreur(err.message || "Erreur de chargement de la conversation.");
    } finally {
      setChargementConversation(false);
      // Fermer la sidebar sur mobile après sélection
      if (window.innerWidth < 1024) {
        setSidebarOuverte(false);
      }
    }
  };

  // Créer une nouvelle conversation
  const handleNouvelleConversation = async (rechargerListe = true) => {
    try {
      setErreur("");
      const nouvelle = await creerConversation();
      const nouvelleConvObjet = {
        id: nouvelle.id,
        titre: "Nouvelle consultation",
        creee_le: new Date().toISOString(),
        messages: [],
      };

      setConversations((prev) => [nouvelleConvObjet, ...prev]);
      setConversationActiveId(nouvelle.id);
      setConversationActive(nouvelleConvObjet);

      if (window.innerWidth < 1024) {
        setSidebarOuverte(false);
      }

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return nouvelle.id;
    } catch (err) {
      setErreur(err.message || "Impossible de créer une nouvelle conversation.");
      return null;
    }
  };

  // Envoi d'une question
  const handleEnvoyerQuestion = async (texteAEnvoyer = null) => {
    const texte = (texteAEnvoyer || questionTexte).trim();
    if (!texte || chargementEnvoi) return;

    let convId = conversationActiveId;
    if (!convId) {
      convId = await handleNouvelleConversation();
    }
    if (!convId) return;

    setErreur("");
    setChargementEnvoi(true);
    setQuestionTexte("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Ajout optimiste du message de l'utilisateur dans l'affichage
    const nouveauMessageUtilisateur = {
      question: texte,
      reponse: null,
      sources: [],
      horodatage: new Date().toISOString(),
    };

    setConversationActive((prev) => {
      if (!prev) return { id: convId, titre: texte.slice(0, 30), messages: [nouveauMessageUtilisateur] };
      return {
        ...prev,
        messages: [...(prev.messages || []), nouveauMessageUtilisateur],
      };
    });

    try {
      const reponseApi = await poserQuestionConversation(convId, texte, langue);

      // Mise à jour de la réponse dans la conversation active
      setConversationActive((prev) => {
        if (!prev) return prev;
        const messagesModifies = [...prev.messages];
        const dernierIndex = messagesModifies.length - 1;
        if (dernierIndex >= 0) {
          messagesModifies[dernierIndex] = {
            ...messagesModifies[dernierIndex],
            reponse: reponseApi.reponse,
            sources: reponseApi.sources || [],
          };
        }
        return { ...prev, messages: messagesModifies };
      });

      // Rafraîchir la liste des conversations pour afficher le nouveau titre auto s'il a changé
      const majConversations = await listerConversations();
      setConversations(majConversations);
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue lors du traitement juridique.");
      // Retirer le message optimiste en cas d'échec
      setConversationActive((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.reponse !== null),
        };
      });
    } finally {
      setChargementEnvoi(false);
    }
  };

  // Renommer une conversation
  const demarrerEditionTitre = (conv, e) => {
    e.stopPropagation();
    setIdEnEdition(conv.id);
    setTitreEnEdition(conv.titre);
  };

  const validerEditionTitre = async (idConv, e) => {
    e?.stopPropagation();
    if (!titreEnEdition.trim()) {
      setIdEnEdition(null);
      return;
    }

    try {
      await renommerConversation(idConv, titreEnEdition.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === idConv ? { ...c, titre: titreEnEdition.trim() } : c))
      );
      if (conversationActiveId === idConv) {
        setConversationActive((prev) => (prev ? { ...prev, titre: titreEnEdition.trim() } : prev));
      }
    } catch (err) {
      setErreur("Erreur lors de la modification du titre.");
    } finally {
      setIdEnEdition(null);
    }
  };

  // Supprimer une conversation
  const handleSupprimerConversation = async (idConv, e) => {
    e?.stopPropagation();
    try {
      await supprimerConversation(idConv);
      const reste = conversations.filter((c) => c.id !== idConv);
      setConversations(reste);
      setIdEnSuppression(null);

      if (conversationActiveId === idConv) {
        if (reste.length > 0) {
          await chargerConversation(reste[0].id);
        } else {
          await handleNouvelleConversation(false);
        }
      }
    } catch (err) {
      setErreur(err.message || "Erreur lors de la suppression.");
    }
  };

  // Copier le texte d'une réponse
  const handleCopier = (texte, index) => {
    navigator.clipboard.writeText(texte);
    setCopieIndex(index);
    setTimeout(() => setCopieIndex(null), 2000);
  };

  // Déplier / replier les sources d'un message
  const toggleSources = (index) => {
    setSourcesDepliees((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Déconnexion
  const handleDeconnexion = () => {
    supprimerToken();
    router.push("/connexion");
  };

  if (chargementInitial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Logo size="lg" />
        <div className="mt-6 flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-700 dark:text-emerald-400" />
          <span>Chargement de votre espace de consultation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* ============================================================ */}
      {/* SIDEBAR GAUCHE (HISTORIQUE DES CONSULTATIONS & NAVIGATION)   */}
      {/* ============================================================ */}

      {/* Overlay mobile */}
      {sidebarOuverte && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOuverte(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOuverte ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* En-tête Sidebar : Logo & Bouton fermer mobile */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOuverte(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton Nouvelle Consultation */}
        <div className="p-3">
          <button
            onClick={() => handleNouvelleConversation()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Nouvelle consultation</span>
            </span>
            <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono">
              +
            </span>
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Historique ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-400">
              Aucune consultation pour l'instant.
            </div>
          ) : (
            conversations.map((conv) => {
              const estActive = conv.id === conversationActiveId;
              const estEnEdition = conv.id === idEnEdition;
              const estEnSuppression = conv.id === idEnSuppression;

              return (
                <div
                  key={conv.id}
                  onClick={() => !estEnEdition && chargerConversation(conv.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    estActive
                      ? "bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        estActive
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />

                    {estEnEdition ? (
                      <input
                        type="text"
                        autoFocus
                        value={titreEnEdition}
                        onChange={(e) => setTitreEnEdition(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") validerEditionTitre(conv.id, e);
                          if (e.key === "Escape") setIdEnEdition(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-emerald-600 text-xs text-slate-900 dark:text-white outline-none"
                      />
                    ) : (
                      <span className="truncate">{conv.titre || "Sans titre"}</span>
                    )}
                  </div>

                  {/* Actions (Éditer / Supprimer) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {estEnEdition ? (
                      <>
                        <button
                          onClick={(e) => validerEditionTitre(conv.id, e)}
                          title="Enregistrer"
                          className="p-1 rounded text-emerald-700 hover:bg-emerald-200/50"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdEnEdition(null);
                          }}
                          title="Annuler"
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : estEnSuppression ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 px-1 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        <button
                          onClick={(e) => handleSupprimerConversation(conv.id, e)}
                          className="text-[10px] text-rose-700 dark:text-rose-300 font-bold hover:underline"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdEnSuppression(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => demarrerEditionTitre(conv, e)}
                          title="Renommer"
                          className="p-1 rounded hover:bg-slate-300/50 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdEnSuppression(conv.id);
                          }}
                          title="Supprimer"
                          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Liens de navigation additionnels */}
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            href="/explorer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t("nav.explorer")}</span>
          </Link>
          <Link
            href="/profil"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>{t("nav.profil")}</span>
          </Link>
        </div>

        {/* Pied de sidebar : Profil connecté, thème & déconnexion */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {utilisateur?.nom_prenoms?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {utilisateur?.nom_prenoms || "Utilisateur"}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {utilisateur?.profession || utilisateur?.email || t("nav.citoyen")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <LanguageToggle compact className="!p-1.5" />
            <ThemeToggle className="!p-1.5" />
            <button
              onClick={handleDeconnexion}
              title={t("nav.deconnexion")}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* ZONE CENTRALE : CHAT DE CONSULTATION JURIDIQUE               */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
        
        {/* Barre supérieure de l'espace de consultation */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOuverte(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {conversationActive?.titre || "Nouvelle consultation"}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                <Scale className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span>Loi N° 2017-20</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            <ThemeToggle className="!p-1.5" />
            <button
              onClick={() => handleNouvelleConversation()}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("chat.nouvelle")}</span>
            </button>
          </div>
        </header>

        {/* Message d'erreur s'il y en a un */}
        {erreur && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erreur}</span>
            </div>
            <button onClick={() => setErreur("")} className="text-rose-600 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Corps des messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {chargementConversation ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs">Chargement des échanges...</span>
              </div>
            ) : (!conversationActive?.messages || conversationActive.messages.length === 0) ? (
              
              /* ÉCRAN D'ACCUEIL POUR CONVERSATION VIERGE */
              <div className="py-8 sm:py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Scale className="w-7 h-7" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("chat.titre")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {t("chat.sousTitre")}
                </p>

                {/* Suggestions cliquables */}
                <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
                  {suggestionsJuridiques.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEnvoyerQuestion(sug.texte)}
                      className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-700 dark:hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          {sug.livre}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                          {sug.titre}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          « {sug.texte} »
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                        <span>{t("chat.explorerCas")}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* LISTE DES MESSAGES DE LA CONVERSATION */
              conversationActive.messages.map((msg, index) => {
                const aSources = msg.sources && msg.sources.length > 0;
                const estDeplie = !!sourcesDepliees[index];

                return (
                  <div key={index} className="space-y-4">
                    
                    {/* Message Utilisateur */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-emerald-800 text-white px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                        {msg.question}
                      </div>
                    </div>

                    {/* Réponse Assistant */}
                    {msg.reponse ? (
                      <div className="flex justify-start">
                        <div className="w-full rounded-2xl rounded-tl-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm text-sm space-y-4">
                          
                          {/* En-tête assistant + bouton copier */}
                          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5 text-xs text-slate-500">
                            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200">
                              <div className="w-5 h-5 rounded-md bg-emerald-800 text-white flex items-center justify-center">
                                <Scale className="w-3 h-3" />
                              </div>
                              <span>Numeris229 • Analyse juridique</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <AudioLecteur texte={msg.reponse} />
                              <button
                                onClick={() => handleCopier(msg.reponse, index)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                                title={t("chat.copier")}
                              >
                                {copieIndex === index ? (
                                  <>
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">{t("chat.copie")}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{t("chat.copier")}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Contenu textuel de la réponse */}
                          <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                            {msg.reponse}
                          </div>

                          {/* Sources et Références du Code du Numérique */}
                          {aSources && (
                            <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
                              <button
                                onClick={() => toggleSources(index)}
                                className="w-full flex items-center justify-between py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:opacity-80 transition-opacity"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>
                                    {msg.sources.length} référence{msg.sources.length > 1 ? "s" : ""} juridique{msg.sources.length > 1 ? "s" : ""} citée{msg.sources.length > 1 ? "s" : ""}
                                  </span>
                                </span>
                                {estDeplie ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>

                              {estDeplie && (
                                <div className="mt-2.5 space-y-2">
                                  {msg.sources.map((src, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                                    >
                                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                                        <Scale className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                        <span>Extrait #{sIdx + 1}</span>
                                      </div>
                                      <p className="font-mono text-[11px] whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                                        {typeof src === "string" ? src : JSON.stringify(src, null, 2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    ) : null}

                  </div>
                );
              })
            )}

            {/* Animation de réflexion / recherche en cours */}
            {chargementEnvoi && (
              <div className="flex justify-start">
                <div className="w-full max-w-md rounded-2xl rounded-tl-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Recherche dans le Code du Numérique...
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Analyse des articles et formulation de la synthèse juridique
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* BARRE DE SAISIE EN BAS                                       */}
        {/* ============================================================ */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnvoyerQuestion();
              }}
              className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-2 sm:p-2.5 focus-within:ring-2 focus-within:ring-emerald-700 focus-within:border-emerald-700 transition-all shadow-sm"
            >
              <textarea
                ref={textareaRef}
                value={questionTexte}
                onChange={(e) => setQuestionTexte(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEnvoyerQuestion();
                  }
                }}
                rows={1}
                placeholder={t("chat.placeholder")}
                disabled={chargementEnvoi}
                className="w-full max-h-44 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none px-2 py-1 leading-relaxed"
              />

              <button
                type="submit"
                disabled={!questionTexte.trim() || chargementEnvoi}
                className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-800 text-white transition-colors shrink-0 shadow-sm"
                title={t("chat.envoyer")}
              >
                {chargementEnvoi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
              {t("chat.avertissement")}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function PageConsultation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
        </div>
      }
    >
      <ContenuConsultation />
    </Suspense>
  );
}
