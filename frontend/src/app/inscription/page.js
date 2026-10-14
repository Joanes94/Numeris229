"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import { inscrireUtilisateur, connecterUtilisateur } from "../../lib/api";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PageInscription() {
  const router = useRouter();

  const [formulaire, setFormulaire] = useState({
    nom_prenoms: "",
    email: "",
    telephone: "",
    sexe: "M",
    age: "",
    profession: "",
    mot_de_passe: "",
    mot_de_passe_confirmation: "",
  });

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    // Vérification de la correspondance des mots de passe
    if (formulaire.mot_de_passe !== formulaire.mot_de_passe_confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const ageNombre = parseInt(formulaire.age, 10);
    if (isNaN(ageNombre) || ageNombre < 10 || ageNombre > 120) {
      setErreur("Veuillez saisir un âge valide.");
      return;
    }

    setChargement(true);

    try {
      // 1. Appel de création de compte
      await inscrireUtilisateur({
        nom_prenoms: formulaire.nom_prenoms.trim(),
        email: formulaire.email.trim(),
        telephone: formulaire.telephone.trim(),
        sexe: formulaire.sexe,
        age: ageNombre,
        profession: formulaire.profession.trim(),
        mot_de_passe: formulaire.mot_de_passe,
        mot_de_passe_confirmation: formulaire.mot_de_passe_confirmation,
      });

      setSucces(true);

      // 2. Connexion automatique pour une expérience fluide
      try {
        await connecterUtilisateur({
          email: formulaire.email.trim(),
          mot_de_passe: formulaire.mot_de_passe,
        });
        setTimeout(() => {
          router.push("/consultation");
        }, 1200);
      } catch {
        // En cas de souci sur l'auto-connexion, redirection vers la page de login
        setTimeout(() => {
          router.push("/connexion");
        }, 1500);
      }
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue lors de l'inscription.");
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barre supérieure */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* En-tête */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Créer un compte
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Accédez à la consultation du Code du Numérique
            </p>
          </div>

          {/* Message de succès */}
          {succes && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>Compte créé avec succès ! Connexion en cours...</span>
            </div>
          )}

          {/* Alerte d'erreur */}
          {erreur && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom & Prénoms */}
            <div>
              <label
                htmlFor="nom_prenoms"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Nom et Prénoms
              </label>
              <input
                id="nom_prenoms"
                name="nom_prenoms"
                type="text"
                required
                value={formulaire.nom_prenoms}
                onChange={handleChange}
                placeholder="Ex : Bio KOUAGOU"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
              />
            </div>

            {/* Email & Téléphone (Grille 2 colonnes) */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formulaire.email}
                  onChange={handleChange}
                  placeholder="nom@domaine.bj"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="telephone"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Téléphone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  value={formulaire.telephone}
                  onChange={handleChange}
                  placeholder="+229 01 02 03 04"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Sexe, Âge & Profession */}
            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label
                  htmlFor="sexe"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Sexe
                </label>
                <select
                  id="sexe"
                  name="sexe"
                  value={formulaire.sexe}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Âge
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="12"
                  max="120"
                  value={formulaire.age}
                  onChange={handleChange}
                  placeholder="Ex : 28"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="profession"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Profession
                </label>
                <input
                  id="profession"
                  name="profession"
                  type="text"
                  required
                  value={formulaire.profession}
                  onChange={handleChange}
                  placeholder="Ex : Juriste, Développeur..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Mots de passe (Grille 2 colonnes) */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label
                  htmlFor="mot_de_passe"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Mot de passe
                </label>
                <input
                  id="mot_de_passe"
                  name="mot_de_passe"
                  type="password"
                  required
                  value={formulaire.mot_de_passe}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="mot_de_passe_confirmation"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Confirmation
                </label>
                <input
                  id="mot_de_passe_confirmation"
                  name="mot_de_passe_confirmation"
                  type="password"
                  required
                  value={formulaire.mot_de_passe_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={chargement || succes}
              className="w-full mt-3 py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {chargement ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <span>S'inscrire</span>
              )}
            </button>
          </form>

          {/* Lien vers Connexion */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Vous possédez déjà un compte ?{" "}
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
