import React from 'react';

interface SplitLayoutProps {
  chatPanel: React.ReactNode;
  canvasPanel: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ chatPanel, canvasPanel }) => {
  return (
    <div className="flex h-full w-full overflow-hidden text-white font-sans rounded-3xl border border-white/5">
      {/* Left Panel: Orchestrator (Chat) */}
      <aside className="w-[400px] border-r border-white/5 flex flex-col bg-[#0A0C10] shadow-2xl z-20">
        {chatPanel}
      </aside>

      {/* Right Panel: Canvas (Artifacts) */}
      <main className="flex-1 relative overflow-auto bg-[#05070A] v2-scrollbar">
        <div className="min-h-full w-full flex items-center justify-center p-8">
          {canvasPanel}
        </div>
      </main>
    </div>
  );
};

export default SplitLayout;
