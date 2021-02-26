import links from './links';

window.addEventListener('DOMContentLoaded', () => {
  links({ defaultLoadingAnimation: true });
  require('instant.page');
});
