import type { Config } from 'tailwindcss';
import componentConfig from '../components/tailwind.config';

const config: Config = {
  ...componentConfig,
  content: ['./src/**/*.{ts,tsx}', '../components/src/**/*.{ts,tsx}'],
};

export default config;
