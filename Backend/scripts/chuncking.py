import json
from pathlib import Path

RACINE_BACKEND = Path(__file__).resolve().parents[1]
DOSSIER_DATA = RACINE_BACKEND / "data"

SEUIL_MOTS = 200  # au-delà, on découpe par alinéa

def decouper_alineas(texte):
    # Alinéas = phrases commençant par un tiret ou un chiffre suivi de "-"
    import re
    morceaux = re.split(r"(?=\n?-\s|\n?\d+[-.]\s)", texte)
    return [m.strip() for m in morceaux if m.strip()]

with open(DOSSIER_DATA / "articles_prets.json", encoding="utf-8") as f:
    articles = json.load(f)

chunks = []
for a in articles:
    nb_mots = len(a["texte"].split())
    if nb_mots <= SEUIL_MOTS:
        chunks.append({
            "id": f"art_{a['numero']}_0",
            "numero_article": a["numero"],
            "titre_article": a["titre"],
            "livre": a["livre"],
            "titre_hierarchie": a["titre_hierarchie"],
            "chapitre": a["chapitre"],
            "modifie_par": a["modifie_par"],
            "texte_affichage": a["texte"],
            "texte_embedding": a["texte_embedding"],
        })
    else:
        sous_parties = decouper_alineas(a["texte"])
        prefixe = a["texte_embedding"].split(".\n")[0]  # récupère le préfixe contextuel
        for i, partie in enumerate(sous_parties):
            chunks.append({
                "id": f"art_{a['numero']}_{i}",
                "numero_article": a["numero"],
                "titre_article": a["titre"],
                "livre": a["livre"],
                "titre_hierarchie": a["titre_hierarchie"],
                "chapitre": a["chapitre"],
                "modifie_par": a["modifie_par"],
                "texte_affichage": partie,
                "texte_embedding": f"{prefixe}.\n{partie}",
            })

with open(DOSSIER_DATA / "chunks.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)

print(f"{len(articles)} articles -> {len(chunks)} chunks")