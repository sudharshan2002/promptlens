import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavigationProps {
  currentPage: 'main' | 'dashboard' | 'features' | 'documentation' | 'support' | 'auth';
  onNavigate: (page: 'main' | 'dashboard' | 'features' | 'documentation' | 'support' | 'auth') => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function Navigation({ currentPage, onNavigate, theme, onThemeToggle }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const menuItems = [
    { label: 'Features', page: 'features' as const },
    { label: 'Dashboard', page: 'dashboard' as const },
    { label: 'Docs', page: 'documentation' as const },
    { label: 'Support', page: 'support' as const },
  ];

  return (
    <nav className="border-b fixed top-0 left-0 right-0 z-50" 
      style={{ 
        borderColor: scrolled ? 'var(--border-color)' : 'transparent',
        backgroundColor: 'var(--bg-primary)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled ? '0 1px 0 0 var(--border-color)' : 'none'
      }}
    >
      <div className="h-11 px-5 flex items-center justify-between max-w-[980px] mx-auto">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('main')}
          className="relative group"
          style={{
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <span style={{ 
            fontWeight: 590, 
            fontSize: '1.125rem', 
            letterSpacing: '-0.022em',
            color: 'var(--text-primary)',
            transition: 'opacity 0.2s ease'
          }}
          className="group-hover:opacity-70">
            PromptLens
          </span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item, index) => {
            const isActive = item.page === currentPage;
            return (
              <button
                key={index}
                onClick={() => onNavigate(item.page)}
                className="relative group py-1"
                style={{
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <span style={{ 
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '-0.006em',
                  transition: 'all 0.2s ease'
                }}
                className="group-hover:opacity-70">
                  {item.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      transform: 'translateX(-50%)',
                      opacity: 0.8
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full relative group"
            style={{ 
              color: 'var(--text-secondary)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-label="Toggle theme"
          >
            <div className="group-hover:opacity-70 group-active:scale-90" style={{ transition: 'all 0.15s ease' }}>
              {theme === 'light' ? <Moon size={14} strokeWidth={2} /> : <Sun size={14} strokeWidth={2} />}
            </div>
          </button>

          {/* Auth Button or User Menu */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:opacity-80 liquid-transition"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  >
                    <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    zIndex: 100,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 liquid-transition"
                    style={{ color: '#d70015', fontSize: '0.8125rem' }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:scale-105 liquid-transition"
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              <User size={12} />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full relative group"
            style={{ 
              color: 'var(--text-primary)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-label="Toggle menu"
          >
            <div className="group-hover:opacity-70 group-active:scale-90" style={{ transition: 'all 0.15s ease' }}>
              {isMenuOpen ? <X size={15} strokeWidth={2} /> : <Menu size={15} strokeWidth={2} />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className="md:hidden border-t"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="px-5 py-2">
            {menuItems.map((item, index) => {
              const isActive = item.page === currentPage;
              return (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 border-b last:border-b-0 active:opacity-50"
                  style={{ 
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 500 : 400,
                    borderColor: 'var(--border-color)',
                    letterSpacing: '-0.011em',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {item.label}
                  {isActive && (
                    <div 
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--text-primary)',
                        opacity: 0.8
                      }}
                    />
                  )}
                </button>
              );
            })}
            
            {/* Mobile Auth Button */}
            <div className="py-3">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-primary)', color: '#fff' }}
                      >
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="p-2 rounded-full"
                    style={{ color: '#d70015' }}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <User size={16} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}