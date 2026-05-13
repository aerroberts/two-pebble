import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
          raised: 'var(--color-surface-raised)',
          hover: 'var(--color-surface-hover)',
          neutral: 'var(--color-surface-neutral)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        content: {
          DEFAULT: 'var(--color-content)',
          muted: 'var(--color-content-muted)',
          subtle: 'var(--color-content-subtle)',
          inverse: 'var(--color-content-inverse)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          content: 'var(--color-accent-content)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          content: 'var(--color-danger-content)',
          soft: 'var(--color-danger-soft)',
          ring: 'var(--color-danger-ring)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
          ring: 'var(--color-success-ring)',
        },
        pool: {
          tint: 'var(--color-pool-tint)',
          header: 'var(--color-pool-header-tint)',
        },
        info: 'var(--color-info)',
        transfer: {
          sent: 'var(--color-transfer-sent)',
          received: 'var(--color-transfer-received)',
        },
        overlay: 'var(--color-overlay)',
        brand: {
          github: '#24292e',
          bitbucket: '#0052cc',
          gitlab: '#fc6d26',
          aws: '#ff9900',
        },
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        modal: 'var(--shadow-modal)',
      },
    },
  },
  plugins: [],
};

export default config;
