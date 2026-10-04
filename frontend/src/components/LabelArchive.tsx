import React from 'react';
import type { ProductAnalysis } from '../types';
import { ArrowUpRight, Archive, Scan, FlaskConical } from 'lucide-react';

interface LabelArchiveProps {
  archive: ProductAnalysis[];
  onSelectProduct: (analysis: ProductAnalysis) => void;
  onOpenScanner: () => void;
}

function getCategoryAccent(categoryName: string): string {
  const c = categoryName.toLowerCase();
  if (c.includes('care'))     return 'border-l-lime';
  if (c.includes('food'))     return 'border-l-cat-food';
  if (c.includes('cleaning')) return 'border-l-sky';
  if (c.includes('baby'))     return 'border-l-coral';
  if (c.includes('pet'))      return 'border-l-gold';
  if (c.includes('tech'))     return 'border-l-lavender';
  return 'border-l-forest-700';
}

export const LabelArchive: React.FC<LabelArchiveProps> = ({
  archive,
  onSelectProduct,
  onOpenScanner,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-editorial-fade">

      {/* Archive header card */}
      <div className="border border-forest-900 bg-paper-light shadow-sheet p-6 md:p-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-ink-muted uppercase tracking-widest border-b border-forest-900/12 pb-4 mb-6">
          <Archive className="w-3.5 h-3.5" />
          <span className="text-forest-900 font-bold">Specimen Repository</span>
          <span>/</span>
          <span>Your Label Archive</span>
          <span className="ml-auto">{String(archive.length).padStart(3, '0')} records</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-forest-950 tracking-tightest">
            Your Label Archive
          </h1>
          <p className="font-mono text-xs text-ink-muted mt-2">
            Chronological inspection timeline of all analyzed consumer formulation specimens.
          </p>
        </div>
      </div>

      {/* Archive list */}
      {archive.length > 0 ? (
        <div className="border border-forest-900 bg-paper-light overflow-hidden">
          <div className="divide-y divide-forest-900/10">
            {archive.map((item, idx) => {
              const accent = getCategoryAccent(item.category_name || '');
              const attentionCount = item.ingredients.filter(
                (i) => i.concern_level === 'NEEDS ATTENTION' || i.concern_level === 'MODERATE CONCERN'
              ).length;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectProduct(item)}
                  className={`
                    w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4
                    px-5 md:px-6 py-4 border-l-4 ${accent}
                    hover:bg-paper-warm transition-colors group
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-ink-muted font-semibold flex-shrink-0">
                      {String(idx + 1).padStart(3, '0')}
                    </span>
                    <div>
                      <h3 className="font-display font-medium text-lg text-forest-950 group-hover:text-forest-800 transition-colors leading-snug">
                        {item.product_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-ink-muted mt-1">
                        <span className="uppercase font-bold text-forest-900 px-1.5 py-0.5 bg-paper-warm border border-forest-900/15">
                          {item.category_name}
                        </span>
                        {item.subcategory && <><span>·</span><span>{item.subcategory}</span></>}
                        <span>·</span>
                        <span>{item.ingredients.length} ingredients</span>
                        {attentionCount > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-coral-dark font-bold">{attentionCount} flagged</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs flex-shrink-0">
                    <span className="text-[10px] text-ink-muted hidden sm:inline">
                      {item.is_demo ? 'Reference monograph' : 'Live scan'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-forest-950 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="border border-forest-900/20 bg-paper-light p-16 text-center space-y-5">
          <div className="w-14 h-14 border border-forest-900/30 bg-paper-warm flex items-center justify-center mx-auto text-forest-700">
            <FlaskConical className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-medium text-2xl text-forest-950">
              Archive is empty
            </h3>
            <p className="text-sm text-ink-muted font-body max-w-xs mx-auto">
              Scan a product to start building your permanent chemical record.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenScanner}
            className="btn-primary mx-auto"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan First Specimen</span>
          </button>
        </div>
      )}

    </div>
  );
};
