from sentence_transformers import CrossEncoder

class Reranker:
    def __init__(self):
        self.modele = CrossEncoder(
            "antoinelouis/crossencoder-camembert-base-mmarcoFR",
            device="cpu"
        )

    def reclasser(self, question: str, documents: list, top_k: int = 3):
        if not documents:
            return documents
        paires = [[question, d["texte"]] for d in documents]
        scores = self.modele.predict(paires)
        for doc, score in zip(documents, scores):
            doc["score_reranker"] = float(score)
        documents_tries = sorted(documents, key=lambda d: d["score_reranker"], reverse=True)
        return documents_tries[:top_k]