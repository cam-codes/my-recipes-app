import { render } from 'solid-js/web';
import App from './App';
import './index.css';
import { initGA } from './lib/analytics';

console.log('init ga from main.tsx')
initGA();

console.log('render...')
render(
  () => (
      <App />
  ),
  document.getElementById('root')!,
);
