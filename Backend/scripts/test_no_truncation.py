import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from pipeline import Pipeline

pipe = Pipeline()

tests = [
    "comment sont désignés les membres du conseil de régulation",
    "Quel est le rôle du conseil de régulation ?",
    "Quelles sont les obligations d'information pour un site e-commerce ?"
]

for q in tests:
    print(f"\n==========================================")
    print(f"QUESTION : {q}")
    res = pipe.repondre(q)
    print(f"RÉPONSE  :\n{res['reponse']}")
    print(f"\nLongueur réponse : {len(res['reponse'])} caractères")
    assert not res['reponse'].endswith("..."), "La réponse ne doit pas se terminer par '...'"
    print("Vérification : AUCUNE TRONCATURE !")
