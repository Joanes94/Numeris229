"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import { motDePasseOublie, reinitialiserMotDePasse } from "../../lib/api";

function FormulaireMotDePasseOublie() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const jetonUrl = searchParams.get("jeton") || "";

  // État du mode : "demande" ou "reinitialisation"
  const [jeton, setJeton] = useState(jetonUrl);
  const [email, setEmail] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    if (jetonUrl) {
      setJeton(jetonUrl);
    }
  }, [jetonUrl]);

  // Étape 1 : Demande de réinitialisation par email
  const handleDemande = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      const reponse = await motDePasseOublie(email.trim());
      setSucces(reponse.message || "Si cette adresse est enregistrée, vous recevrez les instructions de réinitialisation.");
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue lors de la demande.");
    } finally {
      setChargement(false);
    }
  };

  // Étape 2 : Réinitialisation effective avec le jeton
  const handleReinitialiser = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");

    if (!jeton.trim()) {
      setErreur("Le jeton de sécurité est manquant.");
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setErreur("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);

    try {
      const reponse = await reinitialiserMotDePasse(jeton.trim(), nouveauMotDePasse);
      setSucces(reponse.message || "Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        router.push("/connexion");
      }, 2000);
    } catch (err) {
      setErreur(err.message || "Le lien ou le jeton de réinitialisation est invalide.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Barre supérieure */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la connexion</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* En-tête */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {jeton ? "Nouveau mot de passe" : "Mot de passe oublié"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {jeton
                ? "Définissez un nouveau mot de passe pour sécuriser votre compte"
                : "Saisissez votre email pour recevoir les instructions de récupération"}
            </p>
          </div>

          {/* Succès */}
          {succes && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{succes}</span>
            </div>
          )}

          {/* Erreur */}
          {erreur && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          {/* Formulaire 1 : Demande de jeton par email */}
          {!jeton ? (
            <form onSubmit={handleDemande} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.bj"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {chargement ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <span>Envoyer le lien de réinitialisation</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Vous possédez déjà un jeton de réinitialisation ?{" "}
                <button
                  type="button"
                  onClick={() => setJeton("jeton-manuel")}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Saisir le jeton
                </button>
              </div>
            </form>
          ) : (
            /* Formulaire 2 : Nouveau mot de passe */
            <form onSubmit={handleReinitialiser} className="space-y-4">
              <div>
                <label
                  htmlFor="jeton"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Jeton de sécurité
                </label>
                <input
                  id="jeton"
                  type="text"
                  required
                  value={jeton === "jeton-manuel" ? "" : jeton}
                  onChange={(e) => setJeton(e.target.value)}
                  placeholder="Ex : 49a7e0d3-..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-mono transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="nouveauMotDePasse"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="nouveauMotDePasse"
                  type="password"
                  required
                  value={nouveauMotDePasse}
                  onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmationMotDePasse"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmationMotDePasse"
                  type="password"
                  required
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {chargement ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Enregistrer le nouveau mot de passe</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setJeton("")}
                  className="text-slate-600 dark:text-slate-400 hover:underline"
                >
                  Recommencer la demande par email
                </button>
              </div>
            </form>
          )}

          {/* Lien vers Connexion */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link
              href="/connexion"
              className="font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
            >
              Se connecter
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PageMotDePasseOublie() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
        </div>
      }
    >
      <FormulaireMotDePasseOublie />
    </Suspense>
  );
}
