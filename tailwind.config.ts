import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { fontFamily: { display: ['Arial Narrow', 'Arial', 'sans-serif'] }, colors: { ink: '#080808', panel: '#111111', line: '#292929' } } }, plugins: [] };
export default config;
