'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Check, Sun, Moon } from 'lucide-react';
import { THEMES } from '@/lib/themes';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Inline style here is intentionally limited to *dynamic data tokens*
 * (each theme's own preview colors). These cannot live in globals.css
 * because they're data-driven per swatch. All structural/visual styling
 * is in globals.css (.theme-fab, .theme-panel, .theme-preview, etc.).
 */
type PreviewVars = React.CSSProperties & Record<`--${string}`, string>;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll + close on Escape while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  if (!mounted) return null;

  const panel = (
    <>
      {open && (
        <>
          <div className="theme-scrim" onClick={() => setOpen(false)} />
          <aside
            className="theme-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Theme switcher"
          >
            <div className="theme-panel-head flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="brand-mark inline-flex h-8 w-8 items-center justify-center rounded-xl text-on-accent">
                    <Palette className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-content">Appearance</h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Pick a theme — it applies instantly across the app.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-content"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="theme-grid">
              {THEMES.map((t) => {
                const active = theme === t.id;
                const vars: PreviewVars = {
                  '--tp-bg': t.preview.bg,
                  '--tp-surface': t.preview.surface,
                  '--tp-surface2': t.preview.surface2,
                  '--tp-line': t.preview.line,
                  '--tp-line2': t.preview.line2,
                  '--tp-accent': t.preview.accent,
                  '--tp-accent2': t.preview.accent2,
                };
                return (
                  <button
                    key={t.id}
                    className="theme-swatch"
                    data-active={active}
                    onClick={() => setTheme(t.id)}
                    aria-pressed={active}
                    title={`${t.name} — ${t.tag}`}
                  >
                    {active && (
                      <span className="theme-check">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div className="theme-preview" style={vars}>
                      <div className="tp-rail" />
                      <div className="tp-main">
                        <div className="tp-bar" />
                        <div className="tp-line" />
                        <div className="tp-line short" />
                        <div className="tp-chip" />
                      </div>
                      <span className="tp-dot" />
                    </div>
                    <div className="theme-meta" style={vars}>
                      <div className="tm-name">
                        <span>{t.name}</span>
                        {t.scheme === 'dark' ? (
                          <Moon className="h-3.5 w-3.5 text-subtle" />
                        ) : (
                          <Sun className="h-3.5 w-3.5 text-subtle" />
                        )}
                      </div>
                      <div className="tm-tag">{t.tag}</div>
                      <div className="tm-dots">
                        {t.dots.map((d, i) => (
                          <span
                            key={i}
                            style={{ '--dot': d } as PreviewVars}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </>
      )}
    </>
  );

  return (
    <>
      <button
        className="theme-fab"
        onClick={() => setOpen(true)}
        aria-label="Open theme switcher"
        title="Change theme"
      >
        <Palette className="h-5 w-5" />
      </button>
      {createPortal(panel, document.body)}
    </>
  );
}
