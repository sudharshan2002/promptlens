import { useState } from "react";
import { GitCompare, Sparkles } from "lucide-react";

export function WhatIfEditor() {
  const [editPrompt, setEditPrompt] = useState("");
  const [hasRegenerated, setHasRegenerated] = useState(false);

  const previousOutput = "A dark, shadowy city street at midnight. Towering cyberpunk buildings loom overhead.";
  const newOutput = "A bright, sunny city street at noon. Modern glass buildings reflect the clear blue sky.";

  const handleRegenerate = () => {
    if (editPrompt.trim()) {
      setHasRegenerated(true);
    }
  };

  return (
    <div 
      className="apple-transition"
      style={{ 
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <GitCompare size={20} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
          <h3 
            style={{ fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.02em' }}
          >
            What-If Edit Mode
          </h3>
        </div>
        
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder="Make changes to the prompt to see different outputs..."
          className="w-full rounded-xl p-5 h-28 resize-none focus:outline-none apple-transition"
          style={{ 
            fontWeight: 400,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.9375rem'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        
        <button
          onClick={handleRegenerate}
          className="mt-4 px-6 py-3 rounded-full apple-transition transform hover:scale-105 active:scale-95"
          style={{ 
            fontWeight: 500,
            background: 'var(--accent-primary)',
            color: '#ffffff',
            fontSize: '0.9375rem'
          }}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Regenerate with Changes
          </span>
        </button>

        {hasRegenerated && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bounce-in">
            <div 
              className="rounded-2xl p-6 apple-transition hover:shadow-md"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              <h4 
                style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                className="mb-4"
              >
                Previous Output
              </h4>
              <p 
                style={{ fontWeight: 400, color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                className="leading-relaxed"
              >
                {previousOutput}
              </p>
            </div>
            
            <div 
              className="rounded-2xl p-6 apple-transition hover:shadow-md"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-primary)'
              }}
            >
              <h4 
                style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.875rem' }}
                className="mb-4"
              >
                New Output
              </h4>
              <p 
                style={{ fontWeight: 400, color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                className="leading-relaxed"
              >
                {newOutput}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}