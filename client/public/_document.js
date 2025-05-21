// This file is used to disable the Vercel deployment toolbar
window.addEventListener('load', function() {
  // Check if there's a Vercel toolbar and remove it
  const vercelToolbar = document.querySelector('[data-vercel-toolbar]');
  if (vercelToolbar) {
    vercelToolbar.remove();
  }
  
  // Add styles to prevent the toolbar from showing
  const style = document.createElement('style');
  style.textContent = `
    [data-vercel-toolbar],
    [data-vercel-badge] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
});
