import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Cache mémoire des articles pour éviter les lectures disques répétées
let articlesCache = null;

function chargerArticles() {
  if (articlesCache) return articlesCache;

  // Chemins de recherche vers articles_prets.json
  const chemins = [
    path.join(process.cwd(), "public", "data", "articles_prets.json"),
    path.join(process.cwd(), "..", "backend", "data", "articles_prets.json"),
    path.join(process.cwd(), "backend", "data", "articles_prets.json"),
    path.join(process.cwd(), "data", "articles_prets.json"),
  ];

  for (const c of chemins) {
    if (fs.existsSync(c)) {
      try {
        const contenu = fs.readFileSync(c, "utf-8");
        articlesCache = JSON.parse(contenu);
        return articlesCache;
      } catch (err) {
        console.error("Erreur parsing articles_prets.json :", err);
      }
    }
  }

  return [];
}

export async function GET(request) {
  try {
    const articles = chargerArticles();
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const livre = (searchParams.get("livre") || "").trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limite = parseInt(searchParams.get("limit") || "20", 10);
    const numeroExact = searchParams.get("numero") || "";

    // Si on demande la liste des livres uniques
    if (searchParams.get("meta") === "livres") {
      const livresUniques = [
        ...new Set(articles.map((a) => a.livre).filter(Boolean)),
      ];
      return NextResponse.json({
        total_articles: articles.length,
        livres: livresUniques,
      });
    }

    // Filtrage
    let resultat = articles;

    if (numeroExact) {
      const art = articles.find((a) => String(a.numero) === String(numeroExact));
      return NextResponse.json(art ? { article: art } : { erreur: "Article introuvable" }, {
        status: art ? 200 : 404,
      });
    }

    if (livre) {
      resultat = resultat.filter((a) => a.livre === livre);
    }

    if (q) {
      resultat = resultat.filter((a) => {
        const numMatch = String(a.numero || "").toLowerCase().includes(q);
        const titreMatch = (a.titre || "").toLowerCase().includes(q);
        const texteMatch = (a.texte || "").toLowerCase().includes(q);
        const livreMatch = (a.livre || "").toLowerCase().includes(q);
        return numMatch || titreMatch || texteMatch || livreMatch;
      });
    }

    const total = resultat.length;
    const debut = (page - 1) * limite;
    const pagines = resultat.slice(debut, debut + limite);

    return NextResponse.json({
      total,
      page,
      limite,
      total_pages: Math.ceil(total / limite),
      articles: pagines,
    });
  } catch (err) {
    console.error("Erreur API articles :", err);
    return NextResponse.json(
      { erreur: "Impossible de charger les articles" },
      { status: 500 }
    );
  }
}
