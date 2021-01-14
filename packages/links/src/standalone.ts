import 'instant.page';
import links from './links';

links();

window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    body { transition: opacity 150ms ease-in 16ms; }
    body.is-loading { opacity: 0.75; }
  `;
  document.head.appendChild(style);
});
