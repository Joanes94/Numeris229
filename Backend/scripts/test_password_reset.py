import sys
from pathlib import Path

# Add backend/src to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from database import Base, engine, SessionLocal
from models import Utilisateur, JetonReinitialisation
from schemas import UtilisateurCreation, MotDePasseOublieDemande, ReinitialisationDemande, UtilisateurConnexion
from auth_routes import mot_de_passe_oublie, reinitialiser_mot_de_passe, connexion, inscription
from securite import verifier_mot_de_passe

def test_reinitialisation_flux():
    print("=== DÉBUT DU TEST DE RÉINITIALISATION DE MOT DE PASSE ===")
    
    # 1. Assurer la création des tables SQLite
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    test_email = "test_reset@numeris229.bj"
    mdp_initial = "AncienMotDePasse123"
    nouveau_mdp = "NouveauMotDePasse456!"

    try:
        # Nettoyage préalable pour le test
        db.query(Utilisateur).filter(Utilisateur.email == test_email).delete()
        db.query(JetonReinitialisation).filter(JetonReinitialisation.email == test_email).delete()
        db.commit()

        # 2. Inscription de l'utilisateur de test
        print(f"\n1. Inscription utilisateur test ({test_email})...")
        user_data = UtilisateurCreation(
            nom_prenoms="Test Reset User",
            email=test_email,
            sexe="M",
            age=30,
            profession="Développeur",
            telephone="97000000",
            mot_de_passe=mdp_initial,
            mot_de_passe_confirmation=mdp_initial
        )
        inscription(user_data, db=db)
        print("  [OK] Utilisateur cree avec succes.")

        # 3. Test de connexion avec l'ancien mot de passe
        conn_initial = connexion(UtilisateurConnexion(email=test_email, mot_de_passe=mdp_initial), db=db)
        assert "access_token" in conn_initial
        print("  [OK] Connexion avec l'ancien mot de passe reussie.")

        # 4. Demande de réinitialisation (mot_de_passe_oublie)
        print("\n2. Demande de reinitialisation de mot de passe...")
        demande = MotDePasseOublieDemande(email=test_email)
        res_demande = mot_de_passe_oublie(donnees=demande, db=db)
        print(f"  [OK] Reponse backend : {res_demande['message']}")
        jeton = res_demande.get("jeton")
        assert jeton is not None, "Le jeton n'a pas ete retourne en mode dev !"
        print(f"  [OK] Jeton genere : {jeton}")
        print(f"  [OK] Lien genere : {res_demande.get('lien')}")

        # Vérification en base SQLite
        jeton_db = db.query(JetonReinitialisation).filter(JetonReinitialisation.jeton == jeton).first()
        assert jeton_db is not None, "Le jeton n'est pas persiste dans SQLite !"
        assert jeton_db.email == test_email
        print("  [OK] Jeton valide et persiste dans SQLite.")

        # 5. Réinitialisation effective avec le jeton
        print("\n3. Reinitialisation avec le nouveau mot de passe...")
        reset_data = ReinitialisationDemande(jeton=jeton, nouveau_mot_de_passe=nouveau_mdp)
        res_reset = reinitialiser_mot_de_passe(donnees=reset_data, db=db)
        print(f"  [OK] Reponse reinitialisation : {res_reset['message']}")

        # 6. Vérification que le jeton a bien été consommé (sécurité usage unique)
        jeton_apres = db.query(JetonReinitialisation).filter(JetonReinitialisation.jeton == jeton).first()
        assert jeton_apres is None, "Le jeton n'a pas ete supprime apres utilisation !"
        print("  [OK] Jeton a usage unique consomme avec succes.")

        # 7. Vérification de la connexion avec l'ancien mot de passe (doit échouer)
        print("\n4. Verification de la securite...")
        try:
            connexion(UtilisateurConnexion(email=test_email, mot_de_passe=mdp_initial), db=db)
            print("  [ERREUR] : L'ancien mot de passe fonctionne encore !")
            sys.exit(1)
        except Exception:
            print("  [OK] L'ancien mot de passe est bien rejete (401 attendu).")

        # 8. Vérification de la connexion avec le nouveau mot de passe (doit réussir)
        conn_nouveau = connexion(UtilisateurConnexion(email=test_email, mot_de_passe=nouveau_mdp), db=db)
        assert "access_token" in conn_nouveau
        print("  [OK] Connexion avec le NOUVEAU mot de passe reussie !")

        print("\n=======================================================")
        print("TOUS LES TESTS DE REINITIALISATION ONT REUSSI A 100% !")
        print("=======================================================")

    finally:
        # Nettoyage
        db.query(Utilisateur).filter(Utilisateur.email == test_email).delete()
        db.query(JetonReinitialisation).filter(JetonReinitialisation.email == test_email).delete()
        db.commit()
        db.close()

if __name__ == "__main__":
    test_reinitialisation_flux()
