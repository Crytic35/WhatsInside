import React from 'react';
import { X, Cpu, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';
import type { OllamaStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaStatus: OllamaStatus | null;
  onRefreshStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ollamaStatus,
  onRefreshStatus,
}) => {
  if (!isOpen) return null;

  const isConnected = ollamaStatus?.connected && ollamaStatus?.available;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-editorial-fade">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-paper border border-forest-900 shadow-sheet overflow-hidden flex flex-col text-ink font-mono text-xs">
        
        {/* Header */}
        <div className="border-b border-forest-900 bg-forest-950 px-6 py-3.5 flex items-center justify-between text-paper">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-lime" />
            <h2 className="font-bold uppercase tracking-wider text-[11px]">
              LOCAL PROCESSING & SYSTEM DIAGNOSTICS
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-forest-200 hover:text-lime transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          
          {/* Status Box */}
          <div className={`p-4 border ${
            isConnected
              ? 'border-forest-900 bg-paper-warm text-forest-950'
              : 'border-attention bg-attention-faint text-attention'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase text-xs">
                {isConnected ? 'LOCAL MODEL: GEMMA 4:12B' : 'LOCAL MODEL OFFLINE'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 border border-current font-bold uppercase">
                {isConnected ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {isConnected
                ? `Inference daemon reachable at ${ollamaStatus?.base_url} with active vision model ${ollamaStatus?.model}.`
                : 'Start Ollama to enable local neural vision analysis. Reference demo specimens remain fully operable.'}
            </p>
          </div>

          {/* Configuration Matrix */}
          <div className="space-y-2">
            <div className="text-forest-950 font-bold uppercase text-[11px] tracking-label">
              NEURAL INFERENCE METRICS
            </div>
            <div className="border border-forest-900/15 bg-paper-light divide-y divide-forest-900/10 text-[11px]">
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-ink-muted">BASE URL:</span>
                <span className="text-forest-950 font-bold">{ollamaStatus?.base_url || 'http://127.0.0.1:11434'}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-ink-muted">PRIMARY MODEL:</span>
                <span className="text-forest-950 font-bold">{ollamaStatus?.model || 'gemma4:12b'}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-ink-muted">INSTALLED INVENTORY:</span>
                <span className="text-forest-950 text-right truncate max-w-[240px]">
                  {ollamaStatus?.installed_models && ollamaStatus.installed_models.length > 0
                    ? ollamaStatus.installed_models.join(', ')
                    : 'None detected'}
                </span>
              </div>
            </div>
          </div>

          {/* Terminal Commands for starting */}
          {!isConnected && (
            <div className="space-y-2">
              <div className="text-forest-950 font-bold uppercase text-[11px] tracking-label flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>STARTING LOCAL OLLAMA</span>
              </div>
              <div className="p-3 bg-forest-950 text-paper border border-forest-900 space-y-1.5 text-[11px]">
                <div className="text-lime">$ ollama serve</div>
                <div className="text-lime">$ ollama run gemma4:12b</div>
              </div>
            </div>
          )}

          {/* Local Privacy Commitment */}
          <div className="space-y-1.5 p-4 border border-forest-900/15 bg-paper-warm">
            <div className="text-forest-950 font-bold uppercase text-[11px] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
              <span>EDITORIAL PRIVACY COMMITMENT</span>
            </div>
            <p className="font-body text-xs text-ink leading-relaxed">
              Your product images and ingredient transcripts are processed strictly on your local hardware when Ollama is active. No external cloud endpoints, accounts, or proprietary AI tokens are utilized.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-forest-900 bg-paper-warm px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onRefreshStatus}
            className="px-3 py-1.5 border border-forest-900/30 bg-paper hover:bg-paper-dark text-forest-950 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3 h-3 text-forest-800" />
            <span>PING DAEMON</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-forest-950 text-lime hover:bg-forest-900 transition-colors font-bold uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
