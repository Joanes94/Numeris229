import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import UseCases from "../components/UseCases";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barre de navigation */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1">
        <Hero />
        <Features />
        <UseCases />
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
