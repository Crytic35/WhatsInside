import React from 'react';
import { X, ArrowUpRight, BookOpen, FlaskConical, AlertTriangle, HelpCircle } from 'lucide-react';
import type { AnalyzedIngredient } from '../types';

interface IngredientDetailModalProps {
  ingredient: AnalyzedIngredient | null;
  onClose: () => void;
}

export const IngredientDetailModal: React.FC<IngredientDetailModalProps> = ({
  ingredient,
  onClose,
}) => {
  if (!ingredient) return null;

  const isAttention = ingredient.concern_level === 'NEEDS ATTENTION' || ingredient.concern_level === 'MODERATE CONCERN';

  return (
    <div className="fixed inset-0 z-50 animate-editorial-fade">
      {/* Blurred backdrop — completely separate layer, never a parent of the card */}
      <div
        className="absolute inset-0 bg-forest-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Positioning wrapper — transparent, just centers the card */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-4 pointer-events-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#F4F0E6] border border-forest-900 shadow-[0_20px_60px_-10px_rgba(16,35,29,0.35)] overflow-hidden flex flex-col text-ink animate-slide-up pointer-events-auto">

        {/* Modal header */}
        <div className="border-b border-forest-900 bg-forest-950 px-6 py-3.5 flex items-center justify-between text-paper font-mono text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-lime" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Scientific Field Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-forest-300 hover:text-lime transition-colors p-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 md:p-8 space-y-7">

            {/* ── Ingredient identity ── */}
            <div className="border-b border-forest-900/12 pb-6 space-y-3">

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                <span className={`px-2 py-1 border font-bold uppercase ${
                  isAttention
                    ? 'border-coral text-coral-dark bg-coral-light'
                    : 'border-forest-900/20 text-forest-900 bg-paper-warm'
                }`}>
                  {ingredient.concern_level}
                </span>
                <span className="px-2 py-1 border border-gold text-gold-dark bg-gold-light font-bold uppercase">
                  Evidence: {ingredient.evidence_level}
                </span>
                <span className="text-ink-muted uppercase">
                  {ingredient.category}
                </span>
              </div>

              {/* Name */}
              <h2 className="text-3xl sm:text-4xl font-display font-medium text-forest-950 tracking-tightest leading-tight">
                {ingredient.canonical_name}
              </h2>

              {/* Label name if different */}
              {ingredient.name !== ingredient.canonical_name && (
                <p className="font-mono text-xs text-ink-muted">
                  Declared on label as: <strong className="text-forest-950">{ingredient.name}</strong>
                </p>
              )}

              {/* Role pill */}
              <div className="inline-block font-mono text-xs font-semibold px-3 py-1 bg-paper-warm border border-forest-900/20 text-forest-950">
                Role: {ingredient.function}
              </div>
            </div>

            {/* ── 01 What it does ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-forest-950 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-lime-dark flex-shrink-0" />
                <span>01 / What it does</span>
              </div>
              <div className="p-4 border-l-4 border-l-lime border border-forest-900/12 bg-paper-light font-body text-sm text-ink leading-relaxed">
                {ingredient.why_used}
              </div>
            </div>

            {/* ── 02 Evidence ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-forest-950 uppercase tracking-widest">
                <AlertTriangle className="w-3 h-3 text-gold-dark flex-shrink-0" />
                <span>02 / What the Evidence Says</span>
              </div>
              <div className="p-4 border-l-4 border-l-gold border border-forest-900/12 bg-paper-light space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-coral-dark uppercase font-bold block mb-1">
                    Potential concern / sensitization:
                  </span>
                  <p className="font-body text-sm text-ink leading-relaxed">
                    {ingredient.potential_concern}
                  </p>
                </div>

                {ingredient.evidence_summary && (
                  <div className="pt-3 border-t border-forest-900/10">
                    <span className="font-mono text-[10px] text-forest-900 uppercase font-bold block mb-1">
                      Toxicological Evidence Synthesis:
                    </span>
                    <p className="font-body text-sm text-ink leading-relaxed">
                      {ingredient.evidence_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── 03 Uncertainty ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-lavender-dark uppercase tracking-widest">
                <HelpCircle className="w-3 h-3 flex-shrink-0" />
                <span>03 / What We Don't Know</span>
              </div>
              <div className="p-4 border-l-4 border-l-lavender border border-lavender/40 bg-lavender-light font-body text-sm text-forest-950 leading-relaxed">
                {ingredient.unknown_info || "The ingredient list does not provide the concentration, so product-specific risk cannot be determined from the label alone."}
              </div>
            </div>

            {/* ── 04 Sources ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-forest-950 uppercase tracking-widest">
                <BookOpen className="w-3 h-3 text-forest-700 flex-shrink-0" />
                <span>04 / Authoritative Sources</span>
              </div>

              {ingredient.sources && ingredient.sources.length > 0 ? (
                <div className="border border-forest-900/15 bg-paper-light divide-y divide-forest-900/10">
                  {ingredient.sources.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 flex items-center justify-between hover:bg-gold-light/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[9px] font-mono text-gold-dark font-bold px-1.5 py-0.5 border border-gold/40 bg-gold-light/60 flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-xs text-ink truncate">{url}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-forest-700 group-hover:text-forest-950 flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-forest-900/12 font-mono text-xs text-ink-muted italic">
                  No external monograph linked in the local knowledge base.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-forest-900/15 bg-paper-warm px-6 py-3 flex items-center justify-between font-mono text-[10px] text-forest-800 flex-shrink-0">
          <span>Source integrity: Peer-reviewed & regulatory only</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-forest-900/25 hover:border-forest-900 bg-paper text-forest-950 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
      </div>
    </div>
  );
};
