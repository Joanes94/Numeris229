from pydantic import BaseModel, EmailStr, field_validator

class UtilisateurCreation(BaseModel):
    nom_prenoms: str
    email: EmailStr
    sexe: str
    age: int
    profession: str
    telephone: str
    mot_de_passe: str
    mot_de_passe_confirmation: str

    @field_validator("mot_de_passe_confirmation")
    @classmethod
    def verifier_correspondance(cls, v, info):
        if "mot_de_passe" in info.data and v != info.data["mot_de_passe"]:
            raise ValueError("Les mots de passe ne correspondent pas")
        return v

class UtilisateurMiseAJour(BaseModel):
    nom_prenoms: str | None = None
    sexe: str | None = None
    age: int | None = None
    profession: str | None = None
    telephone: str | None = None

class UtilisateurConnexion(BaseModel):
    email: EmailStr
    mot_de_passe: str

class UtilisateurReponse(BaseModel):
    id: int
    nom_prenoms: str
    email: str
    sexe: str
    age: int
    profession: str
    telephone: str

    class Config:
        from_attributes = True

class ConversationMiseAJour(BaseModel):
    titre: str

class MotDePasseOublieDemande(BaseModel):
    email: EmailStr

class ReinitialisationDemande(BaseModel):
    jeton: str
    nouveau_mot_de_passe: str