import json
import re
from pathlib import Path

RACINE_BACKEND = Path(__file__).resolve().parents[1]
DOSSIER_DATA = RACINE_BACKEND / "data"

with open(DOSSIER_DATA / "articles.json", encoding="utf-8") as f:
    articles = json.load(f)

def nettoyer_corps(texte):
    texte = re.sub(r"\s*\n\s*", " ", texte)  # \n internes -> espace
    texte = re.sub(r"\s{2,}", " ", texte).strip()
    texte = re.sub(r"^\|\s+est\b", "Il est", texte)  # faute OCR fréquente repérée
    return texte

for a in articles:
    a["texte"] = nettoyer_corps(a["texte"])
    # Texte final destiné à l'embedding : contexte + contenu
    contexte = " > ".join(filter(None, [a["livre"], a["titre_hierarchie"], a["chapitre"]]))
    prefixe = f"Code du numérique, {contexte}, Article {a['numero']} ({a['titre']})"
    if a["modifie_par"]:
        prefixe += f", modifié par {a['modifie_par']}"
    a["texte_embedding"] = f"{prefixe}.\n{a['texte']}"

with open(DOSSIER_DATA / "articles_prets.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print("Exemple :")
print(articles[120]["texte_embedding"])