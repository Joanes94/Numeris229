import json
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class Retriever:
    def __init__(self):
        racine_backend = Path(__file__).resolve().parents[1]
        chemin_data = racine_backend / "data"
        chemin_chunks = chemin_data / "chunks.json"
        chemin_embeddings = chemin_data / "embeddings.npy"

        # 1. Chargement des chunks
        self.chunks = []
        self.chunks_par_numero = {}
        if chemin_chunks.exists():
            with open(chemin_chunks, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
                for c in self.chunks:
                    num = str(c.get("numero_article", "")).strip()
                    if num:
                        self.chunks_par_numero.setdefault(num, []).append({
                            "texte": c["texte_affichage"],
                            "meta": {
                                "numero_article": c["numero_article"],
                                "titre_article": c.get("titre_article") or "",
                                "livre": c.get("livre") or "",
                                "titre_hierarchie": c.get("titre_hierarchie") or "",
                                "chapitre": c.get("chapitre") or "",
                                "modifie_par": c.get("modifie_par") or "",
                            },
                            "distance": 0.0
                        })

        # 2. Modèle d'embeddings Solon (Dense)
        self.modele = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1", device="cpu")

        # 3. Chargement ou calcul des embeddings denses
        if chemin_embeddings.exists():
            self.embeddings = np.load(chemin_embeddings)
        else:
            textes = [c["texte_embedding"] for c in self.chunks]
            self.embeddings = self.modele.encode(textes, batch_size=64, show_progress_bar=False, normalize_embeddings=True)
            np.save(chemin_embeddings, self.embeddings)

        # 4. Modèle Sparse / Lexical TF-IDF (pour les mots juridiques exacts)
        textes_tfidf = [
            f"Article {c.get('numero_article', '')} {c.get('titre_article', '')} {c.get('texte_embedding', '')}"
            for c in self.chunks
        ]
        self.tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=0.95)
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(textes_tfidf)

    def rechercher(self, question: str, n: int = 15):
        if not question or not self.chunks:
            return []

        # 1. Recherche Dense (sémantique par embedding Solon)
        q_emb = self.modele.encode([question], normalize_embeddings=True)
        dense_sims = np.dot(q_emb, self.embeddings.T)[0]

        # 2. Recherche Sparse (lexicale par TF-IDF)
        q_tfidf = self.tfidf_vectorizer.transform([question])
        sparse_sims = cosine_similarity(q_tfidf, self.tfidf_matrix).flatten()

        # 3. Fusion hybride (Dense + Sparse)
        # Normalisation min-max
        d_min, d_max = dense_sims.min(), dense_sims.max()
        dense_norm = (dense_sims - d_min) / (d_max - d_min + 1e-8)

        s_min, s_max = sparse_sims.min(), sparse_sims.max()
        sparse_norm = (sparse_sims - s_min) / (s_max - s_min + 1e-8) if s_max > 0 else sparse_sims

        # Score combiné : 55% dense sémantique + 45% lexical termes exacts
        score_hybride = 0.55 * dense_norm + 0.45 * sparse_norm

        top_indices = score_hybride.argsort()[-n:][::-1]
        candidats = []
        for idx in top_indices:
            c = self.chunks[idx]
            candidats.append({
                "texte": c["texte_affichage"],
                "meta": {
                    "numero_article": c["numero_article"],
                    "titre_article": c.get("titre_article") or "",
                    "livre": c.get("livre") or "",
                    "titre_hierarchie": c.get("titre_hierarchie") or "",
                    "chapitre": c.get("chapitre") or "",
                    "modifie_par": c.get("modifie_par") or "",
                },
                "distance": float(1.0 - dense_sims[idx]),
                "score_dense": float(dense_sims[idx]),
                "score_sparse": float(sparse_sims[idx]),
                "score_hybride": float(score_hybride[idx])
            })

        return candidats

    def rechercher_par_numero(self, numero: str):
        numero_propre = str(numero).strip()
        if numero_propre in self.chunks_par_numero:
            return self.chunks_par_numero[numero_propre]

        # Recherche de secours si numéro comme "55-1" ou avec zéro initial
        num_clean = re.sub(r"\D", "", numero_propre)
        if num_clean and num_clean in self.chunks_par_numero:
            return self.chunks_par_numero[num_clean]

        return None