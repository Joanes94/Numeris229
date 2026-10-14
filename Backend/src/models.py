from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
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

    conversations = relationship("Conversation", back_populates="utilisateur", cascade="all, delete-orphan")


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