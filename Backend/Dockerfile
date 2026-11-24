FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.cache/huggingface \
    PYTHONPATH=/app/src

WORKDIR /app

# Dépendances système minimales pour PostgreSQL (psycopg2) et healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installer PyTorch CPU uniquement pour alléger l'image Docker
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Installer les dépendances applicatives du Backend
COPY requirements.docker.txt /app/requirements.docker.txt
RUN pip install --no-cache-dir -r /app/requirements.docker.txt

# Pré-télécharger les modèles Hugging Face dans l'image (Solon dense + Cross-Encoder CamemBERT)
RUN python -c "from sentence_transformers import SentenceTransformer, CrossEncoder; \
    SentenceTransformer('OrdalieTech/Solon-embeddings-base-0.1', device='cpu'); \
    CrossEncoder('antoinelouis/crossencoder-camembert-base-mmarcoFR', device='cpu')"

# Activer le mode hors-ligne souverain une fois les modèles embarqués dans l'image
ENV HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1

# Copier le code source, les données vectorielles et les scripts
COPY src/ /app/src/
COPY data/ /app/data/
COPY scripts/ /app/scripts/

WORKDIR /app/src

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}"]
