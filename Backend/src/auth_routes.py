import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models import Utilisateur
from schemas import UtilisateurCreation, UtilisateurMiseAJour, UtilisateurConnexion, UtilisateurReponse
from securite import hacher_mot_de_passe, verifier_mot_de_passe, creer_token, decoder_token

router = APIRouter()
security = HTTPBearer()

# Jetons de réinitialisation de mot de passe, en mémoire pour le MVP
jetons_reinitialisation = {}  # jeton -> (email, date_expiration)


def utilisateur_courant(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    email = decoder_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return utilisateur


@router.post("/auth/inscription", response_model=UtilisateurReponse)
def inscription(donnees: UtilisateurCreation, db: Session = Depends(get_db)):
    if db.query(Utilisateur).filter(Utilisateur.email == donnees.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    utilisateur = Utilisateur(
        nom_prenoms=donnees.nom_prenoms,
        email=donnees.email,
        sexe=donnees.sexe,
        age=donnees.age,
        profession=donnees.profession,
        telephone=donnees.telephone,
        mot_de_passe_hash=hacher_mot_de_passe(donnees.mot_de_passe),
    )
    db.add(utilisateur)
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


@router.post("/auth/connexion")
def connexion(donnees: UtilisateurConnexion, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == donnees.email).first()
    if not utilisateur or not verifier_mot_de_passe(donnees.mot_de_passe, utilisateur.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = creer_token(utilisateur.email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/auth/moi", response_model=UtilisateurReponse)
def mon_profil(utilisateur: Utilisateur = Depends(utilisateur_courant)):
    return utilisateur


@router.put("/auth/moi", response_model=UtilisateurReponse)
def modifier_profil(
    donnees: UtilisateurMiseAJour,
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: Session = Depends(get_db),
):
    for champ, valeur in donnees.model_dump(exclude_unset=True).items():
        setattr(utilisateur, champ, valeur)
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


@router.delete("/auth/moi")
def supprimer_compte(utilisateur: Utilisateur = Depends(utilisateur_courant), db: Session = Depends(get_db)):
    db.delete(utilisateur)
    db.commit()
    return {"message": "Compte supprimé"}


@router.post("/auth/mot-de-passe-oublie")
def mot_de_passe_oublie(email: str, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not utilisateur:
        return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}

    jeton = str(uuid.uuid4())
    jetons_reinitialisation[jeton] = (email, datetime.utcnow() + timedelta(hours=1))

    print(f"[DEV] Lien de réinitialisation : http://localhost:8000/auth/reinitialiser?jeton={jeton}")

    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}


@router.post("/auth/reinitialiser")
def reinitialiser_mot_de_passe(jeton: str, nouveau_mot_de_passe: str, db: Session = Depends(get_db)):
    info = jetons_reinitialisation.get(jeton)
    if not info or info[1] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")

    email, _ = info
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    utilisateur.mot_de_passe_hash = hacher_mot_de_passe(nouveau_mot_de_passe)
    db.commit()
    del jetons_reinitialisation[jeton]
    return {"message": "Mot de passe réinitialisé avec succès"}