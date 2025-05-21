// This file is used to disable the Vercel deployment toolbar
window.addEventListener('load', function() {
  // Function to remove Vercel toolbar elements
  function removeVercelElements() {
    // List of selectors that might be used by Vercel
    const selectors = [
      '[data-vercel-toolbar]',
      '[data-vercel-badge]',
      '[data-vercel-analytics]',
      '[data-vercel-speed-insights]',
      '[data-vercel-feedback]',
      '[data-vercel-toolbar-button]',
      '[class*="vercel-toolbar"]',
      '[class*="vercel-badge"]',
      '[id*="vercel-toolbar"]',
      '[id*="vercel-badge"]',
      'div[style*="z-index: 2147483647"]',
      'div[style*="bottom: 0px"][style*="position: fixed"]',
      'div[style*="bottom: 0"][style*="position: fixed"][style*="z-index: 9999"]',
      'iframe[src*="vercel.com"]',
      'iframe[src*="vercel.app"]'
    ];

    // Try to find and remove each element
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Also check for elements that might be the toolbar based on position
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
      const style = window.getComputedStyle(div);
      if (
        style.position === 'fixed' &&
        (style.bottom === '0px' || style.bottom === '0') &&
        (style.zIndex === '2147483647' || parseInt(style.zIndex) > 9000)
      ) {
        div.remove();
      }
    });
  }

  // Add styles to prevent the toolbar from showing
  const style = document.createElement('style');
  style.textContent = `
    [data-vercel-toolbar],
    [data-vercel-badge],
    [data-vercel-analytics],
    [data-vercel-speed-insights],
    [data-vercel-feedback],
    [data-vercel-toolbar-button],
    [class*="vercel-toolbar"],
    [class*="vercel-badge"],
    [id*="vercel-toolbar"],
    [id*="vercel-badge"],
    div[style*="z-index: 2147483647"],
    div[style*="bottom: 0px"][style*="position: fixed"],
    div[style*="bottom: 0"][style*="position: fixed"][style*="z-index: 9999"],
    iframe[src*="vercel.com"],
    iframe[src*="vercel.app"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
    }
  `;
  document.head.appendChild(style);

  // Remove elements immediately
  removeVercelElements();

  // Also set up a MutationObserver to catch any dynamically added elements
  const observer = new MutationObserver(function(mutations) {
    removeVercelElements();
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
