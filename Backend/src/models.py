from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom_prenoms = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    sexe = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    profession = Column(String, nullable=False)
    telephone = Column(String, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)
    role = Column(String, default="citoyen", nullable=False)  # "citoyen", "admin", "juriste"
    est_actif = Column(Boolean, default=True, nullable=False)
    cree_le = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("Conversation", back_populates="utilisateur", cascade="all, delete-orphan")
    signalements = relationship("Signalement", back_populates="utilisateur", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    titre = Column(String, default="Nouvelle conversation")
    creee_le = Column(DateTime, default=datetime.utcnow)

    utilisateur = relationship("Utilisateur", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    question = Column(String, nullable=False)
    reponse = Column(String, nullable=False)
    sources = Column(String, nullable=False)  # stocké en JSON texte
    horodatage = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class JetonReinitialisation(Base):
    __tablename__ = "jetons_reinitialisation"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jeton = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=False, index=True)
    date_expiration = Column(DateTime, nullable=False)


class Signalement(Base):
    """
    Signalement d'anomalie ou retour utilisateur pour l'Administrateur (Acteur Secondaire).
    """
    __tablename__ = "signalements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=True)
    question = Column(Text, nullable=False)
    reponse = Column(Text, nullable=False)
    motif = Column(String, nullable=False)  # "reponse_inexacte", "article_manquant", "hallucination", "autre"
    commentaire = Column(Text, nullable=True)
    statut = Column(String, default="en_attente")  # "en_attente", "examine", "resolu", "rejete"
    reponse_admin = Column(Text, nullable=True)
    cree_le = Column(DateTime, default=datetime.utcnow)
    traite_le = Column(DateTime, nullable=True)

    utilisateur = relationship("Utilisateur", back_populates="signalements")


class JournalRequete(Base):
    """
    Télémétrie et métriques d'observabilité du RAG pour le tableau de bord Administrateur.
    """
    __tablename__ = "journal_requetes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    utilisateur_id = Column(Integer, nullable=True)
    question = Column(Text, nullable=False)
    langue = Column(String, default="fr")
    temps_reponse_ms = Column(Integer, nullable=True)
    articles_cites = Column(String, nullable=True)  # ex: "Article 55, Article 125"
    est_succes = Column(Boolean, default=True)      # False si "non trouvé"
    horodatage = Column(DateTime, default=datetime.utcnow)
