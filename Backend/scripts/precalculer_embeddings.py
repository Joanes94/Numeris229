import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

RACINE = Path(__file__).resolve().parents[1]
DATA_CHUNKS = RACINE / "data" / "chunks.json"
NPY_PATH = RACINE / "data" / "embeddings.npy"

print("Lecture des chunks...")
with open(DATA_CHUNKS, "r", encoding="utf-8") as f:
    chunks = json.load(f)

print(f"Total chunks: {len(chunks)}")
print("Chargement du modèle Solon...")
modele = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1", device="cpu")

textes = [c["texte_embedding"] for c in chunks]
print("Calcul des embeddings vectoriels par lots...")
embeddings = modele.encode(textes, batch_size=64, show_progress_bar=True, normalize_embeddings=True)

np.save(NPY_PATH, embeddings)
print(f"Sauvegardé {embeddings.shape} dans {NPY_PATH} ({NPY_PATH.stat().st_size} octets)")
print("Test cosine similarity...")
q_emb = modele.encode(["comment sont désignés les membres du conseil de régulation"], normalize_embeddings=True)
sims = np.dot(q_emb, embeddings.T)[0]
top3 = sims.argsort()[-3:][::-1]
for idx in top3:
    print(f"Article {chunks[idx]['numero_article']}: {chunks[idx]['titre_article']} (Cosine sim: {sims[idx]:.4f})")
