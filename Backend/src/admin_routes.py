import os
import json
import time
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import get_db
from models import Utilisateur, Conversation, Message, Signalement, JournalRequete
from schemas import (
    UtilisateurReponse,
    UtilisateurStatutModif,
    SignalementReponse,
    SignalementTraitement,
    SignalementCreation
)
from auth_routes import utilisateur_courant, exiger_admin

router = APIRouter(prefix="/admin", tags=["Administration"])


# ==============================================================================
# 1. TABLEAU DE BORD & MÉTRIQUES D'OBSERVABILITÉ DU RAG
# ==============================================================================

@router.get("/stats")
def statistiques_globales(
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    total_utilisateurs = db.query(Utilisateur).count()
    utilisateurs_actifs = db.query(Utilisateur).filter(Utilisateur.est_actif == True).count()
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()

    total_signalements = db.query(Signalement).count()
    signalements_en_attente = db.query(Signalement).filter(Signalement.statut == "en_attente").count()

    # Statistiques du journal de requêtes RAG
    total_requetes = db.query(JournalRequete).count()
    requetes_succes = db.query(JournalRequete).filter(JournalRequete.est_succes == True).count()
    taux_succes = round((requetes_succes / total_requetes * 100), 1) if total_requetes > 0 else 100.0

    temps_moyen = db.query(func.avg(JournalRequete.temps_reponse_ms)).scalar()
    temps_moyen_ms = round(temps_moyen or 0, 1)

    # Top 5 des articles les plus sollicités
    requetes_articles = db.query(JournalRequete.articles_cites).filter(JournalRequete.articles_cites.isnot(None)).all()
    compteur_articles = {}
    for (arts,) in requetes_articles:
        if arts:
            for art in arts.split(","):
                art_propre = art.strip()
                if art_propre:
                    compteur_articles[art_propre] = compteur_articles.get(art_propre, 0) + 1

    top_articles = sorted(
        [{"article": k, "frequence": v} for k, v in compteur_articles.items()],
        key=lambda x: x["frequence"],
        reverse=True
    )[:5]

    # Nombre d'articles du corpus officiel
    chemin_chunks = Path(__file__).resolve().parents[1] / "data" / "chunks.json"
    nb_chunks = 0
    if chemin_chunks.exists():
        try:
            with open(chemin_chunks, "r", encoding="utf-8") as f:
                nb_chunks = len(json.load(f))
        except Exception:
            pass

    return {
        "utilisateurs": {
            "total": total_utilisateurs,
            "actifs": utilisateurs_actifs,
            "suspendus": total_utilisateurs - utilisateurs_actifs,
        },
        "activite": {
            "conversations": total_conversations,
            "messages": total_messages,
            "signalements_ouverts": signalements_en_attente,
            "signalements_total": total_signalements,
        },
        "performance_rag": {
            "total_requetes": total_requetes,
            "taux_succes": taux_succes,
            "temps_moyen_ms": temps_moyen_ms,
            "chunks_corpus": nb_chunks,
            "top_articles": top_articles,
        }
    }


# ==============================================================================
# 2. GESTION DES UTILISATEURS (ADMINISTRATION & CONFORMITÉ LIVRE V)
# ==============================================================================

@router.get("/utilisateurs", response_model=list[UtilisateurReponse])
def lister_utilisateurs(
    page: int = Query(1, ge=1),
    limite: int = Query(50, ge=1, le=100),
    recherche: str | None = None,
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    requete = db.query(Utilisateur)
    if recherche and recherche.strip():
        terme = f"%{recherche.strip()}%"
        requete = requete.filter(
            (Utilisateur.nom_prenoms.ilike(terme)) |
            (Utilisateur.email.ilike(terme)) |
            (Utilisateur.profession.ilike(terme))
        )
    
    offset = (page - 1) * limite
    return requete.order_by(desc(Utilisateur.id)).offset(offset).limit(limite).all()


@router.patch("/utilisateurs/{user_id}", response_model=UtilisateurReponse)
def modifier_statut_utilisateur(
    user_id: int,
    donnees: UtilisateurStatutModif,
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    # Empêcher l'admin de se rétrograder lui-même accidentellement
    if utilisateur.id == admin.id and donnees.role and donnees.role != "admin":
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas révoquer vos propres droits administrateur.")

    if donnees.est_actif is not None:
        utilisateur.est_actif = donnees.est_actif
    if donnees.role is not None:
        if donnees.role not in ["citoyen", "admin", "juriste"]:
            raise HTTPException(status_code=400, detail="Rôle invalide. Choisissez 'citoyen', 'admin' ou 'juriste'.")
        utilisateur.role = donnees.role

    db.commit()
    db.refresh(utilisateur)
    return utilisateur


@router.delete("/utilisateurs/{user_id}")
def supprimer_utilisateur(
    user_id: int,
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte admin ici.")

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    db.delete(utilisateur)
    db.commit()
    return {"message": f"Utilisateur {utilisateur.nom_prenoms} supprimé avec succès."}


# ==============================================================================
# 3. GESTION DES SIGNALEMENTS / QUALITÉ JURIDIQUE (ADMIN ACTEUR SECONDAIRE)
# ==============================================================================

@router.get("/signalements", response_model=list[SignalementReponse])
def lister_signalements(
    statut: str | None = None,
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Signalement)
    if statut:
        query = query.filter(Signalement.statut == statut)
    return query.order_by(desc(Signalement.cree_le)).all()


@router.patch("/signalements/{signalement_id}", response_model=SignalementReponse)
def traiter_signalement(
    signalement_id: int,
    donnees: SignalementTraitement,
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    sig = db.query(Signalement).filter(Signalement.id == signalement_id).first()
    if not sig:
        raise HTTPException(status_code=404, detail="Signalement introuvable.")

    sig.statut = donnees.statut
    if donnees.reponse_admin:
        sig.reponse_admin = donnees.reponse_admin
    sig.traite_le = datetime.utcnow()

    db.commit()
    db.refresh(sig)
    return sig


# ==============================================================================
# 4. GESTION DU CORPUS & RÉINDEXATION DU RAG
# ==============================================================================

@router.get("/corpus/info")
def info_corpus(admin: Utilisateur = Depends(exiger_admin)):
    data_dir = Path(__file__).resolve().parents[1] / "data"
    chunks_path = data_dir / "chunks.json"
    articles_path = data_dir / "articles_prets.json"
    embeddings_path = data_dir / "embeddings.npy"

    nb_articles = 0
    nb_chunks = 0
    taille_embeddings_mo = 0.0

    if articles_path.exists():
        try:
            with open(articles_path, "r", encoding="utf-8") as f:
                nb_articles = len(json.load(f))
        except Exception:
            pass

    if chunks_path.exists():
        try:
            with open(chunks_path, "r", encoding="utf-8") as f:
                nb_chunks = len(json.load(f))
        except Exception:
            pass

    if embeddings_path.exists():
        taille_embeddings_mo = round(embeddings_path.stat().st_size / (1024 * 1024), 2)

    return {
        "textes_de_loi": "Code du Numérique (Loi N° 2017-20 modifiée par la Loi N° 2020-35)",
        "nombre_articles": nb_articles,
        "nombre_chunks": nb_chunks,
        "taille_embeddings_mo": taille_embeddings_mo,
        "modele_dense": "OrdalieTech/Solon-embeddings-base-0.1 (768-dim)",
        "modele_reranker": "antoinelouis/crossencoder-camembert-base-mmarcoFR",
        "modele_generation": "Ollama (gemma3:1b)",
        "derniere_mise_a_jour": datetime.fromtimestamp(chunks_path.stat().st_mtime).isoformat() if chunks_path.exists() else None
    }


@router.post("/corpus/reindexer")
def reindexer_corpus(
    admin: Utilisateur = Depends(exiger_admin),
    db: Session = Depends(get_db)
):
    """
    Déclenche le re-calcul des embeddings et recharge le retriever sans couper le serveur.
    """
    from api import pipeline
    t_start = time.time()
    try:
        # Recharger le corpus et recalculer les embeddings
        data_dir = Path(__file__).resolve().parents[1] / "data"
        embeddings_path = data_dir / "embeddings.npy"
        
        # Supprimer le cache d'embeddings pour forcer le recalcul
        if embeddings_path.exists():
            embeddings_path.unlink()

        # Réinitialiser le retriever avec le nouveau calcul
        from retriever import Retriever
        pipeline.retriever = Retriever()

        duree = round(time.time() - t_start, 2)
        return {
            "statut": "succes",
            "message": f"Réindexation du corpus réussie en {duree} secondes.",
            "nombre_chunks": len(pipeline.retriever.chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Échec de la réindexation : {str(e)}")
