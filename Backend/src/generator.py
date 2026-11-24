import os
import requests

class Generator:
    def __init__(self, modele=None):
        self.modele = modele or os.getenv("OLLAMA_MODEL", "gemma3:1b")
        self.url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.timeout = int(os.getenv("OLLAMA_TIMEOUT", "45"))

    def generer(self, question: str, documents: list, langue: str = "fr") -> str:
        is_en = (langue == "en") or ("in english" in question.lower()) or ("english" in question.lower())

        if not documents:
            return "This information was not found in the Benin Digital Code." if is_en else "Je ne trouve pas cette information dans le code du numérique."

        # Préparation du contexte avec les articles les plus pertinents
        # On limite aux 2 meilleurs articles pour réduire la charge CPU et accélérer la génération
        docs_contexte = documents[:2]
        contexte = "\n\n".join(
            f"=== ARTICLE {d['meta']['numero_article']} ({d['meta'].get('titre_article', '')}) ===\n{d['texte'].strip()}"
            for d in docs_contexte
        )

        if is_en:
            prompt = f"""You are the official legal assistant dedicated exclusively to the Digital Code of the Republic of Benin (Law No. 2017-20 as amended).

The official legal articles below are provided in French (the official legal language of the Republic of Benin):
{contexte}

Strict Instructions:
1. You MUST formulate the ENTIRE answer in English. Do NOT output raw French paragraphs.
2. Translate, explain, and summarize the relevant legal provisions, obligations, and penalties into fluent, natural English.
3. Explicitly cite the article number(s) (e.g. "According to Article {docs_contexte[0]['meta']['numero_article']} of the Benin Digital Code...").
4. If the user's question does NOT relate to the Benin Digital Code, or if the provided articles do not contain the answer, you MUST reply ONLY with: "HORS_PERIMETRE".

Question: {question}
Official legal answer in English:"""
        else:
            prompt = f"""Tu es l'assistant conversationnel intelligent expert du Code du Numérique de la République du Bénin (Loi N° 2017-20 modifiée).

Voici les extraits officiels applicables :
{contexte}

Consignes strictes :
1. Réponds à la question en te basant rigoureusement et exclusivement sur ces extraits juridiques officiels.
2. Cite expressément le ou les numéros d'articles utilisés.
3. Si la question de l'usager NE concerne PAS le Code du Numérique béninois, ou si les articles ci-dessus ne permettent absolument pas d'y répondre (par exemple pour des questions de géographie mondiale, cuisine, sport, divertissement ou politique étrangère), réponds STRICTEMENT et UNIQUEMENT : "HORS_PERIMETRE".

Question : {question}
Réponse juridique :"""

        try:
            reponse = requests.post(
                self.url,
                json={
                    "model": self.modele,
                    "prompt": prompt,
                    "stream": False,
                    "keep_alive": "30m",
                    "options": {
                        "temperature": 0.1,
                        "num_predict": 250,
                        "num_ctx": 1536,
                    }
                },
                timeout=(5, self.timeout)
            )

            if reponse.status_code == 200:
                texte_rep = reponse.json().get("response", "").strip()
                if texte_rep:
                    return texte_rep
            else:
                print(f"[Avertissement] Ollama a répondu avec le statut HTTP {reponse.status_code} : {reponse.text}")
        except Exception as e:
            print(f"[Avertissement] Ollama inaccessible ou délai dépassé : {e}")

        # Secours direct : vérifier d'abord si le document est réellement pertinent
        doc_principal = documents[0]
        score_reranker = doc_principal.get("score_reranker", 1.0)
        score_dense = doc_principal.get("score_dense", 1.0)
        
        # Si le score de pertinence est insuffisant (recherche thématique ayant échoué), on ne renvoie pas un article au hasard
        if "score_reranker" in doc_principal and score_reranker < 0.2 and score_dense < 0.60:
            return "HORS_PERIMETRE"

        num = doc_principal['meta']['numero_article']
        titre = doc_principal['meta'].get('titre_article', '').strip()
        texte_integral = doc_principal['texte'].strip()

        if is_en:
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            return f"According to {entete} of the Benin Digital Code:\n\n{texte_integral}"
        else:
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            return f"Selon l'{entete} du Code du Numérique :\n\n{texte_integral}"