/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import App from './App';
import { initGA } from './lib/analytics';

initGA();
const root = document.getElementById('root');

render(() => <App />, root!);
