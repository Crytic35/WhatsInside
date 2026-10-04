import React from 'react';
import type { OllamaStatus } from '../types';
import { ArrowLeftRight, Scan, Sparkles, Sliders, Archive, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  ollamaStatus: OllamaStatus | null;
  activeView: 'home' | 'analysis' | 'compare' | 'archive';
  onNavigate: (view: 'home' | 'analysis' | 'compare' | 'archive') => void;
  onOpenPreferences: () => void;
  onOpenSettings: () => void;
  hasCurrentProduct: boolean;
  archiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  ollamaStatus,
  activeView,
  onNavigate,
  onOpenPreferences,
  onOpenSettings,
  hasCurrentProduct,
  archiveCount,
}) => {
  const isConnected = ollamaStatus?.connected && ollamaStatus?.available;

  const navItems = [
    {
      id: 'home' as const,
      label: 'Scan',
      icon: <Scan className="w-3.5 h-3.5" />,
      always: true,
    },
    {
      id: 'analysis' as const,
      label: 'Dossier',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      always: false,
    },
    {
      id: 'compare' as const,
      label: 'Compare',
      icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
      always: true,
    },
    {
      id: 'archive' as const,
      label: `Archive${archiveCount > 0 ? ` (${archiveCount})` : ''}`,
      icon: <Archive className="w-3.5 h-3.5" />,
      always: true,
      hideOnSmall: true,
    },
  ];

  return (
    <header className="border-b border-forest-900/15 bg-paper/95 backdrop-blur-sm sticky top-0 z-40 shadow-[0_1px_0_rgba(20,32,27,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 group flex-shrink-0"
        >
          <div className="w-8 h-8 bg-forest-950 text-lime flex items-center justify-center font-mono font-bold text-xs tracking-tight border border-forest-900 group-hover:bg-forest-900 transition-colors flex-shrink-0">
            WI
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display font-bold text-forest-950 text-sm tracking-tight group-hover:text-forest-800 transition-colors">
              WHAT'S INSIDE?
            </span>
            <span className="font-mono text-[9px] text-ink-muted uppercase tracking-widest mt-0.5">
              Product Intelligence
            </span>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center max-w-sm">
          {navItems.map((item) => {
            if (!item.always && !hasCurrentProduct) return null;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-none
                  transition-all duration-150
                  ${item.hideOnSmall ? 'hidden md:flex' : 'flex'}
                  ${isActive
                    ? 'bg-forest-950 text-lime'
                    : 'text-forest-800 hover:text-forest-950 hover:bg-paper-warm'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Preferences + Status */}
        <div className="flex items-center gap-2 flex-shrink-0">

          <button
            onClick={onOpenPreferences}
            title="Preferences"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-forest-800 hover:text-forest-950 hover:bg-paper-warm transition-colors border border-transparent hover:border-forest-900/20"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Preferences</span>
          </button>

          {/* AI Status Badge */}
          <button
            onClick={onOpenSettings}
            title="AI Diagnostics"
            className={`
              flex items-center gap-2 pl-2.5 pr-3 py-1.5 border transition-colors text-xs font-mono
              ${isConnected
                ? 'border-forest-900/15 bg-paper-warm hover:border-forest-900/40 text-forest-800'
                : 'border-attention/30 bg-attention-faint/20 hover:border-attention/50 text-attention'
              }
            `}
          >
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-dark" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-attention" />
              )}
            </span>
            {isConnected
              ? <Wifi className="w-3 h-3 text-forest-700" />
              : <WifiOff className="w-3 h-3 text-attention" />
            }
            <span className="hidden sm:inline font-semibold">
              {isConnected ? 'Local AI' : 'Offline'}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
