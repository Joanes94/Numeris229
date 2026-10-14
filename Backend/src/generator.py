import requests

class Generator:
    def __init__(self, modele="gemma3:1b"):
        self.modele = modele
        self.url = "http://localhost:11434/api/generate"

    def generer(self, question: str, documents: list) -> str:
        if not documents:
            return "Je ne trouve pas cette information dans le code du numérique."

        contexte = "\n\n".join(
            f"=== ARTICLE {d['meta']['numero_article']} ({d['meta'].get('titre_article', '')}) ===\n{d['texte']}"
            for d in documents
        )

        prompt = f"""Tu es l'assistant juridique Numeris229, expert du Code du Numérique de la République du Bénin (Loi N° 2017-20).

Voici les extraits officiels pertinents :
{contexte}

Consigne : En te basant sur ces articles, réponds à la question suivante en français de manière claire, concise et précise. Cite toujours le ou les numéros d'articles applicables. Si les articles fournis ne permettent pas de répondre, dis simplement que l'information ne s'y trouve pas.

Question : {question}
Réponse juridique :"""

        try:
            reponse = requests.post(
                self.url,
                json={
                    "model": self.modele,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 300,
                    }
                },
                timeout=90
            )

            if reponse.status_code == 200:
                texte_rep = reponse.json().get("response", "").strip()
                if texte_rep:
                    return texte_rep
        except Exception as e:
            print(f"[Avertissement] Erreur de communication avec Ollama : {e}")

        # Secours direct si Ollama est indisponible ou ne répond pas
        doc_principal = documents[0]
        num = doc_principal['meta']['numero_article']
        titre = doc_principal['meta'].get('titre_article', '')
        texte_extrait = doc_principal['texte'][:300] + ("..." if len(doc_principal['texte']) > 300 else "")
        return f"Selon l'article {num} ({titre}) du Code du Numérique : {texte_extrait}"