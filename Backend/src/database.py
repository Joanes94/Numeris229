from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

CHEMIN_BASE = Path(__file__).resolve().parent / "mondroit.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{CHEMIN_BASE.as_posix()}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def migrer_base():
    try:
        with engine.begin() as conn:
            cols = [row[1] for row in conn.execute(text("PRAGMA table_info(conversations)")).fetchall()]
            if cols and "titre" not in cols:
                conn.execute(text("ALTER TABLE conversations ADD COLUMN titre VARCHAR DEFAULT 'Nouvelle conversation'"))
    except Exception as e:
        print(f"[DB] Migration note: {e}")

migrer_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()