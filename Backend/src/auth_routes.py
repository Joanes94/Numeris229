import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models import Utilisateur, JetonReinitialisation
from schemas import (
    UtilisateurCreation,
    UtilisateurMiseAJour,
    UtilisateurConnexion,
    UtilisateurReponse,
    MotDePasseOublieDemande,
    ReinitialisationDemande,
)
from securite import hacher_mot_de_passe, verifier_mot_de_passe, creer_token, decoder_token

router = APIRouter()
security = HTTPBearer()


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
def mot_de_passe_oublie(
    donnees: MotDePasseOublieDemande | None = Body(default=None),
    email: str | None = None,
    db: Session = Depends(get_db)
):
    email_cible = donnees.email if (donnees and donnees.email) else email
    if not email_cible:
        raise HTTPException(status_code=400, detail="Veuillez renseigner votre adresse email.")

    email_propre = str(email_cible).strip().lower()
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email_propre).first()
    if not utilisateur:
        return {"message": "Si cette adresse email est enregistrée, un lien de réinitialisation vous a été envoyé."}

    # Supprimer les anciens jetons non expirés pour cet utilisateur
    db.query(JetonReinitialisation).filter(JetonReinitialisation.email == email_propre).delete()

    jeton = str(uuid.uuid4())
    expiration = datetime.utcnow() + timedelta(hours=1)
    db.add(JetonReinitialisation(
        jeton=jeton,
        email=email_propre,
        date_expiration=expiration
    ))
    db.commit()

    lien_frontend = f"http://localhost:3000/mot-de-passe-oublie?jeton={jeton}"

    print("\n" + "=" * 65)
    print("[DEV] DEMANDE DE REINITIALISATION DE MOT DE PASSE")
    print(f"[DEV] Utilisateur : {email_propre}")
    print(f"[DEV] Jeton       : {jeton}")
    print(f"[DEV] Lien direct : {lien_frontend}")
    print("=" * 65 + "\n")

    return {
        "message": "Si cette adresse email est enregistrée, un lien de réinitialisation vous a été envoyé.",
        "jeton": jeton,
        "lien": lien_frontend,
        "mode_dev": True
    }


@router.post("/auth/reinitialiser")
def reinitialiser_mot_de_passe(
    donnees: ReinitialisationDemande | None = Body(default=None),
    jeton: str | None = None,
    nouveau_mot_de_passe: str | None = None,
    db: Session = Depends(get_db)
):
    jeton_val = donnees.jeton if (donnees and donnees.jeton) else jeton
    nouveau_mdp = donnees.nouveau_mot_de_passe if (donnees and donnees.nouveau_mot_de_passe) else nouveau_mot_de_passe

    if not jeton_val or not nouveau_mdp:
        raise HTTPException(status_code=400, detail="Le jeton et le nouveau mot de passe sont obligatoires.")

    jeton_val = str(jeton_val).strip()
    if len(nouveau_mdp) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit comporter au moins 6 caractères.")

    enregistrement = db.query(JetonReinitialisation).filter(JetonReinitialisation.jeton == jeton_val).first()
    if not enregistrement:
        raise HTTPException(status_code=400, detail="Jeton de réinitialisation invalide ou déjà utilisé.")

    if enregistrement.date_expiration < datetime.utcnow():
        db.delete(enregistrement)
        db.commit()
        raise HTTPException(status_code=400, detail="Ce jeton de réinitialisation a expiré. Veuillez refaire une demande.")

    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == enregistrement.email).first()
    if not utilisateur:
        db.delete(enregistrement)
        db.commit()
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    utilisateur.mot_de_passe_hash = hacher_mot_de_passe(nouveau_mdp)
    db.delete(enregistrement)
    db.commit()

    return {"message": "Mot de passe réinitialisé avec succès !"}