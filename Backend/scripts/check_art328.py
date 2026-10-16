import json
from pathlib import Path

RACINE = Path(__file__).resolve().parents[1]
with open(RACINE / "data" / "chunks.json", encoding="utf-8") as f:
    chunks = json.load(f)

c328 = [c for c in chunks if str(c.get("numero_article")) == "328"]
print(f"Article 328 has {len(c328)} chunks:")
for i, c in enumerate(c328):
    print(f"Chunk {i+1} (id={c['id']}): {c['texte_affichage'][:100]}... (len={len(c['texte_affichage'])})")
