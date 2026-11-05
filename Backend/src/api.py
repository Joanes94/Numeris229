import os
import time
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from pipeline import Pipeline
from conversation import (
    creer_conversation,
    ajouter_message,
    obtenir_conversation,
    renommer_conversation,
    supprimer_conversation,
    lister_conversations
)
from database import Base, engine, get_db, migrer_base, auto_seed_admin
from auth_routes import router as auth_router, utilisateur_courant
from admin_routes import router as admin_router
from models import Utilisateur, Signalement, JournalRequete
from schemas import ConversationMiseAJour, SignalementCreation, SignalementReponse

app = FastAPI(title="Numeris229 API", version="2.0.0")

# Initialisation, migration et seed admin automatique (Neon PostgreSQL ou SQLite)
Base.metadata.create_all(bind=engine)
migrer_base()
auto_seed_admin()

# Inclusion des routeurs
app.include_router(auth_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = Pipeline()


class Question(BaseModel):
    texte: str
    langue: str | None = "fr"


class Reponse(BaseModel):
    reponse: str
    sources: list[str]


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Numeris229 API",
        "database": "PostgreSQL (Neon.tech)" if "postgres" in str(engine.url) else "SQLite local"
    }


@app.post("/question", response_model=Reponse)
def poser_question(
    q: Question,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    t_start = time.time()
    resultat = pipeline.repondre(q.texte, langue=q.langue or "fr")
    latence_ms = int((time.time() - t_start) * 1000)

    # Télémétrie RAG pour supervision Admin
    rep_min = resultat["reponse"].lower()
    est_succes = bool(resultat.get("sources")) and ("non trouvé" not in rep_min) and ("ne relève pas" not in rep_min) and ("not fall within" not in rep_min)
    try:
        log = JournalRequete(
            utilisateur_id=utilisateur.id,
            question=q.texte.strip(),
            langue=q.langue or "fr",
            temps_reponse_ms=latence_ms,
            articles_cites=", ".join(resultat.get("sources", [])),
            est_succes=est_succes
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[JournalRequete Log Error]: {e}")

    return resultat


@app.post("/conversation")
def nouvelle_conversation(
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    return {"id": creer_conversation(db, utilisateur.id)}


@app.post("/conversation/{id_conv}/question")
def poser_question_dans_conversation(
    id_conv: str,
    q: Question,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    t_start = time.time()
    resultat = pipeline.repondre(q.texte, langue=q.langue or "fr")
    latence_ms = int((time.time() - t_start) * 1000)

    ajouter_message(db, id_conv, q.texte, resultat["reponse"], resultat["sources"])

    # Télémétrie RAG pour supervision Admin
    rep_min = resultat["reponse"].lower()
    est_succes = bool(resultat.get("sources")) and ("non trouvé" not in rep_min) and ("ne relève pas" not in rep_min) and ("not fall within" not in rep_min)
    try:
        log = JournalRequete(
            utilisateur_id=utilisateur.id,
            question=q.texte.strip(),
            langue=q.langue or "fr",
            temps_reponse_ms=latence_ms,
            articles_cites=", ".join(resultat.get("sources", [])),
            est_succes=est_succes
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[JournalRequete Log Error]: {e}")

    return resultat


@app.get("/conversations")
def lister_toutes_conversations(
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    return lister_conversations(db, utilisateur.id)


@app.get("/conversation/{id_conv}")
def lire_conversation(
    id_conv: str,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    conv = obtenir_conversation(db, id_conv, utilisateur.id)
    if not conv:
        return JSONResponse(status_code=404, content={"erreur": "Conversation introuvable"})
    return conv


@app.patch("/conversation/{id_conv}")
@app.put("/conversation/{id_conv}")
def renommer_une_conversation(
    id_conv: str,
    donnees: ConversationMiseAJour,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    succes = renommer_conversation(db, id_conv, utilisateur.id, donnees.titre)
    if not succes:
        return JSONResponse(status_code=404, content={"erreur": "Conversation introuvable"})
    return {"message": "Conversation renommée avec succès", "id": id_conv, "titre": donnees.titre}


@app.delete("/conversation/{id_conv}")
def supprimer_une_conversation(
    id_conv: str,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    succes = supprimer_conversation(db, id_conv, utilisateur.id)
    if not succes:
        return JSONResponse(status_code=404, content={"erreur": "Conversation introuvable"})
    return {"message": "Conversation supprimée avec succès", "id": id_conv}


# ==============================================================================
# RETOURS UTILISATEURS / SIGNALEMENTS (POUR L'ADMIN ACTEUR SECONDAIRE)
# ==============================================================================

@app.post("/signalement", response_model=SignalementReponse)
def soumettre_signalement(
    donnees: SignalementCreation,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db)
):
    """
    Permet à un utilisateur de signaler une anomalie ou une réponse imprécise à l'admin.
    """
    sig = Signalement(
        utilisateur_id=utilisateur.id,
        conversation_id=donnees.conversation_id,
        question=donnees.question.strip(),
        reponse=donnees.reponse.strip(),
        motif=donnees.motif,
        commentaire=donnees.commentaire.strip() if donnees.commentaire else None,
        statut="en_attente"
    )
    db.add(sig)
    db.commit()
    db.refresh(sig)
    return sig


@app.exception_handler(Exception)
async def gestion_erreurs(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"erreur": f"Une erreur interne est survenue : {str(exc)}"})
