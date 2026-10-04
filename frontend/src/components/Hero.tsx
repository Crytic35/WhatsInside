import React from 'react';
import { Scan, FileText, ArrowRight } from 'lucide-react';
import type { DemoProduct, OllamaStatus } from '../types';

interface HeroProps {
  onStartScan: () => void;
  onOpenTextInput: () => void;
  demoProducts: DemoProduct[];
  onSelectDemoProduct: (id: string) => void;
  ollamaStatus: OllamaStatus | null;
}

export const Hero: React.FC<HeroProps> = ({
  onStartScan,
  onOpenTextInput,
  demoProducts,
  onSelectDemoProduct,
  ollamaStatus,
}) => {
  const isConnected = ollamaStatus?.connected && ollamaStatus?.available;

  const exampleCategories = [
    { label: 'FOOD', desc: 'Snacks, Cereals, Sauces' },
    { label: 'PERSONAL CARE', desc: 'Shampoo, Lotions, Serums' },
    { label: 'CLEANING', desc: 'Detergents, Degreasers' },
    { label: 'HOUSEHOLD', desc: 'Sanitizers, Freshness' },
    { label: 'BABY', desc: 'Diaper Creams, Wipes' },
    { label: 'PET', desc: 'Pet Foods, Shampoos' },
    { label: 'DIY', desc: 'Paints, Sealants' },
    { label: 'TECH', desc: 'Electronics Cleaners' },
  ];

  return (
    <div className="relative py-12 md:py-16 overflow-hidden">
      
      {/* Subtle Grid backdrop */}
      <div className="absolute inset-0 lab-grid opacity-70 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-paper-400 bg-paper-100 text-ink-700 text-xs font-mono mb-6 shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>HAZARD ≠ RISK • CONCENTRATION-AWARE • LOCAL-FIRST AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-950 tracking-tight leading-tight mb-4">
          WHAT'S INSIDE?
        </h1>

        <p className="text-xl sm:text-2xl text-ink-800 font-serif italic max-w-2xl mx-auto mb-4">
          "Understand what you're actually buying."
        </p>

        {/* Supporting Explanation */}
        <p className="text-sm sm:text-base text-ink-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Scan a food, cosmetic, cleaning product, or household item.
          Get a plain-language explanation backed by available evidence—without fear-mongering or over-simplifications.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
          <button
            onClick={onStartScan}
            className="w-full sm:w-auto px-8 py-4 bg-ink-950 hover:bg-ink-900 text-paper-50 rounded font-semibold text-sm tracking-wide shadow-md flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5 border border-ink-950"
          >
            <Scan className="w-4 h-4 text-emerald-400" />
            <span className="font-mono uppercase tracking-wider">SCAN ANY PRODUCT</span>
          </button>

          <button
            onClick={onOpenTextInput}
            className="w-full sm:w-auto px-6 py-4 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded font-medium text-sm border border-paper-300 shadow-subtle flex items-center justify-center space-x-2 transition-colors font-mono"
          >
            <FileText className="w-4 h-4 text-ink-600" />
            <span>PASTE INGREDIENT LIST</span>
          </button>
        </div>

        {/* Local AI Status Card */}
        <div className="inline-flex items-center space-x-4 px-4 py-2 rounded border border-paper-300 bg-paper-50 font-mono text-xs text-ink-700 shadow-subtle mb-12">
          <div className="flex items-center space-x-2">
            <span className="text-ink-500 uppercase">LOCAL AI:</span>
            <span className="font-bold text-ink-900">{ollamaStatus?.model || 'Gemma 4:12B'}</span>
          </div>
          <span className="text-paper-400">|</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            <span className={isConnected ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
              {isConnected ? '● Connected via Ollama' : '○ Offline (Demo Mode Active)'}
            </span>
          </div>
        </div>

        {/* Category Examples */}
        <div className="mb-14">
          <div className="text-[11px] font-mono text-ink-500 uppercase tracking-widest mb-3">
            EXAMPLES OF ANALYZABLE FORMULATIONS
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {exampleCategories.map((cat) => (
              <span
                key={cat.label}
                className="px-3 py-1 text-[11px] font-mono rounded border border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-700 transition-colors cursor-default"
                title={cat.desc}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Demo Shelf */}
        <div className="border border-paper-300 bg-paper-100/80 rounded-lg p-6 max-w-4xl mx-auto text-left shadow-subtle">
          <div className="flex items-center justify-between border-b border-paper-300 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-900">
                SAMPLE SPECIMEN VAULT (OFFLINE READY)
              </h3>
              <p className="text-xs text-ink-500">
                Instantly explore verified analyses across different product classes.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-paper-200 px-2 py-0.5 rounded border border-paper-300 text-ink-600">
              5 SPECIMENS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectDemoProduct(p.id)}
                className="p-3 bg-paper-50 rounded border border-paper-300 hover:border-ink-800 hover:shadow-specimen transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 mb-1">
                    <span className="uppercase">{p.category}</span>
                    <span className="text-ink-400 group-hover:text-ink-900 transition-colors">
                      {p.subcategory}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-ink-950 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                    {p.product_name}
                  </h4>
                  <p className="text-[11px] text-ink-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-paper-200 flex items-center justify-between text-[10px] font-mono text-ink-500">
                  <span>{p.ingredients?.length || 0} Ingredients</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-ink-800 font-semibold flex items-center space-x-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
