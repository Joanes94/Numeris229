# Numeris229 🇧🇯

> **Plateforme d'information et d'assistance juridique intelligente sur le Code du Numérique en République du Bénin (Loi N° 2017-20 modifiée).**

Numeris229 permet aux citoyens, juristes, développeurs et entreprises de rechercher des articles de loi, de vérifier leurs obligations légales et d'interroger un assistant d'intelligence artificielle souverain basé sur une architecture **RAG (Retrieval-Augmented Generation)** rigoureuse et sans hallucination.

---

## 🌟 Fonctionnalités Principales

- **💬 Espace de Consultation Juridique (RAG)** :
  - Dialogue en langage naturel pour poser des questions sur n'importe quelle disposition du Code du Numérique.
  - Réponses synthétiques et sourcées avec indication des livres et articles de référence.
  - Gestion des conversations multiples (création, renommage, suppression).
- **📖 Explorateur du Code du Numérique** :
  - Parcourt et recherche parmi les plus de 600 articles officiels.
  - Filtrage thématique par Livre (Livre Préliminaire, Livres I à VI).
  - Lecture intégrale des articles et interrogation en un clic de l'assistant IA.
- **🔐 Authentification & Espace Personnel** :
  - Inscription complète, connexion par jeton JWT sécurisé.
  - Gestion du profil utilisateur et réinitialisation de mot de passe oublié.
  - Respect du droit à l'effacement (Livre V) avec suppression définitive du compte.
- **🌓 Design Moderne & Institutionnel** :
  - Interface sobre et réactive conçue avec Next.js 14 et Tailwind CSS.
  - Prise en charge native du mode clair et du mode sombre (Dark Mode).

---

## 🏗️ Architecture Technique

```
Numeris229/
├── backend/                  # API Backend Python (FastAPI & Pipeline RAG)
│   ├── data/                 # Corpus juridique (chunks.json, articles_prets.json, embeddings.npy)
│   ├── src/                  # Code source backend
│   │   ├── api.py            # Point d'entrée FastAPI & routes de consultation
│   │   ├── auth_routes.py    # Authentification, gestion de compte & mot de passe
│   │   ├── pipeline.py       # Orchestrateur RAG
│   │   ├── retriever.py      # Recherche Hybride (Dense Solon 768-dim + Sparse TF-IDF)
│   │   ├── reranker.py       # Ré-ordonnancement sémantique (CrossEncoder CamemBERT)
│   │   ├── generator.py      # Synthèse des réponses avec Ollama (gemma3:1b)
│   │   ├── models.py         # Modèles SQLAlchemy (Utilisateurs, Conversations, Messages)
│   │   └── database.py       # Connexion SQLite
│   └── requirements.txt      # Dépendances Python
│
├── frontend/                 # Application Frontend (Next.js 14 App Router)
│   ├── src/
│   │   ├── app/              # Routes Next.js (/, /consultation, /explorer, /profil, /connexion, etc.)
│   │   ├── components/       # Composants réutilisables (Navbar, Hero, Features, Logo, ThemeToggle, Footer)
│   │   └── lib/api.js        # Client HTTP pour l'API Backend
│   └── package.json          # Dépendances Node.js
│
├── .gitignore                # Exclusion des caches, dépendances et bases locales
└── README.md
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis

- **Python 3.10+**
- **Node.js 18+** et **npm**
- **Ollama** avec le modèle `gemma3:1b` :
  ```bash
  ollama run gemma3:1b
  ```

---

### 2. Lancement du Backend (FastAPI)

1. Ouvrez un terminal dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
3. Lancez le serveur FastAPI :
   ```bash
   cd src
   uvicorn api:app --reload --port 8000
   ```
> L'API sera accessible sur `http://127.0.0.1:8000` et la documentation interactive sur `http://127.0.0.1:8000/docs`.

---

### 3. Lancement du Frontend (Next.js)

1. Ouvrez un second terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
> L'application sera accessible sur `http://localhost:3000`.

---

## ⚖️ Cadre Juridique de Référence

- **Loi N° 2017-20 du 20 avril 2018** portant Code du Numérique en République du Bénin.
- **Loi N° 2020-35 du 06 janvier 2021** modifiant et complétant la loi N° 2017-20.

*Avertissement : Numeris229 est un système de recherche documentaire et d'assistance automatisé. Les informations fournies ont une valeur indicative et ne remplacent pas les conseils d'un avocat ou les décisions judiciaires officielles.*

---

## 📄 Licence

Ce projet est distribué sous licence MIT.
