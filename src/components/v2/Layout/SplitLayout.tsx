import React from 'react';

interface SplitLayoutProps {
  chatPanel: React.ReactNode;
  canvasPanel: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ chatPanel, canvasPanel }) => {
  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-full w-full lg:overflow-hidden text-white font-sans rounded-3xl border border-white/5">
      {/* Left Panel: Orchestrator (Chat) */}
      <aside className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-[#0A0C10] shadow-2xl z-20 min-h-[500px] lg:min-h-0">
        {chatPanel}
      </aside>

      {/* Right Panel: Canvas (Artifacts) */}
      <main className="flex-1 relative bg-[#05070A] v2-scrollbar min-h-[600px] lg:min-h-0">
        <div className="min-h-full w-full flex items-center justify-center px-2 py-8 lg:py-0">
          {canvasPanel}
        </div>
      </main>
    </div>
  );
};

export default SplitLayout;
