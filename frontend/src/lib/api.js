/**
 * Service API complet pour la communication avec le backend Numeris229 FastAPI.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const TOKEN_KEY = "numeris229_token";
export const ROLE_KEY = "numeris229_user_role";

// ==========================================
// GESTION DU TOKEN D'AUTHENTIFICATION & DU RÔLE
// ==========================================

export function sauvegarderToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function obtenirToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function sauvegarderRole(role) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ROLE_KEY, role || "citoyen");
  }
}

export function obtenirRole() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ROLE_KEY) || "citoyen";
  }
  return "citoyen";
}

export function estRoleAdmin() {
  return obtenirRole() === "admin";
}

export function supprimerToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}

function entetesAuth() {
  const token = obtenirToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ==========================================
// AUTHENTIFICATION & COMPTE UTILISATEUR
// ==========================================

// Inscription d'un nouvel utilisateur
export async function inscrireUtilisateur(donnees) {
  const reponse = await fetch(`${API_URL}/auth/inscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Échec de l'inscription");
  }
  return resultat;
}

// Connexion de l'utilisateur
export async function connecterUtilisateur(donnees) {
  const reponse = await fetch(`${API_URL}/auth/connexion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Email ou mot de passe incorrect");
  }

  if (resultat.access_token) {
    sauvegarderToken(resultat.access_token);
  }
  if (resultat.role) {
    sauvegarderRole(resultat.role);
  }
  return resultat;
}

// Obtenir le profil de l'utilisateur connecté
export async function obtenirProfil() {
  const token = obtenirToken();
  if (!token) return null;

  try {
    const reponse = await fetch(`${API_URL}/auth/moi`, {
      headers: entetesAuth(),
    });

    if (!reponse.ok) {
      if (reponse.status === 401) {
        supprimerToken();
      }
      return null;
    }
    const data = await reponse.json();
    if (data && data.role) {
      sauvegarderRole(data.role);
    }
    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération du profil :", err);
    return null;
  }
}

// Modifier le profil de l'utilisateur connecté
export async function modifierProfil(donnees) {
  const reponse = await fetch(`${API_URL}/auth/moi`, {
    method: "PUT",
    headers: entetesAuth(),
    body: JSON.stringify(donnees),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Échec de la mise à jour du profil");
  }
  return resultat;
}

// Supprimer le compte de l'utilisateur
export async function supprimerCompte() {
  const reponse = await fetch(`${API_URL}/auth/moi`, {
    method: "DELETE",
    headers: entetesAuth(),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Échec de la suppression du compte");
  }
  supprimerToken();
  return resultat;
}

// Demande de réinitialisation de mot de passe oublié
export async function motDePasseOublie(email) {
  const reponse = await fetch(`${API_URL}/auth/mot-de-passe-oublie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur lors de la demande de réinitialisation");
  }
  return resultat;
}

// Validation de la réinitialisation de mot de passe
export async function reinitialiserMotDePasse(jeton, nouveauMotDePasse) {
  const reponse = await fetch(`${API_URL}/auth/reinitialiser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jeton: jeton.trim(),
      nouveau_mot_de_passe: nouveauMotDePasse,
    }),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Le lien de réinitialisation est invalide ou expiré");
  }
  return resultat;
}

// ==========================================
// CONVERSATIONS & QUESTIONS RAG (ASSISTANT)
// ==========================================

// Créer une nouvelle conversation
export async function creerConversation() {
  const reponse = await fetch(`${API_URL}/conversation`, {
    method: "POST",
    headers: entetesAuth(),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Impossible de créer la conversation");
  }
  return resultat; // { id: "..." }
}

// Lister toutes les conversations de l'utilisateur
export async function listerConversations() {
  const reponse = await fetch(`${API_URL}/conversations`, {
    method: "GET",
    headers: entetesAuth(),
  });

  if (!reponse.ok) {
    if (reponse.status === 401) {
      supprimerToken();
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }
    const resultat = await reponse.json();
    throw new Error(resultat.detail || "Impossible de récupérer l'historique");
  }
  return await reponse.json(); // [{ id, titre, creee_le }]
}

// Obtenir le détail et tous les messages d'une conversation
export async function obtenirConversation(idConv) {
  const reponse = await fetch(`${API_URL}/conversation/${idConv}`, {
    method: "GET",
    headers: entetesAuth(),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.erreur || resultat.detail || "Conversation introuvable");
  }
  return resultat; // { id, titre, creee_le, messages: [...] }
}

// Poser une question dans une conversation existante
export async function poserQuestionConversation(idConv, texte, langue = "fr") {
  const reponse = await fetch(`${API_URL}/conversation/${idConv}/question`, {
    method: "POST",
    headers: entetesAuth(),
    body: JSON.stringify({ texte, langue }),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || resultat.erreur || "Erreur lors du traitement de la question");
  }
  return resultat; // { reponse: "...", sources: [...] }
}

// Renommer une conversation
export async function renommerConversation(idConv, titre) {
  const reponse = await fetch(`${API_URL}/conversation/${idConv}`, {
    method: "PATCH",
    headers: entetesAuth(),
    body: JSON.stringify({ titre }),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || resultat.erreur || "Impossible de renommer la conversation");
  }
  return resultat;
}

// Supprimer une conversation
export async function supprimerConversation(idConv) {
  const reponse = await fetch(`${API_URL}/conversation/${idConv}`, {
    method: "DELETE",
    headers: entetesAuth(),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || resultat.erreur || "Impossible de supprimer la conversation");
  }
  return resultat;
}

// Poser une question directe (sans persistance en conversation)
export async function poserQuestionDirecte(texte, langue = "fr") {
  const reponse = await fetch(`${API_URL}/question`, {
    method: "POST",
    headers: entetesAuth(),
    body: JSON.stringify({ texte, langue }),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur lors de la question");
  }
  return resultat;
}

// ==========================================
// SIGNALEMENT / RETOUR QUALITÉ (POUR L'ADMIN)
// ==========================================

export async function envoyerSignalement(donnees) {
  const reponse = await fetch(`${API_URL}/signalement`, {
    method: "POST",
    headers: entetesAuth(),
    body: JSON.stringify(donnees),
  });

  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur lors de l'envoi du signalement");
  }
  return resultat;
}

// ==========================================
// ADMINISTRATION & SUPERVISION RAG
// ==========================================

export async function obtenirStatsAdmin() {
  const reponse = await fetch(`${API_URL}/admin/stats`, {
    method: "GET",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur récupération statistiques admin");
  }
  return resultat;
}

export async function listerUtilisateursAdmin(page = 1, limite = 50, recherche = "") {
  const params = new URLSearchParams({ page: String(page), limite: String(limite) });
  if (recherche) params.append("recherche", recherche);

  const reponse = await fetch(`${API_URL}/admin/utilisateurs?${params.toString()}`, {
    method: "GET",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur récupération utilisateurs");
  }
  return resultat;
}

export async function modifierStatutUtilisateurAdmin(userId, donnees) {
  const reponse = await fetch(`${API_URL}/admin/utilisateurs/${userId}`, {
    method: "PATCH",
    headers: entetesAuth(),
    body: JSON.stringify(donnees),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur modification utilisateur");
  }
  return resultat;
}

export async function supprimerUtilisateurAdmin(userId) {
  const reponse = await fetch(`${API_URL}/admin/utilisateurs/${userId}`, {
    method: "DELETE",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur suppression utilisateur");
  }
  return resultat;
}

export async function listerSignalementsAdmin(statut = "") {
  const url = statut ? `${API_URL}/admin/signalements?statut=${statut}` : `${API_URL}/admin/signalements`;
  const reponse = await fetch(url, {
    method: "GET",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur récupération signalements");
  }
  return resultat;
}

export async function traiterSignalementAdmin(id, donnees) {
  const reponse = await fetch(`${API_URL}/admin/signalements/${id}`, {
    method: "PATCH",
    headers: entetesAuth(),
    body: JSON.stringify(donnees),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur traitement signalement");
  }
  return resultat;
}

export async function obtenirInfoCorpusAdmin() {
  const reponse = await fetch(`${API_URL}/admin/corpus/info`, {
    method: "GET",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur récupération infos corpus");
  }
  return resultat;
}

export async function reindexerCorpusAdmin() {
  const reponse = await fetch(`${API_URL}/admin/corpus/reindexer`, {
    method: "POST",
    headers: entetesAuth(),
  });
  const resultat = await reponse.json();
  if (!reponse.ok) {
    throw new Error(resultat.detail || "Erreur lors de la réindexation");
  }
  return resultat;
}
