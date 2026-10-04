import React, { useState, useEffect } from 'react';
import { X, Sliders, Plus, Check } from 'lucide-react';
import type { UserPreferences } from '../types';
import { fetchPreferences, updatePreferences } from '../lib/api';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    skin_irritation: false,
    fragrance: false,
    allergens: false,
    food_additives: false,
    environmental_impact: false,
    children_exposure: false,
    general_information: true,
    custom_avoidances: [],
    notes: '',
  });

  const [newAvoidance, setNewAvoidance] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPreferences().then((p) => setPrefs(p)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const setFlag = (key: keyof UserPreferences, value: boolean) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddAvoidance = () => {
    const trimmed = newAvoidance.trim().toLowerCase();
    if (trimmed && !prefs.custom_avoidances.includes(trimmed)) {
      setPrefs((prev) => ({
        ...prev,
        custom_avoidances: [...prev.custom_avoidances, trimmed],
      }));
      setNewAvoidance('');
    }
  };

  const handleRemoveAvoidance = (term: string) => {
    setPrefs((prev) => ({
      ...prev,
      custom_avoidances: prev.custom_avoidances.filter((t) => t !== term),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updatePreferences(prefs);
      setPrefs(updated);
      onPreferencesUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const PREF_CRITERIA: { key: keyof UserPreferences; label: string; desc: string }[] = [
    { 
      key: 'fragrance', 
      label: 'FRAGRANCE & SCENT COMPOUNDS', 
      desc: 'Highlights unlisted perfume/parfum mixtures and terpene allergens (limonene, linalool).' 
    },
    { 
      key: 'skin_irritation', 
      label: 'SKIN IRRITATION & STRIPPING', 
      desc: 'Monitors strong sulfate surfactants (SLS), high pH builders, and barrier disruptors.' 
    },
    { 
      key: 'allergens', 
      label: 'COMMON CONTACT ALLERGENS', 
      desc: 'Flags preservatives (parabens, phenoxyethanol), soy protein carriers, and amine impurities.' 
    },
    { 
      key: 'food_additives', 
      label: 'FOOD ADDITIVES & SWEETENERS', 
      desc: 'Tracks high-intensity sugar substitutes (aspartame, sucralose), flavor boosters (MSG), and sulfites.' 
    },
    { 
      key: 'environmental_impact', 
      label: 'ENVIRONMENTAL & ECOTOXICITY', 
      desc: 'Identifies persistent optical brighteners, non-biodegradable polymers, and aquatic hazards.' 
    },
    { 
      key: 'children_exposure', 
      label: "CHILDREN'S FORMULATION SENSITIVITY", 
      desc: 'Highlights aerosol inhalation hazards, strong detergents, and infant safety guidelines.' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-editorial-fade">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-paper border border-forest-900 shadow-sheet overflow-hidden flex flex-col text-ink">
        
        {/* Masthead */}
        <div className="border-b border-forest-900 bg-forest-950 px-6 py-3.5 flex items-center justify-between text-paper font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-lime" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              EDITORIAL PREFERENCE PROFILE
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-forest-200 hover:text-lime transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          
          <div className="border-b border-forest-900/15 pb-4 space-y-1">
            <h2 className="text-2xl font-display font-medium text-forest-950">
              WHAT MATTERS TO YOU?
            </h2>
            <p className="font-mono text-xs text-ink-muted">
              Select criteria to highlight in formulation analyses. Preferences do not constitute medical diagnoses.
            </p>
          </div>

          {/* Horizontal Preference Board with Colored Underline States */}
          <div className="border border-forest-900/20 divide-y divide-forest-900/15 bg-paper-light">
            {PREF_CRITERIA.map(({ key, label, desc }) => {
              const isImportant = Boolean(prefs[key]);
              return (
                <div key={key} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isImportant ? 'bg-cream/40' : ''
                }`}>
                  <div className="space-y-1 max-w-sm">
                    <h4 className={`font-mono text-xs font-bold ${
                      isImportant ? 'text-forest-950' : 'text-forest-900/70'
                    }`}>
                      {label}
                    </h4>
                    <p className="font-body text-xs text-ink-muted leading-snug">
                      {desc}
                    </p>
                  </div>

                  {/* Underline Toggle Choice */}
                  <div className="flex items-center space-x-2 font-mono text-xs flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setFlag(key, false)}
                      className={`px-3 py-1.5 transition-all text-xs ${
                        !isImportant
                          ? 'border-b-2 border-b-forest-900 text-forest-950 font-bold bg-paper-warm'
                          : 'border-b-2 border-b-transparent text-ink-muted hover:text-forest-900'
                      }`}
                    >
                      ○ LESS IMPORTANT
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlag(key, true)}
                      className={`px-3 py-1.5 transition-all text-xs ${
                        isImportant
                          ? 'border-b-2 border-b-lime bg-forest-950 text-lime font-bold shadow-subtle'
                          : 'border-b-2 border-b-transparent text-ink-muted hover:text-forest-900'
                      }`}
                    >
                      ● IMPORTANT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Avoidances */}
          <div className="space-y-3 pt-2">
            <div>
              <span className="font-mono text-xs font-bold text-forest-950 uppercase tracking-label block">
                CUSTOM AVOIDANCES ("I AVOID ______")
              </span>
              <p className="font-mono text-[11px] text-ink-muted">
                Add specific chemical compounds (e.g. parabens, sulfates, msg, phenoxyethanol).
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. parabens"
                value={newAvoidance}
                onChange={(e) => setNewAvoidance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAvoidance()}
                className="flex-1 text-xs font-mono px-3 py-2 border border-forest-900/30 bg-paper-light focus:outline-none focus:border-forest-950 text-forest-950"
              />
              <button
                type="button"
                onClick={handleAddAvoidance}
                className="px-4 py-2 text-xs font-mono border border-forest-900/30 bg-paper-warm hover:bg-forest-950 hover:text-lime text-forest-950 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            </div>

            {prefs.custom_avoidances.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prefs.custom_avoidances.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 border border-forest-900/20 bg-paper-warm text-xs font-mono text-forest-950"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAvoidance(term)}
                      className="text-forest-700 hover:text-forest-950 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-forest-900 bg-paper-warm px-6 py-3.5 flex items-center justify-between font-mono text-xs">
          <span className="text-[11px] text-ink-muted">
            SYNCED TO LOCAL DB
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-forest-900/20 text-forest-900 hover:bg-paper"
            >
              DISCARD
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-1.5 bg-forest-950 text-lime font-bold uppercase tracking-wider border border-forest-950 hover:bg-forest-900 flex items-center space-x-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime" />
                  <span>SAVED</span>
                </>
              ) : (
                <span>SAVE PROFILE</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
