import os
import sys
from pathlib import Path

# Ajouter Backend/src au sys.path
chemin_src = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(chemin_src))

from database import SessionLocal, engine, Base
from models import Utilisateur
from securite import hacher_mot_de_passe

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@numeris229.bj").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin229#Secure").strip()
ADMIN_NOM = os.getenv("ADMIN_NOM", "Administrateur Numeris229").strip()

def seed_administrateur():
    print("=" * 60)
    print("SEEDING DU COMPTE ADMINISTRATEUR PRINCIPAL")
    print(f"Cible Base : {engine.url}")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existant = db.query(Utilisateur).filter(Utilisateur.email == ADMIN_EMAIL).first()
        if existant:
            print(f"[!] Le compte {ADMIN_EMAIL} existe déjà.")
            if existant.role != "admin" or not existant.est_actif:
                existant.role = "admin"
                existant.est_actif = True
                db.commit()
                print(f"[OK] Rôle promu vers 'admin' et statut réactivé pour {ADMIN_EMAIL}.")
            else:
                print(f"[OK] Le compte possède déjà le rôle 'admin'.")
        else:
            admin_user = Utilisateur(
                nom_prenoms=ADMIN_NOM,
                email=ADMIN_EMAIL,
                sexe="M",
                age=35,
                profession="Superviseur Juridique & Système",
                telephone="+229 01 00 00 00",
                mot_de_passe_hash=hacher_mot_de_passe(ADMIN_PASSWORD),
                role="admin",
                est_actif=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[SUCCES] Compte administrateur créé avec succès !")

        print("\nIdentifiants de connexion Admin :")
        print(f"  • Email       : {ADMIN_EMAIL}")
        print(f"  • Mot de passe: {ADMIN_PASSWORD}")
        print(f"  • Rôle        : admin")
        print("=" * 60)

    except Exception as e:
        print(f"[ERREUR] Échec du seed : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_administrateur()
