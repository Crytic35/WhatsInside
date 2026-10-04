import React, { useState, useEffect } from 'react';
import type { 
  OllamaStatus, 
  ProductAnalysis, 
  DemoProduct, 
  AnalyzedIngredient, 
  UserPreferences 
} from './types';
import { 
  fetchOllamaStatus, 
  fetchDemoProducts, 
  fetchDemoProductAnalysis 
} from './lib/api';
import { Header } from './components/Header';
import { EditorialHero } from './components/EditorialHero';
import { ScannerModal } from './components/ScannerModal';
import { AnalysisView } from './components/AnalysisView';
import { IngredientDetailModal } from './components/IngredientDetailModal';
import { CompareView } from './components/CompareView';
import { PreferencesModal } from './components/PreferencesModal';
import { SettingsModal } from './components/SettingsModal';
import { LabelArchive } from './components/LabelArchive';
import { Heart } from 'lucide-react';

const ARCHIVE_STORAGE_KEY = 'whats_inside_label_archive_v1';

export const App: React.FC = () => {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'analysis' | 'compare' | 'archive'>('home');
  const [currentAnalysis, setCurrentAnalysis] = useState<ProductAnalysis | null>(null);
  const [demoProducts, setDemoProducts] = useState<DemoProduct[]>([]);
  const [archive, setArchive] = useState<ProductAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialMode, setScannerInitialMode] = useState<'upload' | 'text'>('upload');
  const [selectedIngredient, setSelectedIngredient] = useState<AnalyzedIngredient | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize status and demo products on load
  const loadInitialData = async () => {
    try {
      const [status, demos] = await Promise.all([
        fetchOllamaStatus(),
        fetchDemoProducts(),
      ]);
      setOllamaStatus(status);
      setDemoProducts(demos);
    } catch (e) {
      console.error('Initialization error:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const saveToArchive = (item: ProductAnalysis) => {
    setArchive((prev) => {
      // Avoid duplicate by product_name
      const filtered = prev.filter((p) => p.product_name !== item.product_name);
      const updated = [item, ...filtered];
      try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        console.error('Error saving to archive', e);
      }
      return updated;
    });
  };

  const handleSelectDemoProduct = async (id: string) => {
    try {
      const analysis = await fetchDemoProductAnalysis(id);
      setCurrentAnalysis(analysis);
      saveToArchive(analysis);
      setActiveView('analysis');
    } catch (err) {
      console.error('Failed to load demo product analysis', err);
    }
  };

  const handleAnalysisComplete = (result: ProductAnalysis) => {
    setCurrentAnalysis(result);
    saveToArchive(result);
    setActiveView('analysis');
  };

  const handlePreferencesUpdated = async (_updated: UserPreferences) => {
    if (currentAnalysis && currentAnalysis.is_demo) {
      handleSelectDemoProduct(currentAnalysis.id);
    }
  };

  // Any open modal triggers the page blur
  const isAnyModalOpen = Boolean(selectedIngredient) || isScannerOpen || isPreferencesOpen || isSettingsOpen;

  return (
    <div className="min-h-screen bg-paper text-ink font-body selection:bg-lime selection:text-forest-950">
      
      {/* ─── Page content wrapper — blurs when any modal is open ─── */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          filter: isAnyModalOpen ? 'blur(4px) brightness(0.85)' : 'none',
          transition: 'filter 0.25s ease',
          willChange: 'filter',
        }}
      >

        {/* Header */}
        <Header
          ollamaStatus={ollamaStatus}
          activeView={activeView}
          onNavigate={setActiveView}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasCurrentProduct={Boolean(currentAnalysis)}
          archiveCount={archive.length}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeView === 'home' && (
            <EditorialHero
              onAnalysisComplete={handleAnalysisComplete}
              demoProducts={demoProducts}
              onSelectDemoProduct={handleSelectDemoProduct}
              ollamaStatus={ollamaStatus}
              onOpenTextInputModal={() => {
                setScannerInitialMode('text');
                setIsScannerOpen(true);
              }}
            />
          )}

          {activeView === 'analysis' && currentAnalysis && (
            <AnalysisView
              analysis={currentAnalysis}
              onOpenIngredientModal={(ing) => setSelectedIngredient(ing)}
              onCompareWithProduct={(_analysis) => setActiveView('compare')}
              onRescan={() => {
                setScannerInitialMode('upload');
                setIsScannerOpen(true);
              }}
            />
          )}

          {activeView === 'compare' && (
            <CompareView
              currentAnalysis={currentAnalysis}
              demoProducts={demoProducts}
              onSelectProductForAnalysis={(analysis) => {
                setCurrentAnalysis(analysis);
                setActiveView('analysis');
              }}
            />
          )}

          {activeView === 'archive' && (
            <LabelArchive
              archive={archive}
              onSelectProduct={(analysis) => {
                setCurrentAnalysis(analysis);
                setActiveView('analysis');
              }}
              onOpenScanner={() => {
                setScannerInitialMode('upload');
                setIsScannerOpen(true);
              }}
            />
          )}
        </main>

      {/* Footer */}
      <footer className="border-t border-forest-900/15 bg-paper-warm py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-forest-900/12 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-forest-950 text-sm">WHAT'S INSIDE?</span>
                <span className="text-ink-muted font-mono text-xs">—</span>
                <span className="text-ink-muted font-body italic text-xs">Understand what you're actually buying.</span>
              </div>
              <p className="font-mono text-[10px] text-ink-muted mt-1 uppercase tracking-wider">
                Build for a Friend · Hacktoberfest / Dev Weekend 2026
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-forest-950 font-semibold">
                <Heart className="w-3 h-3 text-coral fill-coral" />
                Local-First AI
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-forest-800 hover:text-forest-950 hover:underline underline-offset-2 transition-colors font-semibold"
              >
                AI Diagnostics
              </button>
            </div>
          </div>

          <div className="text-[11px] text-ink-muted leading-relaxed max-w-3xl space-y-1.5">
            <p>
              <strong className="text-forest-900">Disclaimer:</strong> This tool deciphers product formulation panels and cross-references toxicological research (FDA, EFSA, CIR, SCCS, EPA). It provides no medical diagnoses or binary "safe/toxic" classifications. Chemical presence on a label denotes formulation inclusion, not bioavailability or finished product toxicity.
            </p>
            <p className="text-[10px] text-ink-faint font-mono">
              Model: Gemma 4:12B · Local Ollama inference · Privacy-first · No cloud storage
            </p>
          </div>

        </div>
      </footer>

      </div>{/* end blurrable page wrapper */}

      {/* Modals — outside the blurrable wrapper, always sharp */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        initialMode={scannerInitialMode}
      />

      <IngredientDetailModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />

      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onPreferencesUpdated={handlePreferencesUpdated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ollamaStatus={ollamaStatus}
        onRefreshStatus={loadInitialData}
      />

    </div>
  );
};

export default App;
