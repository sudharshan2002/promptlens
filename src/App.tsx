import { useState, useEffect, useRef } from "react";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { MainInterface } from "./components/MainInterface";
import { Dashboard } from "./components/Dashboard";
import { FeaturesPage } from "./components/FeaturesPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { SupportPage } from "./components/SupportPage";
import { Footer } from "./components/Footer";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'dashboard' | 'features' | 'documentation' | 'support'>('main');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set theme on document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGetStarted = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col apple-transition" style={{ background: 'var(--bg-primary)' }}>
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      {currentPage === 'main' ? (
        <>
          <HeroSection onGetStarted={handleGetStarted} theme={theme} />
          <MainInterface featuresRef={featuresRef} />
        </>
      ) : currentPage === 'dashboard' ? (
        <Dashboard />
      ) : currentPage === 'features' ? (
        <FeaturesPage />
      ) : currentPage === 'documentation' ? (
        <DocumentationPage />
      ) : currentPage === 'support' ? (
        <SupportPage />
      ) : null}
      
      <Footer />
    </div>
  );
}