import bcrypt
from jose import jwt
from datetime import datetime, timedelta

#CLE_SECRETE = "change-moi-en-vrai-secret-aleatoire-long"
CLE_SECRETE = "a2yhU7jdua90keBTGFARLm7643bgGBQstg42"
ALGORITHME = "HS256"
DUREE_SESSION_JOURS = 7

def hacher_mot_de_passe(mot_de_passe: str) -> str:
    sel = bcrypt.gensalt()
    return bcrypt.hashpw(mot_de_passe.encode("utf-8"), sel).decode("utf-8")

def verifier_mot_de_passe(mot_de_passe: str, hash_stocke: str) -> bool:
    try:
        return bcrypt.checkpw(mot_de_passe.encode("utf-8"), hash_stocke.encode("utf-8"))
    except Exception:
        return False

def creer_token(email: str) -> str:
    expiration = datetime.utcnow() + timedelta(days=DUREE_SESSION_JOURS)
    return jwt.encode({"sub": email, "exp": expiration}, CLE_SECRETE, algorithm=ALGORITHME)

def decoder_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, CLE_SECRETE, algorithms=[ALGORITHME])
        return payload.get("sub")
    except Exception:
        return None