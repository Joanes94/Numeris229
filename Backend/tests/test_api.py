import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

EMAIL_TEST = "test_pytest@example.com"
MOT_DE_PASSE_TEST = "motdepasse123"


def test_inscription_et_connexion():
    client.post("/auth/inscription", json={
        "nom_prenoms": "Testeur Pytest",
        "email": EMAIL_TEST,
        "sexe": "M",
        "age": 25,
        "profession": "Testeur",
        "telephone": "0100000000",
        "mot_de_passe": MOT_DE_PASSE_TEST,
        "mot_de_passe_confirmation": MOT_DE_PASSE_TEST
    })
    reponse = client.post("/auth/connexion", json={
        "email": EMAIL_TEST,
        "mot_de_passe": MOT_DE_PASSE_TEST
    })
    assert reponse.status_code == 200
    assert "access_token" in reponse.json()


def obtenir_token():
    reponse = client.post("/auth/connexion", json={
        "email": EMAIL_TEST,
        "mot_de_passe": MOT_DE_PASSE_TEST
    })
    return reponse.json()["access_token"]


def test_question_sans_authentification_refusee():
    reponse = client.post("/question", json={"texte": "Qu'est-ce que la cybersécurité ?"})
    assert reponse.status_code == 401


def test_question_dans_le_corpus():
    token = obtenir_token()
    headers = {"Authorization": f"Bearer {token}"}
    reponse = client.post(
        "/question",
        json={"texte": "Comment sont désignés les membres du Conseil de régulation ?"},
        headers=headers
    )
    assert reponse.status_code == 200
    assert "125" in str(reponse.json()["sources"])


def test_question_hors_sujet():
    token = obtenir_token()
    headers = {"Authorization": f"Bearer {token}"}
    reponse = client.post(
        "/question",
        json={"texte": "Quelle est la capitale du Paraguay ?"},
        headers=headers
    )
    assert reponse.status_code == 200
    assert reponse.json()["sources"] == []


def test_article_precis():
    token = obtenir_token()
    headers = {"Authorization": f"Bearer {token}"}
    reponse = client.post(
        "/question",
        json={"texte": "Que dit l'article 550 ?"},
        headers=headers
    )
    assert reponse.status_code == 200
    assert "550" in str(reponse.json()["sources"])