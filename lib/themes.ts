// Theme registry for XchangeSkills.
// Each entry maps to a `[data-theme="id"]` block in app/globals.css.
// `preview` colors are used only to render the mini-preview swatches
// in the theme switcher — they are not applied to the app directly.

export interface ThemeDef {
  id: string;
  name: string;
  tag: string;
  scheme: 'light' | 'dark';
  preview: {
    bg: string;
    surface: string;
    surface2: string;
    line: string;
    line2: string;
    accent: string;
    accent2: string;
  };
  /** dots shown under the swatch name */
  dots: string[];
}

export const THEMES: ThemeDef[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    tag: 'Cream · antique gold',
    scheme: 'light',
    preview: {
      bg: '#f4efe6',
      surface: '#fdfaf4',
      surface2: '#f0e8da',
      line: '#e7dccb',
      line2: '#d2c3a9',
      accent: '#a8842c',
      accent2: '#b06a3a',
    },
    dots: ['#a8842c', '#b06a3a', '#2c2418', '#f4efe6'],
  },
  {
    id: 'verdure',
    name: 'Verdure',
    tag: 'Emerald · brass',
    scheme: 'light',
    preview: {
      bg: '#eef1ea',
      surface: '#fbfcf8',
      surface2: '#e7ede1',
      line: '#dde5d4',
      line2: '#c2cfb3',
      accent: '#1c4a32',
      accent2: '#b08d3c',
    },
    dots: ['#1c4a32', '#b08d3c', '#18271c', '#eef1ea'],
  },
  {
    id: 'rosewood',
    name: 'Rosewood',
    tag: 'Blush · burgundy',
    scheme: 'light',
    preview: {
      bg: '#f3e9e2',
      surface: '#faf2ec',
      surface2: '#f0e0d6',
      line: '#ecdacf',
      line2: '#dcbdb0',
      accent: '#6d1722',
      accent2: '#b07d6e',
    },
    dots: ['#6d1722', '#cba49f', '#2a1216', '#f3e9e2'],
  },
  {
    id: 'cocoa',
    name: 'Cocoa',
    tag: 'Espresso · warm sand',
    scheme: 'light',
    preview: {
      bg: '#ece4da',
      surface: '#f6f0e7',
      surface2: '#e7dccd',
      line: '#e3d6c5',
      line2: '#cdb89f',
      accent: '#8a6c5f',
      accent2: '#bfa38a',
    },
    dots: ['#8a6c5f', '#bfa38a', '#544339', '#ece4da'],
  },
  {
    id: 'crane',
    name: 'Crane',
    tag: 'Navy · warm tan',
    scheme: 'dark',
    preview: {
      bg: '#050b1a',
      surface: '#0c1630',
      surface2: '#14213f',
      line: '#1c2a4a',
      line2: '#2c3e63',
      accent: '#e3c39d',
      accent2: '#a4b5c4',
    },
    dots: ['#e3c39d', '#4b6382', '#e8edf6', '#071739'],
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    tag: 'Sea teal · champagne',
    scheme: 'dark',
    preview: {
      bg: '#021e22',
      surface: '#063138',
      surface2: '#0c4049',
      line: '#14444c',
      line2: '#1f5961',
      accent: '#d8c3a0',
      accent2: '#5c9396',
    },
    dots: ['#d8c3a0', '#297376', '#e2f1f1', '#013137'],
  },
];

export const DEFAULT_THEME = 'atelier';
export const THEME_STORAGE_KEY = 'xchange_theme';
