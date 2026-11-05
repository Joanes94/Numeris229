import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, declarative_base

# Charger le fichier .env depuis Backend/.env s'il existe
chemin_env = Path(__file__).resolve().parent.parent / ".env"
if chemin_env.exists():
    load_dotenv(dotenv_path=chemin_env)
else:
    load_dotenv()

CHEMIN_BASE_SQLITE = Path(__file__).resolve().parent / "mondroit.db"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    # Nettoyage automatique des paramètres Neon incompatibles avec psycopg2 sur Windows
    import re
    DATABASE_URL = re.sub(r"[?&]channel_binding=[^&]+", "", DATABASE_URL)
    if "?" not in DATABASE_URL and "&" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("&", "?", 1)

    # Compatibilité Neon / Supabase / Render / Heroku
    # Remplacement des préfixes non reconnus par SQLAlchemy 2.0
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

    print(f"[DB] Connexion à PostgreSQL (Neon.tech / Cloud)...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,      # Teste la validité de la connexion avant usage (indispensable pour Neon serverless)
        pool_recycle=300,        # Renouvelle les connexions inactives toutes les 5 min
        pool_size=10,
        max_overflow=20
    )
else:
    # Fallback SQLite local si aucune URL Neon n'est configurée
    print(f"[DB] Aucune URL DATABASE_URL détectée, utilisation de SQLite local : {CHEMIN_BASE_SQLITE.name}")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{CHEMIN_BASE_SQLITE.as_posix()}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def migrer_base():
    """
    Migration douce et automatique des colonnes sans casser les données existantes.
    Compatible à la fois avec SQLite et PostgreSQL (Neon.tech).
    """
    try:
        inspecteur = inspect(engine)
        tables = inspecteur.get_table_names()

        # 1. Vérification de la table 'conversations' (ajout colonne 'titre')
        if "conversations" in tables:
            colonnes_conv = [col["name"] for col in inspecteur.get_columns("conversations")]
            if "titre" not in colonnes_conv:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE conversations ADD COLUMN titre VARCHAR(255) DEFAULT 'Nouvelle conversation'"))
                print("[DB] Colonne 'titre' ajoutée à la table 'conversations'.")

        # 2. Vérification de la table 'utilisateurs' (colonnes role, est_actif, cree_le)
        if "utilisateurs" in tables:
            colonnes_user = [col["name"] for col in inspecteur.get_columns("utilisateurs")]
            with engine.begin() as conn:
                if "role" not in colonnes_user:
                    conn.execute(text("ALTER TABLE utilisateurs ADD COLUMN role VARCHAR(50) DEFAULT 'citoyen'"))
                    print("[DB] Colonne 'role' ajoutée à la table 'utilisateurs'.")
                if "est_actif" not in colonnes_user:
                    conn.execute(text("ALTER TABLE utilisateurs ADD COLUMN est_actif BOOLEAN DEFAULT TRUE"))
                    print("[DB] Colonne 'est_actif' ajoutée à la table 'utilisateurs'.")
                if "cree_le" not in colonnes_user:
                    if engine.dialect.name == "sqlite":
                        conn.execute(text("ALTER TABLE utilisateurs ADD COLUMN cree_le TIMESTAMP"))
                    else:
                        conn.execute(text("ALTER TABLE utilisateurs ADD COLUMN cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                    print("[DB] Colonne 'cree_le' ajoutée à la table 'utilisateurs'.")

    except Exception as e:
        print(f"[DB] Note de migration : {e}")


def auto_seed_admin():
    """
    S'assure qu'un compte Administrateur initial existe toujours
    (admin@numeris229.bj / Admin229#Secure).
    """
    try:
        from models import Utilisateur
        from securite import hacher_mot_de_passe
        db = SessionLocal()
        admin_email = os.getenv("ADMIN_EMAIL", "admin@numeris229.bj").strip().lower()
        admin_pass = os.getenv("ADMIN_PASSWORD", "Admin229#Secure").strip()
        admin_nom = os.getenv("ADMIN_NOM", "Administrateur Numeris229").strip()

        existant = db.query(Utilisateur).filter(Utilisateur.email == admin_email).first()
        if not existant:
            admin_user = Utilisateur(
                nom_prenoms=admin_nom,
                email=admin_email,
                sexe="M",
                age=35,
                profession="Superviseur Juridique & Système",
                telephone="+229 01 00 00 00",
                mot_de_passe_hash=hacher_mot_de_passe(admin_pass),
                role="admin",
                est_actif=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[DB] Compte Administrateur créé avec succès ({admin_email}).")
        else:
            if existant.role != "admin" or not existant.est_actif:
                existant.role = "admin"
                existant.est_actif = True
                db.commit()
                print(f"[DB] Droits d'administrateur confirmés pour {admin_email}.")
        db.close()
    except Exception as e:
        print(f"[DB] Note auto_seed_admin : {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
