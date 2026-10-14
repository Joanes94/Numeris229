import uuid
import json
from sqlalchemy.orm import Session
from models import Conversation, Message

def creer_conversation(db: Session, utilisateur_id: int, titre: str = "Nouvelle conversation") -> str:
    id_conv = str(uuid.uuid4())
    conv = Conversation(id=id_conv, utilisateur_id=utilisateur_id, titre=titre)
    db.add(conv)
    db.commit()
    return id_conv

def renommer_conversation(db: Session, id_conv: str, utilisateur_id: int, nouveau_titre: str) -> bool:
    conv = db.query(Conversation).filter(
        Conversation.id == id_conv,
        Conversation.utilisateur_id == utilisateur_id
    ).first()
    if not conv:
        return False
    titre_propre = nouveau_titre.strip() if nouveau_titre else ""
    conv.titre = titre_propre if titre_propre else "Nouvelle conversation"
    db.commit()
    return True

def supprimer_conversation(db: Session, id_conv: str, utilisateur_id: int) -> bool:
    conv = db.query(Conversation).filter(
        Conversation.id == id_conv,
        Conversation.utilisateur_id == utilisateur_id
    ).first()
    if not conv:
        return False
    db.delete(conv)
    db.commit()
    return True

def lister_conversations(db: Session, utilisateur_id: int) -> list:
    conversations = db.query(Conversation).filter(
        Conversation.utilisateur_id == utilisateur_id
    ).order_by(Conversation.creee_le.desc()).all()
    return [
        {
            "id": c.id,
            "titre": c.titre or "Nouvelle conversation",
            "creee_le": c.creee_le.isoformat() if c.creee_le else None
        }
        for c in conversations
    ]

def ajouter_message(db: Session, id_conv: str, question: str, reponse: str, sources: list):
    message = Message(
        conversation_id=id_conv,
        question=question,
        reponse=reponse,
        sources=json.dumps(sources, ensure_ascii=False)
    )
    db.add(message)

    # Titre automatique façon GPT au premier message si c'est encore "Nouvelle conversation"
    conv = db.query(Conversation).filter(Conversation.id == id_conv).first()
    if conv and (not conv.titre or conv.titre == "Nouvelle conversation"):
        titre_auto = question.strip().replace("\n", " ")
        if len(titre_auto) > 40:
            titre_auto = titre_auto[:37] + "..."
        conv.titre = titre_auto

    db.commit()

def obtenir_conversation(db: Session, id_conv: str, utilisateur_id: int):
    conv = db.query(Conversation).filter(
        Conversation.id == id_conv,
        Conversation.utilisateur_id == utilisateur_id  # sécurité : chacun ne voit que ses conversations
    ).first()
    if not conv:
        return None
    return {
        "id": conv.id,
        "titre": conv.titre or "Nouvelle conversation",
        "creee_le": conv.creee_le.isoformat() if conv.creee_le else None,
        "messages": [
            {
                "question": m.question,
                "reponse": m.reponse,
                "sources": json.loads(m.sources),
                "horodatage": m.horodatage.isoformat() if m.horodatage else None
            } for m in conv.messages
        ]
    }