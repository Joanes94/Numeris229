import json
from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer

RACINE_BACKEND = Path(__file__).resolve().parents[1]
DOSSIER_DATA = RACINE_BACKEND / "data"
DOSSIER_CHROMA = RACINE_BACKEND / "chroma_db"

with open(DOSSIER_DATA / "chunks.json", encoding="utf-8") as f:
    chunks = json.load(f)

print("Chargement du modèle d'embedding (peut prendre un moment la première fois)...")
modele = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1", device="cpu")

client = chromadb.PersistentClient(path=str(DOSSIER_CHROMA))
collection = client.get_or_create_collection(
    name="code_numerique",
    metadata={"hnsw:space": "cosine"}
)

# Indexation par lots pour ménager la RAM
TAILLE_LOT = 32
for i in range(0, len(chunks), TAILLE_LOT):
    lot = chunks[i:i + TAILLE_LOT]
    textes = [c["texte_embedding"] for c in lot]
    embeddings = modele.encode(textes, show_progress_bar=False).tolist()

    collection.add(
        ids=[c["id"] for c in lot],
        embeddings=embeddings,
        documents=[c["texte_affichage"] for c in lot],
        metadatas=[{
            "numero_article": c["numero_article"],
            "titre_article": c["titre_article"],
            "livre": c["livre"] or "",
            "titre_hierarchie": c["titre_hierarchie"] or "",
            "chapitre": c["chapitre"] or "",
            "modifie_par": c["modifie_par"] or "",
        } for c in lot]
    )
    print(f"{min(i + TAILLE_LOT, len(chunks))}/{len(chunks)} indexés")

print(f"Terminé. Base sauvegardée dans {DOSSIER_CHROMA}")