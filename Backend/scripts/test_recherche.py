import chromadb
from pathlib import Path
from sentence_transformers import SentenceTransformer

DOSSIER_CHROMA = Path(__file__).resolve().parents[1] / "chroma_db"

modele = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1", device="cpu")
client = chromadb.PersistentClient(path=str(DOSSIER_CHROMA))
collection = client.get_collection("code_numerique")

question = "Comment sont désignés les membres du Conseil de régulation ?"
embedding = modele.encode([question]).tolist()

resultats = collection.query(query_embeddings=embedding, n_results=3)

for i, doc in enumerate(resultats["documents"][0]):
    meta = resultats["metadatas"][0][i]
    print(f"\n--- Article {meta['numero_article']} ({meta['titre_article']}) ---")
    print(doc[:200])