import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { analyzeImage, analyzeText } from '../lib/api';
import type { ProductAnalysis } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: ProductAnalysis) => void;
  initialMode?: 'upload' | 'text';
}

const SCAN_STEPS = [
  '01 / Reading the label',
  '02 / Identifying product',
  '03 / Extracting ingredients',
  '04 / Checking evidence record',
];

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  initialMode = 'upload',
}) => {
  const [tab,              setTab]              = useState<'upload' | 'text'>(initialMode);
  const [file,             setFile]             = useState<File | null>(null);
  const [previewUrl,       setPreviewUrl]       = useState<string | null>(null);
  const [rawText,          setRawText]          = useState('');
  const [productName,      setProductName]      = useState('');
  const [isProcessing,     setIsProcessing]     = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage,     setErrorMessage]     = useState<string | null>(null);
  const [isDragging,       setIsDragging]       = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setFile(selectedFile);
    setErrorMessage(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleProcessScan = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStepIndex(0);

    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 650);

    try {
      let result: ProductAnalysis;

      if (tab === 'upload') {
        if (!file) {
          setErrorMessage('Please select an image of the product label first.');
          setIsProcessing(false);
          clearInterval(stepTimer);
          return;
        }
        result = await analyzeImage(file, true);
      } else {
        if (!rawText.trim()) {
          setErrorMessage('Please enter an ingredient list or transcription.');
          setIsProcessing(false);
          clearInterval(stepTimer);
          return;
        }
        result = await analyzeText(rawText, productName || undefined, true);
      }

      setTimeout(() => {
        clearInterval(stepTimer);
        setIsProcessing(false);
        onAnalysisComplete(result);
        onClose();
      }, 400);
    } catch {
      clearInterval(stepTimer);
      setIsProcessing(false);
      setErrorMessage("Couldn't read this label. Try a clearer photo or paste the ingredients directly.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-forest-950/75 backdrop-blur-sm animate-editorial-fade">
      <div className="relative w-full sm:max-w-xl bg-paper border-t sm:border border-forest-900 sm:shadow-sheet overflow-hidden font-mono animate-slide-up sm:animate-editorial-fade">

        {/* Header */}
        <div className="border-b border-forest-900 bg-forest-950 px-5 py-3.5 flex items-center justify-between text-paper">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-lime animate-pulse-dot" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Specimen Intake Scanner
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-forest-300 hover:text-lime transition-colors p-1 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-forest-900/15 text-xs">
          {[
            { id: 'upload' as const, label: 'Drop a Label / Photo', icon: <Upload className="w-3.5 h-3.5" /> },
            { id: 'text'   as const, label: 'Paste Ingredients',     icon: <FileText className="w-3.5 h-3.5" /> },
          ].map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setErrorMessage(null); }}
              disabled={isProcessing}
              className={`
                flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors border-b-2 disabled:opacity-50
                ${i === 0 ? 'border-r border-forest-900/15' : ''}
                ${tab === t.id
                  ? 'bg-paper-light font-bold text-forest-950 border-b-forest-950'
                  : 'bg-paper-warm text-ink-muted hover:text-forest-950 border-b-transparent'
                }
              `}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 md:p-7">
          {isProcessing ? (
            /* Scanning state */
            <div className="py-4 text-center space-y-5 animate-editorial-fade">

              {previewUrl && (
                <div className="relative w-32 h-32 mx-auto border-2 border-forest-900 bg-paper overflow-hidden shadow-overlap">
                  <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover" />
                  <div className="absolute left-0 right-0 h-0.5 bg-lime shadow-[0_0_10px_rgba(200,230,90,0.8)] animate-laser" />
                  <div className="absolute top-1 left-1 bg-forest-950/80 px-1 py-0.5 text-[8px] text-lime">CAL: OK</div>
                  <div className="absolute bottom-1 right-1 bg-forest-950/80 px-1 py-0.5 text-[8px] text-paper">12B VISION</div>
                </div>
              )}

              <div className="font-bold text-xs uppercase tracking-wider text-forest-950">
                Decoding packaging specimen…
              </div>

              <div className="max-w-xs mx-auto space-y-1.5 text-left text-xs">
                {SCAN_STEPS.map((step, idx) => {
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
                <div className="animate-editorial-fade space-y-1.5 max-w-xs mx-auto">
                  <div className="text-[10px] text-forest-700 uppercase tracking-widest font-semibold text-left">
                    Identified ingredients:
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 border border-lime bg-lime/15 text-forest-950">+ GLYCERIN</span>
                    <span className="px-1.5 py-0.5 border border-coral bg-coral/15 text-forest-950">+ FRAGRANCE</span>
                    <span className="px-1.5 py-0.5 border border-sky bg-sky/15 text-forest-950">+ PANTHENOL</span>
                  </div>
                </div>
              )}
            </div>

          ) : tab === 'upload' ? (
            /* Upload tab */
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed p-6 text-center cursor-pointer transition-all min-h-[160px] flex flex-col items-center justify-center gap-3
                  ${isDragging
                    ? 'border-forest-950 bg-lime/8'
                    : 'border-forest-900/30 hover:border-forest-900/60 bg-paper-light hover:bg-paper-warm'
                  }
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />

                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Label preview"
                      className="max-h-40 mx-auto border border-forest-900 object-contain shadow-subtle"
                    />
                    <div className="text-[11px] text-ink-muted">{file?.name} · click to change</div>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 border border-dashed border-forest-900/50 bg-paper flex items-center justify-center text-forest-700">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-forest-950 font-bold">Drop a label here</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">JPG, PNG or WEBP · Local Gemma 4:12B</div>
                    </div>
                  </>
                )}
              </div>

              {/* Camera button */}
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Or snap directly:</span>
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-ghost border border-forest-900/20"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Use Camera</span>
                </button>
              </div>
            </div>

          ) : (
            /* Text tab */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1.5 font-mono">
                  Product Name <span className="normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Balancing Shampoo"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1.5 font-mono">
                  Ingredients Transcription
                </label>
                <textarea
                  rows={6}
                  placeholder="Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Sodium Chloride…"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="input-base leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="mt-4 p-3 border border-coral bg-coral-light text-coral-dark text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="px-5 py-3.5 border-t border-forest-900/15 bg-paper-warm flex items-center justify-between text-xs">
            <span className="text-[10px] text-ink-muted hidden sm:inline font-mono uppercase tracking-wider">
              Local processing · No cloud storage
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost border border-forest-900/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessScan}
                disabled={tab === 'upload' ? !file : !rawText.trim()}
                className="btn-primary"
              >
                <span>Run Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
