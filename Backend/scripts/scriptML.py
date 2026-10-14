import re
import json
from pathlib import Path

RACINE_BACKEND = Path(__file__).resolve().parents[1]
DOSSIER_DATA = RACINE_BACKEND / "data"

with open(DOSSIER_DATA / "Loi Propre.txt", encoding="utf-8") as f:
    texte = f.read()

texte = texte.replace("\r\n", "\n")
texte = re.sub(r"=== PAGE \d+ ===\n?", "", texte)

motif_article = re.compile(
    r"^Article\s*(\d+)(er|ème|e)?\s*:\s*(.+)$",
    re.MULTILINE
)
motif_livre = re.compile(r"^LIVRE\s+.+$", re.MULTILINE)
motif_titre = re.compile(r"^TITRE\s+.+$", re.MULTILINE)
motif_chapitre = re.compile(r"^CHAPITRE\s+.+$", re.MULTILINE)
motif_section = re.compile(r"^SECTION\s+.+$", re.MULTILINE)

marqueurs = []
for m in motif_livre.finditer(texte):
    marqueurs.append((m.start(), "livre", m.group().strip()))
for m in motif_titre.finditer(texte):
    marqueurs.append((m.start(), "titre", m.group().strip()))
for m in motif_chapitre.finditer(texte):
    marqueurs.append((m.start(), "chapitre", m.group().strip()))
for m in motif_section.finditer(texte):
    marqueurs.append((m.start(), "section", m.group().strip()))
for m in motif_article.finditer(texte):
    marqueurs.append((m.start(), "article", m))
marqueurs.sort(key=lambda x: x[0])

articles = []
livre_actuel = titre_actuel = chapitre_actuel = section_actuelle = None

for i, (pos, type_, val) in enumerate(marqueurs):
    if type_ == "livre":
        livre_actuel = val
        titre_actuel = chapitre_actuel = section_actuelle = None
    elif type_ == "titre":
        titre_actuel = val
        chapitre_actuel = section_actuelle = None
    elif type_ == "chapitre":
        chapitre_actuel = val
        section_actuelle = None
    elif type_ == "section":
        section_actuelle = val
    elif type_ == "article":
        m = val
        numero = m.group(1)
        titre_article = m.group(3).strip()
        debut_corps = m.end()
        fin_corps = marqueurs[i + 1][0] if i + 1 < len(marqueurs) else len(texte)
        corps = texte[debut_corps:fin_corps].strip()

        # Titre coupé sur la ligne suivante : si la première ligne du corps
        # ne se termine pas par un point et que la ligne suivante commence
        # en minuscule ou continue une phrase, on la rattache au titre
        lignes_corps = corps.split("\n", 1)
        if len(lignes_corps) > 1 and not titre_article.rstrip().endswith((":", ".")):
            premiere_ligne = lignes_corps[0].strip()
            # Heuristique : si la 1ère ligne du corps est courte (<6 mots) et
            # sans ponctuation finale, c'est probablement la suite du titre
            if premiere_ligne and len(premiere_ligne.split()) <= 6 and not premiere_ligne.endswith((".", ";", ":")):
                titre_article = f"{titre_article} {premiere_ligne}".strip()
                corps = lignes_corps[1].strip() if len(lignes_corps) > 1 else ""

        modifie_par = None
        m_mod = re.search(r"\[Modifié par (.+?)\]", corps)
        if m_mod:
            modifie_par = m_mod.group(1)
            corps = corps.replace(m_mod.group(0), "").strip()

        articles.append({
            "numero": numero,
            "titre": titre_article,
            "livre": livre_actuel,
            "titre_hierarchie": titre_actuel,
            "chapitre": chapitre_actuel,
            "section": section_actuelle,
            "modifie_par": modifie_par,
            "texte": corps
        })

with open(DOSSIER_DATA / "articles.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"{len(articles)} articles extraits")
cible = next((a for a in articles if a["numero"] == "135"), None)
print(json.dumps(cible, ensure_ascii=False, indent=2))