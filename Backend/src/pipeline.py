import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import re
from retriever import Retriever
from reranker import Reranker
from generator import Generator

# Détection souple d'un numéro d'article dans la question (ex: "article 55", "art. 125", "art 378")
MOTIF_NUMERO_ARTICLE = re.compile(r"(?:article|art\.?)\s*(\d+)", re.IGNORECASE)

PHRASES_NE_SAIT_PAS = [
    "ne sais pas",
    "ne sait pas",
    "ne figure pas dans les articles",
    "n'est pas dans les articles",
    "ne permettent pas de répondre",
    "cette information ne s'y trouve pas"
]

class Pipeline:
    def __init__(self):
        print("Initialisation du Pipeline RAG Numeris229...")
        self.retriever = Retriever()
        self.reranker = Reranker()
        self.generator = Generator()
        print("Pipeline RAG prêt.")

    def repondre(self, question: str) -> dict:
        if not question or not question.strip():
            return {"reponse": "Veuillez poser votre question sur le Code du Numérique.", "sources": []}

        question_propre = question.strip()
        m = MOTIF_NUMERO_ARTICLE.search(question_propre)

        documents = None

        # Cas 1 : La question cible explicitement un numéro d'article
        if m:
            num = m.group(1)
            docs_article = self.retriever.rechercher_par_numero(num)
            if docs_article:
                # Si la question contient d'autres mots que juste "article X", on enrichit avec le RAG
                mots = [w for w in re.findall(r"\w+", question_propre.lower()) if len(w) > 3]
                if len(mots) > 2:
                    autres_docs = self.retriever.rechercher(question_propre, n=10)
                    tous_candidats = docs_article + [d for d in autres_docs if str(d["meta"]["numero_article"]) != str(num)]
                    documents = self.reranker.reclasser(question_propre, tous_candidats, top_k=3)
                else:
                    documents = docs_article[:3]
            else:
                return {
                    "reponse": f"L'article {num} n'a pas été trouvé dans les dispositions du Code du Numérique.",
                    "sources": []
                }

        # Cas 2 : Question thématique générale (sémantique / conceptuelle)
        if not documents:
            candidats = self.retriever.rechercher(question_propre, n=15)
            if not candidats:
                return {
                    "reponse": "Je ne trouve pas cette information dans le Code du Numérique.",
                    "sources": []
                }

            documents = self.reranker.reclasser(question_propre, candidats, top_k=3)

            # Vérification de sécurité du score de pertinence du reranker
            score_top = documents[0].get("score_reranker", 0)
            if score_top < -8.0:
                return {
                    "reponse": "Je ne trouve pas cette information dans le Code du Numérique.",
                    "sources": []
                }

        # 3. Génération de la réponse avec le LLM
        try:
            reponse = self.generator.generer(question_propre, documents)
        except Exception as e:
            print(f"[Erreur Générateur] : {e}")
            doc_secours = documents[0]
            num = doc_secours['meta']['numero_article']
            titre = doc_secours['meta'].get('titre_article', '').strip()
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            reponse = f"Selon l'{entete} du Code du Numérique :\n\n{doc_secours['texte'].strip()}"

        # Si le modèle avoue ne pas trouver la réponse
        if any(p in reponse.lower() for p in PHRASES_NE_SAIT_PAS):
            return {
                "reponse": "Cette information n'a pas été trouvée dans les dispositions du Code du Numérique du Bénin.",
                "sources": []
            }

        # 4. Construction des sources juridiques uniques
        vus = set()
        sources = []
        for d in documents:
            num = str(d["meta"]["numero_article"])
            titre = d["meta"].get("titre_article", "")
            label = f"Article {num}" + (f" - {titre}" if titre else "")
            if num not in vus:
                vus.add(num)
                sources.append(label)

        # Si la réponse ne commence pas déjà par mentionner l'article
        reponse_finale = reponse.strip()
        if not re.search(r"^(selon|d'apr[eè]s|l'article|les articles)", reponse_finale, re.IGNORECASE):
            article_principal = documents[0]["meta"]["numero_article"]
            reponse_finale = f"Selon l'article {article_principal} du Code du Numérique : {reponse_finale}"

        return {"reponse": reponse_finale, "sources": sources}