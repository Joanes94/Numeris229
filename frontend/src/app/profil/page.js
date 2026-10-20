"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Save,
  Trash2,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../components/LanguageContext";
import {
  obtenirProfil,
  modifierProfil,
  supprimerCompte,
  listerConversations,
  supprimerToken,
} from "../../lib/api";

export default function PageProfil() {
  const router = useRouter();
  const { t } = useLanguage();

  const [utilisateur, setUtilisateur] = useState(null);
  const [formulaire, setFormulaire] = useState({
    nom_prenoms: "",
    sexe: "M",
    age: "",
    profession: "",
    telephone: "",
  });

  const [nombreConversations, setNombreConversations] = useState(0);
  const [chargementInitial, setChargementInitial] = useState(true);
  const [chargementEnregistrement, setChargementEnregistrement] = useState(false);
  const [chargementSuppression, setChargementSuppression] = useState(false);

  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");
  const [modalSuppression, setModalSuppression] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const profil = await obtenirProfil();
        if (!profil) {
          router.push("/connexion");
          return;
        }
        setUtilisateur(profil);
        setFormulaire({
          nom_prenoms: profil.nom_prenoms || "",
          sexe: profil.sexe || "M",
          age: profil.age ? String(profil.age) : "",
          profession: profil.profession || "",
          telephone: profil.telephone || "",
        });

        // Compter les conversations
        const convs = await listerConversations();
        setNombreConversations(convs.length);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        router.push("/connexion");
      } finally {
        setChargementInitial(false);
      }
    }

    charger();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnregistrer = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");

    const ageNombre = parseInt(formulaire.age, 10);
    if (isNaN(ageNombre) || ageNombre < 10 || ageNombre > 120) {
      setErreur("Veuillez renseigner un âge valide (entre 10 et 120 ans).");
      return;
    }

    setChargementEnregistrement(true);

    try {
      const maj = await modifierProfil({
        nom_prenoms: formulaire.nom_prenoms.trim(),
        sexe: formulaire.sexe,
        age: ageNombre,
        profession: formulaire.profession.trim(),
        telephone: formulaire.telephone.trim(),
      });

      setUtilisateur(maj);
      setSucces("Profil mis à jour avec succès.");
      setTimeout(() => setSucces(""), 4000);
    } catch (err) {
      setErreur(err.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setChargementEnregistrement(false);
    }
  };

  const handleSupprimerCompte = async () => {
    setErreur("");
    setChargementSuppression(true);

    try {
      await supprimerCompte();
      router.push("/");
    } catch (err) {
      setErreur(err.message || "Impossible de supprimer le compte pour le moment.");
      setModalSuppression(false);
      setChargementSuppression(false);
    }
  };

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
          <span>Chargement de votre compte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Barre supérieure */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la consultation</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={handleDeconnexion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("nav.deconnexion")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* En-tête de page & Carte de profil récapitulative */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                {utilisateur?.nom_prenoms?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {utilisateur?.nom_prenoms}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{utilisateur?.email}</span>
                  </span>
                  <span>•</span>
                  <span>{utilisateur?.profession || "Non spécifié"}</span>
                </div>
              </div>
            </div>

            {/* Statistique rapide */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Dossiers de consultation</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {nombreConversations} conversation{nombreConversations > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {succes && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{succes}</span>
          </div>
        )}

        {erreur && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{erreur}</span>
          </div>
        )}

        {/* Formulaire de modification */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Informations personnelles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mettez à jour les données associées à votre compte Numeris229
            </p>
          </div>

          <form onSubmit={handleEnregistrer} className="space-y-4">
            
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Email (Lecture seule) & Téléphone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Adresse email (identifiant)
                </label>
                <input
                  type="email"
                  disabled
                  value={utilisateur?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Sexe, Âge & Profession */}
            <div className="grid sm:grid-cols-3 gap-4">
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                  min="12"
                  max="120"
                  required
                  value={formulaire.age}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={chargementEnregistrement}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {chargementEnregistrement ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Zone de Danger : Suppression du compte */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Zone de suppression définitive</span>
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-xl">
                Conformément au Livre V du Code du Numérique sur le droit à l'effacement, la suppression de votre compte effacera irrévocablement votre profil et tout l'historique de vos consultations.
              </p>
            </div>

            <button
              onClick={() => setModalSuppression(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>

      </main>

      {/* Modal de confirmation de suppression */}
      {modalSuppression && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirmer la suppression de votre compte ?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cette action est irréversible. Toutes vos conversations et données personnelles seront effacées de la base de données de Numeris229.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalSuppression(false)}
                disabled={chargementSuppression}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimerCompte}
                disabled={chargementSuppression}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {chargementSuppression ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Confirmer la suppression</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
