/**
 * AuthPage Component
 * Beautiful login and signup page with Google OAuth support
 * Matches the existing PromptLens UI design language
 */

import { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, Eye, EyeOff, 
  ArrowRight, Sparkles, Shield, AlertCircle, Check,
  Zap, Brain, Layers, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Google OAuth Client ID - should be set in environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id_here') return;
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        
        const googleButtonDiv = document.getElementById('google-signin-button');
        if (googleButtonDiv) {
          window.google.accounts.id.renderButton(googleButtonDiv, {
            type: 'standard',
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            width: 400,
            shape: 'rectangular',
            text: mode === 'login' ? 'signin_with' : 'signup_with',
          });
        }
      }
    };

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [mode, theme]);

  const handleGoogleCallback = async (response: { credential: string }) => {
    setIsLoading(true);
    setError(null);
    
    const result = await loginWithGoogle(response.credential);
    
    setIsLoading(false);
    
    if (result.success) {
      setSuccess('Successfully signed in with Google!');
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } else {
      setError(result.error || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        setError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await login({ email, password });
      } else {
        result = await register({ email, password, name });
      }

      if (result.success) {
        setSuccess(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const features = [
    { icon: Brain, title: 'AI Transparency', desc: 'Understand how AI interprets your prompts' },
    { icon: Layers, title: 'Visual Explanations', desc: 'See heatmaps and segment contributions' },
    { icon: Zap, title: 'What-If Analysis', desc: 'Compare how changes affect outputs' },
  ];

  return (
    <div 
      className="min-h-screen flex"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Left Panel - Branding & Features */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0071e3 0%, #6366f1 50%, #8b5cf6 100%)',
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
          <div 
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-5"
            style={{ 
              background: 'conic-gradient(from 0deg, transparent, white, transparent)',
              animation: 'spin 20s linear infinite',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Sparkles size={26} color="#fff" />
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">PromptLens</span>
          </div>
          <p className="text-white/70 text-sm ml-1">Explainable AI for Everyone</p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-white text-4xl xl:text-5xl font-bold leading-tight mb-6">
            See Inside the
            <br />
            <span className="text-white/90">AI Black Box</span>
          </h1>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            PromptLens helps you understand exactly how AI models interpret and respond to your prompts, 
            making generative AI transparent and trustworthy.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <feature.icon size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/50 text-sm">
          © 2026 PromptLens • Built for AI Transparency Research
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div 
        className="w-full lg:w-1/2 xl:w-[45%] flex flex-col min-h-screen"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Theme Toggle */}
        <div className="flex justify-end p-6">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-xl hover:scale-105 transition-transform"
            style={{ 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {theme === 'light' ? (
              <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-12">
          <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0071e3, #6366f1)',
                }}
              >
                <Sparkles size={22} color="#fff" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                PromptLens
              </span>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h2 
                style={{ 
                  fontWeight: 700, 
                  fontSize: '1.875rem', 
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                {mode === 'login' 
                  ? 'Enter your credentials to access your account' 
                  : 'Start exploring AI transparency today'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div 
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{ 
                  background: 'rgba(215, 0, 21, 0.08)', 
                  border: '1px solid rgba(215, 0, 21, 0.2)' 
                }}
              >
                <AlertCircle size={18} color="#d70015" className="flex-shrink-0 mt-0.5" />
                <span style={{ color: '#d70015', fontSize: '0.875rem', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}
            
            {success && (
              <div 
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{ 
                  background: 'rgba(0, 130, 59, 0.08)', 
                  border: '1px solid rgba(0, 130, 59, 0.2)' 
                }}
              >
                <Check size={18} color="#00823b" className="flex-shrink-0 mt-0.5" />
                <span style={{ color: '#00823b', fontSize: '0.875rem', lineHeight: 1.5 }}>{success}</span>
              </div>
            )}

            {/* Google Sign In */}
            {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? (
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <div 
                  id="google-signin-button" 
                  style={{ width: '100%', height: '48px', display: 'flex', justifyContent: 'center' }} 
                />
              </div>
            ) : (
              <button
                type="button"
                className="rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                style={{
                  width: '100%',
                  height: '48px',
                  marginBottom: '20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                }}
                onClick={() => setError('Google Sign-In not configured. Please add VITE_GOOGLE_CLIENT_ID to .env file.')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            )}

            {/* Divider */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                or continue with email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Name field (signup only) */}
              {mode === 'signup' && (
                <div style={{ width: '100%', marginBottom: '20px' }}>
                  <label 
                    htmlFor="name" 
                    style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <User 
                      size={18} 
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                    />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        borderRadius: '12px',
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <label 
                  htmlFor="email" 
                  style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Mail 
                    size={18} 
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      borderRadius: '12px',
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <label 
                  htmlFor="password" 
                  style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Lock 
                    size={18} 
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '48px',
                      paddingRight: '48px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      borderRadius: '12px',
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', padding: '4px', opacity: 0.7 }}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? (
                      <EyeOff size={18} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Eye size={18} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password field (signup only) */}
              {mode === 'signup' && (
                <div style={{ width: '100%', marginBottom: '20px' }}>
                  <label 
                    htmlFor="confirmPassword" 
                    style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Shield 
                      size={18} 
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                    />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        borderRadius: '12px',
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                style={{
                  width: '100%',
                  height: '48px',
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  borderRadius: '12px',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center mt-8" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for spin animation and Google button styling */}
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        #google-signin-button {
          width: 100% !important;
        }
        
        #google-signin-button > div {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
        
        #google-signin-button > div > div {
          width: 100% !important;
          max-width: 400px !important;
        }
        
        #google-signin-button > div,
        #google-signin-button > div > div,
        #google-signin-button iframe {
          border-radius: 12px !important;
          overflow: hidden;
        }
        
        #google-signin-button .S9gUrf-YoZ4jf,
        #google-signin-button .nsm7Bb-HzV7m-LgbsSe {
          border-radius: 12px !important;
          width: 100% !important;
          justify-content: center !important;
        }
      `}</style>
    </div>
  );
}

// Declare Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}
