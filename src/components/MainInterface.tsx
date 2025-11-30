import { useState } from "react";
import { PromptInput } from "./PromptInput";
import { OutputPanel } from "./OutputPanel";
import { WhatIfEditor } from "./WhatIfEditor";

interface MainInterfaceProps {
  featuresRef: React.RefObject<HTMLDivElement>;
}

export function MainInterface({ featuresRef }: MainInterfaceProps) {
  const [output, setOutput] = useState("");

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      {/* Prompt Interface Section */}
      <div ref={featuresRef} className="px-6 py-20 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="mb-4"
              style={{ 
                fontWeight: 600,
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em'
              }}
            >
              Try it yourself
            </h2>
            <p 
              style={{ 
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                fontWeight: 400
              }}
            >
              See how PromptLens analyzes and improves your AI prompts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PromptInput onGenerate={(prompt) => setOutput(prompt)} />
            <OutputPanel />
          </div>
        </div>
      </div>

      {/* What-If Editor Section */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="mb-4"
              style={{ 
                fontWeight: 600,
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em'
              }}
            >
              What-If Analysis
            </h2>
            <p 
              style={{ 
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                fontWeight: 400
              }}
            >
              Experiment with different scenarios and see how they affect your prompts
            </p>
          </div>

          <WhatIfEditor />
        </div>
      </div>
    </div>
  );
}