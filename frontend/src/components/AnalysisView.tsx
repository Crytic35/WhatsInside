import React, { useState } from 'react';
import type { ProductAnalysis, AnalyzedIngredient } from '../types';
import {
  Search,
  ArrowLeftRight,
  Sliders,
  ArrowUpRight,
  Scan,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface AnalysisViewProps {
  analysis: ProductAnalysis;
  onOpenIngredientModal: (ing: AnalyzedIngredient) => void;
  onCompareWithProduct: (analysis: ProductAnalysis) => void;
  onRescan: () => void;
}

function ConcernBadge({ level }: { level: string }) {
  const isAttention = level === 'NEEDS ATTENTION' || level === 'MODERATE CONCERN';
  const isUnknown   = level === 'INSUFFICIENT INFORMATION';
  if (isAttention) return <span className="badge-coral">{level}</span>;
  if (isUnknown)   return <span className="badge-lavender">{level}</span>;
  return <span className="badge-forest">{level}</span>;
}

function EvidenceBadge({ level }: { level: string }) {
  return <span className="badge-gold">{level}</span>;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  onOpenIngredientModal,
  onCompareWithProduct,
  onRescan,
}) => {
  const [viewMode, setViewMode]       = useState<'plain' | 'technical'>('plain');
  const [searchQuery, setSearchQuery] = useState('');
  const [concernFilter, setConcernFilter] = useState<string>('ALL');

  const attentionItems = analysis.ingredients.filter(
    (i) => i.concern_level === 'NEEDS ATTENTION' || i.concern_level === 'MODERATE CONCERN'
  );

  const filteredIngredients = analysis.ingredients.filter((ing) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ing.name.toLowerCase().includes(q) ||
      ing.canonical_name.toLowerCase().includes(q) ||
      ing.function.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (concernFilter === 'ALL')       return true;
    if (concernFilter === 'ATTENTION') return ing.concern_level === 'NEEDS ATTENTION' || ing.concern_level === 'MODERATE CONCERN';
    if (concernFilter === 'LOW')       return ing.concern_level === 'LOW CONCERN';
    if (concernFilter === 'UNKNOWN')   return ing.concern_level === 'INSUFFICIENT INFORMATION';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 animate-editorial-fade">

      {/* ══════════════════════════════════════
          PRODUCT HEADER CARD
         ══════════════════════════════════════ */}
      <div className="border border-forest-900 bg-paper-light shadow-sheet">

        {/* Breadcrumb metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-forest-900/12 bg-paper-warm/60 font-mono text-[10px] text-ink-muted">
          <div className="flex items-center gap-2 text-forest-900">
            <span className="font-semibold uppercase">Product Analysis</span>
            <span>/</span>
            <span className="font-bold text-forest-950">{analysis.category_name}</span>
            {analysis.subcategory && (
              <>
                <span>/</span>
                <span>{analysis.subcategory}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {analysis.is_demo && (
              <span className="px-2 py-0.5 border border-forest-900/30 bg-paper text-forest-900 font-bold uppercase">
                Reference Specimen
              </span>
            )}
            <span className="text-ink-muted">
              Inference: {analysis.ai_model_used}
            </span>
          </div>
        </div>

        {/* Product title + actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 md:p-8 border-b border-forest-900/12">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-forest-950 tracking-tightest leading-tight">
              {analysis.product_name}
            </h1>
            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-1 border border-forest-900 bg-forest-950 text-paper font-bold uppercase">
                {analysis.category_name}
              </span>
              <span className="px-2 py-1 border border-forest-900/25 bg-paper-warm text-forest-900 font-semibold">
                {analysis.ingredients.length} Constituents
              </span>
              {attentionItems.slice(0, 2).map((item, idx) => (
                <span
                  key={item.canonical_name}
                  className={`px-2 py-1 border font-bold uppercase ${
                    idx === 0
                      ? 'border-coral text-coral-dark bg-coral-light'
                      : 'border-gold text-gold-dark bg-gold-light'
                  }`}
                >
                  <AlertTriangle className="inline w-2.5 h-2.5 mr-0.5 -mt-0.5" />
                  {item.canonical_name}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
            <button
              onClick={() => onCompareWithProduct(analysis)}
              className="btn-secondary"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
            <button
              onClick={onRescan}
              className="btn-primary"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* ── Findings + Uncertainty ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-forest-900/10">

          {/* LEFT: Key Findings */}
          <div className="lg:col-span-7 p-6 md:p-8 space-y-5">

            {/* Summary stat */}
            <div className="flex items-center gap-4 p-4 bg-forest-950 text-paper">
              <div className="text-4xl font-display font-medium text-lime leading-none">
                {String(attentionItems.length).padStart(2, '0')}
              </div>
              <div className="font-mono text-xs space-y-0.5">
                <div className="text-lime font-bold uppercase tracking-wider">Key Findings</div>
                <div className="text-forest-300 text-[11px]">
                  {attentionItems.length > 0
                    ? `${attentionItems.length} ingredient${attentionItems.length > 1 ? 's' : ''} worth your attention`
                    : 'All ingredients within standard usage baseline'}
                </div>
              </div>
            </div>

            {/* Finding cards */}
            {attentionItems.length > 0 ? (
              <div className="space-y-3">
                {attentionItems.slice(0, 3).map((item, idx) => {
                  const colors = [
                    'border-l-coral',
                    'border-l-gold',
                    'border-l-lavender',
                  ];
                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenIngredientModal(item)}
                      className={`p-4 border border-forest-900/15 border-l-4 ${colors[idx]} bg-paper cursor-pointer hover:bg-paper-warm transition-colors space-y-2 group`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-forest-950 uppercase">
                          {String(idx + 1).padStart(2, '0')} / {item.canonical_name}
                        </span>
                        <ConcernBadge level={item.concern_level} />
                      </div>
                      <p className="text-sm text-ink leading-relaxed font-body">
                        {item.potential_concern}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-forest-700 group-hover:text-forest-950 transition-colors">
                        <span>Open dossier</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border-l-4 border-l-lime border border-forest-900/15 bg-paper">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-lime-dark flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-body text-ink leading-relaxed">
                    The identified formulation consists of standard vehicle and conditioning
                    ingredients with well-established consumer safety margins at customary usage.
                  </p>
                </div>
              </div>
            )}

            {/* Preference alerts */}
            {analysis.preference_highlights && analysis.preference_highlights.length > 0 && (
              <div className="p-4 bg-gold-light/50 border-l-4 border-l-gold border border-gold/30 text-xs font-mono text-forest-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold uppercase text-forest-900">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Personal Preference Alerts</span>
                </div>
                {analysis.preference_highlights.map((h, i) => (
                  <div key={i} className="text-ink leading-relaxed">• {h}</div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT: Uncertainty + Reading Mode */}
          <div className="lg:col-span-5 p-6 md:p-8 space-y-6">

            {/* Lavender uncertainty box */}
            <div className="p-4 border border-lavender/50 bg-lavender-light border-l-4 border-l-lavender text-xs font-mono text-forest-950 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-lavender-dark font-bold uppercase text-[10px] tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What We Don't Know</span>
              </div>
              <p className="leading-relaxed">
                {analysis.limitations || "The product label does not disclose ingredient concentrations or manufacturing purity grades. Finished formulation irritation depends on actual exposure concentration and skin contact duration."}
              </p>
              <div className="pt-2 border-t border-lavender/30 text-[10px] text-lavender-dark italic">
                Unknown ≠ dangerous. Exposure dosage governs finished product toxicology.
              </div>
            </div>

            {/* Reading mode toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs border-b border-forest-900/12 pb-2">
                <span className="text-forest-950 font-bold uppercase tracking-wider text-[10px]">Reading Mode</span>
                <div className="flex items-center gap-1">
                  {(['plain', 'technical'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-2.5 py-1 text-[10px] border transition-colors ${
                        viewMode === mode
                          ? 'bg-forest-950 text-lime border-forest-950 font-semibold'
                          : 'bg-paper border-forest-900/20 text-forest-900 hover:bg-paper-warm'
                      }`}
                    >
                      {mode === 'plain' ? 'Plain Language' : 'Technical'}
                    </button>
                  ))}
                </div>
              </div>

              {viewMode === 'plain' ? (
                <div className="font-body text-sm text-ink space-y-3 leading-relaxed p-4 bg-paper border border-forest-900/12">
                  <p><strong>What it does:</strong> {analysis.just_tell_me_what_matters.what_it_does}</p>
                  <p><strong>Why it's there:</strong> {analysis.just_tell_me_what_matters.why_its_there}</p>
                </div>
              ) : (
                <div className="font-mono text-xs text-ink leading-relaxed space-y-2 p-4 bg-paper border border-forest-900/12">
                  <p>{analysis.technical_explanation}</p>
                  <div className="text-[10px] text-ink-muted pt-2 border-t border-forest-900/10">
                    Framework: {analysis.regulatory_context}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          FULL INGREDIENT RECORD
         ══════════════════════════════════════ */}
      <div className="space-y-5">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-forest-900 pb-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-forest-950 tracking-tightest">
              Full Ingredient Record
            </h2>
            <p className="text-xs text-ink-muted font-mono mt-1">
              Individual chemical constituents mapped to authoritative monographs
            </p>
          </div>

          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ingredient or role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-3 pr-8 py-1.5 w-52"
              />
              <Search className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px]">
              {[
                { label: 'All',       id: 'ALL'       },
                { label: 'Attention', id: 'ATTENTION'  },
                { label: 'Low Risk',  id: 'LOW'        },
                { label: 'Unknown',   id: 'UNKNOWN'    },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setConcernFilter(f.id)}
                  className={`px-2.5 py-1 border transition-colors ${
                    concernFilter === f.id
                      ? 'bg-forest-950 text-lime border-forest-950 font-bold'
                      : 'bg-paper-light border-forest-900/20 text-forest-900 hover:bg-paper-warm'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-forest-900 bg-paper-light overflow-hidden">

          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-forest-950 text-paper text-[10px] font-mono uppercase tracking-wider font-semibold">
            <div className="col-span-1">Ref</div>
            <div className="col-span-3">Ingredient</div>
            <div className="col-span-2">Function</div>
            <div className="col-span-3">Concern / Context</div>
            <div className="col-span-2">Evidence</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-forest-900/10">
            {filteredIngredients.map((ing, idx) => {
              const isAttention = ing.concern_level === 'NEEDS ATTENTION' || ing.concern_level === 'MODERATE CONCERN';
              const isUnknown   = ing.concern_level === 'INSUFFICIENT INFORMATION';
              const roleLower   = (ing.function || '').toLowerCase();

              const indicatorColor =
                isAttention ? 'border-l-coral' :
                isUnknown   ? 'border-l-lavender' :
                roleLower.includes('humectant') || roleLower.includes('surfactant') || roleLower.includes('cleanser') ? 'border-l-lime' :
                roleLower.includes('condition') || roleLower.includes('active')     || roleLower.includes('vitamin')  ? 'border-l-sky'  :
                'border-l-forest-700';

              return (
                <div
                  key={`${ing.canonical_name}-${idx}`}
                  onClick={() => onOpenIngredientModal(ing)}
                  className={`
                    grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 md:py-3.5
                    border-l-4 ${indicatorColor}
                    hover:bg-paper-warm transition-colors cursor-pointer group items-center
                  `}
                >
                  {/* Ref */}
                  <div className="md:col-span-1 font-mono text-xs text-ink-muted font-semibold">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Identity */}
                  <div className="md:col-span-3 space-y-0.5">
                    <div className="font-display font-medium text-base text-forest-950 group-hover:text-forest-800 transition-colors leading-snug">
                      {ing.canonical_name}
                    </div>
                    {ing.name !== ing.canonical_name && (
                      <div className="font-mono text-[10px] text-ink-muted">
                        Label: {ing.name}
                      </div>
                    )}
                    {ing.matched_preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ing.matched_preferences.map((p) => (
                          <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 border border-gold/40 bg-gold-light/60 text-forest-950 font-semibold">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Function */}
                  <div className="md:col-span-2 font-mono text-xs">
                    <span className="md:hidden text-[10px] text-ink-muted uppercase block mb-1">Function:</span>
                    <span className="px-2 py-0.5 bg-paper-warm border border-forest-900/15 text-forest-900 text-[11px]">
                      {ing.function}
                    </span>
                  </div>

                  {/* Concern */}
                  <div className="md:col-span-3 font-body text-xs text-ink leading-relaxed">
                    <span className="md:hidden font-mono text-[10px] text-ink-muted uppercase block mb-1">Concern:</span>
                    <p className="line-clamp-2">{ing.potential_concern}</p>
                  </div>

                  {/* Evidence */}
                  <div className="md:col-span-2 font-mono text-xs space-y-1.5">
                    <ConcernBadge level={ing.concern_level} />
                    <div className="text-[10px] flex items-center gap-1">
                      <span className="text-ink-muted">Confidence:</span>
                      <EvidenceBadge level={ing.evidence_level} />
                    </div>
                  </div>

                  {/* Action */}
                  <div className="md:col-span-1 flex md:justify-end items-center">
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-forest-900 group-hover:text-forest-950 group-hover:translate-x-0.5 transition-all">
                      <span>Dossier</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredIngredients.length === 0 && (
            <div className="p-10 text-center font-mono text-sm text-ink-muted">
              <ChevronDown className="w-8 h-8 mx-auto mb-3 text-ink-faint" />
              No ingredients match the selected criteria.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
