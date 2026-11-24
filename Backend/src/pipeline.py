import os
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import re
from retriever import Retriever
from reranker import Reranker
from generator import Generator

# Détection souple d'un numéro d'article ou de loi (ex: "article 55", "art. 125", "art 378", "loi 435", "la loi 435", "loi n° 435")
MOTIF_NUMERO_ARTICLE = re.compile(
    r"(?:article|art\.?|loi|disposition|alin[ée]a)\s*(?:n[°o]\.?\s*)?(\d+)",
    re.IGNORECASE
)

# Détection des salutations et formules de politesse pures
MOTIF_SALUTATION = re.compile(
    r"^(bonjour|bonsoir|salut|coucou|hello|hi|hey|qui es[- ]tu|qui est[- ]tu|présente[- ]toi|comment vas[- ]tu|comment tu vas|ça va)\b",
    re.IGNORECASE
)

STOPWORDS_FR = {
    "les", "des", "une", "pour", "dans", "avec", "sans", "sous", "vers", "chez",
    "par", "sur", "est", "sont", "être", "avoir", "fait", "faire", "comme", "mais",
    "donc", "tout", "tous", "toute", "toutes", "quel", "quelle", "quels", "quelles",
    "quoi", "dont", "leur", "leurs", "cette", "plus", "moins", "aussi", "bien",
    "peut", "peuvent", "doit", "doivent", "dire", "dit", "qui", "que", "ces", "cet"
}

PHRASES_NE_SAIT_PAS = [
    "ne sais pas",
    "ne sait pas",
    "ne figure pas",
    "n'est pas dans les articles",
    "n'est pas mentionné",
    "ne permettent pas de répondre",
    "cette information ne s'y trouve pas",
    "hors_perimetre",
    "out_of_scope",
    "hors périmètre",
    "hors de mon domaine",
    "ne concerne pas le code du numérique",
    "ne relève pas du code",
    "not mentioned in the articles",
    "does not mention",
    "cannot answer based on",
    "outside the scope",
    "i cannot answer",
]

def message_salutation(is_en: bool = False) -> str:
    if is_en:
        return (
            "Hello! I am your intelligent conversational assistant dedicated to the "
            "**Digital Code of the Republic of Benin** (Law No. 2017-20 as amended).\n\n"
            "I can help you understand your legal rights and obligations regarding "
            "cybercrime, personal data protection (APDP), electronic commerce, electronic signatures, "
            "and cybersecurity.\n\n"
            "How can I assist you with your legal inquiries today?"
        )
    return (
        "Bonjour ! Je suis votre assistant conversationnel intelligent dédié au "
        "**Code du Numérique de la République du Bénin** (Loi N° 2017-20 modifiée).\n\n"
        "Je peux vous éclairer sur vos droits et obligations concernant la cybercriminalité, "
        "la protection des données personnelles (APDP), le commerce électronique, "
        "la validité de la signature électronique ou la sécurité des systèmes d'information.\n\n"
        "Quelle est votre question juridique aujourd'hui ?"
    )

def message_hors_perimetre(is_en: bool = False) -> str:
    if is_en:
        return (
            "I apologize, but I am an intelligent legal assistant specialized exclusively in the "
            "**Digital Code of the Republic of Benin** (Law No. 2017-20 as amended).\n\n"
            "Your question does not fall within this legal scope, so I cannot answer it. "
            "Please feel free to ask any question regarding digital law in Benin "
            "(such as penalties for online fraud, formalities with the APDP, or electronic commerce regulations)!"
        )
    return (
        "Bonjour ! Je suis un assistant juridique spécialisé exclusivement dans le "
        "**Code du Numérique de la République du Bénin** (Loi N° 2017-20 modifiée).\n\n"
        "Votre question ne relève pas de ce domaine juridique, je ne suis donc pas en mesure d'y répondre. "
        "N'hésitez pas à me poser une question relative au droit du numérique béninois "
        "(par exemple : les peines pour diffamation en ligne ou escroquerie, les formalités auprès de l'APDP, la valeur d'une signature électronique ou les règles du e-commerce) !"
    )

