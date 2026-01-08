import { useState, useEffect, useRef } from "react";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { ExplainableMainInterface } from "./components/ExplainableMainInterface";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { FeaturesPage } from "./components/FeaturesPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { SupportPage } from "./components/SupportPage";
import { AuthPage } from "./components/AuthPage";
import { Footer } from "./components/Footer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'main' | 'dashboard' | 'features' | 'documentation' | 'support' | 'auth'>('main');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Set theme on document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Redirect to auth if not authenticated and trying to access protected pages
  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPage !== 'auth') {
      setCurrentPage('auth');
    }
  }, [isAuthenticated, isLoading, currentPage]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGetStarted = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('main');
  };

  const handleNavigate = (page: 'main' | 'dashboard' | 'features' | 'documentation' | 'support' | 'auth') => {
    // If not authenticated and trying to go to protected page, redirect to auth
    if (!isAuthenticated && page !== 'auth') {
      setCurrentPage('auth');
      return;
    }
    setCurrentPage(page);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #0071e3, #6366f1)',
            }}
          >
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, only show auth page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        <AuthPage 
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col apple-transition" style={{ background: 'var(--bg-primary)' }}>
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      {currentPage === 'main' ? (
        <>
          <HeroSection onGetStarted={handleGetStarted} theme={theme} />
          <ExplainableMainInterface featuresRef={featuresRef} />
        </>
      ) : currentPage === 'dashboard' ? (
        <EnhancedDashboard />
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}