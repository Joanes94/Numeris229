import os
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
from database import Base, engine, get_db
from auth_routes import router as auth_router, utilisateur_courant
from models import Utilisateur
from schemas import ConversationMiseAJour

app = FastAPI()

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en vraie prod
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
    return {"status": "ok"}


@app.post("/question", response_model=Reponse)
def poser_question(q: Question, utilisateur: Utilisateur = Depends(utilisateur_courant)):
    return pipeline.repondre(q.texte, langue=q.langue or "fr")


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
    resultat = pipeline.repondre(q.texte, langue=q.langue or "fr")
    ajouter_message(db, id_conv, q.texte, resultat["reponse"], resultat["sources"])
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


@app.exception_handler(Exception)
async def gestion_erreurs(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"erreur": "Une erreur interne est survenue."})