class Pipeline:
    def __init__(self):
        print("Initialisation du Pipeline RAG de l'assistant conversationnel...")
        self.retriever = Retriever()
        self.reranker = Reranker()
        self.generator = Generator()
        print("Pipeline RAG prêt.")

    def repondre(self, question: str, langue: str = "fr") -> dict:
        is_en = (langue == "en") or ("in english" in question.lower()) or ("english" in question.lower())

        if not question or not question.strip():
            msg_vide = "Please enter your question about the Digital Code." if is_en else "Veuillez poser votre question sur le Code du Numérique."
            return {"reponse": msg_vide, "sources": []}

        question_propre = question.strip()

        # 1. Vérification des salutations générales (sans question juridique complexe)
        mots = [w for w in re.findall(r"\w+", question_propre.lower()) if len(w) > 1]
        if len(mots) <= 6 and MOTIF_SALUTATION.search(question_propre):
            return {"reponse": message_salutation(is_en), "sources": []}

        # Détection d'un numéro d'article ou de loi (ex: "article 435", "loi 435", "art 55", "que dit la loi 435", etc.)
        m = MOTIF_NUMERO_ARTICLE.search(question_propre)
        num_trouve = None
        if m:
            num_trouve = m.group(1)
        else:
            # Recherche si la question contient un chiffre correspondant à un article du Code
            nombres = re.findall(r"\b(\d+)\b", question_propre)
            for n in nombres:
                if n not in {"2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"} and n in getattr(self.retriever, "chunks_par_numero", {}):
                    num_trouve = n
                    break

        documents = None

        # Cas 1 : La question cible un numéro d'article ou de disposition légale
        if num_trouve:
            docs_article = self.retriever.rechercher_par_numero(num_trouve)
            if docs_article:
                mots_significatifs = [w for w in re.findall(r"\w+", question_propre.lower()) if len(w) > 3 and w not in STOPWORDS_FR]
                # Si la question contient une interrogation thématique spécifique autour de cet article
                if len(mots_significatifs) > 3:
                    autres_docs = self.retriever.rechercher(question_propre, n=10)
                    tous_candidats = docs_article + [d for d in autres_docs if str(d["meta"]["numero_article"]) != str(num_trouve)]
                    documents = self.reranker.reclasser(question_propre, tous_candidats, top_k=3)
                else:
                    documents = docs_article[:3]
            else:
                msg_introuvable = f"Article {num_trouve} was not found in the Benin Digital Code." if is_en else f"L'article {num_trouve} n'a pas été trouvé dans les dispositions du Code du Numérique."
                return {
                    "reponse": msg_introuvable,
                    "sources": []
                }

        # Cas 2 : Question thématique générale (sémantique / conceptuelle)
        if not documents:
            # Règle anti-hors-périmètre 0 (Filtre lexical déterministe) :
            # Vérifie les termes juridiques du corpus français uniquement pour les questions en français
            if not is_en:
                mots_contenu = [
                    w for w in re.findall(r"\b[a-zà-ÿ]{3,}\b", question_propre.lower())
                    if w not in STOPWORDS_FR and not w.isdigit()
                ]
                if mots_contenu and not any(w in getattr(self.retriever, "vocabulaire_corpus", set()) for w in mots_contenu):
                    return {
                        "reponse": message_hors_perimetre(is_en),
                        "sources": []
                    }

            candidats = self.retriever.rechercher(question_propre, n=15)
            if not candidats:
                return {
                    "reponse": message_hors_perimetre(is_en),
                    "sources": []
                }

            top_c = candidats[0]
            score_dense = top_c.get("score_dense", 0.0)
            score_sparse = top_c.get("score_sparse", 0.0)

            # Règle anti-hors-périmètre 1 :
            # Si très faible concordance lexicale et similarité sémantique très basse
            if not is_en and score_sparse < 0.01 and score_dense < 0.55:
                return {
                    "reponse": message_hors_perimetre(is_en),
                    "sources": []
                }

            documents = self.reranker.reclasser(question_propre, candidats, top_k=3)

            # Règle anti-hors-périmètre 2 :
            # Vérification de sécurité du score de pertinence du reranker (Cross-Encoder)
            score_top = documents[0].get("score_reranker", 0.0)
            if score_top < -0.6 or (score_top < 0.0 and score_dense < 0.58 and not is_en):
                return {
                    "reponse": message_hors_perimetre(is_en),
                    "sources": []
                }

        # 3. Génération de la réponse avec le LLM
        try:
            reponse = self.generator.generer(question_propre, documents, langue=langue)
        except Exception as e:
            print(f"[Erreur Générateur] : {e}")
            doc_secours = documents[0]
            score_top = doc_secours.get("score_reranker", 1.0)
            if "score_reranker" in doc_secours and score_top < 0.2 and doc_secours.get("score_dense", 0.0) < 0.60:
                return {"reponse": message_hors_perimetre(is_en), "sources": []}

            num = doc_secours['meta']['numero_article']
            titre = doc_secours['meta'].get('titre_article', '').strip()
            entete = f"Article {num}" + (f" ({titre})" if titre else "")
            if is_en:
                reponse = f"According to {entete} of the Benin Digital Code:\n\n{doc_secours['texte'].strip()}"
            else:
                reponse = f"Selon l'{entete} du Code du Numérique :\n\n{doc_secours['texte'].strip()}"

        # 4. Vérification si la réponse est hors-périmètre
        rep_clean = reponse.strip().lower()
        if (
            "hors_perimetre" in rep_clean
            or "out_of_scope" in rep_clean
            or any(p in rep_clean for p in PHRASES_NE_SAIT_PAS)
        ):
            return {
                "reponse": message_hors_perimetre(is_en),
                "sources": []
            }

        # 5. Construction des sources juridiques uniques
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
        if is_en:
            if not re.search(r"^(according|under|in accordance|article|the article)", reponse_finale, re.IGNORECASE):
                article_principal = documents[0]["meta"]["numero_article"]
                reponse_finale = f"According to Article {article_principal} of the Digital Code: {reponse_finale}"
        else:
            if not re.search(r"^(selon|d'apr[eè]s|l'article|les articles)", reponse_finale, re.IGNORECASE):
                article_principal = documents[0]["meta"]["numero_article"]
                reponse_finale = f"Selon l'article {article_principal} du Code du Numérique : {reponse_finale}"

        return {"reponse": reponse_finale, "sources": sources}
