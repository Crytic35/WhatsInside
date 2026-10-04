import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import type { DemoProduct, OllamaStatus, ProductAnalysis } from '../types';
import { analyzeImage } from '../lib/api';

interface EditorialHeroProps {
  onAnalysisComplete: (result: ProductAnalysis) => void;
  demoProducts: DemoProduct[];
  onSelectDemoProduct: (id: string) => void;
  ollamaStatus: OllamaStatus | null;
  onOpenTextInputModal: () => void;
}

const PROCESSING_STEPS = [
  '01 / Reading the label',
  '02 / Identifying product',
  '03 / Extracting ingredients',
  '04 / Checking evidence record',
];

const DETECTED_PREVIEWS = [
  { name: 'GLYCERIN',       role: 'Humectant',        color: 'bg-lime/15 text-forest-950 border-lime' },
  { name: 'FRAGRANCE',      role: 'Aroma Compound',   color: 'bg-coral/15 text-forest-950 border-coral' },
  { name: 'PANTHENOL',      role: 'Pro-Vitamin B5',   color: 'bg-sky/15 text-forest-950 border-sky' },
  { name: 'PHENOXYETHANOL', role: 'Preservative',     color: 'bg-gold/15 text-forest-950 border-gold' },
];

const CATEGORIES = [
  { num: '01', name: 'Food',     color: 'text-cat-food border-cat-food'         },
  { num: '02', name: 'Care',     color: 'text-lime-dark border-lime'            },
  { num: '03', name: 'Cleaning', color: 'text-sky-dark border-sky'             },
  { num: '04', name: 'Baby',     color: 'text-coral-dark border-coral'          },
  { num: '05', name: 'Pet',      color: 'text-gold-dark border-gold'            },
  { num: '06', name: 'Home',     color: 'text-forest-800 border-forest-800'     },
  { num: '07', name: 'Auto',     color: 'text-cat-auto border-cat-auto'         },
  { num: '08', name: 'DIY',      color: 'text-cat-diy border-cat-diy'           },
  { num: '09', name: 'Tech',     color: 'text-lavender-dark border-lavender'    },
  { num: '10', name: 'Medicine', color: 'text-cat-medicine border-cat-medicine' },
  { num: '11', name: 'Garden',   color: 'text-cat-garden border-cat-garden'     },
  { num: '12', name: 'Water',    color: 'text-cat-water border-cat-water'       },
];

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  onAnalysisComplete,
  demoProducts,
  onSelectDemoProduct,
  ollamaStatus,
  onOpenTextInputModal,
}) => {
  const isConnected = ollamaStatus?.connected && ollamaStatus?.available;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setFile(selected);
    setErrorMessage(null);
    setPreviewUrl(URL.createObjectURL(selected));
    startScanSequence(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const startScanSequence = async (imgFile: File) => {
    setIsProcessing(true);
    setCurrentStepIndex(0);
    setErrorMessage(null);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 650);

    try {
      const result = await analyzeImage(imgFile, true);
      setTimeout(() => {
        clearInterval(stepInterval);
        setIsProcessing(false);
        onAnalysisComplete(result);
      }, 400);
    } catch {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMessage("Couldn't read this label. Try a clearer photo or paste the ingredient list directly.");
    }
  };

  return (
    <div className="relative editorial-paper hairline-b">

      {/* Slim top notice bar */}
      <div className="border-b border-forest-900/10 py-1.5 px-4 sm:px-6 lg:px-8 bg-paper-warm/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-dark animate-pulse-dot" />
            <span className="uppercase tracking-wider">Research instrument · hazard ≠ risk · concentration-aware</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span>Local inference: {ollamaStatus?.model || 'gemma4:12b'}</span>
            <span className={`font-semibold ${isConnected ? 'text-forest-900' : 'text-ink-muted'}`}>
              {isConnected ? '● Online' : '○ Demo ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Editorial statement ── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 font-mono text-xs text-forest-700 uppercase tracking-widest">
              <span className="inline-block w-5 h-px bg-lime" />
              <span>Consumer Product Intelligence</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-forest-950 tracking-tightest leading-[1.06]">
                Don't just read<br />
                the label.<br />
                Understand what's<br />
                <span className="relative inline-flex items-baseline gap-2 mt-1">
                  <span className="relative inline-block px-3 py-1 bg-lime text-forest-950 font-bold border border-forest-950 shadow-[3px_3px_0_#10231D]">
                    Inside.
                  </span>
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-ink leading-relaxed max-w-lg">
              Scan almost any product label. See what each ingredient actually does, what
              the toxicological evidence says, and what remains unknown.
            </p>

            {/* 3-pillar strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-forest-900/12">
              {[
                { num: '01', label: 'Ingredients', color: 'border-lime', desc: 'Functional roles decoded beyond trade jargon.' },
                { num: '02', label: 'Evidence', color: 'border-gold', desc: 'CIR, FDA, SCCS & EFSA monographs.' },
                { num: '03', label: 'Context', color: 'border-coral', desc: 'Hazard distinguished from exposure dosage.' },
              ].map((p) => (
                <div key={p.num} className={`pl-3 border-l-2 ${p.color} space-y-1`}>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-widest">{p.num}</div>
                  <div className="font-display font-medium text-forest-950 text-sm">{p.label}</div>
                  <p className="text-xs text-ink-muted leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Drop a Label</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenTextInputModal}
                className="btn-secondary"
              >
                <FileText className="w-3.5 h-3.5 text-forest-700" />
                <span>Paste Ingredient List</span>
              </button>
            </div>

          </div>

          {/* ── RIGHT: Inspection Tray ── */}
          <div className="lg:col-span-5">
            <div className="border-2 border-forest-900 bg-paper-light shadow-tray">

              {/* Tray header */}
              <div className="border-b border-forest-900 bg-forest-950 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-paper">
                  <span className="w-1.5 h-1.5 bg-lime animate-pulse-dot" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Specimen Inspection Tray</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 border border-coral text-coral">
                    LIVE
                  </span>
                  <span className="text-[10px] font-mono text-forest-300">
                    {isConnected ? 'Ollama · Connected' : 'Demo Ready'}
                  </span>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  relative min-h-[300px] sm:min-h-[340px] p-6 flex flex-col items-center justify-center
                  transition-colors duration-200 technical-grid
                  ${isDragging ? 'bg-lime/10' : 'bg-paper-light'}
                `}
              >
                {/* Corner calibration ticks */}
                <div className="absolute top-2 left-2 font-mono text-[8px] text-coral/60 select-none">┌ CAL</div>
                <div className="absolute top-2 right-2 font-mono text-[8px] text-lime-dark/60 select-none">REF ┐</div>
                <div className="absolute bottom-2 left-2 font-mono text-[8px] text-sky-dark/60 select-none">└ OPT</div>
                <div className="absolute bottom-2 right-2 font-mono text-[8px] text-gold-dark/60 select-none">ISO ┘</div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {isProcessing ? (
                  /* ── Scanning state ── */
                  <div className="w-full text-center space-y-5 animate-editorial-fade">

                    {previewUrl && (
                      <div className="space-y-1">
                        <div className="relative w-40 h-40 mx-auto border-2 border-forest-900 bg-paper overflow-hidden shadow-overlap">
                          <img
                            src={previewUrl}
                            alt="Scanning"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute left-0 right-0 h-0.5 bg-lime shadow-[0_0_10px_rgba(200,230,90,0.8)] animate-laser" />
                          <div className="absolute top-1 left-1 bg-forest-950/80 px-1 py-0.5 text-[8px] font-mono text-lime">FOV 100%</div>
                          <div className="absolute bottom-1 right-1 bg-forest-950/80 px-1 py-0.5 text-[8px] font-mono text-paper">12B VISION</div>
                        </div>
                        {file?.name && (
                          <div className="text-[10px] font-mono text-ink-muted truncate max-w-[200px] mx-auto">{file.name}</div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 max-w-xs mx-auto text-left font-mono text-xs">
                      {PROCESSING_STEPS.map((step, idx) => {
                        const isDone    = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div
                            key={step}
                            className={`
                              flex items-center justify-between px-3 py-1.5 border text-[11px] transition-all duration-200
                              ${isCurrent
                                ? 'border-forest-950 bg-forest-950 text-lime font-semibold'
                                : isDone
                                ? 'border-forest-900/20 bg-paper-warm text-forest-900'
                                : 'border-dashed border-forest-900/15 text-ink-muted'
                              }
                            `}
                          >
                            <span>{step}</span>
                            {isDone    ? <Check   className="w-3.5 h-3.5 text-lime"            /> : null}
                            {isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin text-lime" /> : null}
                          </div>
                        );
                      })}
                    </div>

                    {currentStepIndex >= 2 && (
                      <div className="pt-1 animate-editorial-fade space-y-2 max-w-xs mx-auto">
                        <div className="text-[10px] font-mono text-forest-700 uppercase tracking-widest font-semibold text-left">
                          Extracted chemical nomenclature:
                        </div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          {DETECTED_PREVIEWS.map((ing) => (
                            <span key={ing.name} className={`px-1.5 py-0.5 border ${ing.color}`}>
                              + {ing.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-ink-muted">
                      Local Gemma 4:12B Vision Inference
                    </div>
                  </div>
                ) : (
                  /* ── Idle state ── */
                  <div className="text-center space-y-5 max-w-sm">

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 mx-auto border-2 border-dashed border-forest-900/40 bg-paper-warm flex items-center justify-center cursor-pointer hover:border-forest-950 hover:bg-forest-950 group transition-all duration-200 shadow-subtle"
                    >
                      <Upload className="w-6 h-6 text-forest-700 group-hover:text-lime transition-colors" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-medium text-xl text-forest-950">
                        Drop a Product Label
                      </h3>
                      <p className="font-mono text-xs text-ink-muted">
                        Photograph or upload any packaging panel
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-forest-900/30 hover:border-forest-950 bg-paper text-forest-950 font-semibold transition-colors"
                      >
                        Browse File
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-4 py-2 border border-forest-900/30 hover:border-forest-950 bg-paper text-forest-950 flex items-center gap-1.5 font-semibold transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                      </button>
                    </div>

                    <div className="text-[10px] font-mono text-ink-muted flex items-center justify-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-lime-dark" />
                      JPG · PNG · WEBP · Privacy Preserved
                    </div>

                  </div>
                )}

              </div>

              {/* Error */}
              {errorMessage && (
                <div className="p-3 bg-coral-light border-t-2 border-coral text-coral-dark font-mono text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Tray footer */}
              <div className="border-t border-forest-900/15 bg-paper-warm px-4 py-2.5 flex items-center justify-between font-mono text-[10px] text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-forest-700" />
                  Stage: Ready for scan
                </span>
                <span>~1.2 s · Local GPU</span>
              </div>

            </div>
          </div>

        </div>

        {/* ── Category Index ── */}
        <div className="mt-16 pt-6 border-t border-forest-900/12">
          <div className="flex items-center justify-between mb-4 font-mono text-[10px] text-ink-muted uppercase tracking-widest">
            <span>Index of covered product formulations</span>
            <span className="hidden sm:inline">Universal chemical taxonomy</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-xs">
            {CATEGORIES.map((c) => (
              <div key={c.num} className="flex items-center gap-1.5 group cursor-default">
                <span className={`text-[10px] font-bold px-1 border ${c.color} bg-paper`}>
                  {c.num}
                </span>
                <span className="text-forest-950 font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Demo Products ── */}
        {demoProducts.length > 0 && (
          <div className="mt-12 pt-6 border-t border-forest-900/12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-forest-950 uppercase tracking-wider">
                  <FlaskConical className="w-3.5 h-3.5 text-lime-dark" />
                  <span>Try a Label</span>
                </div>
                <p className="font-mono text-[11px] text-ink-muted mt-1">
                  Reference label transcriptions ready for immediate exploration.
                </p>
              </div>
              <span className="font-mono text-[10px] border border-forest-900/20 px-2 py-1 bg-paper-warm text-forest-800">
                {demoProducts.length} Verified Entries
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {demoProducts.map((p, idx) => {
                const catLower = p.category?.toLowerCase() || '';
                const accent =
                  catLower.includes('care')     ? 'border-l-lime'    :
                  catLower.includes('food')     ? 'border-l-cat-food':
                  catLower.includes('cleaning') ? 'border-l-sky'     :
                  catLower.includes('cosmetic') ? 'border-l-coral'   :
                  'border-l-gold';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectDemoProduct(p.id)}
                    className={`
                      text-left p-4 bg-paper-light border border-forest-900/20 border-l-4 ${accent}
                      hover:border-forest-900/60 hover:bg-paper-warm hover:shadow-subtle
                      transition-all duration-150 group flex flex-col justify-between gap-3
                    `}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted mb-2">
                        <span>REF-{String(idx + 1).padStart(3, '0')}</span>
                        <span className="uppercase font-bold text-forest-900">{p.category}</span>
                      </div>
                      <h4 className="font-display font-medium text-sm text-forest-950 group-hover:text-forest-800 transition-colors line-clamp-2 leading-snug">
                        {p.product_name}
                      </h4>
                      <p className="text-[11px] text-ink-muted mt-1 line-clamp-2 leading-snug">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-forest-900 border-t border-forest-900/10 pt-2">
                      <span>{p.ingredients?.length || 0} ingr.</span>
                      <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
