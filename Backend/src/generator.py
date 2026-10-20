import requests

class Generator:
    def __init__(self, modele="gemma3:1b"):
        self.modele = modele
        self.url = "http://localhost:11434/api/generate"

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
            prompt = f"""You are Numeris229, an expert legal AI assistant on the Digital Code of the Republic of Benin (Law No. 2017-20).

Here are the official legal articles applicable:
{contexte}

Instruction: Based strictly on the legal articles above, answer the user's question in English clearly, accurately, and comprehensively. Cite the article number(s) explicitly.

Question: {question}
Legal answer in English:"""
        else:
            prompt = f"""Tu es l'assistant juridique Numeris229, expert du Code du Numérique de la République du Bénin (Loi N° 2017-20).

Voici les extraits officiels applicables :
{contexte}

Consigne : En te basant sur ces articles, réponds à la question suivante en français de manière claire, complète et précise. Cite expressément le ou les numéros d'articles utilisés.

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
                timeout=120
            )

            if reponse.status_code == 200:
                texte_rep = reponse.json().get("response", "").strip()
                if texte_rep:
                    return texte_rep
        except Exception as e:
            print(f"[Avertissement] Ollama inaccessible ou délai dépassé : {e}")

        # Secours direct : restitution intégrale et soignée de l'article officiel SANS troncature
        doc_principal = documents[0]
        num = doc_principal['meta']['numero_article']
        titre = doc_principal['meta'].get('titre_article', '').strip()
        texte_integral = doc_principal['texte'].strip()

        if is_en:
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            return f"According to {entete} of the Benin Digital Code:\n\n{texte_integral}"
        else:
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            return f"Selon l'{entete} du Code du Numérique :\n\n{texte_integral}"